// services/RoleService.ts
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { deleteUser, fetchAllInternDetails, fetchInternsByRole, updateUserDetails } from './UserService';

export interface Role {
  id?: string;
  roleName: string;
  roleDesc: string;
}

export const fetchAllRoles = async (): Promise<Role[]> => {
  const q = query(collection(db, 'roles'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
  })) as unknown as Role[];
};

export const createRole = async (role: Role) => {
  try {
    const roleRef = doc(collection(db, 'roles'));
    await setDoc(roleRef, role);
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

export const updateRole = async (roleID: string, role: Role) => {
    try {
        await setDoc(doc(db, 'roles', roleID), role);
    } catch (error) {
        console.error('Error updating role:', error);
        throw error;
    }
};

export const deleteRole = async (roleID: string) => {
    try {
        // Fetch the role details to get the role name
        const roleRef = doc(db, 'roles', roleID);
        const roleDoc = await getDoc(roleRef); 
        const roleData = roleDoc.data() as Role;
        
        if (roleData) {
            // Fetch all users associated with the role
            const interns = await fetchInternsByRole(roleData.roleName);
            
            // Delete each user and their related data
            for (const intern of interns) {
                await deleteUser(intern.id!);
            }
        }

        // Delete the role
        await deleteDoc(roleRef);
    } catch (error) {
        console.error('Error deleting role:', error);
        throw error;
    }
};