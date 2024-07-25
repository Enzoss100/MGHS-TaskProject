import { Timestamp, addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

export type Task = {
    reportDate: Date;
    reportTime: Date;
    report: string;
    userId: string;
}
  
export const fetchTasks = async (userID: string) => {
  const q = query(collection(db, 'tasks'), 
  where('userId','==', userID));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

export const createTask = async (task: Task) => {
  try {
    const taskRef = await addDoc(collection(db, 'tasks'), task);
    return taskRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, task: Task) => {
  try {
    await setDoc(doc(db, 'tasks', taskId), task);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};
