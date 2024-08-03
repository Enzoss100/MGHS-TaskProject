'use client';

import React, { useEffect, useState } from 'react';
import AdminMenu from '@/app/components/AdminMenu'; // Adjust the import path as necessary

export default function Dashboard () {
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
                // Simulate fetching data
                const exampleData = {
                    totalBatches: 3,
                    currentInterns: 30,
                    allInterns: 120,
                    undergoingOnboarding: 5,
                    internsWithOneWeekLeft: 20,
                    undergoingOffboarding: 4
                };
                
                // Simulate data fetch delay
                setTimeout(() => {
                    setDashboardData(exampleData);
                }, 2000);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div>
            <AdminMenu />
            <main>
                <div className="dashboard-container">
                    <button className="dashboard-card" id="totalBatches">
                        <h2>Total Batches</h2>
                        <p>{dashboardData.totalBatches}</p>
                    </button>
                    <button className="dashboard-card" id="currentInterns">
                        <h2>Current Interns</h2>
                        <p>{dashboardData.currentInterns}</p>
                    </button>
                    <button className="dashboard-card" id="allInterns">
                        <h2>All Interns</h2>
                        <p>{dashboardData.allInterns}</p>
                    </button>
                    <button className="dashboard-card" id="undergoingOnboarding">
                        <h2>Undergoing Onboarding</h2>
                        <p>{dashboardData.undergoingOnboarding}</p>
                    </button>
                    <button className="dashboard-card" id="internsWithOneWeekLeft">
                        <h2>Interns with 1 Week Left</h2>
                        <p>{dashboardData.internsWithOneWeekLeft}</p>
                    </button>
                    <button className="dashboard-card" id="undergoingOffboarding">
                        <h2>Undergoing Offboarding</h2>
                        <p>{dashboardData.undergoingOffboarding}</p>
                    </button>
                </div>
            </main>
        </div>
    );
};
