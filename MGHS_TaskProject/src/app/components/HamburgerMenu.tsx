'use client';

import styles from './hamburgermenu.module.css';
import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import Image from 'next/image';
import logo from './../assets/logo.jpg';
import { signOut } from 'next-auth/react';

interface HamburgerMenuProps {
  internName?: string;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ internName }) => {
  return (
    <header className={styles.header}>
      <div className={styles.menuLogo}>
        <div className={styles.dropdown}>
          <FaBars className={styles.hamburgerMenu} size={50} />
          <div className={styles.dropdownContent}>
            <div className={styles.dropdownItem}>
              <span><a href="/intern/dashboard">DASHBOARD &#9662;</a></span>
              <div className={styles.dropdownSubmenu}>
                <a href="/intern/task-view" className={styles.submenuLink}>TASK</a>
                <a href="/intern/overtime-reports" className={styles.submenuLink}>OVERTIME</a>
              </div>
            </div>
            <a href="/intern/onboarding">ONBOARDING</a>
            <a href="/intern/details">INTERN DETAILS</a>
          </div>
        </div>
        <Image src={logo.src} alt="Company Logo" width={50} height={50} className={styles.logo} />
      </div>
      <div className={styles.welcome}>Hello, {internName == null ? 'loading' : internName}</div>
      <div className={styles.logout}>
        <button className={styles.logoutbutton} onClick={() => signOut()}>
          <FaSignOutAlt size={30} />
        </button>
      </div>
    </header>
  );
};

export default HamburgerMenu;
