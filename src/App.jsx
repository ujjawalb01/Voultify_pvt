import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import MyFiles from './pages/MyFiles';
import Trash from './pages/Trash';
import Profile from './pages/Profile';

// A small wrapper to connect the existing Auth component with our context
function AuthHandler() {
  const { login_success } = useAuth();
  return <Auth onLogin={login_success} />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthHandler />} 
      />

      <Route
        path="/*"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="my-files" element={<MyFiles />} />
        <Route path="trash" element={<Trash />} />
        <Route path="profile" element={<Profile />} />
        {/* Redirect from base path to dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

// import React, { useState } from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Sidebar from './components/Sidebar';
// import Topbar from './components/Topbar';
// import Dashboard from './pages/Dashboard';
// import MyFiles from './pages/MyFiles';
// import Trash from './pages/Trash';
// import Profile from './pages/Profile';
// import { UploadModal, NewFolderModal } from './components/Modals';

// export default function App() {
//   // State to manage which modal is currently open
//   const [activeModal, setActiveModal] = useState(null);

//   const handleCreateFolder = (folderName) => {
//     // In the future, this will add a new folder to our file list.
//     console.log('Creating new folder:', folderName);
//     setActiveModal(null); // Close the modal after creation
//   };

//   return (
//     <BrowserRouter>
//       <div className="flex min-h-screen bg-[#0b0616] text-white">
//         <Sidebar />
//         <div className="flex-1">
//           {/* Pass functions to the Topbar to open the modals */}
//           <Topbar 
//             onUploadClick={() => setActiveModal('upload')} 
//             onNewFolderClick={() => setActiveModal('new-folder')} 
//           />
//           <main className="p-6">
//             <Routes>
//               <Route path="/" element={<Navigate to="/dashboard" replace />} />
//               <Route path="/dashboard" element={<Dashboard />} />
//               <Route path="/my-files" element={<MyFiles />} />
//               <Route path="/trash" element={<Trash />} />
//               <Route path="/profile" element={<Profile />} />
//             </Routes>
//           </main>
//         </div>
//       </div>

//       {/* Conditionally render modals based on the active state */}
//       {activeModal === 'upload' && <UploadModal onClose={() => setActiveModal(null)} />}
//       {activeModal === 'new-folder' && (
//         <NewFolderModal 
//           onClose={() => setActiveModal(null)} 
//           onCreate={handleCreateFolder} 
//         />
//       )}
//     </BrowserRouter>
//   );
// }
