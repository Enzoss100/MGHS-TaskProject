'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { UserDetails } from '@/types/user-details';
import { toast } from 'sonner';
import { fetchUserDetails } from '@/app/services/UserService';
import { useEffect, useState, useCallback } from 'react';
import HamburgerMenu from '@/app/components/HamburgerMenu';
import styles from './taskview.module.css';
import InternProtectedRoute from '@/app/components/InternProtectedRoute';
import { fetchTasks, Task } from '@/app/services/TaskService';
import { fetchAccomplishments, Accomplishment, deleteAccomplishment } from '@/app/services/AccomplishmentService';
import AccomplishmentModal from '@/app/intern/task-view/AccomplishmentModal';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function TaskView() {
    const { data: session } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/signin');
        },
    });

    const [internName, setInternName] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([]);
    const [selectedAccomplishment, setSelectedAccomplishment] = useState<Accomplishment | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getTasks = useCallback(async () => {
        const tasks = await fetchTasks();
        setTasks(tasks);
    }, []);

    const getAccomplishments = useCallback(async (taskId: string) => {
        if (session?.user?.email) {
            const accomplishments = await fetchAccomplishments(session.user.email);
            setAccomplishments(accomplishments.filter(accomp => accomp.taskID === taskId));
        }
    }, [session?.user?.email]);

    useEffect(() => {
        const getInternName = async () => {
            const email = session?.user?.email;

            if (!email) {
                toast.error('Email is not available');
                return;
            }

            try {
                const userDetails: UserDetails[] = await fetchUserDetails(email);

                if (userDetails.length > 0) {
                    const user = userDetails[0] as UserDetails;
                    setInternName(user.firstname);
                } else {
                    toast.error('User not found');
                }
            } catch (error) {
                toast.error('An error occurred while fetching user details');
                console.error(error);
            }
        };

        getInternName();
        getTasks();
    }, [session, getTasks]);

    const openModal = (accomplishment?: Accomplishment) => {
        setSelectedAccomplishment(accomplishment || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        if (selectedTask) {
            getAccomplishments(selectedTask.id!);
        }
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        getAccomplishments(task.id!);
    };

    const handleDelete = async (accomplishmentid: string) => {
        if (confirm(`Are you sure you want to delete this Accomplishment?`)) {
          await deleteAccomplishment(accomplishmentid);
          getAccomplishments(selectedTask?.id!);
        }
      };

    return (
        <InternProtectedRoute>
            <div className={styles.container}>
                <HamburgerMenu internName={internName} />
                <main className={styles.main}>
                    <div className={styles.sidebar}>
                        <h3 className={styles.sidebarTitle}><b>TASK VIEW</b></h3>
                        <hr className={styles.divider} />
                        {tasks.map((task) => (
                            <a
                                key={task.id}
                                className={`${styles.task} ${selectedTask?.id === task.id ? styles.activeTask : ''}`}
                                onClick={() => handleTaskClick(task)}
                            >
                                <b>{task.taskName}</b>
                            </a>
                        ))}
                        <hr className={styles.divider} />
                    </div>
                    <div className={styles.content}>
                        {selectedTask ? (
                            <>
                                <div className={styles.taskHeader}>
                                    <h3 className={styles.heading}>{selectedTask.taskName}</h3>
                                </div>
                                <p className={styles.description}>{selectedTask.taskDesc}</p>
                                <div className={styles.taskHeader}>
                                    <h3 className={styles.heading}>ACCOMPLISHMENTS</h3>
                                    <button className={styles.addTask} onClick={() => openModal()}>Add Accomplishments</button>
                                </div>
                                <hr className={styles.divider} />
                                {accomplishments.map(accomplishment => (
                                    <div key={accomplishment.id} className={styles.intern}>
                                        <div className={styles.iconContainer}>
                                            <button className={styles.editIcon} onClick={() => openModal(accomplishment)}>
                                                <FaEdit />
                                            </button>
                                            <button className={styles.deleteIcon} onClick={() => handleDelete(accomplishment.id!)}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                        <h4>{accomplishment.title}</h4>
                                        <p className={styles.description}>{accomplishment.description}</p>
                                        {accomplishment.link && <a href={accomplishment.link} target="_blank" rel="noopener noreferrer">View Link</a>}
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className={styles.noTaskSelected}>Please select a task to view details</p>
                        )}
                    </div>
                </main>
            </div>
            {isModalOpen && (
                <AccomplishmentModal
                    setModalState={closeModal}
                    initialAccomplishment={selectedAccomplishment}
                    taskID={selectedTask?.id || null}
                />
            )}
        </InternProtectedRoute>
    );
}
