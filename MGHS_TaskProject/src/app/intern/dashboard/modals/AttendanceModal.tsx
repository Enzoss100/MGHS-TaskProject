import React from 'react';
import styles from './attendance.module.css';

interface AttendanceModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ isVisible, onClose }) => {
    return (
        <div className={`${styles.modal} ${isVisible ? styles.show : ''}`}>
            <div className={styles.modalContent}>
                <span className={styles.closeBtn} onClick={onClose}>&times;</span>
                <h2 className={styles.modalContenth2}>ATTENDANCE MONITORING</h2>
                <form className={styles.dashboardform}>
                    <label htmlFor="time-in" className={styles.dashboardformlabel}><b>Time In:</b></label>
                    <input 
                        type="time" 
                        id="time-in" 
                        name="time-in" 
                        className={styles.dashboardforminput} 
                        required 
                        placeholder="Time" />
                    
                    <label htmlFor="break-time-start" className={styles.dashboardformlabel}><b>Break Time Start:</b></label>
                    <input 
                        type="time" 
                        id="break-time-start" 
                        name="break-time-start" 
                        className={styles.dashboardforminput} 
                        required 
                        placeholder="Time" />
                    <label htmlFor="break-time-end" className={styles.dashboardformlabel}><b>Break Time End</b></label>
                    <input 
                        type="time" 
                        id="break-time-end" 
                        name="break-time-end" 
                        className={styles.dashboardforminput} 
                        required 
                        placeholder="Time" />
                    <label htmlFor="time-out" className={styles.dashboardformlabel}><b>Time Out:</b></label>
                    <input 
                        type="time" 
                        id="time-out" 
                        name="time-out" 
                        className={styles.dashboardforminput} 
                        required placeholder="Time" />
                    <button type="submit" className={`${styles.renderBtn} ${styles.dashboardbutton}`}>Render</button>
                </form>
            </div>
        </div>
    );
};

export default AttendanceModal;
