import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './a-batch.module.css';

const InternTable: React.FC = () => {
    const [students, setStudents] = useState([
        { id: 1, name: '', status: 'pending' },
        { id: 2, name: '', status: 'pending' }
    ]);

    const handleNameChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const newStudents = [...students];
        newStudents[index].name = event.target.value;
        setStudents(newStudents);
    };

    const handleStatusChange = (index: number, event: React.ChangeEvent<HTMLSelectElement>) => {
        const newStudents = [...students];
        newStudents[index].status = event.target.value;
        setStudents(newStudents);
    };

    const toggleMenu = () => {
        const navMenu = document.querySelector('.nav-menu') as HTMLElement;
        if (navMenu.style.display === 'block') {
            navMenu.style.display = 'none';
        } else {
            navMenu.style.display = 'block';
        }
    };

    useEffect(() => {
        const selects = document.querySelectorAll('.status-select');
        selects.forEach((select) => {
            const selectedOption = (select as HTMLSelectElement).options[(select as HTMLSelectElement).selectedIndex];
            select.classList.remove('pending', 'approved', 'backout');
            select.classList.add(selectedOption.value);
        });
    }, [students]);

    return (
        <div>
            <header className="header">
                <div className="hamburger-menu" onClick={toggleMenu}>
                    &#9776;
                </div>
                <div className="logo">[INSERT LOGO]</div>
                <h1>HELLO, [admin]</h1>
            </header>
            <nav className="nav-menu">
                <button className="dashboard">Dashboard</button>
                <button className="internpool">Intern Pool</button>
                <button className="batches">Intern Batches</button>
                <button className='internrole'>Intern Role</button>
                <button className='accomplishment'>Intern Accomplishments</button>
                <button className='attendance'>Intern Attendance</button>
            </nav>
            <main>
                <table className="intern-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Student Name</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={student.id}>
                                <td>{student.id}</td>
                                <td>
                                    <input 
                                        type="text" 
                                        value={student.name} 
                                        onChange={(event) => handleNameChange(index, event)} 
                                    />
                                </td>
                                <td>
                                    <select 
                                        value={student.status} 
                                        onChange={(event) => handleStatusChange(index, event)}
                                        className={`status-select ${student.status}`}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="backout">Backout</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

ReactDOM.render(<InternTable />, document.getElementById('root'));
