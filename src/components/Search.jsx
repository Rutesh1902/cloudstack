// src/components/Search.jsx
import { FiArrowLeft, FiSearch } from 'react-icons/fi';

export default function SearchHeader({ currentPath, setCurrentPath, setFiles }) {
  const handleBack = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    if (parentPath !== currentPath) {
      setFiles([]);
      setCurrentPath(parentPath);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div
        style={{
          position: 'relative',
          marginTop: '1rem',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Back Button */}
        {currentPath && (
          <div
            onClick={handleBack}
            style={{
              position: 'absolute',
              left: 0,
              background: '#333',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginLeft: '1rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              transition: 'transform 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.background = '#444';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = '#333';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
            }}
          >
            <FiArrowLeft size={20} />
          </div>
        )}

        {/* Search Bar */}
        <div
         style={{
    background: "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
    borderRadius: "9999px",
    padding: "0.75rem 1rem",
    width: "60%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    transition: "transform 0.2s ease, background 0.3s ease, box-shadow 0.2s ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "scale(1.02)";
    e.currentTarget.style.background = "linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.08))";
    e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.35)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.background = "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))";
    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.25)";
  }}
>
  <FiSearch style={{ marginRight: "0.5rem", color: "rgba(255,255,255,0.85)" }} />
  <input
    type="text"
    placeholder="Search in Cloudstack"
    style={{
      background: "transparent",
      border: "none",
      outline: "none",
      width: "100%",
      fontSize: "1rem",
      color: "white",
    }}
  />
        </div>
      </div>
    </div>
  );
}
