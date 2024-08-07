import { UserDetails } from "@/types/user-details";
import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebase";

export const fetchAllUsers = async () : Promise<UserDetails[]> => {
  const q = query(collection(db, "users"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as UserDetails));
};

export const fetchUserByEmail = async (email: string): Promise<UserDetails | null> => {
  const q = query(collection(db, "users"), where("mghsemail", "==", email));
  const querySnapshot = await getDocs(q);
  const userDocs = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as UserDetails));
  return userDocs.length > 0 ? userDocs[0] : null;
};

export const fetchAllInterns = async () : Promise<UserDetails[]> => {
  const q = query(collection(db, "users"), where('admin', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as UserDetails));
};
