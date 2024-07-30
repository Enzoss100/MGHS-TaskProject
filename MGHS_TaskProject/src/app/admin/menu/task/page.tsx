import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './a-task.module.css';

const App: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [websiteName, setWebsiteName] = useState('');
    const [websiteGroups, setWebsiteGroups] = useState([
        { id: 1, role: 'TEAM LEADER', name: 'Lorenzo Santillan', position: 'Batch Leader', startDate: '2024-04-02', isChecked: true },
        { id: 2, role: 'INTERN', name: 'Kennichi Nitta', position: 'Batch Leader', startDate: '2024-04-02', isChecked: true },
        { id: 3, role: 'INTERN', name: 'Caitlyn Datu', position: 'Member', startDate: '2024-04-06', isChecked: false }
    ]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleWebsiteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWebsiteName(e.target.value);
    };

    return (
        <div>
            <header className="header">
                <div className="hamburger-menu" onClick={toggleMenu}>
                    &#9776;
                </div>
                <div className="logo">[INSERT LOGO]</div>
                <h1>HELLO, [admin]</h1>
            </header>
            {isMenuOpen && (
                <nav className="nav-menu">
                    <button className="onboarding">Onboarding</button>
                    <button className="batches">Batches</button>
                    <button className="task">Task</button>
                </nav>
            )}
            <main>
                <div className="container">
                    <label htmlFor="websiteName">Website Name:</label>
                    <input type="text" id="websiteName" name="websiteName" value={websiteName} onChange={handleWebsiteNameChange} />

                    <div className="batch-table">
                        <h2>Website Groupings</h2>
                        <table className="intern-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>No.</th>
                                    <th>Role</th>
                                    <th>Name</th>
                                    <th>Position</th>
                                    <th>Start Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {websiteGroups.map((group, index) => (
                                    <tr key={group.id}>
                                        <td><input type="checkbox" checked={group.isChecked} /></td>
                                        <td>{index + 1}</td>
                                        <td>{group.role}</td>
                                        <td>{group.name}</td>
                                        <td>{group.position}</td>
                                        <td>{group.startDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="add-interns">ADD INTERNS</button>
                    </div>

                    <div className="batch-table">
                        <h2>MGHS Website</h2>
                        <table className="intern-table">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Role</th>
                                    <th>Name</th>
                                    <th>Position</th>
                                    <th>Start Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {websiteGroups.map((group, index) => (
                                    group.isChecked && (
                                        <tr key={group.id}>
                                            <td>{index + 1}</td>
                                            <td>{group.role}</td>
                                            <td>{group.name}</td>
                                            <td>{group.position}</td>
                                            <td>{group.startDate}</td>
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
