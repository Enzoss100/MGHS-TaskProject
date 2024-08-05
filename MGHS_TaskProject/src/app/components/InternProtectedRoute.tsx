// components/InternProtectedRoute.tsx
'use client';

import React, { useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { fetchUserDetails } from '@/app/services/UserService';

interface InternProtectedRouteProps {
  children: ReactNode;
}

const InternProtectedRoute: React.FC<InternProtectedRouteProps> = ({ children }) => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  useEffect(() => {
    const checkInternStatus = async () => {
      if (session?.user?.email) {
        const userDetails = await fetchUserDetails(session.user.email);
        const user = userDetails[0];
        if (user.onboarded !== 'approved') {
          redirect('/signin');
        }
      }
    };

    if (status === 'authenticated') {
      checkInternStatus();
    }
  }, [session, status]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default InternProtectedRoute;
