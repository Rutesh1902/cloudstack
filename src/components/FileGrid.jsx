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
  const [renamingFile, setRenamingFile] = useState(null);
  const [newName, setNewName] = useState("");
  const measureRef = useRef();

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleNameClick = (file) => {
    setRenamingFile(file.name);
    setNewName(file.name);
  };

  const saveRename = async (file) => {
    if (!newName.trim() || newName === file.name) {
      setRenamingFile(null);
      return;
    }
    try {
      await axios.post("files/rename", {
        old_name: file.name,
        new_name: newName.trim(),
        path: currentPath
      });
      setFiles((prev) =>
        prev.map((f) =>
          f.name === file.name ? { ...f, name: newName.trim() } : f
        )
      );
      setRenamingFile(null);
    } catch (err) {
      alert("Rename failed");
      console.error(err);
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
    <div style={{ padding: '0.7rem', borderRadius: '10px', textAlign: 'left', marginBottom: '1rem' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '1rem', fontSize: '1.4rem', color: '#ccc' }}>
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem',
          maxWidth: '1600px',
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
                background: selectedFiles.includes(file.name)
                  ? "linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))"
                  : "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                border: selectedFiles.includes(file.name)
                  ? '2px solid #4fa3ff'
                  : '1px solid rgba(255,255,255,0.15)',
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                transition: "transform 0.2s ease, background 0.3s ease, box-shadow 0.2s ease",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                height: "220px", // fixed height for equal cards
                padding: "0.5rem",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.background = selectedFiles.includes(file.name)
                  ? "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.1))"
                  : "linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.08))";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.background = selectedFiles.includes(file.name)
                  ? "linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))"
                  : "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.25)";
              }}
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  setSelectedFiles(prev =>
                    prev.includes(file.name)
                      ? prev.filter(f => f !== file.name)
                      : [...prev, file.name]
                  );
                }
              }}
              onDoubleClick={() => {
                if (file.is_dir) {
                  handleFolderClick(file.name);
                } else {
                  window.location.href = `/files/serve?path=${encodeURIComponent(currentPath + '/' + file.name)}`;
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                if (!selectedFiles.includes(file.name)) {
                  setSelectedFiles([file.name]);
                }
                setContextMenu({ x: e.pageX, y: e.pageY, file });
              }}
            >
              {/* Thumbnail */}
              {file.is_dir ? (
                <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>📂</div>
              ) : isImage(file.name) ? (
                <img
                  src={`/files/serve?path=${encodeURIComponent(currentPath + '/' + file.name)}`}
                  alt={file.name}
                  style={{
                    width: '100%',
                    maxHeight: '120px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                  }}
                />
              ) : isVideo(file.name) ? (
                <video
                  src={`/files/serve?path=${encodeURIComponent(currentPath + '/' + file.name)}`}
                  style={{
                    width: '100%',
                    maxHeight: '120px',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                  }}
                />
              ) : (
                <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>📄</div>
              )}

              {/* File name / rename */}
              {renamingFile === file.name ? (
                <>
                  <span
                    ref={measureRef}
                    style={{
                      position: "absolute",
                      visibility: "hidden",
                      whiteSpace: "pre",
                      fontSize: "0.9rem",
                      fontFamily: "inherit",
                      padding: "4px 6px"
                    }}
                  >
                    {newName || " "}
                  </span>
                  <textarea
                    value={newName}
                    autoFocus
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={() => saveRename(file)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        saveRename(file);
                      }
                      if (e.key === "Escape") setRenamingFile(null);
                    }}
                    style={{
                      width: "100%",
                      minHeight: "1.8em",
                      padding: "2px 4px",
                      borderRadius: "4px",
                      border: "1px solid #4fa3ff",
                      background: "#1e1e1e",
                      color: "white",
                      textAlign: "center",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      outline: "none",
                      boxShadow: "0 0 0 1px rgba(79, 163, 255, 0.5)",
                      resize: "none",
                      fontSize: "0.85rem",
                      fontFamily: "inherit",
                      overflow: "hidden",
                      lineHeight: "1.2em",
                    }}
                    rows={Math.min(Math.ceil(newName.length / 20), 3)}
                  />
                </>
              ) : (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNameClick(file);
                  }}
                   style={{    width: "100%",
                      minHeight: "1.8em",
                      padding: "2px 4px",


                      color: "white",
                      textAlign: "center",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      outline: "none",
                      resize: "none",
                      fontSize: "0.85rem",
                      fontFamily: "inherit",
                      overflow: "hidden",
                      lineHeight: "1.2em",}}
                >
                  {truncateName(file.name)}
                </span>
              )}
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
            background: 'rgba(40, 40, 40, 0.9)',
            backdropFilter: 'blur(6px)',
            borderRadius: '10px',
            padding: '0.5rem 0',
            zIndex: 1000,
            color: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            minWidth: '150px',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {['open', 'download', 'rename', 'delete'].map((action, index) => (
            <div
              key={action}
              style={{
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                background: hovered === action
                  ? 'linear-gradient(90deg, #555, #333)'
                  : 'transparent',
                transition: 'background 0.15s ease',
                borderTop: index > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}
              onMouseEnter={() => setHovered(action)}
              onMouseLeave={() => setHovered(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (action === 'delete') {
                  if (!window.confirm(`Delete ${selectedFiles.length} file(s)?`)) return;
                  axios.post('/files/delete', {
                    files: selectedFiles.map(name => currentPath + '/' + name)
                  }).then(() => {
                    setFiles(files.filter(f => !selectedFiles.includes(f.name)));
                    setSelectedFiles([]);
                  });
                }
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
                if (action === 'open') {
                  if (contextMenu.file.is_dir) {
                    handleFolderClick(contextMenu.file.name);
                  } else {
                    window.location.href = `/files/serve?path=${encodeURIComponent(currentPath + '/' + contextMenu.file.name)}`;
                  }
                }
                if (action === 'rename' && selectedFiles.length === 1) {
                  setRenamingFile(contextMenu.file.name);
                  setNewName(contextMenu.file.name);
                  setContextMenu(null);
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
