import React, { useState } from 'react';
import { Absence, UserDetails } from '@/types/user-details';
import styles from './attendance.module.css';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp if you're using Firebase

interface AbsenceModalProps {
  student: UserDetails;
  onClose: () => void;
  onSave: (updatedStudent: UserDetails) => void;
}

const AbsenceModal: React.FC<AbsenceModalProps> = ({ student, onClose, onSave }) => {
  const [newAbsenceDate, setNewAbsenceDate] = useState<string>('');
  const [newAbsenceReason, setNewAbsenceReason] = useState<string>('');

  const handleSave = () => {
    // Create a new Absence object with the date properly converted
    const newAbsence: Absence = {
      absenceDate: new Date(newAbsenceDate), // Ensure this is a Date object
      reason: newAbsenceReason || 'No reason provided',
    };

    // Update the student's absences
    const updatedStudent: UserDetails = {
      ...student,
      absences: [...(student.absences || []), newAbsence],
    };

    // Call the onSave function with the updated student details
    onSave(updatedStudent);
    onClose(); // Close the modal after saving
  };

  const handleDelete = (index: number) => {
    const updatedAbsences = [...(student.absences || [])];
    updatedAbsences.splice(index, 1);

    const updatedStudent: UserDetails = {
      ...student,
      absences: updatedAbsences,
    };

    onSave(updatedStudent);
  };


  return (
    <div className={`${styles.modal} ${styles.show}`}>
      <div className={styles.modalContent}>
        <span className={styles.closeBtn} onClick={onClose}>X</span>
        <h2>{`${student.firstname} ${student.lastname}`}</h2>
        <h3>Absences</h3>
        {student.absences && student.absences.length > 0 ? (
          <ul>
            {student.absences.map((absence, index) => (
              <li key={index} className={styles.absenceItem}>
                <p>Date: {absence.absenceDate instanceof Timestamp ? absence.absenceDate.toDate().toDateString() : new Date(absence.absenceDate).toDateString()}</p>
                <p>Reason: {absence.reason || 'No reason provided'}</p>
                  <button onClick={() => handleDelete(index)} className={styles.deleteIcon} >Delete Absence</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No absences recorded.</p>
        )}
        <div className={styles.formGroup}>
        <h4>Record Absence</h4>
          <label htmlFor="absenceDate">Absence Date:</label>
          <input
            type="date"
            id="absenceDate"
            value={newAbsenceDate}
            onChange={(e) => setNewAbsenceDate(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="absenceReason">Reason:</label>
          <input
            type="text"
            id="absenceReason"
            value={newAbsenceReason}
            onChange={(e) => setNewAbsenceReason(e.target.value)}
            placeholder="Enter reason (optional)"
          />
        </div>
        <div className={styles.buttonGroup}>
          <button className={`${styles.button} ${styles.buttonSave}`} onClick={handleSave}>Mark Absent</button>
        </div>
      </div>
    </div>
  );
};

export default AbsenceModal;