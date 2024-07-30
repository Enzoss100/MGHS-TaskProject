import React, { useState, useEffect } from 'react';
import './attendance.module.css';

const App: React.FC = () => {
    const [batchCount, setBatchCount] = useState(1);
    const [batches, setBatches] = useState<number[]>([1]);

    const toggleMenu = () => {
        const navMenu = document.querySelector('.nav-menu') as HTMLElement;
        if (navMenu.style.display === 'block') {
            navMenu.style.display = 'none';
        } else {
            navMenu.style.display = 'block';
        }
    };

    const toggleBatch = (batchId: string) => {
        const batchTables = document.querySelectorAll('.batch-table');
        batchTables.forEach((table) => {
            if (table.id !== batchId) {
                (table as HTMLElement).style.display = 'none';
            }
        });

        const batchTable = document.getElementById(batchId);
        if (batchTable && batchTable.style.display === 'block') {
            batchTable.style.display = 'none';
        } else if (batchTable) {
            batchTable.style.display = 'block';
        }
    };

    const addBatch = () => {
        setBatchCount((prevBatchCount) => {
            const newBatchCount = prevBatchCount + 1;
            setBatches([...batches, newBatchCount]);
            return newBatchCount;
        });
    };

    const generateEmptyRows = (count: number) => {
        let rows = [];
        for (let i = 1; i <= count; i++) {
            rows.push(
                <tr key={i}>
                    <td>{i}</td>
                    <td><input type="text" name="studentName" placeholder="Student Name" /></td>
                    <td><input type="text" name="absences" placeholder="Number of Absences" /></td>
                    <td><input type="text" name="hoursRendered" placeholder="Total Hours Rendered" /></td>
                    <td><input type="text" name="hoursNeeded" placeholder="Hours Needed" /></td>
                    <td><input type="text" name="hoursLeft" placeholder="Hours Left for Completion" /></td>
                </tr>
            );
        }
        return rows;
    };

    useEffect(() => {
        const addEventListeners = (batchId: string) => {
            const tbody = document.getElementById(batchId);
            if (tbody) {
                tbody.addEventListener('input', () => {
                    const rows = tbody.querySelectorAll('tr');
                    const lastRow = rows[rows.length - 1];
                    const inputs = lastRow.querySelectorAll('input');
                    const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
                    if (allFilled && rows.length < 20) {
                        const newRow = document.createElement('tr');
                        newRow.innerHTML = `
                            <td>${rows.length + 1}</td>
                            <td><input type="text" name="studentName" placeholder="Student Name"></td>
                            <td><input type="text" name="absences" placeholder="Number of Absences"></td>
                            <td><input type="text" name="hoursRendered" placeholder="Total Hours Rendered"></td>
                            <td><input type="text" name="hoursNeeded" placeholder="Hours Needed"></td>
                            <td><input type="text" name="hoursLeft" placeholder="Hours Left for Completion"></td>
                        `;
                        tbody.appendChild(newRow);
                    }
                });
            }
        };

        batches.forEach((batch) => {
            addEventListeners(`batch${batch}-body`);
        });
    }, [batches]);

    return (
        <div>
            <header className="header">
                <div className="hamburger-menu" onClick={toggleMenu}>&#9776;</div>
                <div className="logo"><img src="logo.png" alt="Logo" /></div>
                <h1>Intern Attendance</h1>
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
                <div className="batch-container">
                    {batches.map((batch) => (
                        <div className="batch" key={batch}>
                            <button className="batch-header" onClick={() => toggleBatch(`batch${batch}`)}>
                                Batch {batch} Table
                                <span className="arrow">&#9660;</span>
                            </button>
                            <div className="batch-table" id={`batch${batch}`}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>No.</th>
                                            <th>Student Name</th>
                                            <th>Number of Absences</th>
                                            <th>Total Hours Rendered</th>
                                            <th>Hours Needed</th>
                                            <th>Hours Left for Completion</th>
                                        </tr>
                                    </thead>
                                    <tbody id={`batch${batch}-body`}>
                                        {generateEmptyRows(1)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="add-batch" onClick={addBatch}>Add New Batch</button>
            </main>
        </div>
    );
};

export default App;
