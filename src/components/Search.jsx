// // src/components/DriveHeader.jsx
// import { FiSearch } from 'react-icons/fi'; // Make sure you have react-icons installed

// export default function SearchHeader() {
//   return (
//     <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
//       <h1 style={{ fontSize: '1.5rem', fontWeight: '500' }}>Welcome to CloudStack</h1>
//       <div
//         style={{
//           marginTop: '1rem',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <div
//           style={{
//             backgroundColor: '#333',
//             borderRadius: '9999px',
//             padding: '0.75rem 1rem',
//             width: '60%',
//             display: 'flex',
//             alignItems: 'center',
//           }}
//         >
//           <FiSearch style={{ marginRight: '0.5rem', color: 'white' }} />
//           <input
//             type="text"
//             placeholder="Search in Cloudstack"
//             style={{
//               background: 'transparent',
//               border: 'none',
//               outline: 'none',
//               width: '100%',
//               fontSize: '1rem',
//               color: 'white',
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
// src/components/Search.jsx
// src/components/Search.jsx
import { FiSearch } from 'react-icons/fi';

export default function SearchHeader({ currentPath, setCurrentPath, setFiles }) {
  const handleBack = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    if (parentPath !== currentPath) {
      setFiles([]);
      setCurrentPath(parentPath);
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Header */}
      <h1 style={{ fontSize: '1.5rem', fontWeight: '500', textAlign: 'center' }}>
        Welcome to CloudStack
      </h1>

      {/* Search Row */}
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
              padding: '0.8rem',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              marginLeft: '1rem',
            }}
          >
            ⬅ Back
          </div>
        )}

        {/* Search Bar (always centered) */}
        <div
          style={{
            backgroundColor: '#333',
            borderRadius: '9999px',
            padding: '0.75rem 1rem',
            width: '60%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FiSearch style={{ marginRight: '0.5rem', color: 'white' }} />
          <input
            type="text"
            placeholder="Search in Cloudstack"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '1rem',
              color: 'white',
            }}
          />
        </div>
      </div>
    </div>
  );
}
