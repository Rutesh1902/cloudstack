import { useState } from 'react';
import './App.css';
import LoginPage from './components/LoginPage';
import FileGrid from './components/FileGrid';

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );

  const handleLoginSuccess = (username) => {
    const userData = { username };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <div>
      {user ? (
        <div>
          <button
            onClick={handleLogout}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              backgroundColor: '#444',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
          <FileGrid />
        </div>
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
