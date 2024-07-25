import { addDoc, collection, deleteDoc, doc, getDocs, increment, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

export interface Overtime {
  otDate: Date;
  otStart: Date;
  otEnd: Date;
  otBreakStart: Date;
  otBreakEnd: Date;
  otReport: string;
  userID: string;
}

export const fetchOT = async (userEmail: string) => {
  const q = query(collection(db, 'overtime'), where('userID', '==', userEmail));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

export const createOT = async (overtime: Overtime) => {
  try {
    const overtimeRef = await addDoc(collection(db, 'overtime'), overtime);
    return overtimeRef.id;
  } catch (error) {
    console.error('Error creating overtime:', error);
    throw error;
  }
};

export const updateOT = async (overtimeId: string, overtime: Overtime) => {
  try {
    await setDoc(doc(db, 'overtime', overtimeId), overtime);
  } catch (error) {
    console.error('Error updating overtime:', error);
    throw error;
  }
};

export async function deleteOT(overtimeId: string) {
  try {
    const overtimeRef = doc(db, 'overtime', overtimeId);
    await deleteDoc(overtimeRef);
  } catch (error) {
    console.error('Error deleting overtime:', error);
    throw error;
}
}
