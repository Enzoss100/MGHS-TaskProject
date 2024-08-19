// services/RoleService.ts

import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { deleteUser, fetchInternsByRole, updateUserDetails } from './UserService';

const DEFAULT_ROLE_NAME = 'Intern';

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
        // Fetch the role details
        const roleRef = doc(db, 'roles', roleID);
        const roleDoc = await getDoc(roleRef); 
        const roleData = roleDoc.data() as Role;
        
        // Prevent deletion of the "Intern" role
        if (roleData.roleName === DEFAULT_ROLE_NAME) {
            console.error('Cannot delete the default "Intern" role.');
            throw new Error('Cannot delete the default "Intern" role.');
        }

        if (roleData) {
            // Fetch all users associated with the role
            const interns = await fetchInternsByRole(roleData.roleName);
            
            // Reassign users to the "Intern" role before deleting
            for (const intern of interns) {
                await updateUserDetails(intern.id!, { ...intern, role: DEFAULT_ROLE_NAME });
            }
        }

        // Delete the role
        await deleteDoc(roleRef);
    } catch (error) {
        console.error('Error deleting role:', error);
        throw error;
    }
};

// Initialize default role if not present
export const initializeDefaultRole = async () => {
  try {
    const roles = await fetchAllRoles();
    const defaultRole = roles.find(role => role.roleName === DEFAULT_ROLE_NAME);

    if (!defaultRole) {
      const newRole: Role = {
        roleName: DEFAULT_ROLE_NAME,
        roleDesc: 'This is the default role for all interns.',
      };
      await createRole(newRole);
    }
  } catch (error) {
    console.error('Error initializing default role:', error);
  }
};
