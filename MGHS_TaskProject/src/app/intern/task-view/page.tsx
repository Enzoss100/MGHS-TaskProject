'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { UserDetails } from '@/types/user-details';
import { toast } from 'sonner';
import { fetchUserDetails } from '@/app/services/UserService';
import { useEffect, useState } from 'react';
import HamburgerMenu from '@/app/components/HamburgerMenu';
import styles from './taskview.module.css';

export default function TaskView() {
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

    //Edit the HTML code here      
    return (
      <div>
        <HamburgerMenu internName={internName} />
        <main>
          <center><p className={styles.p}><b>UNDER DEVELOPMENT</b></p></center> {/*Sample Code on How to Use Module CSS*/}
        </main>
      </div>
    );
  }