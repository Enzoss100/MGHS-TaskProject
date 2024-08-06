'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { UserDetails } from '@/types/user-details';
import { toast } from 'sonner';
import { fetchUserDetails, updateUserDetails, fetchAllInternDetails, updateFirebaseEmail } from '@/app/services/UserService';
import { useEffect, useState } from 'react';
import HamburgerMenu from '@/app/components/HamburgerMenu';
import styles from './details.module.css';
import { getAuth, updateEmail, sendEmailVerification } from 'firebase/auth';
import InternProtectedRoute from '@/app/components/InternProtectedRoute';

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
                } else {
                    toast.error('User not found');
                }
            } catch (error) {
                toast.error('An error occurred while fetching user details');
                console.error(error);
            }
        };

        const getAllInternDetails = async () => {
            try {
                const interns = await fetchAllInternDetails();
                setAllInterns(interns);
            } catch (error) {
                toast.error('An error occurred while fetching all intern details');
                console.error(error);
            }
        };

        getInternDetails();
        getAllInternDetails();
    }, [session]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInternDetails(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        if (internDetails) {
            try {
                await updateUserDetails(internDetails.id as string, internDetails);
                
                if (internDetails.mghsemail !== session?.user?.email) {
                    await updateFirebaseEmail(internDetails.mghsemail);
                    const auth = getAuth();
                    await sendEmailVerification(auth.currentUser!);
                    toast.success('Verification Email Sent. Please check your email to change your Email.');
                } else {
                    toast.success('Details updated successfully');
                }
                
                setIsEditing(false);
            } catch (error) {
                toast.error('Failed to update details');
                console.error(error);
            }
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        const d = new Date(date);
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
                        <label htmlFor="mghs-email" className={styles.detailLabel}>MGHS Email:</label>
                        <input 
                            type="email" 
                            id="mghs-email" 
                            name="mghsemail"
                            value={internDetails?.mghsemail || ''}
                            className={styles.detailInput} 
                            onChange={handleInputChange}
                            readOnly={!isEditing}
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
                        <a href="https://docs.google.com/spreadsheets/d/1USxRu_PoeUX-U_oOMd3MKQLpk3MXP4z_/edit?usp=sharing&ouid=113420244296512121808&rtpof=true&sd=true" className={styles.detailButton} target="_blank" rel="noopener noreferrer">
                            Worksheet
                        </a>
                    </form>

                <div className={styles.notification}>
                    <p>Note:</p>
                    <p>Your Position and Role fields can only be edited by an admin.</p>
                    <p>Changing your MGHS Email will change your email for login.</p>
                </div>

                </div>

                <div className={styles.rightContainer}>
                    <form className={styles.detailForm} method='POST'>
                        <div className={styles.infoItem}>
                            <label htmlFor="intern-name" className={styles.detailLabel}>Intern Name:</label>
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
                            <label htmlFor="role" className={styles.detailLabel}>Role:</label>
                            <input 
                                type="text"
                                id="role" 
                                name="role" 
                                className={styles.detailInput} 
                                value={internDetails?.role || ''}
                                onChange={handleInputChange}
                                readOnly={true}
                                placeholder="Role" 
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
                                readOnly={true}
                                placeholder="Position" />
                        </div>
                        <div className={styles.infoItem}>
                            <label htmlFor="start-date" className={styles.detailLabel}>Start Date:</label>
                            <input 
                                type="date" 
                                id="start-date" 
                                name="startDate" 
                                className={styles.detailInput} 
                                value={formatDate(internDetails?.startDate || null)}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                required 
                            />
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
                                placeholder="Position" />
                        </div>
                        <div className={styles.buttonContainer}>
                            {isEditing ? (
                                <>
                                    <button type="button" className={styles.detailButton} onClick={handleSave}>Save</button>
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
