// src/components/LoginPage.jsx
import React, { useState } from 'react';

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Very basic login: assume any non-empty username is accepted
    if (username && password) {
      localStorage.setItem('user', JSON.stringify({ username }));
      onLoginSuccess(username);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>CloudStack</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        /><br />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
