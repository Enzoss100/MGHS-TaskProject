'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { UserDetails } from '@/types/user-details';
import { toast } from 'sonner';
import { fetchUserDetails } from '@/app/services/UserService';
import { useEffect, useState } from 'react';
import HamburgerMenu from '@/app/components/HamburgerMenu';
import styles from './taskview.module.css';
import InternProtectedRoute from '@/app/components/InternProtectedRoute';

export default function TaskView() {
    const session = useSession({
        required: true,
        onUnauthenticated() {
          redirect('/signin');
        },
    });
      
    const [internName, setInternName] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
      
    useEffect(() => {
        const getInternName = async () => {
          const email = session.data?.user?.email;
      
          if (!email) {
            toast.error('Email is not available');
            return;
          }

          try {
            const userDetails: UserDetails[] = await fetchUserDetails(email);
      
            if (userDetails.length > 0) {
              const user = userDetails[0] as UserDetails;
              setInternName(user.firstname);
            } else {
              toast.error('User not found');
            }
          } catch (error) {
            toast.error('An error occurred while fetching user details');
            console.error(error);
          }
        };
      
        getInternName();  
      }, [session]);

    const openPopup = () => {
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
    };

    return (
      <InternProtectedRoute>
      <div className={styles.container}>
        <HamburgerMenu internName={internName} />
        <main>
          <div className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}><b>TASK VIEW</b></h3>
            <hr className={styles.divider} />
            <a href="#" className={styles.sidebarLink}><b>AI Task</b></a>
            <hr className={styles.divider} />
            <a href="#" className={styles.sidebarLink}><b>Website</b></a>
            <hr className={styles.divider} />
          </div>
          <div className={styles.content}>
            <h3 className={styles.contentTitle}>TASK DESCRIPTION</h3>
            <p className={styles.description}>Insert description here</p>
            <h3 className={styles.contentTitle}>ACCOMPLISHMENTS</h3>
            <button className={styles.accomplishmentsBtn} onClick={openPopup}>Add Accomplishments</button>
            <hr className={styles.divider} />
            <div className={styles.accomplishmentSection}>
              <p className={styles.accomplishmentTitle}>Accomplishment Title</p>
              <p className={styles.accomplishmentDescription}>Accomplishment Description</p>
              <a href="#" className={styles.accomplishmentLink}>Accomplishment Link</a>
            </div>
            <hr className={styles.divider} />
            <div className={styles.accomplishmentSection}>
              <p className={styles.accomplishmentTitle}>Accomplishment Title</p>
              <p className={styles.accomplishmentDescription}>Accomplishment Description</p>
              <a href="#" className={styles.accomplishmentLink}>Accomplishment Link</a>
            </div>
            <hr className={styles.divider} />
          </div>

          {isPopupOpen && (
            <div className={styles.popup}>
              <div className={styles.popupContent}>
                <span className={styles.closeBtn} onClick={closePopup}>&times;</span>
                <h2>Accomplishment</h2>
                <label htmlFor="title">Title:</label>
                <input type="text" id="title" name="title" /><br /><br />
                <label htmlFor="description">Description:</label> 
                <input type="text" id="description" name="description" /><br /><br />
                <label htmlFor="link">Submission Link:</label> 
                <input type="text" id="link" name="link" /><br /><br />
                <button className={styles.submitBtn}>Submit</button>
              </div>
            </div>
          )}
        </main>
      </div>
      </InternProtectedRoute>
    );
}

