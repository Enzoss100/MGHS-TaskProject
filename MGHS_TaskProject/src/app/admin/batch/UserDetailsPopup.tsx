// src/app/components/UserDetailsPopup.tsx

import React from 'react';
import styles from './UserDetailsPopup.module.css';

interface UserDetailsPopupProps {
    user: {
        firstname: string;
        lastname: string;
        mghsemail: string;
        personalemail: string;
        schoolemail: string;
        role?: string;
        position?: string;
        onboarded: string;
        startDate?: Date | null;
        hoursNeeded: number;
        totalHoursRendered: number;
        batchName: string;
    };
    onClose: () => void;
}

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

const UserDetailsPopup: React.FC<UserDetailsPopupProps> = ({ user, onClose }) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <button className={styles.closeButton} onClick={onClose}>X</button>
                <h2>{user.firstname} {user.lastname}</h2>
                <p><strong>MGHS Email:</strong> {user.mghsemail}</p>
                <p><strong>Personal Email:</strong> {user.personalemail}</p>
                <p><strong>School Email:</strong> {user.schoolemail}</p>
                <p><strong>Role:</strong> {user.role || 'N/A'}</p>
                <p><strong>Position:</strong> {user.position || 'N/A'}</p>
                <p><strong>Status:</strong> {user.onboarded}</p>
                <p><strong>Start Date:</strong> {user.startDate ? formatDate(user.startDate): 'N/A'}</p>
                <p><strong>Hours Needed:</strong> {user.hoursNeeded}</p>
                <p><strong>Total Hours Rendered:</strong> {user.totalHoursRendered}</p>
                <p><strong>Batch Name:</strong> {user.batchName}</p>
            </div>
        </div>
    );
};

export default UserDetailsPopup;
