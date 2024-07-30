'use client';

import styles from './processing.module.css';
import Image from 'next/image';
import logo from "./../../assets/logo.jpg";
import { signOut, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { FaSignOutAlt } from 'react-icons/fa';
import { UserDetails } from '@/types/user-details';
import router from 'next/router';
import { toast } from 'sonner';
import { fetchUserDetails } from '@/app/services/UserService';
import { useEffect, useState } from 'react';

export default function Processing() {
    const session = useSession({
        required: true,
        onUnauthenticated() {
          redirect('/signin');
        },
      });
      
    const [internName, setInternName] = useState('');
      
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

    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <Image src={logo.src} alt="Company Logo" width={50} height={50} className={styles.logo} />
          <div className={styles.welcome}>Hello, {internName}</div>
          <div className={styles.logout}>
            <button onClick={() => signOut()}>
                <FaSignOutAlt size={30} />
            </button>
          </div>
        </header>
        <main className={styles.content}>
          <p><b>We are currently processing your requirements.</b></p>
          <p>Please submit the following to your Supervisor:</p>
          <ul>
            <b>Company Requirements Folder:</b> 
            <li>School Calendar</li>
            <li>School Grades</li>
            <li>School Curriculum</li>
            <li>Resume / CV</li>
            <li>Barangay Clearance</li>
          </ul>
          <p><b>Once you have fulfilled the requirements, you will be redirected to the Onboarding Page.</b></p>
          <p><b>Make sure that your Endorsement Letter has been sent and that you have a copy of your Acceptance Letter</b></p>
          <p>For questions, please contact your supervisor. Thank you!</p>
        </main>
      </div>
    );
  }