'use client';

import React, { useState, useEffect } from 'react';
import AdminMenu from '@/app/components/AdminMenu'; 
import styles from './roles.module.css'; 
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { fetchAllRoles, Role } from '@/app/services/RoleService';
import { fetchInternsByRole } from '@/app/services/UserService';
import RoleModal from './RoleModal';

export default function InternRoles() {
    const session = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/signin');
        },
    });

    const [currentRole, setCurrentRole] = useState<Role | null>(null);
    const [modalStat, setModalState] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [interns, setInterns] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        const fetchRoles = async () => {
            const roles = await fetchAllRoles();
            setRoles(roles);
        };

        fetchRoles();
    }, []);

    const addRole = () => {
        setCurrentRole(null);
        setModalState(true);
    };

    const showInterns = async (role: Role) => {
        const internsByRole = await fetchInternsByRole(role.roleName);
        setInterns((prev) => ({ ...prev, [role.roleName]: internsByRole.map(intern => intern.firstname + ' ' + intern.lastname) }));
        setCurrentRole(role);
    };

    return (
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
                    {currentRole && (
                        <>
                            <h2 className={styles.heading}>{currentRole.roleName}</h2>
                            <p className={styles.description}>{currentRole.roleDesc}</p>
                        </>
                    )}
                    <div className={styles.internList}>
                        {currentRole && interns[currentRole.roleName] && interns[currentRole.roleName].length > 0 ? (
                            interns[currentRole.roleName].map((intern, index) => (
                                <div key={index} className={styles.intern}>{intern}</div>
                            ))
                        ) : (
                            <div>No Interns Have this Role</div>
                        )}
                    </div>
                </div>
            </main>
            {modalStat && (
                <RoleModal 
                    setModalState={setModalState} 
                    initialRole={currentRole} 
                    roleID={currentRole?.id || null}
                />
            )}
        </div>
    );
};
