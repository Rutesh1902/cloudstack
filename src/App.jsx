
//src/App.jsx
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
      <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
    }}
  >
    {/* Background Image with Dark Blue Gradient Overlay */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        width: "100%",
backgroundImage: `
  linear-gradient(
    rgba(0, 0, 0, 0.65),           /* Subtle dark overlay */
    rgba(0, 0, 0, 0.65)
  ),
  linear-gradient(
    135deg,
    rgba(29, 78, 216, 0.6) 0%,     /* Blue */
    rgba(56, 189, 248, 0.5) 35%,   /* Teal */
    rgba(91, 33, 182, 0.6) 100%    /* Purple */
  ),
  url('/background.png')
`,
backgroundSize: "cover",
backgroundPosition: "center",
backgroundRepeat: "no-repeat",

        filter: "blur(5px)",
      }}
    />

    {/* Content */}
    <div
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >

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
        </div>
  );
}

export default App;
