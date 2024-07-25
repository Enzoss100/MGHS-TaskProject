import { addDoc, collection, deleteDoc, doc, getDocs, setDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface Attendance {
  id?: string;
  attendanceDate: Date;
  timeStart: string; 
  timeEnd: string; 
  timeBreakStart: string;
  timeBreakEnd: string;
  userID: string;
  renderedHours: number;
}

export const fetchAttendance = async (userEmail: string): Promise<Attendance[]> => {
    const q = query(collection(db, 'attendance'), where('userID', '==', userEmail));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        attendanceDate: data.attendanceDate instanceof Timestamp ? data.attendanceDate.toDate() : new Date(data.attendanceDate), // Convert if Timestamp
        timeStart: data.timeStart,
        timeEnd: data.timeEnd,
        timeBreakStart: data.timeBreakStart,
        timeBreakEnd: data.timeBreakEnd,
        userID: data.userID,
        renderedHours: parseFloat(data.renderedHours)
      } as Attendance;
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
  

  export const createAttendance = async (attendance: Attendance) => {
    try {
      const renderedHours = calculateTotalHours(
        attendance.timeStart,
        attendance.timeEnd,
        attendance.timeBreakStart,
        attendance.timeBreakEnd
      );
      const attendanceWithHours = { ...attendance, renderedHours };
      const attendanceRef = await addDoc(collection(db, 'attendance'), attendanceWithHours);
      return attendanceRef.id;
    } catch (error) {
      console.error('Error creating attendance:', error);
      throw error;
    }
  };
  
  export const updateAttendance = async (attendanceId: string, attendance: Attendance) => {
    try {
      const renderedHours = calculateTotalHours(
        attendance.timeStart,
        attendance.timeEnd,
        attendance.timeBreakStart,
        attendance.timeBreakEnd
      );
      const attendanceWithHours = { ...attendance, renderedHours };
      await setDoc(doc(db, 'attendance', attendanceId), attendanceWithHours);
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  };
  

export const deleteAttendance = async (attendanceId: string) => {
  try {
    const attendanceRef = doc(db, 'attendance', attendanceId);
    await deleteDoc(attendanceRef);
  } catch (error) {
    console.error('Error deleting attendance:', error);
    throw error;
  }
};
