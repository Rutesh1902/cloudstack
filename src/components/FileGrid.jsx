// src/components/FileGrid.jsx
// import React, { useState, useEffect } from 'react';
//
// export default function FileGrid({ currentPath }) {
//   const [files, setFiles] = useState([]);
//   const [error, setError] = useState(null);
//
//   useEffect(() => {
//     const loadFiles = async () => {
//       try {
//         const response = await fetch(`/files/?path=${encodeURIComponent(currentPath || '')}`);
//         const text = await response.text();
//
//         // Try parsing JSON
//         let data;
//         try {
//           data = JSON.parse(text);
//         } catch (parseErr) {
//           throw new Error('Invalid JSON from server');
//         }
//
//         if (!Array.isArray(data)) throw new Error('Expected array of files');
//
//         setFiles(data);
//         setError(null);
//       } catch (err) {
//         console.error('Fetch error:', err);
//         setError('Failed to load files.');
//         setFiles([]);
//       }
//     };
//
//     loadFiles();
//   }, [currentPath]);
//
//   return (
//     <div className="p-4">
//       {error && <div className="text-red-500 mb-4">{error}</div>}
//
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
//         {files.map((file, idx) => (
//           <div key={idx} className="bg-gray-100 p-2 rounded shadow hover:shadow-md transition-all">
//             <div className="text-sm font-semibold truncate">{file.name}</div>
//             <div className="text-xs text-gray-600">
//               {file.is_dir ? '📁 Folder' : '📄 File'} • {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}
//             </div>
//             <div className="text-xs text-gray-500">
//               {file.modified ? `Modified: ${new Date(file.modified * 1000).toLocaleString()}` : ''}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// src/components/FileGrid.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function FileGrid({ currentPath, setCurrentPath }) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const res = await axios.get(`/files/?path=${encodeURIComponent(currentPath)}`);
        console.log("Files received:", res.data); // ← check if data comes here
        setFiles(res.data);
      } catch (err) {
        console.error("Failed to load files:", err);
      }
    };

    loadFiles(); // ← call it inside useEffect
  }, [currentPath]);

  const handleFolderClick = (folderName) => {
    const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setCurrentPath(newPath);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
      {files.map((file) => (
        <div
          key={file.name}
          style={{
            background: '#282828',
            padding: '1rem',
            borderRadius: '10px',
            cursor: file.is_dir ? 'pointer' : 'default',
          }}
          onClick={() => file.is_dir && handleFolderClick(file.name)}
        >
          <div style={{ fontSize: '2rem' }}>{file.is_dir ? '📁' : '📄'}</div>
          <div style={{ marginTop: '0.5rem', wordBreak: 'break-all' }}>{file.name}</div>
        </div>
      ))}
    </div>
  );
}

