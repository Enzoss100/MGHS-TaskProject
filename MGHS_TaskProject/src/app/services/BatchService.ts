// services/BatchService.ts
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { deleteUser, fetchAllInternDetails, fetchInternsByBatch, updateUserDetails } from './UserService';

export interface Batch {
    id?: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

export const fetchAllBatches = async (): Promise<Batch[]> => {
  const q = query(collection(db, 'batches'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
  })) as unknown as Batch[];
};

export const createBatch = async (batch: Batch) => {
  try {
    const batchRef = doc(collection(db, 'batches'));
    await setDoc(batchRef, batch);
  } catch (error) {
    console.error('Error creating batch:', error);
    throw error;
  }
};

export const updateBatch = async (batchID: string, batch: Batch) => {
    try {
        await setDoc(doc(db, 'batches', batchID), batch);
    } catch (error) {
        console.error('Error updating batch:', error);
        throw error;
    }
};

export const deleteBatch = async (batchID: string) => {
    try {
        // Fetch the batch details to get the batch name
        const batchRef = doc(db, 'batches', batchID);
        const batchDoc = await getDoc(batchRef); 
        const batchData = batchDoc.data() as Batch;
        
        if (batchData) {
            // Fetch all users associated with the batch
            const interns = await fetchInternsByBatch(batchData.name);
            
            // Delete each user and their related data
            for (const intern of interns) {
                await deleteUser(intern.id!);
            }
        }

        // Delete the batch
        await deleteDoc(batchRef);
    } catch (error) {
        console.error('Error deleting batch:', error);
        throw error;
    }
};

// New method to update users' batch names
export const updateUserBatches = async () => {
  try {
    const batches = await fetchAllBatches();
    const interns = await fetchAllInternDetails();

    for (const intern of interns) {
      const internStartDate = new Date(intern.startDate!);
      const currentBatch = batches.find(batch => {
        const startDate = new Date(batch.startDate);
        const endDate = new Date(batch.endDate);
        return internStartDate >= startDate && internStartDate <= endDate;
      });

      if (currentBatch) {
        const updatedIntern = { ...intern, batchName: currentBatch.name };
        await updateUserDetails(intern.id!, updatedIntern);
      }
    }
  } catch (error) {
    console.error('Error updating user batches:', error);
    throw error;
  }
};