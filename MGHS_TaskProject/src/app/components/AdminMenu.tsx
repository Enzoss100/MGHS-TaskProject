'use client';

import styles from './adminMenu.module.css'
import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import Image from 'next/image';
import logo from './../assets/logo.jpg';
import { signOut } from 'next-auth/react';

interface AdminMenuProps {
  pageName?: string;
}

const AdminMenu: React.FC<AdminMenuProps> = ({ pageName }) => {
  return (
    <header className={styles.header}>
      <div className={styles.menuLogo}>
        <div className={styles.dropdown}>
          <FaBars className={styles.hamburgerMenu} size={50} />
          <div className={styles.dropdownContent}>
            <a href="/admin/dashboard">Dashboard</a>
            <a href="/admin/internpool">Intern Pool</a>
            <a href="/admin/batch">Intern Batches</a>
            <a href="/admin/roles">Intern Role</a>
            <a href="/admin/accomplishment">Intern Accomplishments</a>
            <a href="/admin/attendance">Intern Attendance</a>
          </div>
        </div>
        <Image src={logo.src} alt="Company Logo" width={50} height={50} className={styles.logo} />
      </div>
      <div className={styles.welcome}>{pageName == null ? 'loading' : pageName}</div>
      <div className={styles.logout}>
        <button className={styles.logoutbutton} onClick={() => signOut()}>
          <FaSignOutAlt size={30} />
        </button>
      </div>
    </header>
  );
};

export default AdminMenu;
