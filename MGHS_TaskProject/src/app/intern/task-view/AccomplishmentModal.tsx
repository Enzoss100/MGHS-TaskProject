import { updateAccomplishment, createAccomplishment, Accomplishment } from '@/app/services/AccomplishmentService';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import styles from './taskview.module.css';
import { useSession } from 'next-auth/react';
import { fetchUserDetails } from '@/app/services/UserService';

interface Props {
  setModalState: (state: boolean) => void;
  initialAccomplishment?: Accomplishment | null;
  taskID: string | null;
}

const AccomplishmentModal = ({ setModalState, initialAccomplishment, taskID }: Props) => {
  const { data: session } = useSession();
  const [accomplishment, setAccomplishment] = useState<Accomplishment>({
    title: initialAccomplishment?.title || '',
    description: initialAccomplishment?.description || '',
    link: initialAccomplishment?.link || '',
    accDate: initialAccomplishment?.accDate ? new Date(initialAccomplishment.accDate) : new Date(),
    userName: '',
    userID: session?.user?.email || '',
    taskID: taskID || '',
  });

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserDetails(session.user.email).then(userDetails => {
        if (userDetails.length > 0) {
          const user = userDetails[0];
          setAccomplishment(prev => ({
            ...prev,
            userName: `${user.firstname} ${user.lastname}`, // Setting userName with full name
          }));
        }
      }).catch(error => {
        console.error('Error fetching user details:', error);
      });
    }
  }, [session, taskID, initialAccomplishment]);

  useEffect(() => {
    if (initialAccomplishment) {
      setAccomplishment({
        ...initialAccomplishment,
        userID: session?.user?.email || '',
        taskID: taskID || '',
      });
    }
  }, [initialAccomplishment, session, taskID]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccomplishment({ ...accomplishment, [name]: value });
  };

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
      if (initialAccomplishment && initialAccomplishment.id) {
        await updateAccomplishment(initialAccomplishment.id, accomplishment);
        toast.success('Accomplishment Updated Successfully!');
      } else {
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
        <div className={styles.formGroup}>
          <label className={styles.label}>Accomplishment Title</label>
          <input
            className={styles.input}
            id="title"
            type="text"
            name="title"
            value={accomplishment.title}
            onChange={handleInputChange}
            placeholder="Accomplishment Title"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Accomplishment Content</label>
          <textarea
            className={styles.tasktextarea}
            id="description"
            name="description"
            value={accomplishment.description}
            onChange={handleTextareaChange}
            placeholder="Place your accomplishment description here..."
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Accomplishment Link</label>
          <input
            className={styles.input}
            id="link"
            type="text"
            name="link"
            value={accomplishment.link}
            onChange={handleInputChange}
            placeholder="Accomplishment Link"
          />
        </div>

        <button
          className={styles.renderBtn}
          type="button"
          onClick={saveAccomplishment}
        >
          {initialAccomplishment ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  );
};

export default AccomplishmentModal;
