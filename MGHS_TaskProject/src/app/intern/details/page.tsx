'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { UserDetails } from '@/types/user-details';
import { toast } from 'sonner';
import { fetchUserDetails, updateUserDetails, fetchInternsByBatch } from '@/app/services/UserService';
import { useEffect, useState } from 'react';
import HamburgerMenu from '@/app/components/HamburgerMenu';
import styles from './details.module.css';
import { getAuth, updateEmail, sendEmailVerification } from 'firebase/auth';
import InternProtectedRoute from '@/app/components/InternProtectedRoute';
import { Timestamp } from 'firebase/firestore';

export default function InternDetails() {
    const { data: session } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/signin');
        },
    });

    const [internDetails, setInternDetails] = useState<UserDetails | null>(null);
    const [allInterns, setAllInterns] = useState<UserDetails[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingStartDate, setIsEditingStartDate] = useState(false);
    const [isEditingMGHSEmail, setIsEditingMGHSEmail] = useState(false);
    const [hoursLeft, setHoursLeft] = useState('');

    useEffect(() => {
        const getInternDetails = async () => {
            const email = session?.user?.email;

            if (!email) {
                toast.error('Email is not available');
                return;
            }

            try {
                const userDetails: UserDetails[] = await fetchUserDetails(email);

                if (userDetails.length > 0) {
                    const user = userDetails[0] as UserDetails;
                    setInternDetails(user);

                    // Fetch interns in the same batch
                    const interns = await fetchInternsByBatch(user.batchName);
                    setAllInterns(interns);
                    
                    const hours = user.hoursNeeded - user.totalHoursRendered;
                    setHoursLeft(hours.toString());
                    
                } else {
                    toast.error('User not found');
                }
            } catch (error) {
                toast.error('An error occurred while fetching user details');
                console.error(error);
            }
        };

        getInternDetails();
    }, [session]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInternDetails(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleStartDateEditToggle = () => {
        setIsEditingStartDate(!isEditingStartDate);
    }; 
    
    const handleEditMGHS = () => {
        setIsEditingMGHSEmail(!isEditingMGHSEmail);
    }; 

    const handleSaveStartDate = async () => {
        if (internDetails) {
            // Validate and parse the startDate
            const startDate = internDetails.startDate ? new Date(internDetails.startDate) : null;
            if (startDate && isNaN(startDate.getTime())) {
                toast.error('Invalid start date');
                return;
            }

            // Update the internDetails with the Date object
            const updatedDetails = {
                ...internDetails,
                startDate,
            };

            try {
                await updateUserDetails(internDetails.id as string, updatedDetails);
                toast.success('Start date updated successfully');
                setIsEditingStartDate(false);
            } catch (error) {
                toast.error('Failed to update start date');
                console.error(error);
            }
        }
    };

    const handleSaveDetails = async () => {
        if (internDetails) {
            const updatedDetails = { 
                ...internDetails };
            
            try {
                await updateUserDetails(internDetails.id as string, updatedDetails);
                toast.success('Details updated successfully');
        
                setIsEditing(false);
            } catch (error) {
                toast.error('Failed to update details');
                console.error(error);
            }
        }
    };
     
    const formatDate = (date: Date | Timestamp | null) => {
        if (!date) return '';
        
        // Convert Firebase Timestamp to Date if needed
        const d = date instanceof Timestamp ? date.toDate() : new Date(date);
    
        const year = d.getFullYear();
        const month = ('0' + (d.getMonth() + 1)).slice(-2);
        const day = ('0' + d.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    };

    return (
        <InternProtectedRoute>
        <div className={styles.container}>
            <HamburgerMenu internName={internDetails?.firstname} />
            <div className={styles.content}>
                <div className={styles.leftContainer}>
                    <form className={styles.detailForm} method='POST'>
                    <div className={styles.infoItem}>
                            <label htmlFor="start-date" className={styles.detailLabel}>Start Date:</label>
                            <input 
                                type="date" 
                                id="start-date" 
                                name="startDate" 
                                className={styles.detailInput} 
                                value={formatDate(internDetails?.startDate || null)}
                                onChange={handleInputChange}
                                readOnly={!isEditingStartDate}
                                required 
                            />
                            <div className={styles.buttonContainer}>
                            {isEditingStartDate ? (
                                <>
                                    <button type="button" className={styles.editButton} onClick={handleSaveStartDate}>Save</button>
                                    <button type="button" className={styles.editButton} onClick={handleStartDateEditToggle}>Cancel</button>
                                </>
                            ) : (
                                <button type="button" className={styles.editButton} onClick={handleStartDateEditToggle}>Edit Start Date</button>
                            )}
                            </div>
                        </div>
                        <label htmlFor="mghs-email" className={styles.detailLabel}>MGHS Email:</label>
                        <input 
                            type="email" 
                            id="mghs-email" 
                            name="mghsemail"
                            value={internDetails?.mghsemail || ''}
                            className={styles.detailInput}
                            readOnly={true}
                        />

                        <label htmlFor="personal-email" className={styles.detailLabel}>Personal Email:</label>
                        <input 
                            type="email" 
                            id="personal-email" 
                            name="personalemail" 
                            value={internDetails?.personalemail || ''}
                            className={styles.detailInput} 
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                        />

                        <label htmlFor="school-email" className={styles.detailLabel}>School Email:</label>
                        <input 
                            type="email" 
                            id="school-email" 
                            name="schoolemail" 
                            value={internDetails?.schoolemail || ''}
                            className={styles.detailInput} 
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                        />
                        <a href="https://drive.google.com/drive/folders/1xXwRjqGGse4ZKUmo60tNuRQVYrjqzr6y?usp=sharing" className={styles.detailButton} target="_blank" rel="noopener noreferrer">
                            Welcome Kit
                        </a>
                        <a href="https://docs.google.com/spreadsheets/d/1USxRu_PoeUX-U_oOMd3MKQLpk3MXP4z_/edit?usp=sharing&ouid=113420244296512121808&rtpof=true&sd=true" className={styles.detailButton} target="_blank" rel="noopener noreferrer">
                            DTR
                        </a>
                        <a href="https://drive.google.com/file/d/1IVQfR7It3rssB_ukbsSDkBSEgoyiEkTQ/view" className={styles.detailButton} target="_blank" rel="noopener noreferrer">
                            Worksheet
                        </a>
                    </form>

                <div className={styles.notification}>
                    <p>Note:</p>
                    <p>Your Role field can only be edited by an admin.</p>
                    <p>You cannot change your MGHS email.</p>
                    <p>Please edit your Hours Needed to Render for this internship</p>
                </div>

                </div>

                <div className={styles.rightContainer}>
                    <form className={styles.detailForm} method='POST'>
                        <div className={styles.infoItem}>
                            <label htmlFor="intern-name" className={styles.detailLabel}>Intern First Name:</label>
                            <input 
                                type="text" 
                                id="intern-name" 
                                name="firstname" 
                                className={styles.detailInput} 
                                value={internDetails?.firstname || ''}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                placeholder="First Name" 
                            />
                            <label htmlFor="intern-name" className={styles.detailLabel}>Intern Last Name:</label>
                            <input 
                                type="text" 
                                id="intern-lastname" 
                                name="lastname" 
                                className={styles.detailInput} 
                                value={internDetails?.lastname || ''}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                placeholder="Last Name" 
                            />
                        </div>
                        <div className={styles.infoItem}>
                            <label htmlFor="position" className={styles.detailLabel}>Position:</label>
                            <input 
                                type="text" 
                                id="position" 
                                name="position" 
                                className={styles.detailInput}
                                value={internDetails?.position || ''}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                placeholder="Position" />
                        </div>
                        <div className={styles.infoItem}>
                            <label htmlFor="hoursNeeded" className={styles.detailLabel}>Hours Needed:</label>
                            <input 
                                type="text" 
                                id="hoursNeeded" 
                                name="hoursNeeded" 
                                className={styles.detailInput}
                                value={internDetails?.hoursNeeded || ''}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                placeholder="Place your Hours Needed to Render here..." />
                        </div>
                        <div className={styles.infoItem}>
                            <label htmlFor="role" className={styles.detailLabel}>Role: {internDetails?.role || ''}</label>
                        </div>
                        <div className={styles.infoItem}>
                            <label htmlFor="hoursNeeded" className={styles.detailLabel}>Hours Left: {hoursLeft}</label>
                        </div>
                        <div className={styles.buttonContainer}>
                            {isEditing ? (
                                <>
                                    <button type="button" className={styles.detailButton} onClick={handleSaveDetails}>Save</button>
                                    <button type="button" className={styles.detailButton} onClick={handleEditToggle}>Cancel</button>
                                </>
                            ) : (
                                <button type="button" className={styles.detailButton} onClick={handleEditToggle}>Edit Details</button>
                            )}
                        </div>
                    </form>

                    <table className={styles.batchTable}>
                        <thead>
                            <tr>
                                <th colSpan={4} className={styles.batchHeader}>Batch 1</th>
                            </tr>
                            <tr>
                                <th>No.</th> 
                                <th>Intern Name</th>
                                <th>Role</th>
                                <th>Position</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allInterns.map((intern, index) => (
                                <tr key={intern.id}>
                                    <td>{index + 1}</td> 
                                    <td>{intern.firstname} {intern.lastname}</td>
                                    <td>{intern.role}</td>
                                    <td>{intern.position}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </InternProtectedRoute>
    );
}
