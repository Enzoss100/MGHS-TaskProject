'use client';

import React, { useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { fetchUserDetails } from '@/app/services/UserService';

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
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
