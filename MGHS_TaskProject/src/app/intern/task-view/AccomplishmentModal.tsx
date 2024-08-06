import { updateAccomplishment, createAccomplishment, Accomplishment } from '@/app/services/AccomplishmentService';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import styles from './accomplishments.module.css';
import { useSession } from 'next-auth/react';

interface Props {
  setModalState: (state: boolean) => void;
  initialAccomplishment?: Accomplishment;
  accomplishmentID?: string | null;
}

const AccomplishmentModal = ({ setModalState, initialAccomplishment, accomplishmentID }: Props) => {
  
    const { data: session } = useSession();

    const [accomplishment, setAccomplishment] = useState<Accomplishment>({
    title: initialAccomplishment?.title || '',
    description: initialAccomplishment?.description || '',
    link: initialAccomplishment?.link || '',
    accDate: initialAccomplishment?.accDate ? new Date(initialAccomplishment.accDate) : new Date(),
    userID: session?.user?.email || '',
    taskID: initialAccomplishment?.taskID || '',
    });

  useEffect(() => {
    if (initialAccomplishment) {
      setAccomplishment({
        ...initialAccomplishment,
      });
    }
  }, [initialAccomplishment]);

  // Handles the change of input for title
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccomplishment({ ...accomplishment, [name]: value });
  };

  // Handles the change of input for content
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAccomplishment({ ...accomplishment, [name]: value });
  };

  const saveAccomplishment = async () => {
    if (!accomplishment.description) {
      toast.error('Please add content to the accomplishment');
      return;
    }

    try {
      if (accomplishmentID) {
        // Update existing accomplishment
        await updateAccomplishment(accomplishmentID, accomplishment);
        toast.success('Accomplishment Updated Successfully!');
      } else {
        // Create new accomplishment
        await createAccomplishment(accomplishment);  
        toast.success('Accomplishment Created Successfully!');
      }
      setModalState(false);
    } catch (error: any) {
      toast.error('Error saving Accomplishment');
    }
  };

  return (
    <div className={`${styles.modal} ${styles.show}`}>
      <div className={styles.modalContent}>
        <span
          className={styles.closeBtn}
          onClick={() => setModalState(false)}
        >
          &times;
        </span>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Accomplishment Title</label>
          <input
            className={styles.input}
            id="accomplishmentName"
            type="text"
            name="accomplishmentName"
            value={accomplishment.title}
            onChange={handleInputChange}
            placeholder="Accomplishment Title"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Accomplishment Content</label>
          <textarea
            className={styles.tasktextarea}
            id="accomplishmentDesc"
            name="accomplishmentDesc"
            value={accomplishment.description}
            onChange={handleTextareaChange}
            placeholder="Place your accomplishment description here..."
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Accomplishment Link</label>
          <input
            className={styles.input}
            id="accomplishmentName"
            type="text"
            name="accomplishmentName"
            value={accomplishment.link}
            onChange={handleInputChange}
            placeholder="Accomplishment Title"
            required
          />
        </div>

        <button
          onClick={() => setModalState(false)}
          className={styles.renderBtn}
        >
          Cancel
        </button>
        <button
          onClick={saveAccomplishment}
          className={styles.renderBtn}
        >
          {accomplishmentID ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  );
};

export default AccomplishmentModal;
