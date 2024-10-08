'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminMenu from '@/app/components/AdminMenu';
import styles from './batch.module.css';
import { fetchAllBatches, Batch, deleteBatch } from '@/app/services/BatchService';
import { fetchAllInternDetails, fetchInternsByBatch, updateUserDetails } from '@/app/services/UserService';
import BatchModal from './BatchModal';
import { FiDownload, FiEdit, FiTrash } from 'react-icons/fi';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';
import { UserDetails } from '@/types/user-details';
import { fetchAllRoles, Role } from '@/app/services/RoleService';
import UserDetailsPopup from './UserDetailsPopup';
import * as XLSX from 'xlsx'; 

// Function to export user details to Excel
const exportToExcel = (students: UserDetails[]) => {
    const confirmation = window.confirm("Are you sure you want to download the Excel file?");
  
    if (!confirmation) {
      return; // If the user cancels, do nothing
    }
    // Create a worksheet from the data
    const ws = XLSX.utils.json_to_sheet(students.map(student => ({
        'First Name': student.firstname || 'N/A',
        'Last Name': student.lastname || 'N/A',
        'Personal Email': student.personalemail || 'N/A',
        'School Email': student.schoolemail || 'N/A',
        'MGHS Email': student.mghsemail || 'N/A',
        'Status': student.onboarded || 'N/A',
        'Start Date': student.startDate ? formatDate(student.startDate) : 'N/A',
        'Batch Name': student.batchName || 'N/A',
        'Total Rendered Hours': student.totalHoursRendered || 'N/A',
        'Total Hours Needed': student.hoursNeeded || 'N/A',
        'Total Hours Left': student.hoursNeeded - student.totalHoursRendered,
    })));

    // Create a new workbook and add the worksheet to it
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Interns');

    // Export the workbook to a file
    XLSX.writeFile(wb, 'interns.xlsx');
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
    const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null); 
    const [showPopup, setShowPopup] = useState(false); 
    const [searchQuery, setSearchQuery] = useState("");

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
        // Check if there are any users assigned to the batch
        const usersInBatch = students.filter(student => student.batchName === batch.name);
        
        if (usersInBatch.length > 0) {
            toast.error('Cannot delete batch because there are still users assigned to this batch. Change the Batch of the Users or Edit the Batch Details instead.');
            return;
        }
    
        if (window.confirm(`Are you sure you want to delete the batch "${batch.name}"?`)) {
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

    const handleEditClick = (filteredIndex: number) => {
        const originalIndex = students.findIndex(student => student.id === filteredStudents[filteredIndex].id);
        setEditingIndex(originalIndex);
    };
    
    const handleBatchEditClick = (filteredIndex: number) => {
        const originalIndex = students.findIndex(student => student.id === filteredStudents[filteredIndex].id);
        setBatchEditingIndex(originalIndex);
    };

    // Save role changes
    const handleSaveRole = async (index: number) => {
        const newRole = localRoles[index];

        if (window.confirm('Are you sure you want to save the role change?')) {
            const updatedStudent = { ...students[index], role: newRole };
            const newStudents = [...students];
            newStudents[index] = updatedStudent;
            setStudents(newStudents);

            try {
                await updateUserDetails(updatedStudent.id!, updatedStudent);
                toast.success('Role updated successfully!');
            } catch (error) {
                console.error('Error updating role:', error);
                toast.error('Failed to update role.');
            }

            setEditingIndex(null);
            fetchBatches();
        }
    };

    // Save batch changes
    const handleSaveBatch = async (index: number) => {
        const newBatch = localBatches[index];

        if (window.confirm('Are you sure you want to save the batch change?')) {
            const updatedStudent = { ...students[index], batchName: newBatch };
            const newStudents = [...students];
            newStudents[index] = updatedStudent;
            setStudents(newStudents);

            try {
                await updateUserDetails(updatedStudent.id!, updatedStudent);
                toast.success('Batch updated successfully!');
            } catch (error) {
                console.error('Error updating batch:', error);
                toast.error('Failed to update batch.');
            }

            setBatchEditingIndex(null);
            fetchBatches();
        }
    };

    const handleCancelClick = () => {
        setEditingIndex(null);
        setBatchEditingIndex(null);
    };

    const handleUserNameClick = (user: UserDetails) => {
        setSelectedUser(user);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedUser(null);
    };

    const filteredStudents = students.filter(student => 
        student.firstname.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.lastname.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.personalemail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.schoolemail.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

                                <button className={`${styles.button} ${styles['buttonExport']}`} onClick={() => exportToExcel(students)}>
                                    <FiDownload /> Export to Excel
                                </button>
                                
                                <input 
                                    type="text" 
                                    placeholder="Search students..." 
                                    value={searchQuery} 
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                    className={styles.searchBar}
                                />  

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
    {students.length === 0 ? (
        <tr>
            <td colSpan={6} className={styles.noUsersMessage}>No users in this batch yet</td>
        </tr>
    ) : (
        filteredStudents.map((student, filteredIndex) => {
            const originalIndex = students.findIndex(s => s.id === student.id);
            // Determine the row class based on the student's status and hours left
            const rowClass = student.onboarded === 'offboarding' ? styles.offboarding
                : student.onboarded === 'offboarded' ? styles.offboarded
                : student.hoursNeeded - student.totalHoursRendered <= 40 ? styles.lessHours
                : '';

                    return (
                        <tr key={student.id} className={rowClass}>
                            <td>{filteredIndex + 1}</td>
                            <td className={styles.nameClick} onClick={() => handleUserNameClick(student)}>
                                {student.firstname} {student.lastname}
                            </td>
                            <td>
                                {editingIndex === originalIndex ? (
                                    <select 
                                        value={localRoles[originalIndex]} 
                                        onChange={event => handleRoleChange(originalIndex, event)}
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
                            <td>{formatDate(student.startDate!)}</td>
                            <td>
                                {editingIndex === originalIndex ? (
                                    <div className={styles['button-group']}>
                                        <button className={`${styles.button} ${styles.buttonSave}`} onClick={() => handleSaveRole(originalIndex)}>Save</button>
                                        <button className={`${styles.button} ${styles.buttonCancel}`} onClick={handleCancelClick}>Cancel</button>
                                    </div>
                                ) : (
                                    <button
                                        className={styles.changeBatchBtn}
                                        onClick={() => handleEditClick(filteredIndex)}
                                    >
                                        Change Intern Role
                                    </button>     
                                )}
                            </td>
                            <td>
                                {batchEditingIndex === originalIndex ? (
                                    <div className={styles['button-group']}>
                                        <select className={styles.batchSelect} value={localBatches[originalIndex]} onChange={event => handleBatchChange(originalIndex, event)}>
                                            {batches.map(batch => (
                                                <option key={batch.id} value={batch.name}>{batch.name}</option>
                                            ))}
                                        </select>
                                        <button className={`${styles.button} ${styles.buttonSave}`} onClick={() => handleSaveBatch(originalIndex)}>Save</button>
                                        <button className={`${styles.button} ${styles.buttonCancel}`} onClick={handleCancelClick}>Cancel</button>
                                    </div>
                                ) : (
                                    <button
                                        className={styles.changeBatchBtn}
                                        onClick={() => handleBatchEditClick(filteredIndex)}
                                    >
                                        Change Intern Batch
                                    </button>
                                )}
                            </td>
                        </tr>
                                );
                        })
                    )}
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
                {showPopup && selectedUser && (
                <UserDetailsPopup user={selectedUser} onClose={handleClosePopup} />
            )}
            </div>
        </ProtectedRoute>
    );
}
