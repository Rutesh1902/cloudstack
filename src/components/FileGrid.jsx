// src/components/FileGrid.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function FileGrid({ currentPath, setCurrentPath }) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const res = await axios.get(`/files/?path=${encodeURIComponent(currentPath)}`);
        console.log("Files received:", res.data); // Check structure here
        setFiles(res.data.files || []); // Make sure this matches backend response
      } catch (err) {
        console.error("Failed to load files:", err);
      }
    };

    loadFiles();
  }, [currentPath]);

  const handleFolderClick = (folderName) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setCurrentPath(newPath);
  };

  const isImage = (filename) => /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
  const isVideo = (filename) => /\.(mp4|webm|mov|avi|mkv)$/i.test(filename);

return (
  <div style={{ padding: '1rem' }}>
    {/* ⬅ Back button */}
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
          setCurrentPath(parentPath);
        }}
      >
        ⬅ Back
      </div>
    )}

    {/* File grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '1rem',
    }}>
      {files.map((file) => (
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
        >
          {file.is_dir ? (
            <div style={{ fontSize: '2rem' }}>📁</div>
          ) : isImage(file.name) ? (
            <img
              src={`/files/serve?path=${encodeURIComponent(currentPath + '/' + file.name)}`}
              alt={file.name}
              style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '8px' }}
            />
          ) : isVideo(file.name) ? (
            <video
              src={`/files/serve?path=${encodeURIComponent(currentPath + '/' + file.name)}`}
              style={{ width: '100%', maxHeight: '150px', borderRadius: '8px' }}
              controls
            />
          ) : (
            <div style={{ fontSize: '2rem' }}>📄</div>
          )}

          <div style={{ marginTop: '0.5rem', wordBreak: 'break-word' }}>{file.name}</div>
        </div>
      ))}
    </div>
  </div>
);
}
