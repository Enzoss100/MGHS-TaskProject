import { collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { UserDetails } from '@/types/user-details';
import { db } from '../firebase';
import { fetchAccomplishments } from './AccomplishmentService';


/* FETCHING DETAILS */

// Fetch all the Details of the Specific Intern
export const fetchUserDetails = async (userEmail: string): Promise<UserDetails[]> => {
  const q = query(collection(db, 'users'), where('mghsemail', '==', userEmail));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
      const data = doc.data() as UserDetails;
      return { ...data, id: doc.id };  
  });
};

// Fetch the Details of All Interns
export const fetchAllInternDetails = async (): Promise<UserDetails[]> => {
  const q = query(collection(db, 'users'), where('admin', '==', false), where('onboarded', '==', 'approved'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
      const data = doc.data() as UserDetails;
      return { ...data, id: doc.id };  
  });
};

// Fetch All Interns under the specific Batch
export const fetchInternsByBatch = async (batchName: string): Promise<UserDetails[]> => {
    const q = query(collection(db, 'users'), where('admin', '==', false), where('onboarded', '==', 'approved'), where('batchName', '==', batchName));
    const querySnapshot = await getDocs(q);
  
    return querySnapshot.docs.map((doc) => {
        const data = doc.data() as UserDetails;
        return { ...data, id: doc.id };  
    });
  };

  // Fetch All Interns under the specific role
  export const fetchInternsByRole = async (roleName: string): Promise<UserDetails[]> => {
    const q = query(collection(db, 'users'), where('admin', '==', false), where('role', '==', roleName));
    const querySnapshot = await getDocs(q);
  
    return querySnapshot.docs.map((doc) => {
        const data = doc.data() as UserDetails;
        return { ...data, id: doc.id };  
    });
  };

// Fetch All interns regardless of onboarding status
export const fetchAllStudents = async (): Promise<UserDetails[]> => {
    const q = query(collection(db, 'users'), where('admin', '==', false));
    const querySnapshot = await getDocs(q);
  
    return querySnapshot.docs.map((doc) => {
        const data = doc.data() as UserDetails;
        return { ...data, id: doc.id };  
    });
  };

/* UPDATING DETAILS */

// Update User
export const updateUserDetails = async (userID: string, user: UserDetails) => {
    try {
        await setDoc(doc(db, 'users', userID), user);
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

// Update the Batch Name of the Interns
export const updateBatchNameForInterns = async (oldBatchName: string, newBatchName: string) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('admin', '==', false),
      where('onboarded', '==', 'approved'),
      where('batchName', '==', oldBatchName)
    );
    const snapshot = await getDocs(q);

    const batchUpdatePromises = snapshot.docs.map((docSnap) =>
      updateDoc(docSnap.ref, { batchName: newBatchName })
    );

    await Promise.all(batchUpdatePromises);
  } catch (error) {
    console.error('Error updating batch name for interns:', error);
    throw error;
  }
};

// Update the Role Name of the Users
export const updateRoleNameForUsers = async (oldRoleName: string, newRoleName: string) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', oldRoleName)
    );
    const snapshot = await getDocs(q);

    const roleUpdatePromises = snapshot.docs.map((docSnap) =>
      updateDoc(docSnap.ref, { role: newRoleName })
    );

    await Promise.all(roleUpdatePromises);
  } catch (error) {
    console.error('Error updating role name for users:', error);
    throw error;
  }
};


/* DELETING DETAILS */

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
      
      // Delete user Accomplishments
      const accomplishments = await fetchAccomplishments(userID);
      for (const accomplishment of accomplishments) {
        await deleteDoc(doc(db, 'accomplishments', accomplishment.id!));
      }

    } catch (error) {
      console.error('Error deleting related data:', error);
      throw error;
    }
  };
  
  // Currently can't delete the authentication so you have to manually delete the user in firebase
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

