// src/components/FileGrid.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import './FileGrid.css';

const isImage = (filename) => /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
const isVideo = (filename) => /\.(mp4|webm|mov|avi|mkv)$/i.test(filename);
const isAudio = (filename) => /\.(mp3|wav|aac|flac|ogg)$/i.test(filename);
const isDocument = (filename) => /\.(pdf|docx|doc|xlsx|xls|pptx|ppt|txt)$/i.test(filename);
const isArchive = (filename) => /\.(zip|rar|7z|tar|gz)$/i.test(filename);

const sectionMatchers = {
  Images: isImage,
  Videos: isVideo,
  Audio: isAudio,
  Docs: isDocument,
  Archives: isArchive,
  Other: (name) => !isImage(name) && !isVideo(name) && !isAudio(name) && !isDocument(name) && !isArchive(name),
};

const formatSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const buildPath = (currentPath, name) => (currentPath ? `${currentPath}/${name}` : name);

export default function FileGrid({ currentPath, setCurrentPath, activeSection, searchQuery }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [folderName, setFolderName] = useState('');
  const [message, setMessage] = useState('');
  const uploadInput = useRef(null);

  const refreshFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({ path: currentPath || '', search: searchQuery || '' });
      const response = await axios.get(`/files/?${query.toString()}`);
      setFiles(response.data.files || []);
    } catch (err) {
      setError('Failed to load files.');
      console.error(err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFiles();
  }, [currentPath, searchQuery]);

  useEffect(() => {
    if (!selectedFiles.includes(activeFile?.name)) {
      setActiveFile(null);
    }
  }, [selectedFiles]);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch = searchQuery
        ? file.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesSection = activeSection === 'All Files' ? true : sectionMatchers[activeSection]?.(file.name) ?? true;
      return matchesSearch && matchesSection;
    });
  }, [files, activeSection, searchQuery]);

  const handleSelect = (fileName) => {
    setSelectedFiles((current) =>
      current.includes(fileName) ? current.filter((name) => name !== fileName) : [...current, fileName]
    );
    const fileObject = files.find((file) => file.name === fileName);
    setActiveFile(fileObject || null);
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
      setActiveFile(null);
      return;
    }
    setSelectedFiles(filteredFiles.map((file) => file.name));
    setActiveFile(filteredFiles[0] || null);
  };

  const handleFolderOpen = (folderName) => {
    const newPath = buildPath(currentPath, folderName);
    setSelectedFiles([]);
    setActiveFile(null);
    setCurrentPath(newPath);
  };

  const handleDownload = () => {
    selectedFiles.forEach((fileName) => {
      const downloadUrl = `/files/serve?path=${encodeURIComponent(buildPath(currentPath, fileName))}`;
      window.open(downloadUrl, '_blank');
    });
  };

  const handleDelete = async () => {
    if (!selectedFiles.length) return;
    if (!window.confirm(`Delete ${selectedFiles.length} selected item(s)?`)) return;

    try {
      await axios.post('/files/delete', {
        path: currentPath,
        items: selectedFiles,
      });
      setMessage(`Deleted ${selectedFiles.length} item(s).`);
      setSelectedFiles([]);
      refreshFiles();
    } catch (err) {
      setError('Delete failed.');
      console.error(err);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    try {
      await axios.post('/files/mkdir', {
        path: currentPath,
        folder_name: folderName.trim(),
      });
      setFolderName('');
      setMessage(`Folder '${folderName.trim()}' created.`);
      refreshFiles();
    } catch (err) {
      setError('Failed to create folder.');
      console.error(err);
    }
  };

  const handleUploadButton = () => {
    uploadInput.current?.click();
  };

  const handleUploadFiles = async (event) => {
    const filesList = Array.from(event.target.files || []);
    if (!filesList.length) return;

    const formData = new FormData();
    filesList.forEach((file) => formData.append('files', file));
    formData.append('path', currentPath || '');

    try {
      await axios.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`${filesList.length} file(s) uploaded.`);
      refreshFiles();
      event.target.value = '';
    } catch (err) {
      setError('Upload failed.');
      console.error(err);
    }
  };

  const startRename = () => {
    if (selectedFiles.length !== 1) return;
    const target = files.find((file) => file.name === selectedFiles[0]);
    if (!target) return;
    setRenameTarget(target);
    setRenameValue(target.name);
  };

  const saveRename = async () => {
    if (!renameTarget || !renameValue.trim() || renameValue === renameTarget.name) {
      setRenameTarget(null);
      return;
    }

    try {
      await axios.post('/files/rename', {
        path: currentPath,
        old_name: renameTarget.name,
        new_name: renameValue.trim(),
      });
      setMessage(`Renamed '${renameTarget.name}' to '${renameValue.trim()}'.`);
      setRenameTarget(null);
      setSelectedFiles([]);
      refreshFiles();
    } catch (err) {
      setError('Rename failed.');
      console.error(err);
    }
  };

  const breadcrumbParts = currentPath.split('/').filter(Boolean);

  return (
    <section className="file-manager">
      <div className="file-manager-top">
        <div>
          <div className="breadcrumbs">
            <button type="button" className="breadcrumb-link" onClick={() => setCurrentPath('')}>
              📂 Home
            </button>
            {breadcrumbParts.map((part, index) => {
              const subPath = breadcrumbParts.slice(0, index + 1).join('/');
              return (
                <span key={subPath}>
                  <span className="breadcrumb-separator">/</span>
                  <button type="button" className="breadcrumb-link" onClick={() => setCurrentPath(subPath)}>
                    {part}
                  </button>
                </span>
              );
            })}
          </div>
          <p className="file-manager-meta">
            {filteredFiles.length} item(s) · {activeSection} · {currentPath || 'Root'}
          </p>
        </div>

        <div className="file-manager-actions">
          <button type="button" className="button button-secondary" onClick={refreshFiles}>
            Refresh
          </button>
          <button type="button" className="button button-secondary" onClick={handleUploadButton}>
            Upload
          </button>
          <button type="button" className="button button-secondary" onClick={startRename} disabled={selectedFiles.length !== 1}>
            Rename
          </button>
          <button type="button" className="button button-secondary" onClick={handleDownload} disabled={!selectedFiles.length}>
            Download
          </button>
          <button type="button" className="button button-danger" onClick={handleDelete} disabled={!selectedFiles.length}>
            Delete
          </button>
        </div>
      </div>

      <div className="file-manager-grid">
        <div className="files-panel">
          <div className="file-panel-toolbar">
            <button type="button" className="button button-ghost" onClick={handleSelectAll}>
              {selectedFiles.length === filteredFiles.length ? 'Clear selection' : 'Select all'}
            </button>

            <div className="folder-create">
              <input
                type="text"
                value={folderName}
                onChange={(event) => setFolderName(event.target.value)}
                placeholder="New folder name"
                className="folder-input"
              />
              <button type="button" className="button button-primary" onClick={handleCreateFolder}>
                New folder
              </button>
            </div>
          </div>

          {error && <div className="message message-error">{error}</div>}
          {message && <div className="message message-success">{message}</div>}
          {renameTarget && (
            <div className="rename-panel">
              <label className="rename-label">
                Rename <strong>{renameTarget.name}</strong>
              </label>
              <input
                type="text"
                value={renameValue}
                onChange={(event) => setRenameValue(event.target.value)}
                className="folder-input"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') saveRename();
                }}
              />
              <div className="rename-actions">
                <button type="button" className="button button-primary" onClick={saveRename}>
                  Save
                </button>
                <button type="button" className="button button-ghost" onClick={() => setRenameTarget(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="file-grid">
            {loading ? (
              <div className="empty-state">Loading files…</div>
            ) : filteredFiles.length === 0 ? (
              <div className="empty-state">No files found in this folder.</div>
            ) : (
              filteredFiles.map((file) => {
                const isSelected = selectedFiles.includes(file.name);
                const fileUrl = `/files/serve?path=${encodeURIComponent(buildPath(currentPath, file.name))}`;

                return (
                  <button
                    key={file.name}
                    type="button"
                    className={`file-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(file.name)}
                    onDoubleClick={() => (file.is_dir ? handleFolderOpen(file.name) : window.open(fileUrl, '_blank'))}
                  >
                    <div className="file-thumbnail">
                      {file.is_dir ? (
                        <span className="file-icon">📁</span>
                      ) : isImage(file.name) ? (
                        <img src={fileUrl} alt={file.name} className="file-preview" />
                      ) : isVideo(file.name) ? (
                        <span className="file-icon">🎬</span>
                      ) : isAudio(file.name) ? (
                        <span className="file-icon">🎵</span>
                      ) : isDocument(file.name) ? (
                        <span className="file-icon">📄</span>
                      ) : isArchive(file.name) ? (
                        <span className="file-icon">🗜️</span>
                      ) : (
                        <span className="file-icon">📄</span>
                      )}
                    </div>
                    <div className="file-card-body">
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">{file.is_dir ? 'Folder' : formatSize(file.size)}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <input
            ref={uploadInput}
            type="file"
            multiple
            hidden
            onChange={handleUploadFiles}
          />
        </div>

        <aside className="details-panel">
          <div className="details-card">
            <h3>Details</h3>
            {activeFile ? (
              <>
                <p className="detail-label">Name</p>
                <p>{activeFile.name}</p>
                <p className="detail-label">Type</p>
                <p>{activeFile.is_dir ? 'Folder' : activeFile.type || 'File'}</p>
                <p className="detail-label">Size</p>
                <p>{activeFile.is_dir ? '—' : formatSize(activeFile.size)}</p>
                <p className="detail-label">Location</p>
                <p>{buildPath(currentPath, activeFile.name)}</p>
              </>
            ) : (
              <p>Select a file or folder to see details.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
