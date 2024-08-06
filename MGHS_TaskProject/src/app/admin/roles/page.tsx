'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminMenu from '@/app/components/AdminMenu'; 
import styles from './roles.module.css'; 
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { fetchAllRoles, Role, deleteRole } from '@/app/services/RoleService';
import { fetchInternsByRole } from '@/app/services/UserService';
import RoleModal from './RoleModal';
import { FaEdit, FaTrash } from 'react-icons/fa';
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function InternRoles() {
    const [currentRole, setCurrentRole] = useState<Role | null>(null);
    const [modalStat, setModalState] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [interns, setInterns] = useState<{ [key: string]: string[] }>({});

    const fetchRoles = useCallback(async () => {
        const roles = await fetchAllRoles();
        setRoles(roles);
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const addRole = () => {
        setCurrentRole(null);
        setModalState(true);
    };

    const handleModalClose = () => {
        setModalState(false);
        fetchRoles();
    };

    const showInterns = async (role: Role) => {
        const internsByRole = await fetchInternsByRole(role.roleName);
        setInterns((prev) => ({ ...prev, [role.roleName]: internsByRole.map(intern => intern.firstname + ' ' + intern.lastname) }));
        setCurrentRole(role);
    };

    const handleEditRole = (role: Role) => {
        setCurrentRole(role);
        setModalState(true);
    };

    const handleDeleteRole = async (roleName: string) => {
        if (confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
            await deleteRole(roleName);
            fetchRoles();
            setCurrentRole(null);
        }
    };

    return (
        <ProtectedRoute>
        <div className={styles.container}>
            <AdminMenu pageName='Intern Roles'/>
            <main className={styles.main}>
                <div className={styles.sidebar}>
                    <button className={styles.addRole} onClick={addRole}>Add Special Roles</button>
                    <div className={styles.roleList}>
                        {roles.map((role) => (
                            <button 
                                key={role.roleName} 
                                className={`${styles.role} ${currentRole?.roleName === role.roleName ? styles.activeRole : ''}`} 
                                onClick={() => showInterns(role)}
                            >
                                {role.roleName}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.content}>
                    {currentRole ? (
                        <>
                            <div className={styles.roleHeader}>
                                <h2 className={styles.heading}>{currentRole.roleName}</h2>
                                <div className={styles.roleActions}>
                                    <FaEdit className={styles.editIcon} onClick={() => handleEditRole(currentRole)} />
                                    <FaTrash className={styles.deleteIcon} onClick={() => handleDeleteRole(currentRole.roleName)} />
                                </div>
                            </div>
                            <p className={styles.description}>{currentRole.roleDesc}</p>
                            <div className={styles.internList}>
                                {interns[currentRole.roleName] && interns[currentRole.roleName].length > 0 ? (
                                    interns[currentRole.roleName].map((intern, index) => (
                                        <div key={index} className={styles.intern}>{intern}</div>
                                    ))
                                ) : (
                                    <div>No Interns Have this Role</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className={styles.noRoleSelected}>No Role Selected</div>
                    )}
                </div>
            </main>
            {modalStat && (
                <RoleModal 
                    setModalState={handleModalClose} 
                    initialRole={currentRole || undefined} 
                    roleID={currentRole?.id || null}
                />
            )}
        </div>
        </ProtectedRoute>
    );
};
