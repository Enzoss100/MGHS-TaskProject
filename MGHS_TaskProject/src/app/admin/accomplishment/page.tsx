'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminMenu from '@/app/components/AdminMenu';
import styles from './accomplish.module.css';
import { fetchTasks, Task, deleteTask } from '@/app/services/TaskService';
import TaskModal from './TaskModal';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Accomplishment, fetchAllAccomplishments } from '@/app/services/AccomplishmentService';
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function InternTasks() {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [modalStat, setModalState] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const getTasks = useCallback(async () => {
    const tasks = await fetchTasks();
    setTasks(tasks);
  }, []);

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  const addTask = () => {
    setCurrentTask(null);
    setModalState(true);
  };

  const handleModalClose = () => {
    setModalState(false);
    getTasks();
  };

  const showAccomplishments = async (task: Task) => {
    const allAccomplishments = await fetchAllAccomplishments();
    const filteredAccomplishments = allAccomplishments.filter(accomp => accomp.taskID === task.id);
    setAccomplishments(filteredAccomplishments);
    setCurrentTask(task);
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setModalState(true);
  };

  const handleDeleteTask = async (taskName: string) => {
    if (confirm(`Are you sure you want to delete the task "${taskName}"?`)) {
      await deleteTask(taskName);
      getTasks();
      setCurrentTask(null);
    }
  };

  const filteredAccomplishments = accomplishments.filter(accomplishment =>
    ( (accomplishment.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (accomplishment.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (accomplishment.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ) &&
    (!filterDate || new Date(accomplishment.accDate).toDateString() === new Date(filterDate).toDateString())
  );
  

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <AdminMenu pageName='Intern Tasks' />
        <main className={styles.main}>
          <div className={styles.sidebar}>
            <button className={styles.addTask} onClick={addTask}>Add Intern Tasks</button>
            <div className={styles.taskList}>
              {tasks.map((task) => (
                <button
                  key={task.id}
                  className={`${styles.task} ${currentTask?.id === task.id ? styles.activeTask : ''}`}
                  onClick={() => showAccomplishments(task)}
                >
                  {task.taskName}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.content}>
            {currentTask ? (
              <>
                <div className={styles.taskHeader}>
                  <h2 className={styles.heading}>{currentTask.taskName}</h2>
                  <div className={styles.taskActions}>
                    <FaEdit className={styles.editIcon} onClick={() => handleEditTask(currentTask)} />
                    <FaTrash className={styles.deleteIcon} onClick={() => handleDeleteTask(currentTask.taskName)} />
                  </div>
                </div>
                <p className={styles.description}>{currentTask.taskDesc}</p>

                <h4 className={styles.heading}>Accomplishments</h4>
                <div className={styles.searchAndFilter}>
                  <input
                    type="text"
                    placeholder="Search Accomplishments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchBar}
                  />
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className={styles.dateInput}
                  />
                </div>
                <div>
                  {filteredAccomplishments.length > 0 ? (
                    filteredAccomplishments.map(accomplishment => (
                      <div key={accomplishment.id} className={styles.intern}>
                        <div>
                          <span className={styles.userName}>{accomplishment.userName}</span>
                        </div>
                        <div>
                          <h4>{accomplishment.title}</h4>
                          <p className={styles.description}>{accomplishment.description}</p>
                          {accomplishment.link && <a href={accomplishment.link} target="_blank" rel="noopener noreferrer">View Link</a>}
                        </div>
                        <div>
                          <span className={styles.accDate}>{accomplishment.accDate.toDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>No Accomplishments Found for this Task</div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.noTaskSelected}>No Task Selected</div>
            )}
          </div>
        </main>
        {modalStat && (
          <TaskModal
            setModalState={handleModalClose}
            initialTask={currentTask || undefined}
            taskID={currentTask?.id || null}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
