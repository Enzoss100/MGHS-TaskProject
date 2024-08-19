// components/InternProtectedRoute.tsx
'use client';

import React, { useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { fetchUserDetails } from '@/app/services/UserService';
import styles from './loading.module.css';

interface InternProtectedRouteProps {
  children: ReactNode;
}

const InternProtectedRoute: React.FC<InternProtectedRouteProps> = ({ children }) => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/signin');
    },
  });

  const router = useRouter();

  useEffect(() => {
    const checkInternStatus = async () => {
      if (session?.user?.email) {
        const userDetails = await fetchUserDetails(session.user.email);
        const user = userDetails[0];
        if (user.onboarded === 'pending') {
          router.push('/intern/processing');
        }
      }
    };

    if (status === 'authenticated') {
      checkInternStatus();
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <>
        {children} {/* Render the page content behind the modal */}
        <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <div className={styles.loadingText}>Loading Data...</div>
        </div>
      </>
    );
  }

  return <>{children}</>;
};

export default InternProtectedRoute;
