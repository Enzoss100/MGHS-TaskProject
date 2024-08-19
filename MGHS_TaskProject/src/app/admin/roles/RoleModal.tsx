import { updateRole, createRole } from '@/app/services/RoleService';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import styles from './roles.module.css';
import { updateRoleNameForUsers } from '@/app/services/UserService';

interface Props {
  setModalState: (state: boolean) => void;
  initialRole?: any;
  roleID?: string | null;
}

const RoleModal = ({ setModalState, initialRole, roleID }: Props) => {
  const [role, setRole] = useState({
    roleName: '',
    roleDesc: '',
  });

  useEffect(() => {
    if (initialRole) {
      setRole({
        ...initialRole,
      });
    }
  }, [initialRole]);

  // Handles the change of input for title
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRole({ ...role, [name]: value });
  };

  // Handles the change of input for content
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRole({ ...role, [name]: value });
  };

  const saveRole = async () => {
    if (!role.roleDesc) {
      toast.error('Please add content to the role');
      return;
    }

    try {
      if (roleID) {
        // Check if the role name has changed
        const oldRoleName = initialRole?.roleName;
        if (oldRoleName && oldRoleName !== role.roleName) {
            // Update the role name for all users with the old role name
            await updateRoleNameForUsers(oldRoleName, role.roleName);
        }
        
        // Update existing role
        await updateRole(roleID, role);
        toast.success('Role Updated Successfully!');
      } else {
        // Create new role
        await createRole(role);  
        toast.success('Role Created Successfully!');
      }
      setModalState(false);
    } catch (error: any) {
      toast.error('Error saving Role');
    }
  };

  return (
    <div className={`${styles.modal} ${styles.show}`}>
      <div className={styles.modalContent}>
        <span
          className={styles.closeBtn}
          onClick={() => setModalState(false)}
        >
          &times;
        </span>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Role Title</label>
          <input
            className={styles.input}
            id="roleName"
            type="text"
            name="roleName"
            value={role.roleName}
            onChange={handleInputChange}
            placeholder="Role Title"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Role Content</label>
          <textarea
            className={styles.tasktextarea}
            id="roleDesc"
            name="roleDesc"
            value={role.roleDesc}
            onChange={handleTextareaChange}
            placeholder="Place your role here..."
            required
          />
        </div>

        <button
          onClick={() => setModalState(false)}
          className={styles.renderBtn}
        >
          Cancel
        </button>
        <button
          onClick={saveRole}
          className={styles.renderBtn}
        >
          {roleID ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  );
};

export default RoleModal;
