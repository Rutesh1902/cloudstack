
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
