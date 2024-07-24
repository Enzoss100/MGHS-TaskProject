'use client';

import styles from './hamburgermenu.module.css';
import { FaBars } from 'react-icons/fa';

const HamburgerMenu = () => {
  return (
    <div className={styles.dropdown}>
      <FaBars className={styles.hamburgerMenu} size={50} />
      <div className={styles.dropdownContent}>
        <div className={styles.dropdownItem}>
          <span><a href="/intern/dashboard">DASHBOARD &#9662;</a></span>
          <div className={styles.dropdownSubmenu}>
            <a href="/intern/task-view" className={styles.submenuLink}>TASK</a>
            <a href="/intern/ot-task-report" className={styles.submenuLink}>OVERTIME</a>
          </div>
        </div>
        <a href="/intern/onboarding">ONBOARDING</a>
        <a href="/intern/details">INTERN DETAILS</a>
      </div>
    </div>
  );
};

export default HamburgerMenu;
