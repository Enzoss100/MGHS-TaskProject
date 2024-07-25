'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserDetails } from '@/types/user-details';
import { fetchUserDetails } from './services/UserService';
import styles from './page.module.css';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      if (status === 'loading') return; 

      if (!session) {
        router.push('/signin');
      } else {
        const userDetails: UserDetails[] = await fetchUserDetails(session?.user?.email!);
        
        if (userDetails.length > 0) {
          const user = userDetails[0] as UserDetails;
          if (user.admin) {
            router.push('/admin/dashboard');
          } else {
            router.push('/intern/dashboard');
          }
        } else {
          console.error('User details not found');
        }
      }
    };

    handleRedirect();
  }, [session, status, router]);

  return (
    <div className={styles.container}>
      {status === 'loading' && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <h1 className={styles.loadingText}>Loading...</h1>
        </div>
      )}
    </div>
  );
}

Home.requireAuth = true;
