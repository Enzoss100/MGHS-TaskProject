'use client';

import React, { useEffect, useState } from 'react';
import { fetchAllInternDetails, fetchInternsByBatch, updateUserDetails, deleteUser } from '@/app/services/UserService';
import { UserDetails } from '@/types/user-details';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import styles from './batch.module.css';
import { FiEdit, FiTrash, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { toast } from 'sonner';
import AdminMenu from '@/app/components/AdminMenu';
import { Batch, deleteBatch, fetchAllBatches, updateUserBatches } from '@/app/services/BatchService';
import BatchModal from './BatchModal';
import { Timestamp } from 'firebase/firestore';

export default function InternTable() {
    const session = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/signin');
        },
    });

    const [students, setStudents] = useState<UserDetails[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [localRoles, setLocalRoles] = useState<{ [key: number]: string }>({});
    const [collapsedBatches, setCollapsedBatches] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const internDetails = await fetchAllInternDetails();

                const internRecords = internDetails.map(intern => ({
                    ...intern,
                    startDate: intern.startDate instanceof Timestamp? intern.startDate.toDate() : intern.startDate,
                }))

                setStudents(internRecords);
                console.log('Students:', internRecords);

                const initialRoles = internDetails.reduce((acc, student, index) => {
                    acc[index] = student.role || '';
                    return acc;
                }, {} as { [key: number]: string });
                setLocalRoles(initialRoles);

                const batchDetails = await fetchAllBatches();

                const batchRecord = batchDetails.map(batch => ({
                    ...batch,
                    startDate: batch.startDate instanceof Timestamp? batch.startDate.toDate() : batch.startDate,
                    endDate: batch.endDate instanceof Timestamp? batch.endDate.toDate() : batch.endDate,
                }))

                setBatches(batchRecord);
                
                // Ensure batches are up-to-date
                await updateUserBatches();

            } catch (error) {
                console.error('Error fetching intern details:', error);
            }
        };

        fetchDetails();
    }, []);

    const toggleBatchCollapse = (batchName: string) => {
        setCollapsedBatches(prevState => ({
            ...prevState,
            [batchName]: !prevState[batchName],
        }));
    };

    const handleBatchSelect = async (batch: Batch) => {
        setSelectedBatch(batch);
        try {
            const internDetails = await fetchInternsByBatch(batch.name);

            const internRecords = internDetails.map(intern => ({
                ...intern,
                startDate: intern.startDate instanceof Timestamp? intern.startDate.toDate() : intern.startDate,
            }))

            setStudents(internRecords);
        } catch (error) {
            console.error('Error fetching interns by batch:', error);
        }
    };

    const handleRoleChange = (index: number, event: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = event.target.value;
        setLocalRoles(prevRoles => ({
            ...prevRoles,
            [index]: newRole
        }));
    };

    const handleEditClick = (index: number) => {
        setEditingIndex(index);
    };

    const handleSaveClick = async (index: number) => {
        const newRole = localRoles[index];

        if (window.confirm('Are you sure you want to change the role?')) {
            const newStudents = [...students];
            const updatedStudent = { ...newStudents[index] };

            updatedStudent.role = newRole;

            newStudents[index] = updatedStudent;
            setStudents(newStudents);

            try {
                await updateUserDetails(updatedStudent.id!, updatedStudent);
                toast.success('User role updated successfully!');
            } catch (error) {
                console.error('Error updating user details:', error);
                toast.error('Failed to update user role.');
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
                setLocalRoles(prevRoles => {
                    const newRoles = { ...prevRoles };
                    delete newRoles[index];
                    return newRoles;
                });
                toast.success('User deleted successfully!');
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user.');
            }
        }
    };

    const handleBatchEdit = (batch: any) => {
        setCurrentBatch(batch);
        setModalVisible(true);
    };

    const handleBatchAdd = () => {
        setCurrentBatch(null);
        setModalVisible(true);
    };

    const handleDeleteBatch = async (id: string) => {
        const confirmation = window.confirm("Are you sure you want to delete this Batch? This will also delete the records of all users inside the batch.");
        if (confirmation) {
            try {
                // Delete the batch
                await deleteBatch(id);

                // Update the batches state
                const updatedBatches = batches.filter(batch => batch.id !== id);
                setBatches(updatedBatches);

                // Fetch the latest list of batches to ensure consistency
                const refreshedBatches = await fetchAllBatches();
                setBatches(refreshedBatches);

                // Clear students if the deleted batch was selected
                if (selectedBatch?.id === id) {
                    setStudents([]);
                    setSelectedBatch(null);
                }

                toast.success('Batch deleted successfully');
            } catch (error) {
                toast.error('An error occurred while deleting the batch');
                console.error(error);
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
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${day}-${month}-${year}`;
    };


    return (
        <div className={styles.container}>
            <AdminMenu pageName='Batches' />
            <button className={styles['add-batch-btn']} onClick={handleBatchAdd}>Add New Batch</button>
            <BatchModal 
                isVisible={isModalVisible} 
                setModalState={setModalVisible} 
                initialBatch={currentBatch || undefined}
                batchID={currentBatch?.id || null}
            />

            {batches.length === 0 ? (
                <center><p>No Batch Tables were created yet</p></center>
            ) : (
                batches.map(batch => (
                    <div key={batch.name}>
                        <div className={styles.batchHeader}>
                            <div onClick={() => handleBatchSelect(batch)} className={styles.batchTitle}>
                                <div className={styles.headerActions}>
                                    <h3>{batch.name}</h3>
                                    <div className={styles.iconContainer}>
                                        <FiEdit size={20} onClick={(e) => {e.stopPropagation(); handleBatchEdit(batch); }} />
                                        <FiTrash size={20} onClick={(e) => {e.stopPropagation(); handleDeleteBatch(batch.id!); }} />
                                    </div>
                                </div>
                            </div>
                            <div onClick={() => toggleBatchCollapse(batch.name)} className={styles.collapseIcon}>
                                {collapsedBatches[batch.name] ? <FiChevronDown size={20} /> : <FiChevronUp size={20} />}
                            </div>
                        </div>

                        {!collapsedBatches[batch.name] && (
                            <table className={styles['intern-table']}>
                                <thead>
                                    <tr>
                                        <th>No.</th>
                                        <th>Student Name</th>
                                        <th>Role</th>
                                        <th>Position</th>
                                        <th>Start Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students
                                        .filter(student => student.batchName === batch.name)
                                        .map((student, index) => (
                                            <tr key={student.id}>
                                                <td>{index + 1}</td>
                                                <td>{student.firstname} {student.lastname}</td>
                                                <td>
                                                    {editingIndex === index ? (
                                                        <select
                                                            value={localRoles[index] || ''}
                                                            onChange={event => handleRoleChange(index, event)}
                                                        >
                                                            <option value="">Select a role</option>
                                                            <option value="Role1">Role1</option>
                                                            <option value="Role2">Role2</option>
                                                            <option value="Role3">Role3</option>
                                                            {/* Add more options as needed */}
                                                        </select>
                                                    ) : (
                                                        student.role || 'N/A'
                                                    )}
                                                </td>
                                                <td>{student.position}</td>
                                                <td>{formatDate(student.startDate)}</td>
                                                <td className={styles.actionButtons}>
                                                    {editingIndex === index ? (
                                                        <div className={styles['button-group']}>
                                                            <button onClick={() => handleSaveClick(index)} className={styles['save-button']}>Save</button>
                                                            <button onClick={handleCancelClick} className={styles['cancel-button']}>Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <div className={styles['icon-container']}>
                                                            <FiEdit size={20} onClick={() => handleEditClick(index)} />
                                                            <FiTrash size={20} onClick={() => handleDeleteClick(index)} />
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
