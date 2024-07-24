'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaSignOutAlt } from 'react-icons/fa';
import styles from './dashboard.module.css';
import logo from './../../assets/logo.jpg';
import { signOut, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { fetchUserDetails } from '@/app/services/UserService';
import { UserDetails } from '@/types/user-details';
import { toast } from 'sonner';
import HamburgerMenu from '@/app/components/HamburgerMenu';
import AttendanceModal from './modals/AttendanceModal';
import OvertimeModal from './modals/OvertimeModal';
import TaskModal from './modals/TaskModal';

export default function Dashboard() {
    const session = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/signin');
        },
    });

    const [internName, setInternName] = useState('');
    const [attendancePopup, setAttendancePopup] = useState(false);
    const [taskPopup, setTaskPopup] = useState(false);
    const [overtimePopup, setOvertimePopup] = useState(false);

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

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.menuLogo}>
                    <HamburgerMenu />
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
                        {/* Add more rows as needed */}
                    </tbody>
                </table>
            </main>

            {/* Attendance Modal */}
            <AttendanceModal isVisible={attendancePopup} onClose={() => setAttendancePopup(false)} />

            {/* Task Modal */}
            <TaskModal isVisible={taskPopup} onClose={() => setTaskPopup(false)} />

            {/* Overtime Modal */}
            <OvertimeModal isVisible={overtimePopup} onClose={() => setOvertimePopup(false)} />
        </div>
    );
}
