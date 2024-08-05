// services/AccomplishmentService.ts
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

export interface Accomplishment {
  id?: string;
  title: string;
  description: string;
  link: string;
  accDate: Date;
  userID: string;
  taskID: string
}

export const fetchAllAccomplishments = async (): Promise<Accomplishment[]> => {
  const q = query(collection(db, 'accomplishments'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
  })) as unknown as Accomplishment[];
};

export const fetchAccomplishments = async (userID: string) => {
  const q = query(collection(db, 'accomplishments'), 
  where('userID','==', userID));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

export const fetchAccompByTask = async (taskID: string) => {
  const q = query(collection(db, 'accomplishments'), 
  where('taskID','==', taskID));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

export const createAccomplishment = async (accomplishment: Accomplishment) => {
  try {
    const accomplishmentRef = doc(collection(db, 'accomplishments'));
    await setDoc(accomplishmentRef, accomplishment);
  } catch (error) {
    console.error('Error creating accomplishment:', error);
    throw error;
  }
};

export const updateAccomplishment = async (accomplishmentID: string, accomplishment: Accomplishment) => {
    try {
        await setDoc(doc(db, 'accomplishments', accomplishmentID), accomplishment);
    } catch (error) {
        console.error('Error updating accomplishment:', error);
        throw error;
    }
};

export const deleteAccomplishment = async (accomplishmentID: string) => {
    try {
        // Fetch the accomplishment details to get the accomplishment name
        const accomplishmentRef = doc(db, 'accomplishments', accomplishmentID);
        // Delete the accomplishment
        await deleteDoc(accomplishmentRef);
    } catch (error) {
        console.error('Error deleting accomplishment:', error);
        throw error;
    }
};