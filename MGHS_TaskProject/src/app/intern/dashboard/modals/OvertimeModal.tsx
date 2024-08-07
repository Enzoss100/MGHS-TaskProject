import React, { useEffect, useState } from 'react';
import styles from './overtime.module.css';
import { createOT, Overtime, updateOT } from '@/app/services/OvertimeService';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface OvertimeModalProps {
    isVisible: boolean;
    setModalState: (state: boolean) => void;
    initialRecord?: Overtime;
    recordID: string | null;
    onAddSuccess?: () => void;
}

const OvertimeModal: React.FC<OvertimeModalProps> = ({ isVisible, setModalState, initialRecord, recordID, onAddSuccess }) => {
    
    const { data: session } = useSession();
    const [errors, setErrors] = useState<string[]>([]);
    
  const [overtime, setOvertime] = useState<Overtime>({
    otDate: initialRecord?.otDate ? new Date(initialRecord.otDate) : new Date(),
    otStart: initialRecord?.otStart || '',
    otEnd: initialRecord?.otEnd || '',
    otBreakStart: initialRecord?.otBreakStart || '',
    otBreakEnd: initialRecord?.otBreakEnd || '',
    otrenderedHours: initialRecord?.otrenderedHours || 0,
    otReport: initialRecord?.otReport || '',
    userID: session?.user?.email || '',
});

  useEffect(() => {
    if (initialRecord) {
      setOvertime({
        otDate: initialRecord.otDate ? new Date(initialRecord.otDate) : new Date(),
        otStart: initialRecord.otStart || '',
        otEnd: initialRecord.otEnd || '',
        otBreakStart: initialRecord.otBreakStart || '',
        otBreakEnd: initialRecord.otBreakEnd || '',
        otrenderedHours: initialRecord?.otrenderedHours || 0,
        otReport: initialRecord?.otReport || '',
        userID: session?.user?.email || '',
    });
    }
    else {
        setOvertime({
        otDate: new Date(),
        otStart: '',
        otEnd: '',
        otBreakStart: '',
        otBreakEnd: '',
        userID: session?.user?.email || '',
        otReport: '',
        otrenderedHours: 0,
        });
    }
  }, [initialRecord, session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOvertime({ ...overtime, [name]: value });

    // Validate the updated time fields
    validateTimes();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOvertime({ ...overtime, [name]: value });
  };

  const validateTimes = () => {
    const errors: string[] = [];
    const { otStart, otEnd, otBreakStart, otBreakEnd } = overtime;

    if (otStart && otEnd && otStart > otEnd) {
      errors.push('Time In cannot be greater than Time Out.');
    }
    if (otBreakStart && otStart && otBreakStart > otStart) {
      errors.push('Break Time Start cannot be greater than Time In.');
    }
    if (otBreakEnd && otBreakStart && otBreakEnd < otBreakStart) {
      errors.push('Break Time End cannot be less than Break Time Start.');
    }
    if (otBreakStart && otEnd && otBreakStart > otEnd) {
      errors.push('Break Time Start cannot be greater than Time Out.');
    }
    if (otBreakEnd && otEnd && otBreakEnd > otEnd) {
      errors.push('Break Time End cannot be greater than Time Out.');
    }

    setErrors(errors);
    return errors;
  };

  const saveRecord = async (event: React.FormEvent) => {
    event.preventDefault(); 
  
    const validationErrors = validateTimes();
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join(' '));
      return;
    }

    try {
      const updatedOvertime = {
        ...overtime,
        otDate: new Date(overtime.otDate), 
      };
  
      if (recordID) {
        await updateOT(recordID, updatedOvertime);
        toast.success('Overtime Updated Successfully!');
      } else {
        await createOT(updatedOvertime);
        toast.success('Overtime Created Successfully!');
        if (onAddSuccess) {
            onAddSuccess();
          }
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
                <h2 className={styles.overtimeh2}>OVERTIME RECORDING</h2>
                <form onSubmit={saveRecord} method='POST'>
                <div className={styles.overtimeFormGroup}>
                <label htmlFor="overtimeDate" className={styles.overtimelabel}><b>Date:</b></label>
                    <input 
                        type="date" 
                        id="otDate" 
                        name="otDate" 
                        value={formatDate(overtime.otDate)}
                        onChange={handleInputChange}
                        className={styles.overtimeinput} 
                        required 
                    />
                    </div>
                    <div className={styles.overtimeFormGroup}>
                        <label htmlFor="otStart" className={styles.overtimelabel}><b>Time In:</b></label>
                        <input 
                            type="time" 
                            id="otStart" 
                            name="otStart" 
                            value={overtime.otStart}
                            onChange={handleInputChange} 
                            className={styles.overtimeinput}
                        />
                    </div>
                    <div className={styles.overtimeFormGroup}>
                        <label htmlFor="otBreakStart" className={styles.overtimelabel}><b>Break Time Start:</b></label>
                        <input 
                            type="time" 
                            id="otBreakStart" 
                            name="otBreakStart" 
                            value={overtime.otBreakStart}
                            onChange={handleInputChange} 
                            className={styles.overtimeinput}
                        />
                    </div>
                    <div className={styles.overtimeFormGroup}>
                        <label htmlFor="otBreakEnd" className={styles.overtimelabel}><b>Break Time End:</b></label>
                        <input 
                            type="time" 
                            id="otBreakEnd" 
                            name="otBreakEnd"  
                            value={overtime.otBreakEnd}
                            onChange={handleInputChange} 
                            className={styles.overtimeinput}
                        />
                    </div>
                    <div className={styles.overtimeFormGroup}>
                        <label htmlFor="otEnd" className={styles.overtimelabel}><b>Time Out:</b></label>
                        <input 
                            type="time" 
                            id="otEnd" 
                            name="otEnd"  
                            value={overtime.otEnd}
                            onChange={handleInputChange} 
                            className={styles.overtimeinput}
                        />
                    </div>
                    <h2 className={styles.overtimeh2}>TASKS REPORT</h2>
                    <textarea 
                        id="otReport" 
                        name="otReport"  
                        rows={10} 
                        cols={50} 
                        value={overtime.otReport}
                        onChange={handleTextareaChange}  
                        placeholder="Enter your task report here..." 
                        className={styles.overtimetextarea}
                    />
                    <button type="submit" className={styles.renderBtn}>
                        {recordID ? 'Update' : 'Render'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OvertimeModal;
