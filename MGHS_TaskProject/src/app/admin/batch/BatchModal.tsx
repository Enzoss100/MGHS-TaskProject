import React, { useState, useEffect } from 'react';
import styles from './batch.module.css'; // Adjust path if necessary
import { Batch, createBatch, updateBatch } from '@/app/services/BatchService';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { updateBatchNameForInterns } from '@/app/services/UserService';

interface BatchModalProps {
  setModalState: (state: boolean) => void;
  initialBatch?: Batch;
  batchID?: string | null;
}

const BatchModal: React.FC<BatchModalProps> = ({ setModalState, initialBatch, batchID }) => {
  const [batch, setBatch] = useState<Batch>({
    name: initialBatch?.name || '',
    startDate: initialBatch?.startDate ? new Date(initialBatch.startDate) : new Date(),
    endDate: initialBatch?.endDate ? new Date(initialBatch.endDate) : new Date(),
  });

  useEffect(() => {
    if (initialBatch) {
      setBatch({
        name: initialBatch.name || '',
        startDate: initialBatch.startDate ? new Date(initialBatch.startDate) : new Date(),
        endDate: initialBatch.endDate ? new Date(initialBatch.endDate) : new Date(),
      });
    } else {
      setBatch({
        name: '',
        startDate: new Date(),
        endDate: new Date(),
      });
    }
  }, [initialBatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBatch((prevBatch) => ({
      ...prevBatch,
      [name]: name === 'startDate' || name === 'endDate' ? new Date(value) : value,
    }));
  };

  const saveBatch = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const newBatch = {
        ...batch,
        startDate: new Date(batch.startDate),
        endDate: new Date(batch.endDate),
      };

      if (batchID) {
        // Check if the batch name has changed
        const oldBatchName = initialBatch?.name;
        if (oldBatchName && oldBatchName !== newBatch.name) {
            // Update the batch name for all associated interns
            await updateBatchNameForInterns(oldBatchName, newBatch.name);
        }

        await updateBatch(batchID, newBatch);
        toast.success('Batch Updated Successfully! Refresh to See Updates.');
      } else {
          await createBatch(newBatch);
          toast.success('Batch Created Successfully!');
      }
      setModalState(false);
    } catch (error: any) {
      toast.error('Error saving batch');
    }
  };

  const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  return (
    <div className={`${styles.modal} ${styles.show}`}>
      <div className={styles.modalContent}>
        <span className={styles.closeBtn} 
          onClick={() => setModalState(false)}
          >
            &times;
        </span>
        <h2 className={styles.modalTitle}>{batchID ? 'Edit Batch' : 'Create New Batch'}</h2>
        <form onSubmit={saveBatch}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Batch Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={batch.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formatDate(batch.startDate)}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formatDate(batch.endDate)}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className={styles.submitBtn}>{batchID ? 'Update Batch' : 'Create Batch'}</button>
        </form>
      </div>
    </div>
  );
};

export default BatchModal;
