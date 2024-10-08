'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { fetchUserDetails, updateUserDetails } from '@/app/services/UserService';
import { fetchAttendance, Attendance, updateAttendance, deleteAttendance } from '@/app/services/AttendanceService';
import { UserDetails } from '@/types/user-details';
import { toast } from 'sonner';
import HamburgerMenu from '@/app/components/HamburgerMenu';
import AttendanceModal from './modals/AttendanceModal';
import OvertimeModal from './modals/OvertimeModal';
import styles from './dashboard.module.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Timestamp } from 'firebase/firestore';
import { fetchOT, Overtime } from '@/app/services/OvertimeService';
import InternProtectedRoute from '@/app/components/InternProtectedRoute';
import * as XLSX from 'xlsx'; 
import { FiDownload } from 'react-icons/fi';

// Method to Export to excel
const exportAttendanceToExcel = (attendanceRecords: any[], overtimeRecords: any[]) => {

  const confirmation = window.confirm("Are you sure you want to download the Excel file?");
  
  if (!confirmation) {
    return; // If the user cancels, do nothing
  }

  // Combine attendance and overtime records into a single sheet
  const ws = XLSX.utils.json_to_sheet([
    ...attendanceRecords.map(record => ({
      'Date': new Date(record.attendanceDate).toLocaleDateString(),
      'Type': 'Attendance',
      'Start Time': record.timeStart,
      'End Time': record.timeEnd,
      'Rendered Hours': record.renderedHours,
      'Report': record.report,
    })),
    ...overtimeRecords.map(record => ({
      'Date': new Date(record.otDate).toLocaleDateString(),
      'Type': 'Overtime',
      'Start Time': record.otStart,
      'End Time': record.otEnd,
      'Rendered Hours': record.otrenderedHours,
      'Report': record.otReport,
    })),
  ]);

  // Create a new workbook and add the worksheet to it
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance and Overtime');

  // Export the workbook to a file
  XLSX.writeFile(wb, 'attendance_overtime.xlsx');
};

export default function Dashboard() {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const [internName, setInternName] = useState('');
  const [attendancePopup, setAttendancePopup] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<{ [key: string]: any }[]>([]);
  const [overtimeRecords, setOvertimeRecords] = useState<Overtime[]>([]);
  const [currentRecord, setCurrentRecord] = useState<Attendance | null>(null);
  const [currentOTRecord, setCurrentOTRecord] = useState<Overtime | null>(null);
  const [totalRenderedHours, setTotalRenderedHours] = useState<number>(0);
  const [allRenderedHours, setAllRenderedHours] = useState<number>(0);

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

  // Calls the Records for Attendance and sets the details on the page
  const getAttendanceRecords = useCallback(async () => {
    if (session.data?.user?.email) {
      try {
        const attendanceData = await fetchAttendance(session.data.user.email);
        console.log('Fetched Attendance Data:', attendanceData); // Add this line
  
        const recordsWithDate = attendanceData.map(record => ({
          ...record,
          attendanceDate: record.attendanceDate instanceof Timestamp ? record.attendanceDate.toDate() : record.attendanceDate,
        }));
        
        // Fetch overtime records
        const overtimeData = await fetchOT(session.data.user.email);
        setOvertimeRecords(overtimeData);

        // Calculate total Attendance rendered hours
        const totalAttendanceHours = recordsWithDate.reduce((sum, record) => sum + (record.renderedHours || 0), 0);

        // Calculate total Overtime Rendered Hours
        const totalOvertimeHours = overtimeData.reduce((sum, record) => sum + (record.otrenderedHours || 0), 0);

        // Overall Hours Rendered in Attendance and Overtime
        const overallHours = totalAttendanceHours + totalOvertimeHours;

        // Set Overall Hours rendered shown in page
        setAllRenderedHours(overallHours);

        // Set Total Rendered hours shown in the page
        setTotalRenderedHours(totalAttendanceHours);

        // Set Attendance Record
        setAttendanceRecords(recordsWithDate);

        // Fetch user details to update
        const userDetails: UserDetails[] = await fetchUserDetails(session.data.user.email);
        if (userDetails.length > 0) {
          const user = userDetails[0] as UserDetails;

          // Calculates the hours left of the user
         const hoursLeft = user.hoursNeeded - overallHours;

          // If the user's hours left is less than 40, then change the onboarded status to offboarding, else keep the user status
         const onboardingStatus = hoursLeft <= 40 ? 'offboarding' : user.onboarded;

          // Update user details with the total rendered hours
          const updatedUserDetails: UserDetails = {
            ...user,
              totalHoursRendered: overallHours,
              onboarded: onboardingStatus,
          };
          await updateUserDetails(user.id!, updatedUserDetails);
        }
      } catch (error) {
        toast.error('An error occurred while fetching attendance records or updating user details');
        console.error(error);
      }
    }
  }, [session]);
  
  useEffect(() => {
    getAttendanceRecords();
  }, [session, getAttendanceRecords]);  

  const handleAttendanceEdit = (record: any) => {
    setCurrentRecord(record);
    setAttendancePopup(true);
  };

  const handleAttendanceAdd = () => {
    setCurrentRecord(null);
    setAttendancePopup(true);
  };

  const handleAttPopupClose = () => {
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
    <InternProtectedRoute>
    <div className={styles.container}>
      <HamburgerMenu internName={internName} />
      <main className={styles.content}>
        <h1 className={styles.dashboardh1}>Dashboard</h1>
        <div className={styles.totalHoursContainer}>
              <h3 className={styles.totalHoursHeader}>All Rendered Hours {'(Attendance and Overtime)'} : {allRenderedHours} hours</h3>
              <button className={`${styles.button} ${styles['buttonExport']}`} onClick={() => exportAttendanceToExcel(attendanceRecords, overtimeRecords)}>
                  <FiDownload /> Export Attendance to Excel
              </button>
          </div>
        <div className={styles.squareContainer}>
            <button className={`${styles.overtimeBtn} ${styles.dashboardbutton}`} 
            onClick={handleAttendanceAdd}>
                Render Attendance
            </button>
        </div>
        <center>
        <div className={styles.totalHoursContainer}>
            <h3 className={styles.totalHoursHeader}>Total Attendance Rendered Hours</h3>
            <p className={styles.totalHoursValue}>{totalRenderedHours} hours</p>
        </div>
        </center>
        <table className={styles.attendanceTable}>
  <thead>
    <tr>
      <th colSpan={6} className={styles.tableHeader}>Overview of Attendance</th>
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
        {attendanceRecords.length === 0 ? (
        <tr>
            <td colSpan={6} className={styles.attendanceTabletd}>No Recorded Attendance</td>
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
              {(record.report || '').split(',').map((line: string, index: React.Key | null | undefined) => (
                <React.Fragment key={index}>
                  {line.trim()}
                  <br />
                </React.Fragment>
              ))}
            </td>
            <td className={styles.attendanceTabletd}>
                <button 
                    className={`${styles.actionButton} ${styles.editButton}`} 
                    onClick={() => handleAttendanceEdit(record)}
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
        setModalState={handleAttPopupClose}
        initialRecord={currentRecord || undefined}
        recordID={currentRecord?.id || null}
      />
    </div>
    </InternProtectedRoute>
  );
}
