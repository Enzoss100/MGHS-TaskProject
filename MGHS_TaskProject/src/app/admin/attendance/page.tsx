'use client';

import React, { useState, useEffect } from 'react';
import styles from './attendance.module.css';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import AdminMenu from '@/app/components/AdminMenu';
import { fetchAllBatches, Batch } from '@/app/services/BatchService';
import { fetchAllStudents, updateUserDetails } from '@/app/services/UserService';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { toast } from 'sonner';
import { UserDetails } from '@/types/user-details';
import AbsenceModal from './AbsenceModal';

export default function AdminAttendance() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [students, setStudents] = useState<UserDetails[]>([]);
    const [collapsedBatches, setCollapsedBatches] = useState<{ [key: string]: boolean }>({});
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedStudent, setSelectedStudent] = useState<UserDetails | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const batchDetails = await fetchAllBatches();
                setBatches(batchDetails);
    
                const studentDetails = await fetchAllStudents();
                setStudents(studentDetails);
    
                // Initialize all batches as collapsed
                const initialCollapsedState = batchDetails.reduce((acc, batch) => {
                    acc[batch.name] = true; // true indicates collapsed
                    return acc;
                }, {} as { [key: string]: boolean });
    
                setCollapsedBatches(initialCollapsedState);
    
            } catch (error) {
                console.error('Error fetching details:', error);
            }
        };
    
        fetchData();
    }, []);

    const toggleBatchCollapse = (batchName: string) => {
        setCollapsedBatches(prevState => ({
            ...prevState,
            [batchName]: !prevState[batchName],
        }));
    };

    const handleMarkAbsent = (student: UserDetails) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedStudent(null);
    };

    const handleModalSave = async (updatedStudent: UserDetails) => {
        try {
            await updateUserDetails(updatedStudent.id!, updatedStudent);
            const updatedStudents = students.map(student => student.id === updatedStudent.id ? updatedStudent : student);
            setStudents(updatedStudents);
            toast.success('Student marked as absent successfully!');
        } catch (error) {
            console.error('Error marking student absent:', error);
            toast.error('Failed to mark student absent.');
        }
        handleModalClose();
    };

    return (
        <ProtectedRoute>
            <div className={styles.container}>
                <AdminMenu pageName='Attendance' />
                <div className={styles.legend}>
                    <span className={styles['legend-item']}><span className={styles['status-offboarding']}></span> Offboarding</span>
                    <span className={styles['legend-item']}><span className={styles['status-offboarded']}></span> Offboarded</span>
                </div>
                {batches.length === 0 ? (
                    <center><p>No Batch Tables were created yet</p></center>
                ) : (
                    batches.map(batch => (
                        <div key={batch.id}>
                            <div className={styles.batchHeader}>
                                <div onClick={() => toggleBatchCollapse(batch.name)} className={styles.batchTitle}>
                                    <div className={styles.headerActions}>
                                        <h3>{batch.name}</h3>
                                    </div>
                                </div>
                                <div onClick={() => toggleBatchCollapse(batch.name)} className={styles.collapseIcon}>
                                    {collapsedBatches[batch.name] ? <FiChevronDown size={20} /> : <FiChevronUp size={20} />}
                                </div>
                            </div>
                            
                            {!collapsedBatches[batch.name] && (
                                <table className={styles['attendance-table']}>
                                    <thead>
                                        <tr>
                                            <th>No.</th>
                                            <th>Student Name</th>
                                            <th>Number of Absences</th>
                                            <th>Total Hours Rendered</th>
                                            <th>Hours Needed</th>
                                            <th>Hours Left for Completion</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.filter(student => student.batchName === batch.name).length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className={styles.noUsersMessage}>No users in this batch yet</td>
                                            </tr>
                                        ) : (
                                            students.filter(student => student.batchName === batch.name).map((student, index) => (
                                                <tr key={student.id} className={styles[`status-${student.onboarded}`]}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        {`${student.firstname} ${student.lastname}`}
                                                    </td>
                                                    <td>
                                                        {student.absences ? student.absences.length : 0}
                                                    </td>
                                                    <td>
                                                        {student.totalHoursRendered ?? 'None'}
                                                    </td>
                                                    <td>
                                                        {student.hoursNeeded ?? 'None'}
                                                    </td>
                                                    <td>
                                                        {student.hoursNeeded && student.totalHoursRendered
                                                            ? student.hoursNeeded - student.totalHoursRendered
                                                            : 'None'}
                                                    </td>
                                                    <td>
                                                        <button onClick={() => handleMarkAbsent(student)} className={styles.buttonMarkAbsent}>Mark Absent</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ))
                )}

                {isModalOpen && selectedStudent && (
                    <AbsenceModal
                        student={selectedStudent}
                        onClose={handleModalClose}
                        onSave={handleModalSave}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
}