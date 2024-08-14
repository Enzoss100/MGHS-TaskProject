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
    const [editingIndex, setEditingIndex] = useState<string | null>(null);
    const [localStatuses, setLocalStatuses] = useState<{ [key: string]: string }>({});
    const [batches, setBatches] = useState<Batch[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
    const [originalStatuses, setOriginalStatuses] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const internDetails = await fetchAllStudents();
                setStudents(internDetails);
                const initialStatuses = internDetails.reduce((acc, student) => {
                    acc[student.id!] = student.onboarded || 'pending';
                    return acc;
                }, {} as { [key: string]: string });
                setLocalStatuses(initialStatuses);

                const batchDetails = await fetchAllBatches();
                setBatches(batchDetails);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleStatusChange = (studentId: string, event: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = event.target.value;
        setLocalStatuses(prevStatuses => ({
            ...prevStatuses,
            [studentId]: newStatus
        }));
    };

    const handleEditClick = (studentId: string) => {
        setEditingIndex(studentId);
        setOriginalStatuses(prev => ({
            ...prev,
            [studentId]: localStatuses[studentId] || 'pending'
        }));
        setIsEditing(prev => ({ ...prev, [studentId]: true }));
    };

    const handleSaveClick = async (studentId: string) => {
        const newStatus = localStatuses[studentId];

        if (window.confirm('Are you sure you want to change the status?')) {

            const updatedStudent = students.find(student => student.id === studentId)!;
            updatedStudent.onboarded = newStatus;

            if (newStatus === 'approved') {
                const currentDate = getCurrentDate();
                updatedStudent.startDate = currentDate;

                const batchExists = batches.some(batch => {
                    const start = batch.startDate instanceof Timestamp ? batch.startDate.toDate() : batch.startDate;
                    const end = batch.endDate instanceof Timestamp ? batch.endDate.toDate() : batch.endDate;
                    return currentDate >= start && currentDate <= end;
                });

                if (!batchExists) {
                    const newBatchName = generateBatchName(currentDate);
                    const newBatch: Batch = {
                        name: newBatchName,
                        startDate: currentDate,
                        endDate: new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000),
                    };
                    await createBatch(newBatch);
                    setBatches(prevBatches => [...prevBatches, newBatch]);
                    toast.success("New Batch Created")
                }

                const assignedBatch = batches.find(batch => {
                    const start = batch.startDate instanceof Timestamp ? batch.startDate.toDate() : batch.startDate;
                    const end = batch.endDate instanceof Timestamp ? batch.endDate.toDate() : batch.endDate;
                    return currentDate >= start && currentDate <= end;
                });

                if (assignedBatch) {
                    updatedStudent.batchName = assignedBatch.name;
                    toast.success(`Student Assigned to ${assignedBatch.name}`);
                }
            }

            try {
                await updateUserDetails(updatedStudent.id!, updatedStudent);
                await updateUserBatches();
                setStudents(prevStudents => prevStudents.map(student => student.id === studentId ? updatedStudent : student));
                toast.success('User status updated successfully!');
            } catch (error) {
                console.error('Error updating user details:', error);
                toast.error('Failed to update user status.');
            }

            setEditingIndex(null);
            setIsEditing(prev => ({ ...prev, [studentId]: false }));
        }
    };

    const handleCancelClick = () => {
        if (editingIndex) {
            // Restore the original status
            setLocalStatuses(prevStatuses => ({
                ...prevStatuses,
                [editingIndex]: originalStatuses[editingIndex] || 'pending'
            }));
            setEditingIndex(null);
            setIsEditing(prev => ({ ...prev, [editingIndex]: false }));
        }
    };

    const handleDeleteClick = async (studentId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(studentId);
                setStudents(prevStudents => prevStudents.filter(student => student.id !== studentId));
                setLocalStatuses(prevStatuses => {
                    const newStatuses = { ...prevStatuses };
                    delete newStatuses[studentId];
                    return newStatuses;
                });
                toast.success('User deleted successfully!');
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user.');
            }
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              student.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              student.personalemail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              student.schoolemail.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || localStatuses[student.id!] === statusFilter;
        const isBeingEdited = isEditing[student.id!] || false;
        return (matchesSearch && matchesStatus) || isBeingEdited;
    });

    return (
        <ProtectedRoute>
        <div className={styles.container}>
            <AdminMenu pageName='Intern Pool Table'/>
            <main className={styles.main}>
            <div className={styles['search-filter-container']}>
                <input 
                    type="text" 
                    placeholder="Search students..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className={styles.searchBar}
                />
                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)} 
                    className={styles.statusFilter}
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="backout">Backout</option>
                    <option value="offboarding">Offboarding</option>
                    <option value="offboarded">Offboarded</option>
                </select>
             </div>
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
                        {filteredStudents.map((student, filteredIndex) => {
                            return (
                                <tr key={student.id}>
                                    <td>{filteredIndex + 1}</td>
                                    <td>
                                        {student.firstname} {student.lastname}
                                    </td>
                                    <td className={styles[`status-${localStatuses[student.id!] || 'pending'}`]}>
                                        {editingIndex === student.id ? (
                                            <select 
                                                id={`status-select-${filteredIndex}`}
                                                value={localStatuses[student.id!] || 'pending'}
                                                onChange={(event) => handleStatusChange(student.id!, event)}
                                                className={styles.select}
                                            >
                                                <option className={styles['status-pending']} value="pending">Pending</option>
                                                <option className={styles['status-approved']} value="approved">Approved</option>
                                                <option className={styles['status-backout']} value="backout">Backout</option>
                                                <option className={styles['status-offboarding']} value="offboarding">Offboarding</option>
                                                <option className={styles['status-offboarded']} value="offboarded">Offboarded</option>
                                            </select>
                                        ) : (
                                            <span className={styles[`status-${localStatuses[student.id!] || 'pending'}`]}>
                                                    {localStatuses[student.id!] || 'Pending'}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {editingIndex === student.id ? (
                                            <div className={styles['button-group']}>
                                                <button className={`${styles.button} ${styles['buttonSave']}`} onClick={() => handleSaveClick(student.id!)}>Save</button>
                                                <button className={`${styles.button} ${styles['buttonCancel']}`} onClick={handleCancelClick}>Cancel</button>
                                            </div>
                                    ) : (
                                        <div className={styles.iconContainer}>
                                            <FiEdit onClick={() => handleEditClick(student.id!)} />
                                            <FiTrash onClick={() => handleDeleteClick(student.id!)} />
                                        </div>
                                    )}
                                </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </main>
        </div>
        </ProtectedRoute>
    );
}
