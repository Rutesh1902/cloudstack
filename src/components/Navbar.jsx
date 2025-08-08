// src/components/Navbar.jsx
import React from 'react';

export default function Navbar({ onLogout, toggleSidebar }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#121212',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        zIndex: 50,
        borderBottom: '1px solid #333',
      }}
    >
      <button
        onClick={toggleSidebar}
        style={{
          backgroundColor: '#1e1e1e',
          color: '#fff',
          border: '1px solid #444',
          padding: '0.4rem 0.7rem',
          borderRadius: '4px',
          fontSize: '1.2rem',
          cursor: 'pointer',
        }}
      >
        ☰
      </button>
       <h1 style={{ textAlign: 'center', marginBottom: '1rem',  fontSize: '2rem', }}>CloudStack </h1>
      <button
        onClick={onLogout}
        style={{
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
    </div>
  );
}
