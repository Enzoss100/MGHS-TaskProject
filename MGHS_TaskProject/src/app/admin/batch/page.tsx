'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminMenu from '@/app/components/AdminMenu';
import styles from './batch.module.css';
import { fetchAllBatches, Batch, deleteBatch } from '@/app/services/BatchService';
import { deleteUser, fetchAllInternDetails, fetchInternsByBatch, updateUserDetails } from '@/app/services/UserService';
import BatchModal from './BatchModal';
import { FiEdit, FiTrash } from 'react-icons/fi';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';
import { UserDetails } from '@/types/user-details';
import { fetchAllRoles, Role } from '@/app/services/RoleService';

export default function BatchPage() {
    const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
    const [modalStat, setModalState] = useState(false);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [students, setStudents] = useState<UserDetails[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [localRoles, setLocalRoles] = useState<{ [key: number]: string }>({});
    const [localBatches, setLocalBatches] = useState<{ [key: number]: string }>({});
    const [batchEditingIndex, setBatchEditingIndex] = useState<number | null>(null);

    const fetchBatches = useCallback(async () => {
        const batchDetails = await fetchAllBatches();
        const batchRecords = batchDetails.map(batch => ({
            ...batch,
            startDate: batch.startDate instanceof Timestamp ? batch.startDate.toDate() : batch.startDate,
            endDate: batch.endDate instanceof Timestamp ? batch.endDate.toDate() : batch.endDate,
        }));
        setBatches(batchRecords);

        const internDetails = await fetchAllInternDetails();
                const internRecords = internDetails.map(intern => ({
                    ...intern,
                    startDate: intern.startDate instanceof Timestamp ? intern.startDate.toDate() : intern.startDate,
                }));

        setStudents(internRecords);

        const initialRoles = internDetails.reduce((acc, student, index) => {
            acc[index] = student.role || '';
            return acc;
        }, {} as { [key: number]: string });
        setLocalRoles(initialRoles);

        const initialBatches = internDetails.reduce((acc, student, index) => {
            acc[index] = student.batchName || '';
            return acc;
        }, {} as { [key: number]: string });
        setLocalBatches(initialBatches);

        if (batchRecords.length > 0) {
            handleBatchSelect(batchRecords[0]);
        }
    }, []);

    const fetchRoles = useCallback(async () => {
        try {
            const allRoles = await fetchAllRoles();
            setRoles(allRoles);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    }, []);

    useEffect(() => {
        fetchBatches();
        fetchRoles();
    }, [fetchBatches, fetchRoles]);

    const addBatch = () => {
        setCurrentBatch(null);
        setModalState(true);
    };

    const handleModalClose = () => {
        setModalState(false);
        fetchBatches();
    };

    const handleBatchSelect = async (batch: Batch) => {
        setCurrentBatch(batch);
        try {
            const internDetails = await fetchInternsByBatch(batch.name);
            const internRecords = internDetails.map(intern => ({
                ...intern,
                startDate: intern.startDate instanceof Timestamp ? intern.startDate.toDate() : intern.startDate,
            }));
            setStudents(internRecords);
        } catch (error) {
            console.error('Error fetching interns by batch:', error);
        }
    };

    const handleEditBatch = (batch: Batch) => {
        setCurrentBatch(batch);
        setModalState(true);
    };

    const handleDeleteBatch = async (batch: Batch) => {
        if (window.confirm(`Are you sure you want to delete the batch "${batch.name}"? This will also delete all associated records.`)) {
            try {
                await deleteBatch(batch.id!);
                fetchBatches();
                toast.success('Batch deleted successfully');
            } catch (error) {
                console.error('Error deleting batch:', error);
                toast.error('Failed to delete batch.');
            }
        }
    };

    const formatDate = (timestamp: { seconds: number; nanoseconds: number } | Date | string) => {
        let date: Date;
        if (timestamp instanceof Date) {
            date = timestamp;
        } else if (typeof timestamp === 'string') {
            date = new Date(timestamp);
        } else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
            date = new Date(timestamp.seconds * 1000);
        } else {
            return 'N/A';
        }
        if (isNaN(date.getTime())) return 'N/A';
        
        // Format date as words
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: '2-digit'
        });
    };

    const handleRoleChange = (index: number, event: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = event.target.value;
        setLocalRoles(prevRoles => ({
            ...prevRoles,
            [index]: newRole
        }));
    };

    const handleBatchChange = (index: number, event: React.ChangeEvent<HTMLSelectElement>) => {
        const newBatch = event.target.value;
        setLocalBatches(prevBatches => ({
            ...prevBatches,
            [index]: newBatch
        }));
    };

    const handleEditClick = (index: number) => {
        setEditingIndex(index);
    };

    const handleBatchEditClick = (index: number) => {
        setBatchEditingIndex(index);
    };

    const handleSaveClick = async (index: number) => {
        const newRole = localRoles[index];
        const newBatch = localBatches[index];

        if (window.confirm('Are you sure you want to save the changes?')) {
            const newStudents = [...students];
            const updatedStudent = { ...newStudents[index] };

            updatedStudent.role = newRole;
            updatedStudent.batchName = newBatch;

            newStudents[index] = updatedStudent;
            setStudents(newStudents);

            try {
                await updateUserDetails(updatedStudent.id!, updatedStudent);
                toast.success('User details updated successfully!');
            } catch (error) {
                console.error('Error updating user details:', error);
                toast.error('Failed to update user details.');
            }

            setEditingIndex(null);
            setBatchEditingIndex(null);
            fetchBatches();
        }
    };

    const handleCancelClick = () => {
        setEditingIndex(null);
        setBatchEditingIndex(null);
    };

    return (
        <ProtectedRoute>
            <div className={styles.container}>
                <AdminMenu pageName='Batches'/>
                <main className={styles.main}>
                    <div className={styles.sidebar}>
                        <button className={styles.addRole} onClick={addBatch}>Add New Batch</button>
                        <div className={styles.roleList}>
                            {batches.map(batch => (
                                <button 
                                    key={batch.id} 
                                    className={`${styles.role} 
                                    ${currentBatch?.id === batch.id ? styles.activeRole : ''}`} 
                                    onClick={() => handleBatchSelect(batch)}
                                    >
                                        {batch.name}
                                        </button>
                                        ))}
                                    </div>
                        </div>
                    <div className={styles.content}>
                        {currentBatch ? (
                            <div>
                                <div className={styles.roleHeader}>
                                <h2>{currentBatch.name} ({formatDate(currentBatch.startDate)} - {formatDate(currentBatch.endDate)})</h2>

                                <div className={styles.iconContainer}>
                                        <FiEdit size={20} onClick={(e) => { e.stopPropagation(); handleEditBatch(currentBatch); }} />
                                        <FiTrash size={20} onClick={(e) => { e.stopPropagation(); handleDeleteBatch(currentBatch); }} />
                                </div>
                                </div>
                                
                                <table className={styles['intern-table']}>
                                    <thead>
                                        <tr>
                                            <th>No.</th>
                                            <th>Name</th>
                                            <th>Role</th>
                                            <th>Start Date</th>
                                            <th>Edit Role</th>
                                            <th>Edit Batch</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student, index) => (
                                            <tr key={student.id}>
                                                <td>{index + 1}</td>
                                                <td>{`${student.firstname} ${student.lastname}`}</td>
                                                <td>
                                                {editingIndex === index ? (
                                                    <select 
                                                    value={localRoles[index]} 
                                                    onChange={event => handleRoleChange(index, event)}
                                                    >
                                                        <option value="">Select Role</option>
                                                        {roles.map(role => (
                                                            <option key={role.id} value={role.roleName}>{role.roleName}</option>
                                                        ))}
                                                    </select>
                                                 ) : (
                                                    student.role || 'N/A'
                                                    )}
                                                </td>
                                                <td>{formatDate(student.startDate)}</td>
                                                <td>
                                                {editingIndex === index ? (
                                                    <div className={styles['button-group']}>
                                                      <button className={styles.button + ' ' + styles.buttonSave} onClick={() => handleSaveClick(index)}>Save</button>
                                                      <button className={styles.button + ' ' + styles.buttonCancel} onClick={handleCancelClick}>Cancel</button>
                                                    </div>
                                                    ) : (
                                                    <div className={styles.iconContainer}>
                                                      <FiEdit onClick={() => handleEditClick(index)} />
                                                    </div>        
                                                  )}
                                                </td>
                                                <td>                                        
                                                    {batchEditingIndex === index ? (
                                                        <div className={styles['button-group']}>
                                                            <select className={styles.batchSelect} value={localBatches[index]} onChange={event => handleBatchChange(index, event)}>
                                                               
                                                                {batches.map(batch => (
                                                                    <option key={batch.id} value={batch.name}>{batch.name}</option>
                                                                ))}
                                                            </select>
                                                            <button className={styles.button + ' ' + styles.buttonSave} onClick={() => handleSaveClick(index)}>Save</button>
                                                            <button className={styles.button + ' ' + styles.buttonCancel} onClick={handleCancelClick}>Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                        className={styles.changeBatchBtn}
                                                        onClick={() => handleBatchEditClick(index)}
                                                    >
                                                        Change Batch
                                                    </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>Please select a batch to view its interns.</p>
                        )}
                    </div>
                    {modalStat && 
                        <BatchModal 
                            initialBatch={currentBatch || undefined}
                            batchID={currentBatch?.id || null} 
                            setModalState={handleModalClose} />}
                </main>
            </div>
        </ProtectedRoute>
    );
}
