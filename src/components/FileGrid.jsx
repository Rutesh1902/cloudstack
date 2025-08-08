
// src/components/FileGrid.jsx
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function FileGrid({ currentPath, setCurrentPath }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileCache = useRef(new Map());
  const [contextMenu, setContextMenu] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleFileClick = (file, e) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedFiles(prev =>
        prev.includes(file.name)
          ? prev.filter(f => f !== file.name)
          : [...prev, file.name]
      );
    } else if (e.shiftKey && selectedFiles.length > 0) {
      const lastIndex = files.findIndex(f => f.name === selectedFiles[selectedFiles.length - 1]);
      const currentIndex = files.findIndex(f => f.name === file.name);
      const range = files.slice(
        Math.min(lastIndex, currentIndex),
        Math.max(lastIndex, currentIndex) + 1
      ).map(f => f.name);
      setSelectedFiles(prev => [...new Set([...prev, ...range])]);
    } else {
      setSelectedFiles([file.name]);
      if (file.is_dir) handleFolderClick(file.name);
    }
  };

  useEffect(() => {
    const cachedFiles = fileCache.current.get(currentPath);
    if (cachedFiles !== undefined) {
      setFiles(cachedFiles);
      return;
    }
    const loadFiles = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/files/?path=${encodeURIComponent(currentPath)}`);
        const fileList = res.data.files || [];
        fileCache.current.set(currentPath, fileList);
        setFiles(fileList);
      } catch (err) {
        console.error("Failed to load files:", err);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };
    loadFiles();
  }, [currentPath]);

  const handleFolderClick = (folderName) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    const clickedFolder = files.find(f => f.name === folderName && f.is_dir);
    if (!clickedFolder || newPath === currentPath) return;
    setFiles([]);
    setCurrentPath(newPath);
  };

  const truncateName = (name, maxLength = 27) => {
    if (name.length <= maxLength) return name;
    const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
    return name.slice(0, maxLength - ext.length - 3) + '...' + ext;
  };

  const isImage = (filename) => /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
  const isVideo = (filename) => /\.(mp4|webm|mov|avi|mkv)$/i.test(filename);

  return (
    <div style={{ padding: '0.7rem', borderRadius: '10px', display: 'inline-block', textAlign: 'left', marginBottom: '1rem' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#ccc' }}>
        <span style={{ cursor: 'pointer', color: '#4fa3ff' }} onClick={() => setCurrentPath('')}>
          📂 Home
        </span>
        {currentPath.split('/').filter(Boolean).map((part, idx, arr) => {
          const subPath = arr.slice(0, idx + 1).join('/');
          return (
            <span key={idx}>
              {' / '}
              <span style={{ cursor: 'pointer', color: '#4fa3ff' }} onClick={() => setCurrentPath(subPath)}>
                {part}
              </span>
            </span>
          );
        })}
      </div>

      {/* File grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1rem',
          maxWidth: '1200px',
          width: '100%',
        }}
      >
        {loading ? (
          <div style={{ color: 'white' }}>Loading...</div>
        ) : files.length === 0 ? (
          <div style={{ color: 'gray', gridColumn: '1 / -1', textAlign: 'center' }}>no files found!</div>
        ) : (
          files.map((file) => (
            <div
              key={file.name}
              style={{
                background: selectedFiles.includes(file.name) ? '#444' : '#282828',
                padding: '1rem',
                borderRadius: '10px',
                cursor: file.is_dir ? 'pointer' : 'default',
                textAlign: 'center',
                border: selectedFiles.includes(file.name) ? '2px solid #4fa3ff' : 'none'
              }}
              onClick={(e) => handleFileClick(file, e)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (!selectedFiles.includes(file.name)) {
                  setSelectedFiles([file.name]); // Right click selects if not already
                }
                setContextMenu({ x: e.pageX, y: e.pageY, file });
              }}
            >
              {file.is_dir ? (
                <div style={{ fontSize: '4rem' }}>📂</div>
              ) : isImage(file.name) ? (
                <img
                  src={`/files/serve?path=${encodeURIComponent(currentPath + '/' + file.name)}`}
                  alt={file.name}
                  style={{
                    width: '100%',
                    maxHeight: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              ) : isVideo(file.name) ? (
                <video
                  src={`/files/serve?path=${encodeURIComponent(currentPath + '/' + file.name)}`}
                  style={{ width: '100%', maxHeight: '150px', borderRadius: '8px' }}
                />
              ) : (
                <div style={{ fontSize: '2rem' }}>📄</div>
              )}
              <div style={{ marginTop: '0.5rem', wordBreak: 'break-word' }}>{truncateName(file.name)}</div>
            </div>
          ))
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          style={{
            position: 'absolute',
            top: contextMenu.y,
            left: contextMenu.x,
            textAlign: 'left',
            background: '#333',
            padding: '0.5rem',
            borderRadius: '8px',
            zIndex: 1000,
            color: 'white',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
          }}
        >
          {['open', 'download', 'rename', 'delete'].map(action => (
            <div
              key={action}
              style={{
                padding: '0.25rem 1rem',
                cursor: 'pointer',
                backgroundColor: hovered === action ? '#555' : 'transparent',
                borderRadius: '4px'
              }}
              onMouseEnter={() => setHovered(action)}
              onMouseLeave={() => setHovered(null)}
              onClick={(e) => {
                e.stopPropagation();

                // Bulk delete
                if (action === 'delete') {
                  if (!window.confirm(`Delete ${selectedFiles.length} file(s)?`)) return;
                  axios.post('/files/delete', {
                    files: selectedFiles.map(name => currentPath + '/' + name)
                  }).then(() => {
                    setFiles(files.filter(f => !selectedFiles.includes(f.name)));
                    setSelectedFiles([]);
                  });
                }

                // Bulk download
                if (action === 'download') {
                  if (selectedFiles.length > 1) {
                    window.open(`/files/download-zip?files=${encodeURIComponent(JSON.stringify(selectedFiles.map(name => currentPath + '/' + name)))}`);
                  } else {
                    const link = document.createElement('a');
                    link.href = `/files/serve?path=${encodeURIComponent(currentPath + '/' + contextMenu.file.name)}`;
                    link.download = contextMenu.file.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }

                // Open file
                if (action === 'open') {
                  window.open(`/files/serve?path=${encodeURIComponent(currentPath + '/' + contextMenu.file.name)}`, '_blank');
                }

                // Rename single file
                if (action === 'rename' && selectedFiles.length === 1) {
                  const newName = prompt("Enter new name", contextMenu.file.name);
                  if (!newName || newName === contextMenu.file.name) return;
                  axios.post('/files/rename', null, {
                    params: {
                      old_path: currentPath + '/' + contextMenu.file.name,
                      new_name: newName
                    }
                  }).then(() => {
                    fileCache.current.delete(currentPath);
                    setFiles(files.map(f =>
                      f.name === contextMenu.file.name ? { ...f, name: newName } : f
                    ));
                  }).catch(() => alert('Rename failed'));
                }

                setContextMenu(null);
              }}
            >
              {action}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
