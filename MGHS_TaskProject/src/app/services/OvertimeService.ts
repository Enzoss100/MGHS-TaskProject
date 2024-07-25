import { addDoc, collection, deleteDoc, doc, getDocs, increment, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

export interface Overtime {
  id?: string;
  otDate: Date;
  otStart: string;
  otEnd: string;
  otBreakStart: string;
  otBreakEnd: string;
  otReport: string;
  otrenderedHours: number;
  userID: string;
}

export const fetchOT = async (userEmail: string) => {
  const q = query(collection(db, 'overtime'), where('userID', '==', userEmail));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              otDate: data.otDate instanceof Timestamp ? data.otDate.toDate() : new Date(data.otDate), // Convert if Timestamp
              otStart: data.otStart,
              otEnd: data.otEnd,
              otBreakStart: data.otBreakStart,
              otBreakEnd: data.otBreakEnd,
              otReport: data.otReport,
              otrenderedHours: parseFloat(data.otrenderedHours),
              userID: data.userID           
            } as Overtime;
          });
    };

const calculateTotalHours = (start: string, end: string, breakStart: string, breakEnd: string): number => {
    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);
    const breakStartTime = new Date(`1970-01-01T${breakStart}:00`);
    const breakEndTime = new Date(`1970-01-01T${breakEnd}:00`);
    
    const workDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Convert to hours
    const breakDuration = (breakEndTime.getTime() - breakStartTime.getTime()) / (1000 * 60 * 60); // Convert to hours
  
    return parseFloat((workDuration - breakDuration).toFixed(2)); // Return as number
  };

export const createOT = async (overtime: Overtime) => {
    try {
        const otrenderedHours = calculateTotalHours(
          overtime.otStart,
          overtime.otEnd,
          overtime.otBreakStart,
          overtime.otBreakEnd
        );
        const overtimeWithHours = { ...overtime, otrenderedHours };
        const overtimeRef = await addDoc(collection(db, 'overtime'), overtimeWithHours);
        return overtimeRef.id;
      } catch (error) {
        console.error('Error creating overtime:', error);
        throw error;
      }
};

export const updateOT = async (overtimeId: string, overtime: Overtime) => {
  try {
      const otrenderedHours = calculateTotalHours(
        overtime.otStart,
        overtime.otEnd,
        overtime.otBreakStart,
        overtime.otBreakEnd
      );
      const overtimeWithHours = { ...overtime, otrenderedHours };
      await setDoc(doc(db, 'overtime', overtimeId), overtimeWithHours);
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
