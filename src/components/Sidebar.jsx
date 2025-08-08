
// src/components/Sidebar.jsx
import React from 'react';

const menuItems = [
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
  { name: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ sidebarOpen, toggleSidebar, onMenuClick }) {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          height: 'calc(100% - 60px)',
          width: '250px',
          backgroundColor: '#1f1f1f',
          color: '#fff',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 99,
          overflowY: 'auto',
          borderRight: '1px solid #333',
          padding: '1rem',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>CloudStack</h2>
        {menuItems.map((item) => (
          <div
            key={item.name}
            onClick={() => onMenuClick(item.name)} // notify parent
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.6rem',
              marginBottom: '0.5rem',
              backgroundColor: '#2b2b2b',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3a3a3a')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2b2b2b')}
          >
            <span style={{ marginRight: '10px' }}>{item.icon}</span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: '60px',
            left: 0,
            width: '100%',
            height: 'calc(100% - 60px)',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 50,
          }}
        />
      )}
    </>
  );
}
