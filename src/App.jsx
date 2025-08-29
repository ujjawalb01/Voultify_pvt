// import React, { useState } from 'react';
// import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// // Import Layouts and Protected Route
// import AppLayout from './layouts/AppLayout';
// import ProtectedRoute from './components/ProtectedRoute';

// // Import Pages
// import Auth from './pages/Auth';
// import Dashboard from './pages/Dashboard';
// import MyFiles from './pages/MyFiles';
// import Trash from './pages/Trash';
// import Profile from './pages/Profile';

// // A small component to handle the login logic
// function AuthHandler({ onLogin }) {
//   const navigate = useNavigate();
//   const handleLogin = () => {
//     onLogin();
//     navigate('/dashboard'); // Redirect to dashboard after login
//   };
//   return <Auth onLogin={handleLogin} />;
// }

// export default function App() {
//   // In a real app, this state would be managed more robustly (e.g., with Context API or Redux).
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Public Route: Login/Signup Page */}
//         <Route
//           path="/auth"
//           element={<AuthHandler onLogin={() => setIsAuthenticated(true)} />}
//         />

//         {/* Protected Routes: Main Application */}
//         <Route
//           path="/*"
//           element={
//             <ProtectedRoute isAuthenticated={isAuthenticated}>
//               {/* All protected routes are children of AppLayout */}
//               <Routes>
//                 <Route element={<AppLayout />}>
//                   <Route path="/dashboard" element={<Dashboard />} />
//                   <Route path="/my-files" element={<MyFiles />} />
//                   <Route path="/trash" element={<Trash />} />
//                   <Route path="/profile" element={<Profile />} />
//                   {/* Add a default route for the protected area */}
//                   <Route index element={<Dashboard />} />
//                 </Route>
//               </Routes>
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import MyFiles from './pages/MyFiles';
import Trash from './pages/Trash';
import Profile from './pages/Profile';
import { UploadModal, NewFolderModal } from './components/Modals';

export default function App() {
  // State to manage which modal is currently open
  const [activeModal, setActiveModal] = useState(null);

  const handleCreateFolder = (folderName) => {
    // In the future, this will add a new folder to our file list.
    console.log('Creating new folder:', folderName);
    setActiveModal(null); // Close the modal after creation
  };

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0b0616] text-white">
        <Sidebar />
        <div className="flex-1">
          {/* Pass functions to the Topbar to open the modals */}
          <Topbar 
            onUploadClick={() => setActiveModal('upload')} 
            onNewFolderClick={() => setActiveModal('new-folder')} 
          />
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-files" element={<MyFiles />} />
              <Route path="/trash" element={<Trash />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* Conditionally render modals based on the active state */}
      {activeModal === 'upload' && <UploadModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'new-folder' && (
        <NewFolderModal 
          onClose={() => setActiveModal(null)} 
          onCreate={handleCreateFolder} 
        />
      )}
    </BrowserRouter>
  );
}
