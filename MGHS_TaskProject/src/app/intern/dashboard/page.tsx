'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import styles from './dashboard.module.css';
import logo from "./../../assets/logo.jpg";
import { signOut, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { fetchUserDetails } from '@/app/services/UserService';
import { UserDetails } from '@/types/user-details';
import { toast } from 'sonner';

export default function Dashboard() {

    const session = useSession({
        required: true,
        onUnauthenticated() {
          redirect('/signin');
        },
      });

      const [internName, setInternName] = useState('');
      
      useEffect(() => {
        const getInternName = async () => {
          const email = session.data?.user?.email;
      
          if (!email) {
            toast.error('Email is not available');
            return;
          }
      
          try {
            const userDetails: UserDetails[] = await fetchUserDetails(email);
      
            if (userDetails.length > 0) {
              const user = userDetails[0] as UserDetails;
              setInternName(user.firstname);
            } else {
              toast.error('User not found');
            }
          } catch (error) {
            toast.error('An error occurred while fetching user details');
            console.error(error);
          }
        };
      
        getInternName();  
      }, [session]);

  const [attendancePopup, setAttendancePopup] = useState(false);
  const [taskPopup, setTaskPopup] = useState(false);
  const [overtimePopup, setOvertimePopup] = useState(false);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.menuLogo}>
          <div className={styles.dropdown}>
            <FaBars className={styles.hamburgerMenu} size={50} />
            <div className={styles.dropdownContent}>
              <div className={styles.dropdownItem}>
                <span><a href="/dashboard">DASHBOARD &#9662;</a></span>
                <div className={styles.dropdownSubmenu}>
                  <a href="/task-view" className={styles.submenuLink}>TASK</a>
                  <a href="/ot-task-report" className={styles.submenuLink}>OVERTIME</a>
                </div>
              </div>
              <a href="/onboarding">ONBOARDING</a>
              <a href="/intern-details">INTERN DETAILS</a>
            </div>
          </div>
          <Image src={logo.src} alt="Company Logo" className={styles.logo} width={50} height={50} />
        </div>
        <div className={styles.welcome}>Hello, {internName}</div>
        <div className={styles.logout}>
          <button onClick={() => signOut()}>
            <FaSignOutAlt size={30} />
          </button>
        </div>
      </header>
      <main className={styles.content}>
        <h1 className={styles.dashboardh1}>Dashboard</h1>
        <div className={styles.squareContainer}>
          <div className={styles.topButtons}>
            <button className={styles.attendanceBtn + ' ' + styles.dashboardbutton} onClick={() => setAttendancePopup(true)}>Attendance</button>
            <button className={styles.tasksBtn + ' ' + styles.dashboardbutton} onClick={() => setTaskPopup(true)}>Tasks</button>
          </div>
          <button className={styles.overtimeBtn + ' ' + styles.dashboardbutton} onClick={() => setOvertimePopup(true)}>Overtime</button>
        </div>
        <table className={styles.attendanceTable}>
          <thead>
            <tr>
              <th colSpan={3} className={styles.tableHeader}>Overview of Attendance</th>
            </tr>
            <tr>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>16/07/2024</td>
              <td>8:00 AM</td>
              <td>5:00 PM</td>
            </tr>
            {/* Add rows as needed */}
          </tbody>
        </table>
      </main>

      {/* Attendance Popup */}
      {attendancePopup && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <span className={styles.closeBtn} onClick={() => setAttendancePopup(false)}>&times;</span>
            <h2>ATTENDANCE MONITORING</h2>
            <form className={styles.dashboardform}>
              <label htmlFor="time-in" className={styles.dashboardformlabel}><b>Time In:</b></label>
              <input type="text" id="time-in" name="time-in" className={styles.dashboardforminput} required placeholder="Time" />
              <label htmlFor="break-time-start" className={styles.dashboardformlabel}><b>Break Time:</b></label>
              <input type="text" id="break-time-start" name="break-time-start" className={styles.dashboardforminput} required placeholder="Time" />
              <label htmlFor="break-time-end" className={styles.dashboardformlabel}><b>TO</b></label>
              <input type="text" id="break-time-end" name="break-time-end" className={styles.dashboardforminput} required placeholder="Time" />
              <label htmlFor="time-out" className={styles.dashboardformlabel}><b>Time Out:</b></label>
              <input type="text" id="time-out" name="time-out" className={styles.dashboardforminput} required placeholder="Time" />
              <button type="submit" className={styles.renderBtn + ' ' + styles.dashboardbutton}>Render</button>
            </form>
          </div>
        </div>
      )}

      {/* Task Popup */}
      {taskPopup && (
        <div className={styles.taskpopup}>
          <div className={styles.taskpopupContent}>
            <span className={styles.close} onClick={() => setTaskPopup(false)}>&times;</span>
            <h2>TASKS REPORT</h2>
            <textarea id="taskReport" rows={10} cols={50} placeholder="Enter your task report here..." />
            <button className={styles.renderBtn + ' ' + styles.dashboardbutton}>Render</button>
          </div>
        </div>
      )}

      {/* Overtime Popup */}
      {overtimePopup && (
        <div className={styles.OTpopup}>
          <div className={styles.OTpopupContent}>
            <span className={styles.close} onClick={() => setOvertimePopup(false)}>&times;</span>
            <h2>OVERTIME RECORDING</h2>
            <label htmlFor="timeIn"><b>Time In:</b></label>
            <input type="text" id="timeIn" name="timeIn" placeholder="Time" />
            <label htmlFor="breakTime"><b>Break Time:</b></label>
            <input type="text" id="breakTime" name="breakTime" placeholder="Time" />
            <label htmlFor="to"><b>TO</b></label>
            <input type="text" id="to" name="to" placeholder="Time" />
            <label htmlFor="timeOut"><b>Time Out:</b></label>
            <input type="text" id="timeOut" name="timeOut" placeholder="Time" />
            <h2>TASKS REPORT</h2>
            <textarea id="overtimeTaskReport" rows={10} cols={50} placeholder="Enter your task report here..." />
            <button className={styles.renderBtn + ' ' + styles.dashboardbutton}>Render</button>
          </div>
        </div>
      )}
    </div>
  );
}
