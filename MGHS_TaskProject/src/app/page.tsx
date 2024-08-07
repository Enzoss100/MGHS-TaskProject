'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserDetails } from '@/types/user-details';
import { fetchUserDetails } from './services/UserService';
import styles from './page.module.css';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      console.log("User Unauthenticated. Redirecting to Sign In page...");
      setIsRedirecting(true);
      router.push('/signin');
      return;
    }

    const fetchAndRedirect = async () => {
      try {
        setIsRedirecting(true);
        const userDetails: UserDetails[] = await fetchUserDetails(session.user?.email!);

        if (userDetails.length > 0) {
          const user = userDetails[0];
          if (user.admin) {
            router.push('/admin/dashboard');
          } else {
            router.push('/intern/dashboard');
          }
        } else {
          console.error('User details not found');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setIsRedirecting(false); // Optional: hide the message once redirection is complete
      }
    };

    fetchAndRedirect();
  }, [session, status, router]);

  return (
    <div className={styles.container}>
      {isRedirecting ? (
        <div className={styles.redirecting}>
          <h1 className={styles.redirectingText}>Redirecting...</h1>
        </div>
      ) : (
        status === 'loading' && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <h1 className={styles.loadingText}>Loading...</h1>
          </div>
        )
      )}
    </div>
  );
}
