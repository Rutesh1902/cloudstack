
// src/App.jsx
import React, { useState } from 'react';
import './App.css';
import LoginPage from './components/LoginPage';
import FileGrid from './components/FileGrid';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import SearchHeader from './components/Search';

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('All Files');
  const [currentPath, setCurrentPath] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLoginSuccess = (username) => {
    const userData = { username };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const toggleSidebar = () => setSidebarOpen((value) => !value);

  if (!user) return <LoginPage onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="app-shell">
      <Navbar onLogout={handleLogout} toggleSidebar={toggleSidebar} user={user} />
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        onMenuClick={setActiveSection}
        activeSection={activeSection}
      />

      <main className={`app-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="workspace">
          <SearchHeader
            currentPath={currentPath}
            setCurrentPath={setCurrentPath}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <FileGrid
            currentPath={currentPath}
            setCurrentPath={setCurrentPath}
            activeSection={activeSection}
            searchQuery={searchQuery}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
