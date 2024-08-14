'use client';

import React, { useEffect, useState } from 'react';
import { fetchAllBatches } from '@/app/services/BatchService';
import { fetchAllInternDetails, fetchAllStudents } from '@/app/services/UserService';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import styles from './a-dash.module.css';
import AdminMenu from '@/app/components/AdminMenu';

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState({
        totalBatches: 0,
        currentInterns: 0,
        allInterns: 0,
        undergoingOnboarding: 0,
        internsWithOneWeekLeft: 0,
        undergoingOffboarding: 0
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all interns, including those not yet approved or offboarding
                const allInterns = await fetchAllStudents();
                
                // Total Batches
                const batches = await fetchAllBatches();
                const totalBatches = batches.length;
    
                const currentInterns = (await fetchAllInternDetails()).length; // only those with onboarded === 'approved'
                const allInternsCount = allInterns.length;
    
                const undergoingOnboarding = allInterns.filter(intern => intern.onboarded === 'pending').length;
                const undergoingOffboarding = allInterns.filter(intern => intern.onboarded === 'offboarding').length;
    
                const internsWithOneWeekLeft = allInterns.filter(intern => {
                    const hoursLeft = intern.hoursNeeded - intern.totalHoursRendered;
                    return hoursLeft <= 40 && intern.onboarded === 'approved'; 
                }).length;
    
                setDashboardData({
                    totalBatches,
                    currentInterns,
                    allInterns: allInternsCount,
                    undergoingOnboarding,
                    internsWithOneWeekLeft,
                    undergoingOffboarding
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };
    
        fetchDashboardData();
    }, []);

    return (
        <ProtectedRoute>
            <div className={styles.pageBackground}>
            <AdminMenu pageName='Admin Dashboard'/>
            <div className={styles.container}>
                <main className={styles.mainContainer}>
                    <section className={styles.dashboardSection}>
                        <div className={styles.dashboardContainer}>
                            <div className={styles.dashboardCard}>
                                <h2>Total Batches</h2>
                                <p>{dashboardData.totalBatches}</p>
                                <p className={styles.cardDescription}>The total number of batches currently available.</p>
                            </div>
                            <div className={styles.dashboardCard}>
                                <h2>Current Interns</h2>
                                <p>{dashboardData.currentInterns}</p>
                                <p className={styles.cardDescription}>The number of interns currently active in the program.</p>
                            </div>
                            <div className={styles.dashboardCard}>
                                <h2>All Interns</h2>
                                <p>{dashboardData.allInterns}</p>
                                <p className={styles.cardDescription}>The number of all interns previously or currently registered.</p>
                            </div>
                            <div className={styles.dashboardCard}>
                                <h2>Undergoing Onboarding</h2>
                                <p>{dashboardData.undergoingOnboarding}</p>
                                <p className={styles.cardDescription}>The number of interns currently in the onboarding process.</p>
                            </div>
                            <div className={styles.dashboardCard}>
                                <h2>Interns with 1 Week Left</h2>
                                <p>{dashboardData.internsWithOneWeekLeft}</p>
                                <p className={styles.cardDescription}>Interns whose remaining time is less than or equal to one week.</p>
                            </div>
                            <div className={styles.dashboardCard}>
                                <h2>Undergoing Offboarding</h2>
                                <p>{dashboardData.undergoingOffboarding}</p>
                                <p className={styles.cardDescription}>Interns who are in the process of being offboarded.</p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
            </div>
        </ProtectedRoute>
    );
}
