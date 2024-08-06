import { updateTask, createTask } from '@/app/services/TaskService';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import styles from './accomplish.module.css';

interface Props {
  setModalState: (state: boolean) => void;
  initialTask?: any;
  taskID?: string | null;
}

const TaskModal = ({ setModalState, initialTask, taskID }: Props) => {
  const [task, setTask] = useState({
    taskName: '',
    taskDesc: '',
  });

  useEffect(() => {
    if (initialTask) {
      setTask({
        ...initialTask,
      });
    }
  }, [initialTask]);

  // Handles the change of input for title
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  // Handles the change of input for content
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const saveTask = async () => {
    if (!task.taskDesc) {
      toast.error('Please add description of the task');
      return;
    }

    try {
      if (taskID) {
        // Update existing task
        await updateTask(taskID, task);
        toast.success('Task Updated Successfully!');
      } else {
        // Create new task
        await createTask(task);  
        toast.success('Task Created Successfully!');
      }
      setModalState(false);
    } catch (error: any) {
      toast.error('Error saving Task');
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
          <label className={styles.label}>Task Title</label>
          <input
            className={styles.input}
            id="taskName"
            type="text"
            name="taskName"
            value={task.taskName}
            onChange={handleInputChange}
            placeholder="Task Title"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Task Description</label>
          <textarea
            className={styles.tasktextarea}
            id="taskDesc"
            name="taskDesc"
            value={task.taskDesc}
            onChange={handleTextareaChange}
            placeholder="Place your task description here..."
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
          onClick={saveTask}
          className={styles.renderBtn}
        >
          {taskID ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  );
};

export default TaskModal;
