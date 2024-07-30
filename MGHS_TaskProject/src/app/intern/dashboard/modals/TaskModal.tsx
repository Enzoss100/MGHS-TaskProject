import React from 'react';
import styles from './task.module.css';

interface TaskModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isVisible, onClose }) => {
    return (
        <div className={`${styles.modal} ${isVisible ? styles.show : ''}`}>
            <div className={styles.modalContent}>
                <span className={styles.closeBtn} onClick={onClose}>&times;</span>
                <h2>TASKS REPORT</h2>
                <textarea 
                    id="taskReport" 
                    rows={10} 
                    cols={50} 
                    placeholder="Enter your task report here..." 
                    className={styles.tasktextarea}
                />
                <button type="submit" className={`${styles.renderBtn} ${styles.dashboardbutton}`}>Render</button>
            </div>
        </div>
    );
};

export default TaskModal;
