'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminMenu from '@/app/components/AdminMenu'; 
import styles from './accomplish.module.css'; 
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { fetchTasks, Task, deleteTask } from '@/app/services/TaskService';
import TaskModal from './TaskModal';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { fetchAccompByTask } from '@/app/services/AccomplishmentService';

export default function InternTasks() {
    const session = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/signin');
        },
    });

    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [modalStat, setModalState] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [accomplishments, setAccomplishments] = useState<{ [key: string]: string[] }>({});

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
        const internAccomplishments = await fetchAccompByTask(task.taskName);
        setAccomplishments((prev) => ({ ...prev, [task.taskName]: internAccomplishments.map(accomp => accomp.id) }));
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

    return (
        <div className={styles.container}>
            <AdminMenu pageName='Intern Tasks'/>
            <main className={styles.main}>
                <div className={styles.sidebar}>
                    <button className={styles.addTask} onClick={addTask}>Add Intern Tasks</button>
                    <div className={styles.taskList}>
                        {tasks.map((task) => (
                            <button 
                                key={task.taskName} 
                                className={`${styles.task} ${currentTask?.taskName === task.taskName ? styles.activeTask : ''}`} 
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
                            <div className={styles.internList}>
                                {accomplishments[currentTask.taskName] && accomplishments[currentTask.taskName].length > 0 ? (
                                    accomplishments[currentTask.taskName].map((intern, index) => (
                                        <div key={index} className={styles.intern}>{intern}</div>
                                    ))
                                ) : (
                                    <div>No Interns Have Submitted Accomplishments for this Task</div>
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
    );
};
