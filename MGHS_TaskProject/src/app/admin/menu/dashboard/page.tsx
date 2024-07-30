import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './a-dash.module.css';

const App: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        totalBatches: 2,
        currentInterns: 28,
        allInterns: 100,
        undergoingOnboarding: 2,
        internsWithOneWeekLeft: 28,
        undergoingOffboarding: 3
    });

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        // Simulate data update after 2 seconds
        const exampleData = {
            totalBatches: 3,
            currentInterns: 30,
            allInterns: 120,
            undergoingOnboarding: 5,
            internsWithOneWeekLeft: 20,
            undergoingOffboarding: 4
        };
        
        setTimeout(() => {
            setDashboardData(exampleData);
        }, 2000);
    }, []);

    return (
        <div>
            <header className="header">
                <div className="hamburger-menu" onClick={toggleMenu}>
                    &#9776;
                </div>
                <div className="logo"><img src="logo.png" alt="Logo" /></div>
                <h1>Dashboard</h1>
                {isMenuOpen && (
                    <nav className="nav-menu">
                        <button className="dashboard">Dashboard</button>
                        <button className="internpool">Intern Pool</button>
                        <button className="batches">Intern Batches</button>
                        <button className="internrole">Intern Role</button>
                        <button className="accomplishment">Intern Accomplishments</button>
                        <button className="attendance">Intern Attendance</button>
                    </nav>
                )}
            </header>
            <main>
                <div className="dashboard-container">
                    <button className="dashboard-card" id="totalBatches">
                        <h2>Total Batches</h2>
                        <p>{dashboardData.totalBatches}</p>
                    </button>
                    <button className="dashboard-card" id="currentInterns">
                        <h2>Current Interns</h2>
                        <p>{dashboardData.currentInterns}</p>
                    </button>
                    <button className="dashboard-card" id="allInterns">
                        <h2>All Interns</h2>
                        <p>{dashboardData.allInterns}</p>
                    </button>
                    <button className="dashboard-card" id="undergoingOnboarding">
                        <h2>Undergoing Onboarding</h2>
                        <p>{dashboardData.undergoingOnboarding}</p>
                    </button>
                    <button className="dashboard-card" id="internsWithOneWeekLeft">
                        <h2>Interns with 1 Week left</h2>
                        <p>{dashboardData.internsWithOneWeekLeft}</p>
                    </button>
                    <button className="dashboard-card" id="undergoingOffboarding">
                        <h2>Undergoing Offboarding</h2>
                        <p>{dashboardData.undergoingOffboarding}</p>
                    </button>
                </div>
            </main>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
