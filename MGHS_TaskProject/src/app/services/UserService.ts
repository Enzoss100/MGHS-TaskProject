import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
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
  const q = query(collection(db, 'users'), where('admin', '==', false), where('onboarded', '==', 'approved'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
      const data = doc.data() as UserDetails;
      return { ...data, id: doc.id };  
  });
};

export const fetchInternsByBatch = async (batchName: string): Promise<UserDetails[]> => {
    const q = query(collection(db, 'users'), where('admin', '==', false), where('onboarded', '==', 'approved'), where('batchName', '==', batchName));
    const querySnapshot = await getDocs(q);
  
    return querySnapshot.docs.map((doc) => {
        const data = doc.data() as UserDetails;
        return { ...data, id: doc.id };  
    });
  };

  export const fetchInternsByRole = async (roleName: string): Promise<UserDetails[]> => {
    const q = query(collection(db, 'users'), where('admin', '==', false), where('onboarded', '==', 'approved'), where('role', '==', roleName));
    const querySnapshot = await getDocs(q);
  
    return querySnapshot.docs.map((doc) => {
        const data = doc.data() as UserDetails;
        return { ...data, id: doc.id };  
    });
  };

export const fetchAllStudents = async (): Promise<UserDetails[]> => {
    const q = query(collection(db, 'users'), where('admin', '==', false));
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

const deleteRelatedData = async (userID: string) => {
    try {
      // Delete user attendance records
      const attendanceQuery = query(collection(db, 'attendance'), where('userID', '==', userID));
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendanceDocs = attendanceSnapshot.docs;
      for (const doc of attendanceDocs) {
        await deleteDoc(doc.ref);
      }
  
      // Delete user overtime records
      const overtimeQuery = query(collection(db, 'overtime'), where('userID', '==', userID));
      const overtimeSnapshot = await getDocs(overtimeQuery);
      const overtimeDocs = overtimeSnapshot.docs;
      for (const doc of overtimeDocs) {
        await deleteDoc(doc.ref);
      }
  
      // Delete user tasks
      const tasksQuery = query(collection(db, 'tasks'), where('userID', '==', userID));
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasksDocs = tasksSnapshot.docs;
      for (const doc of tasksDocs) {
        await deleteDoc(doc.ref);
      }
    } catch (error) {
      console.error('Error deleting related data:', error);
      throw error;
    }
  };
  
  export const deleteUser = async (userID: string) => {
    try {
      await deleteRelatedData(userID); // First delete related data
      const userRef = doc(db, 'users', userID);
      await deleteDoc(userRef); // Then delete the user
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

