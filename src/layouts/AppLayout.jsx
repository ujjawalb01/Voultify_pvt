import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { UploadModal, NewFolderModal } from '../components/Modals';

export default function AppLayout() {
  const [activeModal, setActiveModal] = useState(null);

  const handleCreateFolder = (folderName) => {
    console.log('Creating new folder:', folderName);
    // Add API call logic here in the future
    setActiveModal(null);
  };

  return (
    <>
      <div className="flex min-h-screen bg-[#0b0616] text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar 
            onUploadClick={() => setActiveModal('upload')} 
            onNewFolderClick={() => setActiveModal('new-folder')} 
          />
          <main className="p-6 flex-1">
            <Outlet />
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