// src/components/Search.jsx
import { FiArrowLeft, FiSearch } from 'react-icons/fi';

export default function SearchHeader({ currentPath, setCurrentPath, searchQuery, setSearchQuery }) {
  const handleBack = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    if (parentPath !== currentPath) {
      setCurrentPath(parentPath);
    }
  };

  return (
    <div className="search-panel">
      <div className="search-row">
        <div className="search-left">
          {currentPath ? (
            <button type="button" className="icon-button" onClick={handleBack}>
              <FiArrowLeft size={18} />
            </button>
          ) : (
            <div className="path-badge">Home</div>
          )}
          <div className="path-label">{currentPath || 'Home'}</div>
        </div>

        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search files, folders and recent actions"
            className="search-input"
          />
        </div>
      </div>
    </div>
  );
}
