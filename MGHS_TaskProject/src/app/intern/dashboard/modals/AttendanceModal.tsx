import React, { useEffect, useState } from 'react';
import styles from './attendance.module.css';
import { Attendance, createAttendance, updateAttendance } from '@/app/services/AttendanceService';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface AttendanceModalProps {
  isVisible: boolean;
  setModalState: (state: boolean) => void;
  initialRecord?: Attendance;
  recordID: string | null;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ isVisible, setModalState, initialRecord, recordID }) => {
  
  const { data: session } = useSession();

  const [attendance, setAttendance] = useState<Attendance>({
    attendanceDate: initialRecord?.attendanceDate ? new Date(initialRecord.attendanceDate) : new Date(),
    timeStart: initialRecord?.timeStart || '',
    timeEnd: initialRecord?.timeEnd || '',
    timeBreakStart: initialRecord?.timeBreakStart || '',
    timeBreakEnd: initialRecord?.timeBreakEnd || '',
    userID: session?.user?.email || '',
    renderedHours: initialRecord?.renderedHours || 0,
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
      });
    }
  }, [initialRecord, session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAttendance({ ...attendance, [name]: value });
  };

  const saveRecord = async (event: React.FormEvent) => {
    event.preventDefault(); 
  
    try {
      const updatedAttendance = {
        ...attendance,
        attendanceDate: new Date(attendance.attendanceDate), 
      };
  
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
        <form className={styles.dashboardform} onSubmit={saveRecord} method='POST'>
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
          <button type="submit" className={`${styles.renderBtn} ${styles.dashboardbutton}`}>
            {recordID ? 'Update' : 'Render'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AttendanceModal;
