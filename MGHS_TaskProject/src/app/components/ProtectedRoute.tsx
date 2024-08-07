'use client';

import React, { useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { fetchUserDetails } from '@/app/services/UserService';
import styles from './loading.module.css';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.email) {
        const userDetails = await fetchUserDetails(session.user.email);
        const user = userDetails[0];
        if (!user.admin) {
          redirect('/signin');
        }
      }
    };

    if (status === 'authenticated') {
      checkAdminStatus();
    }
  }, [session, status]);

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

export default ProtectedRoute;
