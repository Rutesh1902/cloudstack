
// src/App.jsx
import { useState } from 'react';
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
  const [activeSection, setActiveSection] = useState('All Files'); // 👈 track clicked section
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);

  const handleLoginSuccess = (username) => {
    const userData = { username };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  if (!user) return <LoginPage onLoginSuccess={handleLoginSuccess} />;

  return (
    <div style={{ height: '100vh', overflow: 'hidden', backgroundColor: '#181818', color: 'white' }}>
      <Navbar onLogout={handleLogout} toggleSidebar={toggleSidebar} />
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        onMenuClick={setActiveSection} // 👈 pass handler
      />

      <div
        style={{
          marginTop: '60px',
          padding: '2rem',
          overflowY: 'auto',
          height: 'calc(100vh - 60px)',
        }}
      >
          <SearchHeader
            currentPath={currentPath}
            setCurrentPath={setCurrentPath}
            setFiles={setFiles}
          />


          {activeSection === 'All Files' && (
            <FileGrid
              currentPath={currentPath}
              setCurrentPath={setCurrentPath}
              files={files}
              setFiles={setFiles}
            />

          )}
          {/* You can add more conditionals here if needed for other sections */}
      </div>
    </div>
  );
}

export default App;
