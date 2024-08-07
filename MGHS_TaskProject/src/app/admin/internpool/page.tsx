'use client';

import React, { useEffect, useState } from 'react';
import styles from './interntable.module.css';
import { fetchAllStudents, updateUserDetails, deleteUser } from '@/app/services/UserService';
import { UserDetails } from '@/types/user-details';
import AdminMenu from '@/app/components/AdminMenu';
import { FiDownload, FiEdit, FiTrash } from 'react-icons/fi';
import { toast } from 'sonner';
import { fetchAllBatches, createBatch, Batch, updateUserBatches } from '@/app/services/BatchService';
import { Timestamp } from 'firebase/firestore';
import ProtectedRoute from '@/app/components/ProtectedRoute';

// Function to get the current date
const getCurrentDate = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set time to midnight to avoid time part issues
    return now;
};

// Function to generate a batch name based on the start date
const generateBatchName = (startDate: Date) => {
    const year = startDate.getFullYear();
    const month = startDate.getMonth() + 1; // Months are zero-based
    return `Batch-${year}-${month < 10 ? `0${month}` : month}`;
};

export default function InternPool() {

    const [students, setStudents] = useState<UserDetails[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [localStatuses, setLocalStatuses] = useState<{ [key: number]: string }>({});
    const [batches, setBatches] = useState<Batch[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const internDetails = await fetchAllStudents();
                setStudents(internDetails);
                const initialStatuses = internDetails.reduce((acc, student, index) => {
                    acc[index] = student.onboarded || 'pending';
                    return acc;
                }, {} as { [key: number]: string });
                setLocalStatuses(initialStatuses);

                const batchDetails = await fetchAllBatches();
                setBatches(batchDetails);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleStatusChange = (index: number, event: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = event.target.value;
        setLocalStatuses(prevStatuses => ({
            ...prevStatuses,
            [index]: newStatus
        }));
    };

    const handleEditClick = (index: number) => {
        console.log(`Editing index: ${index}`);
        setEditingIndex(index);
    };

    const handleSaveClick = async (index: number) => {
        const newStatus = localStatuses[index];

        if (window.confirm('Are you sure you want to change the status?')) {
            
            const newStudents = [...students];
            const updatedStudent = { ...newStudents[index] };

            updatedStudent.onboarded = newStatus;

            // Update startDate if the status is 'approved'
            if (newStatus === 'approved') {
                const currentDate = getCurrentDate();
                updatedStudent.startDate = currentDate;

                // Check if there is an existing batch for the start date
                const batchExists = batches.some(batch => {
                    const start = batch.startDate instanceof Timestamp? batch.startDate.toDate() : batch.startDate;
                    const end = batch.endDate instanceof Timestamp? batch.endDate.toDate() : batch.endDate;
                    return currentDate >= start && currentDate <= end;
                });

                // If no batch exists, create a new one
                if (!batchExists) {
                    const newBatchName = generateBatchName(currentDate);
                    const newBatch: Batch = {
                        name: newBatchName,
                        startDate: currentDate,
                        endDate: new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days after start date
                    };
                    await createBatch(newBatch);

                    // Update local batches state
                    setBatches(prevBatches => [...prevBatches, newBatch]);

                    toast.success("New Batch Created")
                }

                // Assign the batch name to the student
                const assignedBatch = batches.find(batch => {
                    const start = batch.startDate instanceof Timestamp? batch.startDate.toDate() : batch.startDate;
                    const end = batch.endDate instanceof Timestamp? batch.endDate.toDate() : batch.endDate;
                    return currentDate >= start && currentDate <= end;
                });              
                
                if (assignedBatch) {
                    updatedStudent.batchName = assignedBatch.name;
                    toast.success(`Student Assigned to ${assignedBatch.name}`);
                }
            }

            newStudents[index] = updatedStudent;
            setStudents(newStudents);

            try {
                await updateUserDetails(updatedStudent.id!, updatedStudent);
                await updateUserBatches();
                toast.success('User status updated successfully!');
            } catch (error) {
                console.error('Error updating user details:', error);
                toast.error('Failed to update user status.');
            }

            setEditingIndex(null);
        }
    };

    const handleCancelClick = () => {
        setEditingIndex(null);
    };

    const handleDeleteClick = async (index: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            const userToDelete = students[index];
            try {
                await deleteUser(userToDelete.id!);
                const updatedStudents = students.filter((_, i) => i !== index);
                setStudents(updatedStudents);
                setLocalStatuses(prevStatuses => {
                    const newStatuses = { ...prevStatuses };
                    delete newStatuses[index];
                    return newStatuses;
                });
                toast.success('User deleted successfully!');
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user.');
            }
        }
    };

    return (
        <ProtectedRoute>
        <div className={styles.container}>
            <AdminMenu pageName='Intern Pool Table'/>
            <main className={styles.main}>
                <table className={styles['intern-table']}>
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Student Name</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={student.id}>
                                <td>{index + 1}</td>
                                <td>
                                    {student.firstname} {student.lastname}
                                </td>
                                <td className={styles[`status-${localStatuses[index] || 'pending'}`]}>
                                    {editingIndex === index ? (
                                        <select 
                                            id={`status-select-${index}`}
                                            value={localStatuses[index] || 'pending'}
                                            onChange={(event) => handleStatusChange(index, event)}
                                            className={styles.select}
                                        >
                                            <option className={styles['status-pending']} value="pending">Pending</option>
                                            <option className={styles['status-approved']} value="approved">Approved</option>
                                            <option className={styles['status-backout']} value="backout">Backout</option>
                                            <option className={styles['status-offboarding']} value="offboarding">Offboarding</option>
                                            <option className={styles['status-offboarded']} value="offboarded">Offboarded</option>
                                        </select>
                                    ) : (
                                        <span className={`${styles['status-select']} ${styles[localStatuses[index] || 'pending']}`}>
                                            {localStatuses[index] === 'approved' ? 'Approved' : 
                                            localStatuses[index] === 'backout' ? 'Backout' : 
                                            localStatuses[index] === 'offboarded' ? 'Offboarded' :
                                            localStatuses[index] === 'offboarding' ? 'Offboarding' : 
                                            'Pending'}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    {editingIndex === index ? (
                                        <div className={styles['button-group']}>
                                            <button className={`${styles.button} ${styles['buttonSave']}`} onClick={() => handleSaveClick(index)}>Save</button>
                                            <button className={`${styles.button} ${styles['buttonCancel']}`} onClick={handleCancelClick}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div className={styles.iconContainer}>
                                            <FiEdit onClick={() => handleEditClick(index)} />
                                            <FiTrash onClick={() => handleDeleteClick(index)} />
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
        </ProtectedRoute>
    );
}
