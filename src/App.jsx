import { useState } from 'react';
import './App.css';
import api, { clearTokens, getTokens } from './api';
import FileGrid from './components/FileGrid';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import SearchHeader from './components/Search';
import Sidebar from './components/Sidebar';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('cloudstack_user') || 'null'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('All Files');
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('cloudstack_user', JSON.stringify(userData));
  };
  const handleLogout = async () => {
    const tokens = getTokens();
    try { if (tokens?.refresh_token) await api.post('/auth/logout', { refresh_token: tokens.refresh_token }); }
    finally { clearTokens(); localStorage.removeItem('cloudstack_user'); setUser(null); setBreadcrumbs([]); }
  };
  const selectSection = (section) => { setActiveSection(section); if (section !== 'Trash') setBreadcrumbs([]); };
  const currentFolderId = breadcrumbs.at(-1)?.id ?? null;
  if (!user) return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  return (
    <div className="app-shell">
      <Navbar onLogout={handleLogout} toggleSidebar={() => setSidebarOpen((value) => !value)} user={user} />
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} onMenuClick={selectSection} activeSection={activeSection} />
      <main className={`app-content ${sidebarOpen ? 'sidebar-open' : ''}`}><div className="workspace">
        <SearchHeader path={breadcrumbs.map((item) => item.name).join(' / ')} onBack={() => setBreadcrumbs((items) => items.slice(0, -1))} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <FileGrid currentFolderId={currentFolderId} breadcrumbs={breadcrumbs} onOpenFolder={(folder) => setBreadcrumbs((items) => [...items, folder])} onGoToBreadcrumb={(index) => setBreadcrumbs((items) => items.slice(0, index + 1))} onGoHome={() => setBreadcrumbs([])} activeSection={activeSection} searchQuery={searchQuery} />
      </div></main>
    </div>
  );
}

export default App;
