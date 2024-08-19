import React, { useEffect, useState } from 'react';
import styles from './attendance.module.css';
import { Attendance, createAttendance, updateAttendance } from '@/app/services/AttendanceService';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { createOT, Overtime } from '@/app/services/OvertimeService';

interface AttendanceModalProps {
  isVisible: boolean;
  setModalState: (state: boolean) => void;
  initialRecord?: Attendance;
  recordID: string | null;
}

const calculateTotalHours = (start: string, end: string, breakStart: string, breakEnd: string): number => {
  const startTime = new Date(`1970-01-01T${start}:00`);
  const endTime = new Date(`1970-01-01T${end}:00`);
  const breakStartTime = new Date(`1970-01-01T${breakStart}:00`);
  const breakEndTime = new Date(`1970-01-01T${breakEnd}:00`);
  
  const workDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // Convert to hours
  const breakDuration = (breakEndTime.getTime() - breakStartTime.getTime()) / (1000 * 60 * 60); // Convert to hours

  return parseFloat((workDuration - breakDuration).toFixed(2)); // Return as number
};

const AttendanceModal: React.FC<AttendanceModalProps> = ({ isVisible, setModalState, initialRecord, recordID }) => {
  
  const { data: session } = useSession();
  const [errors, setErrors] = useState<string[]>([]);

  const [attendance, setAttendance] = useState<Attendance>({
    attendanceDate: initialRecord?.attendanceDate ? new Date(initialRecord.attendanceDate) : new Date(),
    timeStart: initialRecord?.timeStart || '',
    timeEnd: initialRecord?.timeEnd || '',
    timeBreakStart: initialRecord?.timeBreakStart || '',
    timeBreakEnd: initialRecord?.timeBreakEnd || '',
    userID: session?.user?.email || '',
    renderedHours: initialRecord?.renderedHours || 0,
    report: initialRecord?.report || '',
  });

  useEffect(() => {
    if (initialRecord) {
      setAttendance({
        attendanceDate: initialRecord.attendanceDate ? new Date(initialRecord.attendanceDate) : new Date(),
        timeStart: initialRecord.timeStart || '',
        timeEnd: initialRecord.timeEnd || '',
        timeBreakStart: initialRecord.timeBreakStart || '',
        timeBreakEnd: initialRecord.timeBreakEnd || '',
        userID: session?.user?.email || '',
        renderedHours: initialRecord?.renderedHours || 0,
        report: initialRecord?.report || '',
      });
    } else {
      setAttendance({
        attendanceDate: new Date(),
        timeStart: '',
        timeEnd: '',
        timeBreakStart: '',
        timeBreakEnd: '',
        userID: session?.user?.email || '',
        renderedHours: 0,
        report: '',
      });
    }
  }, [initialRecord, session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAttendance({ ...attendance, [name]: value });

    // Validate the updated time fields
    validateTimes();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAttendance({ ...attendance, [name]: value });
  };


  // Validates the Time and Date Inputs in Attendance
  const validateTimes = () => {
    const errors: string[] = [];
    const { timeStart, timeEnd, timeBreakStart, timeBreakEnd } = attendance;

    const selectedDate = new Date(attendance.attendanceDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to midnight to compare only the date
  
    if (selectedDate > today) {
      errors.push('Attendance date cannot be in the future.');
    }
    if (timeStart && timeEnd && timeStart > timeEnd) {
      errors.push('Time In cannot be greater than Time Out.');
    }
    if (timeBreakStart && timeStart && timeBreakStart < timeStart) {
      errors.push('Break Time Start cannot be less than Time In.');
    }
    if (timeBreakEnd && timeBreakStart && timeBreakEnd < timeBreakStart) {
      errors.push('Break Time End cannot be less than Break Time Start.');
    }
    if (timeBreakStart && timeEnd && timeBreakStart > timeEnd) {
      errors.push('Break Time Start cannot be greater than Time Out.');
    }
    if (timeBreakEnd && timeEnd && timeBreakEnd > timeEnd) {
      errors.push('Break Time End cannot be greater than Time Out.');
    }

    setErrors(errors);
    return errors;
  };

  // Saves the Attendance
  const saveRecord = async (event: React.FormEvent) => {
    event.preventDefault(); 
  
    const validationErrors = validateTimes();
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join(' '));
      return;
    }

    try {
      const renderedHours = calculateTotalHours(
        attendance.timeStart,
        attendance.timeEnd,
        attendance.timeBreakStart,
        attendance.timeBreakEnd
      );
      
      const updatedAttendance = {
        ...attendance,
        attendanceDate: new Date(attendance.attendanceDate),
        renderedHours,
      };
  
      // If the rendered hours of the users are greater than 8, it will automatically be an overtime record
      if (renderedHours > 8) {
        const overtime: Overtime = {
          otDate: updatedAttendance.attendanceDate,
          otStart: updatedAttendance.timeStart,
          otEnd: updatedAttendance.timeEnd,
          otBreakStart: updatedAttendance.timeBreakStart,
          otBreakEnd: updatedAttendance.timeBreakEnd,
          otReport: updatedAttendance.report,
          otrenderedHours: renderedHours,
          userID: updatedAttendance.userID,
        };
        toast.warning('Rendered Hours Exceeds 8. Converting Attendance to Overtime record...');
        await createOT(overtime);
        toast.success('Attendance Successfully Converted to Overtime!')
        setModalState(false); // Close modal after saving overtime
        return; // Exit function early, no attendance record should be saved
      }
  
      if (recordID) {
        await updateAttendance(recordID, updatedAttendance);
        toast.success('Attendance Updated Successfully!');
      } else {
        await createAttendance(updatedAttendance);
        toast.success('Attendance Created Successfully!');
      }
      setModalState(false);
    } catch (error: any) {
      toast.error('Error saving Record');
    }
  };
  
  // Formats the Date in the table
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };
  

  return (
    <div className={`${styles.modal} ${isVisible ? styles.show : ''}`}>
      <div className={styles.modalContent}>
        <span className={styles.closeBtn} onClick={() => setModalState(false)}>&times;</span>
        <h2 className={styles.modalContenth2}>ATTENDANCE MONITORING</h2>
        <form onSubmit={saveRecord} method='POST'>
          <div className = {styles.dashboardform}>
          <label htmlFor="attendanceDate" className={styles.dashboardformlabel}><b>Date:</b></label>
          <input 
            type="date" 
            id="attendanceDate" 
            name="attendanceDate" 
            value={formatDate(attendance.attendanceDate)}
            onChange={handleInputChange}
            className={styles.dashboardforminput} 
            required 
          />
          <label htmlFor="timeStart" className={styles.dashboardformlabel}><b>Time In:</b></label>
          <input 
            type="time" 
            id="timeStart" 
            name="timeStart" 
            value={attendance.timeStart}
            onChange={handleInputChange}
            className={styles.dashboardforminput} 
            required 
          />
          <label htmlFor="timeBreakStart" className={styles.dashboardformlabel}><b>Break Time Start:</b></label>
          <input 
            type="time" 
            id="timeBreakStart" 
            name="timeBreakStart" 
            value={attendance.timeBreakStart}
            onChange={handleInputChange}
            className={styles.dashboardforminput} 
            required 
          />
          <label htmlFor="timeBreakEnd" className={styles.dashboardformlabel}><b>Break Time End:</b></label>
          <input 
            type="time" 
            id="timeBreakEnd" 
            name="timeBreakEnd" 
            value={attendance.timeBreakEnd}
            onChange={handleInputChange}
            className={styles.dashboardforminput} 
            required 
          />
          <label htmlFor="timeEnd" className={styles.dashboardformlabel}><b>Time Out:</b></label>
          <input 
            type="time" 
            id="timeEnd" 
            name="timeEnd" 
            value={attendance.timeEnd}
            onChange={handleInputChange}
            className={styles.dashboardforminput} 
            required 
          />
          <h2 className={styles.attendanceh2}>TASKS REPORT</h2>
          <textarea 
            id="report" 
            name="report"  
            rows={10} 
            cols={50} 
            value={attendance.report}
            onChange={handleTextareaChange}  
            placeholder="Enter your task report here..." 
            className={styles.attendancetextarea}
          />
          <button type="submit" className={`${styles.renderBtn} ${styles.dashboardbutton}`}>
            {recordID ? 'Update' : 'Render'}
          </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceModal;
