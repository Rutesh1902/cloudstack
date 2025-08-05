// src/components/FileGrid.jsx
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function FileGrid({ currentPath, setCurrentPath }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ Track loading state
  const fileCache = useRef(new Map());
  const [contextMenu, setContextMenu] = useState(null); // null or { x, y, file }
useEffect(() => {
  const handleClickOutside = () => {
    setContextMenu(null);
  };

  window.addEventListener('click', handleClickOutside);

  return () => {
    window.removeEventListener('click', handleClickOutside);
  };
}, []);

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

    setFiles([]); // ✅ Clear old files immediately to avoid stale rendering
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
    <div style={{ padding: '1rem' }}>
      {/* Back button */}
      {currentPath && (
        <div
          style={{
            background: '#333',
            padding: '1rem',
            borderRadius: '10px',
            cursor: 'pointer',
            textAlign: 'center',
            marginBottom: '1rem'
          }}
          onClick={() => {
            const parentPath = currentPath.split('/').slice(0, -1).join('/');
            if (parentPath !== currentPath) {
              setFiles([]); // ✅ Also clear here to prevent stale serve calls
              setCurrentPath(parentPath);
            }
          }}
        >
          ⬅ Back
        </div>
      )}

      {/* File grid */}
      <div
          style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '1rem',
      maxWidth: '1200px', // optional: keeps grid from stretching too wide
      width: '100%',      // full width up to max
        }}
      >
        {loading ? (
          <div style={{ color: 'white' }}>Loading...</div>
        ) : files.length === 0 ? (
          <div style={{ color: 'gray', gridColumn: '1 / -1', textAlign: 'center' }}>
            no files found!
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.name}
              style={{
                background: '#282828',
                padding: '1rem',
                borderRadius: '10px',
                cursor: file.is_dir ? 'pointer' : 'default',
                textAlign: 'center'
              }}
              onClick={() => file.is_dir && handleFolderClick(file.name)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({
                    x: e.pageX,
                    y: e.pageY,
                    file: file
                  });
                }}

            >
              {file.is_dir ? (
                <div style={{ fontSize: '4rem' }}>📁</div>
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

              <div  style={{ marginTop: '0.5rem', wordBreak: 'break-word' }}>{truncateName(file.name)}</div>
            </div>
          ))
        )}
      </div>
      {contextMenu && (
  <div
    style={{
      position: 'absolute',
      top: contextMenu.y,
      left: contextMenu.x,
      background: '#333',
      padding: '0.5rem',
      borderRadius: '8px',
      zIndex: 1000,
      color: 'white',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    }}
    onClick={() => setContextMenu(null)} // closes on click
  >
    <div
      style={{ padding: '0.25rem 1rem', cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
        alert(`Download ${contextMenu.file.name}`);
        setContextMenu(null);
      }}
    >
      📥 Download
    </div>

    <div
      style={{ padding: '0.25rem 1rem', cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
        alert(`Rename ${contextMenu.file.name}`);
        setContextMenu(null);
      }}
    >
      ✏️ Rename
    </div>

    <div
      style={{ padding: '0.25rem 1rem', cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
        alert(`Delete ${contextMenu.file.name}`);
        setContextMenu(null);
      }}
    >
      🗑 Delete
    </div>
  </div>
)}

    </div>
  );
}
