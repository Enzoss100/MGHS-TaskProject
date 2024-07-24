import React from 'react';
import styles from './overtime.module.css';

interface OvertimeModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const OvertimeModal: React.FC<OvertimeModalProps> = ({ isVisible, onClose }) => {
    return (
        <div className={`${styles.modal} ${isVisible ? styles.show : ''}`}>
            <div className={styles.modalContent}>
                <span className={styles.closeBtn} onClick={onClose}>&times;</span>
                <h2 className={styles.overtimeh2}>OVERTIME RECORDING</h2>
                <form>
                    <div className={styles.overtimeFormGroup}>
                        <label htmlFor="timeIn" className={styles.overtimelabel}><b>Time In:</b></label>
                        <input 
                            type="time" 
                            id="timeIn" 
                            name="timeIn" 
                            placeholder="Time" 
                            className={styles.overtimeinput}
                        />
                    </div>
                    <div className={styles.overtimeFormGroup}>
                        <label htmlFor="breakTime" className={styles.overtimelabel}><b>Break Time Start:</b></label>
                        <input 
                            type="time" 
                            id="breakTime" 
                            name="breakTime" 
                            placeholder="Time" 
                            className={styles.overtimeinput}
                        />
                    </div>
                    <div className={styles.overtimeFormGroup}>
                        <label htmlFor="to" className={styles.overtimelabel}><b>Break Time End:</b></label>
                        <input 
                            type="time" 
                            id="to" 
                            name="to" 
                            placeholder="Time" 
                            className={styles.overtimeinput}
                        />
                    </div>
                    <div className={styles.overtimeFormGroup}>
                        <label htmlFor="timeOut" className={styles.overtimelabel}><b>Time Out:</b></label>
                        <input 
                            type="time" 
                            id="timeOut" 
                            name="timeOut" 
                            placeholder="Time" 
                            className={styles.overtimeinput}
                        />
                    </div>
                    <h2 className={styles.overtimeh2}>TASKS REPORT</h2>
                    <textarea 
                        id="overtimeTaskReport" 
                        rows={10} 
                        cols={50} 
                        placeholder="Enter your task report here..." 
                        className={styles.overtimetextarea}
                    />
                    <button type="submit" className={styles.renderBtn}>Render</button>
                </form>
            </div>
        </div>
    );
};

export default OvertimeModal;
