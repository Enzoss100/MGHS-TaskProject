'use client';

import React, { useState } from 'react';
import './accomplish.module.css';

interface Accomplishment {
    title: string;
    description: string;
    link: string;
    internName: string;
    date: string;
}

const accomplishmentsData: { [key: string]: Accomplishment[] } = {
    'AI TASK': [
        {
            title: 'Accomplishment Title 1',
            description: 'Accomplishment Description 1',
            link: 'https://example.com/1',
            internName: 'Intern Name 1',
            date: '2024-07-01',
        },
        {
            title: 'Accomplishment Title 2',
            description: 'Accomplishment Description 2',
            link: 'https://example.com/2',
            internName: 'Intern Name 2',
            date: '2024-07-02',
        },
    ],
    'WEBSITE': [
        {
            title: 'Accomplishment Title 3',
            description: 'Accomplishment Description 3',
            link: 'https://example.com/3',
            internName: 'Intern Name 3',
            date: '2024-07-03',
        },
        {
            title: 'Accomplishment Title 4',
            description: 'Accomplishment Description 4',
            link: 'https://example.com/4',
            internName: 'Intern Name 4',
            date: '2024-07-04',
        },
    ],
};

const toggleMenu = () => {
    const navMenu = document.querySelector('.nav-menu') as HTMLElement;
    if (navMenu.style.display === 'flex') {
        navMenu.style.display = 'none';
    } else {
        navMenu.style.display = 'flex';
    }
};



const App: React.FC = () => {
    const [selectedTask, setSelectedTask] = useState<string>('AI TASK');

    const showAccomplishments = (task: string) => {
        setSelectedTask(task);
    };

    const logout = () => {
        alert('Logged out');
    };

    return (
        <div className="container">
            <header className="header">
            <div className="hamburger-menu" onClick={toggleMenu}>&#9776;</div>
                <div className="logo">
                    <img src="logo.png" alt="Logo" />
                </div>
                <h1>Accomplishments</h1>
                <button className="logout" onClick={logout}>
                    <img src="logout.png" alt="Logout" className="logout-icon" />
                </button>
                <nav className="nav-menu">
            <button className="dashboard">Dashboard</button>
                <button className="internpool">Intern Pool</button>
                <button className="batches">Intern Batches</button>
                <button className='internrole'>Intern Role</button>
                <button className='accomplishment'>Intern Accomplishments</button>
                <button className='attendance'>Intern Attendance</button>
            </nav>
            </header>
            <main>
                <div className="sidebar">
                    <button className="add-task">Add Task</button>
                    <div className="task-list">
                        <button className="task" onClick={() => showAccomplishments('AI TASK')}>AI TASK</button>
                        <button className="task" onClick={() => showAccomplishments('WEBSITE')}>WEBSITE</button>
                    </div>
                </div>
                <div className="content">
                    <div className="search-bar">
                        <input type="text" placeholder="Search" id="search" />
                    </div>
                    <div className="accomplishments" id="accomplishments">
                        {accomplishmentsData[selectedTask].map((acc, index) => (
                            <div className="accomplishment" key={index}>
                                <h2>{acc.title}</h2>
                                <p>{acc.description}</p>
                                <a href={acc.link} target="_blank" rel="noopener noreferrer">{acc.link}</a>
                                <p>by {acc.internName}</p>
                                <p>{acc.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
