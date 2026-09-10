// src/components/Sidebar.jsx
import React from 'react';

const menuItems = [
  { name: 'All Files', icon: '📁' },
  { name: 'Trash', icon: '🗑️' },
];

export default function Sidebar({ sidebarOpen, toggleSidebar, onMenuClick, activeSection }) {
  return (
    <>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-title">CloudStack</div>
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`sidebar-item ${item.name === activeSection ? 'active' : ''}`}
              onClick={() => onMenuClick(item.name)}
              type="button"
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}
    </>
  );
}
