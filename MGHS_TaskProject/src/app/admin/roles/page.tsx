'use client';

import React, { useState } from 'react';
import AdminMenu from '@/app/components/AdminMenu'; 
import styles from './roles.module.css'; 

const InternRoles: React.FC = () => {
    const [currentRole, setCurrentRole] = useState<string>('Team Leader');
    const [roles, setRoles] = useState<string[]>(['Team Leader']);
    const [interns, setInterns] = useState<{ [key: string]: string[] }>({
        'Team Leader': ['Intern Name 1', 'Intern Name 2']
    });

    const showInterns = (role: string) => {
        setCurrentRole(role);
    };

    const addRole = () => {
        const roleName = prompt('Enter the new role:');
        if (roleName && !roles.includes(roleName)) {
            setRoles([...roles, roleName]);
            setInterns({ ...interns, [roleName]: [] });
        }
    };

    const addIntern = () => {
        const role = prompt('Enter the role to add intern:');
        const internName = prompt('Enter the intern name:');
        if (role && internName && roles.includes(role)) {
            setInterns({
                ...interns,
                [role]: [...interns[role], internName]
            });
            setCurrentRole(role);
        }
    };

      return (
        <div className={styles.container}>
            <AdminMenu pageName='Intern Roles'/>
            <main className={styles.main}>
                <div className={styles.sidebar}>
                    <button className={styles.addRole} onClick={addRole}>Add Special Roles</button>
                    <div className={styles.roleList}>
                        {roles.map((role) => (
                            <button key={role} className={styles.role} onClick={() => showInterns(role)}>
                                {role}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.content}>
                    <button className={styles.addIntern} onClick={addIntern}>Add Intern</button>
                    <div className={styles.internList}>
                        {interns[currentRole]?.map((intern, index) => (
                            <div key={index} className={styles.intern}>{intern}</div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InternRoles;
