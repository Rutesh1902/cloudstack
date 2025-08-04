// src/components/FileGrid.jsx
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function FileGrid({ currentPath, setCurrentPath }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ Track loading state
  const fileCache = useRef(new Map());

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
        }}
      >
        {loading ? (
          <div style={{ color: 'white' }}>Loading...</div>
        ) : files.length === 0 ? (
          <div style={{ color: 'gray', gridColumn: '1 / -1', textAlign: 'center' }}>
            📁 This folder is empty
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
            >
              {file.is_dir ? (
                <div style={{ fontSize: '2rem' }}>📁</div>
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
                  controls
                />
              ) : (
                <div style={{ fontSize: '2rem' }}>📄</div>
              )}

              <div style={{ marginTop: '0.5rem', wordBreak: 'break-word' }}>{file.name}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
