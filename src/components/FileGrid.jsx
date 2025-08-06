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
    const [renamingFile, setRenamingFile] = useState(null);
    const [newName, setNewName] = useState("");

  const isImage = (filename) => /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
  const isVideo = (filename) => /\.(mp4|webm|mov|avi|mkv)$/i.test(filename);
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ padding: '0.7rem',
            borderRadius: '10px',
            display: 'inline-block',  
            cursor: 'pointer',
            textAlign: 'left',
            marginBottom: '1rem' }}>


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
      textAlign: 'left',
      background: '#333',
      padding: '0.5rem',
      borderRadius: '8px',
      zIndex: 1000,
      color: 'white',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    }}
    onClick={() => setContextMenu(null)}
  >
    {['open','download', 'rename', 'delete'].map(action => (
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
          if (action === 'download') {
                  const link = document.createElement('a');
                link.href = `/files/serve?path=${encodeURIComponent(currentPath + '/' + contextMenu.file.name)}`;
                link.download = contextMenu.file.name;  // This tells the browser to download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
          }
          if (action === 'open'){
              window.open(`/files/serve?path=${encodeURIComponent(currentPath + '/' + contextMenu.file.name)}`, '_blank');
          }
          if (action === 'rename') {
              const newName = prompt("Enter new name", contextMenu.file.name);
              if (!newName || newName === contextMenu.file.name) return;

              axios.post('/files/rename', null, {
                params: {
                  old_path: currentPath + '/' + contextMenu.file.name,
                  new_name: newName
                }
              })
              .then(() => {
                fileCache.current.delete(currentPath);
                setContextMenu(null);
                setFiles(files.map(f =>
                  f.name === contextMenu.file.name ? { ...f, name: newName } : f
                ));
              })
              .catch(err => {
                console.error('Rename failed:', err);
                alert('Rename failed');
              });
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
