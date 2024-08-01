import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './roles.module.css';

ReactDOM.render(
    <React.StrictMode>
    </React.StrictMode>,
    document.getElementById('root')
  );

const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<string>('Team Leader');
  const [roles, setRoles] = useState<string[]>(['Team Leader']);
  const [interns, setInterns] = useState<{ [key: string]: string[] }>({
    'Team Leader': ['Intern Name 1', 'Intern Name 2']
  });

  const showInterns = (role: string) => {
    setCurrentRole(role);
  };

  const addRole = () => {
    const roleName = prompt('Enter the new role:');
    if (roleName && !roles.includes(roleName)) {
      setRoles([...roles, roleName]);
      setInterns({ ...interns, [roleName]: [] });
    }
  };

  const addIntern = () => {
    const role = prompt('Enter the role to add intern:');
    const internName = prompt('Enter the intern name:');
    if (role && internName && roles.includes(role)) {
      setInterns({
        ...interns,
        [role]: [...interns[role], internName]
      });
      setCurrentRole(role);
    }
  };

  const toggleMenu = () => {
    const navMenu = document.querySelector('.nav-menu') as HTMLElement;
    if (navMenu.style.display === 'block') {
        navMenu.style.display = 'none';
    } else {
        navMenu.style.display = 'block';
    }
};

  const logout = () => {
    alert('Logged out');
};

  return (
    <div className="app">
      <header className="header">
        <div className="hamburger-menu" onClick={() => toggleMenu()}>&#9776;</div>
        <div className="logo"><img src="logo.png" alt="Logo" /></div>
        <h1>Intern Roles</h1>
        <button className="logout" onClick={logout}>
                    <img src="logout.png" alt="Logout" className="logout-icon" />
                </button>
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
        <div className="sidebar">
          <button className="add-role" onClick={addRole}>Add Special Roles</button>
          <div className="role-list">
            {roles.map((role) => (
              <button key={role} className="role" onClick={() => showInterns(role)}>
                {role}
              </button>
            ))}
          </div>
        </div>
        <div className="content">
          <button className="add-intern" onClick={addIntern}>Add Intern</button>
          <div className="intern-list">
            {interns[currentRole]?.map((intern, index) => (
              <div key={index} className="intern">{intern}</div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

const toggleMenu = () => {
  const navMenu = document.querySelector('.nav-menu');
  if (navMenu) {
    if (navMenu.getAttribute('style') === 'display: block;') {
      navMenu.setAttribute('style', 'display: none;');
    } else {
      navMenu.setAttribute('style', 'display: block;');
    }
  }
};
