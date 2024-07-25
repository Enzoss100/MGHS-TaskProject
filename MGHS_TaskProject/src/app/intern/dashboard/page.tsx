'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { fetchUserDetails } from '@/app/services/UserService';
import { fetchAttendance, Attendance, updateAttendance, deleteAttendance } from '@/app/services/AttendanceService';
import { UserDetails } from '@/types/user-details';
import { toast } from 'sonner';
import HamburgerMenu from '@/app/components/HamburgerMenu';
import AttendanceModal from './modals/AttendanceModal';
import OvertimeModal from './modals/OvertimeModal';
import TaskModal from './modals/TaskModal';
import styles from './dashboard.module.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Timestamp } from 'firebase/firestore';

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
  const [attendanceRecords, setAttendanceRecords] = useState<{ [key: string]: any }[]>([]);
  const [currentRecord, setCurrentRecord] = useState<Attendance | null>(null);
  const [totalRenderedHours, setTotalRenderedHours] = useState<number>(0);

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

  const getAttendanceRecords = useCallback(async () => {
    if (session.data?.user?.email) {
      try {
        const attendanceData = await fetchAttendance(session.data.user.email);
        console.log('Fetched Attendance Data:', attendanceData); // Add this line
  
        const recordsWithDate = attendanceData.map(record => ({
          ...record,
          attendanceDate: record.attendanceDate instanceof Timestamp ? record.attendanceDate.toDate() : record.attendanceDate,
        }));
        
        // Calculate total rendered hours
        const totalHours = recordsWithDate.reduce((sum, record) => sum + (record.renderedHours || 0), 0);
        setTotalRenderedHours(totalHours);
  
        setAttendanceRecords(recordsWithDate);
      } catch (error) {
        toast.error('An error occurred while fetching attendance records');
        console.error(error);
      }
    }
  }, [session]);
  
  useEffect(() => {
    getAttendanceRecords();
  }, [session, getAttendanceRecords]);  

  const handleEdit = (record: any) => {
    setCurrentRecord(record);
    setAttendancePopup(true);
  };

  const handlePopupClose = () => {
    setAttendancePopup(false);
    getAttendanceRecords();
  };

  const handleDelete = async (id: string) => {
    const confirmation = window.confirm("Are you sure you want to delete this Attendance?");
    if (confirmation) {
    try {
      await deleteAttendance(id);
      setAttendanceRecords(attendanceRecords.filter(record => record.id !== id));
      getAttendanceRecords();
      toast.success('Attendance record deleted successfully');
    } catch (error) {
      toast.error('An error occurred while deleting the attendance record');
      console.error(error);
    }}
  };

  return (
    <div className={styles.container}>
      <HamburgerMenu internName={internName} />
      <main className={styles.content}>
        <h1 className={styles.dashboardh1}>Dashboard</h1>
        <div className={styles.squareContainer}>
          <div className={styles.topButtons}>
            <button className={styles.attendanceBtn + ' ' + styles.dashboardbutton} onClick={() => setAttendancePopup(true)}>Attendance</button>
            <button className={styles.tasksBtn + ' ' + styles.dashboardbutton} onClick={() => setTaskPopup(true)}>Tasks</button>
          </div>
          <button className={styles.overtimeBtn + ' ' + styles.dashboardbutton} onClick={() => setOvertimePopup(true)}>Overtime</button>
        </div>
        <center>
        <div className={styles.totalHoursContainer}>
            <h3 className={styles.totalHoursHeader}>Total Rendered Hours</h3>
            <p className={styles.totalHoursValue}>{totalRenderedHours} hours</p>
        </div>
        </center>
        <table className={styles.attendanceTable}>
  <thead>
    <tr>
      <th colSpan={5} className={styles.tableHeader}>Overview of Attendance</th>
    </tr>
    <tr>
      <th className={styles.attendanceTableth}>Date</th>
      <th className={styles.attendanceTableth}>Clock In</th>
      <th className={styles.attendanceTableth}>Clock Out</th>
      <th className={styles.attendanceTableth}>Total Hours Rendered</th>
      <th className={styles.attendanceTableth}>Actions</th>
    </tr>
  </thead>
    <tbody>
        {attendanceRecords.length === 0 ? (
        <tr>
            <td colSpan={5} className={styles.noRecords}>No Recorded Attendance</td>
        </tr>
        ) : (
        attendanceRecords.map((record) => (
            <tr key={record.id}>
            <td className={styles.attendanceTabletd}>
                {new Date(record.attendanceDate).toLocaleDateString()}
            </td>
            <td className={styles.attendanceTabletd}>{record.timeStart}</td>
            <td className={styles.attendanceTabletd}>{record.timeEnd}</td>
            <td className={styles.attendanceTabletd}>{record.renderedHours}</td>
            <td className={styles.attendanceTabletd}>
                <button 
                    className={`${styles.actionButton} ${styles.editButton}`} 
                    onClick={() => handleEdit(record)}
                >
                    <FaEdit />
                </button>
                <button 
                    className={`${styles.actionButton} ${styles.trashButton}`} 
                    onClick={() => handleDelete(record.id)}
                >
                    <FaTrash />
                </button>
            </td>
            </tr>
        ))
        )}
    </tbody>
    </table>
      </main>

      {/* Attendance Modal */}
      <AttendanceModal 
        isVisible={attendancePopup} 
        setModalState={handlePopupClose}
        initialRecord={currentRecord || undefined}
        recordID={currentRecord?.id || null}
      />

      {/* Task Modal */}
      <TaskModal 
        isVisible={taskPopup} 
        onClose={() => setTaskPopup(false)} 
      />

      {/* Overtime Modal */}
      <OvertimeModal 
        isVisible={overtimePopup} 
        onClose={() => setOvertimePopup(false)} 
      />
    </div>
  );
}
