import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function Authenticate() {
const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  return; 
}