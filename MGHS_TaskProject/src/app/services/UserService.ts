import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { UserDetails } from '@/types/user-details';
import { getAuth, updateEmail } from 'firebase/auth';
import { db } from '../firebase';

export const fetchUserDetails = async (userEmail: string): Promise<UserDetails[]> => {
  const q = query(collection(db, 'users'), where('mghsemail', '==', userEmail));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
      const data = doc.data() as UserDetails;
      return { ...data, id: doc.id };  
  });
};

export const fetchAllInternDetails = async (): Promise<UserDetails[]> => {
  const q = query(collection(db, 'users'), where('admin', '==', false), where('onboarded', '==', true));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
      const data = doc.data() as UserDetails;
      return { ...data, id: doc.id };  
  });
};

export const updateUserDetails = async (userID: string, user: UserDetails) => {
    try {
        await setDoc(doc(db, 'users', userID), user);
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const updateFirebaseEmail = async (newEmail: string) => {
    const auth = getAuth();
    if (auth.currentUser) {
        try {
            await updateEmail(auth.currentUser, newEmail);
        } catch (error) {
            console.error('Error updating Firebase email:', error);
            throw error;
        }
    }
};
