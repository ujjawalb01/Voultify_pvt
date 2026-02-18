import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { UploadModal, NewFolderModal } from '../components/Modals';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const [activeModal, setActiveModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { token } = useAuth();

  const handleCreateFolder = async (folderName) => {
    try {
      const response = await fetch('http://localhost:3000/api/file/folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: folderName })
      });
      
      if (!response.ok) throw new Error('Failed to create folder');
      
      setActiveModal(null);
      window.dispatchEvent(new Event('fileChange')); 
    } catch (error) {
      console.error(error);
      alert('Failed to create folder');
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-[#0b0616] text-white">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar 
            onUploadClick={() => setActiveModal('upload')} 
            onNewFolderClick={() => setActiveModal('new-folder')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery} 
            onMenuClick={() => setIsSidebarOpen(true)}
          />
          <main className="p-4 md:p-6 flex-1 overflow-x-hidden">
            <Outlet context={{ searchQuery }} />
          </main>
        </div>
      </div>

      {/* Render modals based on active state */}
      {activeModal === 'upload' && <UploadModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'new-folder' && (
        <NewFolderModal 
          onClose={() => setActiveModal(null)} 
          onCreate={handleCreateFolder} 
        />
      )}
    </>
  );
}