import { UserDetails } from '@/types/user-details';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchUserDetails = async (userEmail: string): Promise<UserDetails[]> => {
  const q = query(collection(db, 'users'), where('mghsemail', '==', userEmail));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
      const data = doc.data() as UserDetails;
      return { ...data, id: doc.id };  
  });
};

export const updateUserDetails = async (userID: string, user: UserDetails) => {
    try{
    await setDoc(doc(db, 'users', userID), user);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };
