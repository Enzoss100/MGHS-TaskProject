'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { fetchUserDetails, updateUserDetails } from '@/app/services/UserService';
import { UserDetails } from '@/types/user-details';
import { toast } from 'sonner';
import HamburgerMenu from '@/app/components/HamburgerMenu';
import styles from '@/app/intern/dashboard/dashboard.module.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Timestamp } from 'firebase/firestore';
import { deleteOT, fetchOT, Overtime } from '@/app/services/OvertimeService';
import OvertimeModal from '../dashboard/modals/OvertimeModal';
import InternProtectedRoute from '@/app/components/InternProtectedRoute';
import { fetchAttendance } from '@/app/services/AttendanceService';

export default function OvertimeView() {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const [internName, setInternName] = useState('');
  const [overtimePopup, setOvertimePopup] = useState(false);
  const [overtimeRecords, setOvertimeRecords] = useState<{ [key: string]: any }[]>([]);
  const [currentOTRecord, setCurrentOTRecord] = useState<Overtime | null>(null);
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

  const getOvertimeRecords = useCallback(async () => {
    if (session.data?.user?.email) {
      try {
        const overtimeData = await fetchOT(session.data.user.email);
        console.log('Fetched Overtime Data:', overtimeData); // Add this line
  
        const recordsWithDate = overtimeData.map(record => ({
          ...record,
          otDate: record.otDate instanceof Timestamp ? record.otDate.toDate() : record.otDate,
        }));

        // Fetch Attendance records
        const attendanceData = await fetchAttendance(session.data.user.email);

        // Calculate total Attendance rendered hours
        const totalAttendanceHours = attendanceData.reduce((sum, record) => sum + (record.renderedHours || 0), 0);
        
        // Calculate total rendered hours
        const totalHours = recordsWithDate.reduce((sum, record) => sum + (record.otrenderedHours || 0), 0);
        
        // Overall Hours Rendered in Attendance and Overtime
        const overallHours = totalAttendanceHours + totalHours;

        setTotalRenderedHours(totalHours);
        setOvertimeRecords(recordsWithDate);

        // Fetch user details to update
        const userDetails: UserDetails[] = await fetchUserDetails(session.data.user.email);
        if (userDetails.length > 0) {
          const user = userDetails[0] as UserDetails;
          // Update user details with the total rendered hours
          const updatedUserDetails: UserDetails = {
            ...user,
              totalHoursRendered: overallHours, // update the field as per your structure
          };
          await updateUserDetails(user.id!, updatedUserDetails);
        }

      } catch (error) {
        toast.error('An error occurred while fetching overtime records');
        console.error(error);
      }
    }
  }, [session]);
  
  useEffect(() => {
    getOvertimeRecords();
  }, [session, getOvertimeRecords]);  

  const handleEdit = (record: any) => {
    setCurrentOTRecord(record);
    setOvertimePopup(true);
  };

  const handlePopupClose = () => {
    setOvertimePopup(false);
    getOvertimeRecords();
  };

  const handleDelete = async (id: string) => {
    const confirmation = window.confirm("Are you sure you want to delete this Overtime?");
    if (confirmation) {
    try {
      await deleteOT(id);
      setOvertimeRecords(overtimeRecords.filter(record => record.id !== id));
      getOvertimeRecords();
      toast.success('Overtime record deleted successfully');
    } catch (error) {
      toast.error('An error occurred while deleting the overtime record');
      console.error(error);
    }}
  };

  return (
    <InternProtectedRoute>
    <div className={styles.container}>
      <HamburgerMenu internName={internName} />
      <main className={styles.content}>
        <h1 className={styles.dashboardh1}>Overtime With Task Report</h1>
        <center>
        <div className={styles.totalHoursContainer}>
            <h3 className={styles.totalHoursHeader}>Total Overtime Hours Rendered</h3>
            <p className={styles.totalHoursValue}>{totalRenderedHours} hours</p>
        </div>
        </center>
      <table className={styles.attendanceTable}>
  <thead>
    <tr>
      <th colSpan={6} className={styles.tableHeader}>Overview of Overtime</th>
    </tr>
    <tr>
      <th className={styles.attendanceTableth}>Date</th>
      <th className={styles.attendanceTableth}>Clock In</th>
      <th className={styles.attendanceTableth}>Clock Out</th>
      <th className={styles.attendanceTableth}>Hours Rendered</th>
      <th className={styles.attendanceTableth}>Report</th>
      <th className={styles.attendanceTableth}>Actions</th>
    </tr>
  </thead>
    <tbody>
        {overtimeRecords.length === 0 ? (
        <tr>
            <td colSpan={6} className={styles.attendanceTabletd}>No Recorded Overtime</td>
        </tr>
        ) : (
        overtimeRecords.map((record) => (
            <tr key={record.id}>
            <td className={styles.attendanceTabletd}>
                {new Date(record.otDate).toLocaleDateString()}
            </td>
            <td className={styles.attendanceTabletd}>{record.otStart}</td>
            <td className={styles.attendanceTabletd}>{record.otEnd}</td>
            <td className={styles.attendanceTabletd}>{record.otrenderedHours}</td>
            <td className={styles.attendanceTabletd}>
              {record.otReport.split(',').map((line: string, index: React.Key | null | undefined) => (
                <React.Fragment key={index}>
                  {line.trim()}
                  <br />
                </React.Fragment>
              ))}
            </td>
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

      {/* Overtime Modal */}
      <OvertimeModal 
        isVisible={overtimePopup} 
        setModalState={handlePopupClose}
        initialRecord={currentOTRecord || undefined}
        recordID={currentOTRecord?.id || null}
      />
      
    </div>
    </InternProtectedRoute>
  );
}
