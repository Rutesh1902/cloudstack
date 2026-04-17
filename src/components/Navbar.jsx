// src/components/Navbar.jsx
import React from 'react';

export default function Navbar({ onLogout, toggleSidebar, user }) {
  return (
    <header className="navbar">
      <button type="button" className="navbar-hamburger" onClick={toggleSidebar}>
        ☰
      </button>
      <div className="navbar-title">
        <span className="navbar-brand">CloudStack</span>
        <span className="navbar-subtitle">Managed file cloud for teams</span>
      </div>
      <div className="navbar-actions">
        <span className="navbar-user">Welcome, {user?.username || 'User'}</span>
        <button type="button" className="button button-danger" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
