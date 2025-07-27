// import { useState } from 'react';
// import './App.css';
// import LoginPage from './components/LoginPage';
// import FileGrid from './components/FileGrid';

// function App() {
//   const [user, setUser] = useState(
//     JSON.parse(localStorage.getItem('user')) || null
//   );

//   const handleLoginSuccess = (username) => {
//     const userData = { username };
//     setUser(userData);
//     localStorage.setItem('user', JSON.stringify(userData));
//   };

//   const handleLogout = () => {
//     setUser(null);
//     localStorage.removeItem('user');
//   };

//   return (
//     <div>
//       {user ? (
//         <div>
//           <button
//             onClick={handleLogout}
//             style={{
//               position: 'absolute',
//               top: '1rem',
//               right: '1rem',
//               backgroundColor: '#444',
//               color: 'white',
//               border: 'none',
//               padding: '0.5rem 1rem',
//               borderRadius: '5px',
//               cursor: 'pointer'
//             }}
//           >
//             Logout
//           </button>
//           <FileGrid />
//         </div>
//       ) : (
//         <LoginPage onLoginSuccess={handleLoginSuccess} />
//       )}
//     </div>
//   );
// }

// export default App;
import { useState } from 'react';
import './App.css';
import LoginPage from './components/LoginPage';
import FileGrid from './components/FileGrid';

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Sidebar */}
<div
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    width: '250px',
    backgroundColor: '#1e1e1e',
    color: 'white',
    padding: '1rem',
    borderRight: '1px solid #333',
    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 40,
  }}
>

  {/* CloudStack Section */}
  <div
    style={{
      backgroundColor: '#000',
      padding: '1rem',
      borderRadius: '12px',
      marginTop: '1rem',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    }}
  >
    <h3
      style={{
        color: '#fff',
        textAlign: 'center',
        marginBottom: '1rem',
        borderBottom: '1px solid #333',
        paddingBottom: '0.5rem',
      }}
    >
      CloudStack
    </h3>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {[
        { name: 'All Files', icon: '📁' },
        { name: 'Recent', icon: '🕘' },
        { name: 'Favorites', icon: '⭐' },
        { name: 'Shared With Me', icon: '🤝' },
        { name: 'Images', icon: '🖼️' },
        { name: 'Videos', icon: '🎥' },
        { name: 'Audio', icon: '🎵' },
        { name: 'Docs', icon: '📄' },
        { name: 'Downloads', icon: '⬇️' },
        { name: 'Backups', icon: '💾' },
        { name: 'Archives', icon: '🗃️' },
        { name: 'Other', icon: '🗂️' },
        { name: 'Trash', icon: '🗑️' },
        { name: 'Settings', icon: '⚙️' }
      ]
      .map((cat) => (
        <div
          key={cat.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            color: '#fff',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#222';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#111';
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{cat.name}</span>
        </div>
      ))}
    </div>
  </div>
</div>


      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 30,
          }}
        />
      )}

      {/* Toggle Button */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 50,
            backgroundColor: '#1e1e1e',
            color: '#fff',
            border: '1px solid #444',
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1.2rem',
          }}
        >
          ☰
        </button>
      )}

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 50,
          backgroundColor: '#e11d48',
          color: '#fff',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>

      {/* Main Content */}
      <div
        style={{
          height: '100%',
          overflowY: 'auto',
          padding: '2rem',
          backgroundColor: '#181818',
          color: 'white',
        }}
      >
        <FileGrid />
      </div>
    </div>
  );
}

export default App;
