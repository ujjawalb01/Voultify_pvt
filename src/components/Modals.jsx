import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // To get the auth token for the upload

export function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl bg-[#171127] p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-sm text-white opacity-80 hover:opacity-100">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function UploadModal({ onClose, currentFolderId }) {
  const { token } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setUploadMessage('');
    setSelectedFiles([...event.target.files]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadMessage('Please select files to upload.');
      return;
    }

    setIsUploading(true);
    setUploadMessage('Uploading...');

    const formData = new FormData();
    if (currentFolderId) {
      formData.append('folderId', currentFolderId);
    }
    
    selectedFiles.forEach(file => {
      formData.append('file', file); // 'files' should match your backend's expected field name
    });
    try {
      // IMPORTANT: Replace with your actual file upload endpoint
      const response = await fetch('http://localhost:3000/api/file/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed. Please try again.');
      }
      
      const result = await response.json();
      setUploadMessage(`Success! ${result.message || 'Files uploaded.'}`);
      setSelectedFiles([]); // Clear selection on success
      window.dispatchEvent(new Event('fileChange')); // Refresh list
      setTimeout(onClose, 2000); // Close modal after 2 seconds on success

    } catch (error) {
      setUploadMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ModalShell title="Upload files" onClose={onClose}>
      <div 
        className="rounded-2xl border text-white border-dashed border-white/10 p-6 text-center cursor-pointer"
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <div className="mb-3">Drag & drop files here or</div>
        <button type="button" className="bg-gradient-to-r from-[#6A11CB] to-[#2575FC] text-white px-4 py-2 rounded-xl text-sm">
          Choose files
        </button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 text-xs text-zinc-400">
          <p className="font-bold mb-1">Selected files:</p>
          <ul>
            {selectedFiles.map((file, index) => <li key={index} className="truncate">{file.name}</li>)}
          </ul>
        </div>
      )}

      {uploadMessage && <p className="mt-4 text-center text-sm">{uploadMessage}</p>}

      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={onClose} className="px-3 py-2 text-white rounded-xl bg-white/5 text-sm" disabled={isUploading}>Cancel</button>
        <button onClick={handleUpload} className="px-4 py-2 rounded-xl bg-gradient-to-r text-white from-[#6A11CB] to-[#2575FC] text-sm" disabled={isUploading}>
          {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
        </button>
      </div>
    </ModalShell>
  );
}

export function NewFolderModal({ onClose, onCreate, currentFolderId }) {
  const ref = useRef();
  return (
    <ModalShell title="Create folder" onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onCreate(ref.current.value, currentFolderId); }}>
        <input ref={ref} placeholder="Folder name" className="w-full rounded-2xl p-3 bg-white/5 mb-3 outline-none focus:ring-2 focus:ring-[#6A11CB] text-white" required />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 text-white rounded-xl bg-white/5">Cancel</button>
          <button className="px-3 py-2 rounded-xl bg-gradient-to-r text-white from-[#6A11CB] to-[#2575FC]">Create</button>
        </div>
      </form>
    </ModalShell>
  );
}

export function MoveFileModal({ onClose, fileToMove, onMove }) {
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchFolders = async () => {
       try {
         const response = await fetch('http://localhost:3000/api/file?folderId=', { 
            headers: { 'Authorization': `Bearer ${token}` }
         });
         const data = await response.json();
         const folderOnly = data.filter(f => f.type === 'folder' && f._id !== fileToMove.id);
         setFolders(folderOnly);
       } catch (e) {
         console.error(e);
       }
    };
    if (token && !isCreating) fetchFolders();
  }, [token, fileToMove, isCreating]);

  const handleMove = () => {
    onMove(fileToMove.id, selectedFolderId);
    onClose();
  };

  const handleCreateAndMove = async () => {
      if (!newFolderName.trim()) return;
      try {
          const response = await fetch('http://localhost:3000/api/file/folder', {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({ name: newFolderName, folderId: null }) // Create in root for now
          });
          
          if (response.ok) {
              const newFolder = await response.json();
              onMove(fileToMove.id, newFolder._id);
              onClose();
          }
      } catch (error) {
          console.error("Error creating folder:", error);
      }
  };

  return (
    <ModalShell title={isCreating ? "New Folder & Move" : `Move ${fileToMove.name}`} onClose={onClose}>
       {!isCreating ? (
           <>
               <div className="space-y-2 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                  <div 
                     className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 transition ${selectedFolderId === null ? 'bg-[#6A11CB]/20 border-[#6A11CB]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                     onClick={() => setSelectedFolderId(null)}
                  >
                     <div className="text-sm font-medium text-white">My Files (Root)</div>
                  </div>
                  {folders.map(f => (
                     <div 
                       key={f._id}
                       className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 transition ${selectedFolderId === f._id ? 'bg-[#6A11CB]/20 border-[#6A11CB]' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                       onClick={() => setSelectedFolderId(f._id)}
                     >
                        <div className="text-sm font-medium text-white">{f.name}</div>
                     </div>
                  ))}
                  {folders.length === 0 && <div className="text-zinc-500 text-sm text-center py-2">No other folders found.</div>}
               </div>
               <div className="flex justify-between items-center mt-4">
                  <button 
                      onClick={() => setIsCreating(true)}
                      className="text-sm text-[#2575FC] hover:underline"
                  >
                      + New Folder
                  </button>
                  <div className="flex gap-2">
                      <button onClick={onClose} className="px-3 py-2 text-white rounded-xl bg-white/5 text-sm hover:bg-white/10 transition">Cancel</button>
                      <button onClick={handleMove} className="px-3 py-2 rounded-xl bg-gradient-to-r text-white from-[#6A11CB] to-[#2575FC] text-sm hover:shadow-lg hover:shadow-blue-500/20 transition">Move</button>
                  </div>
               </div>
           </>
       ) : (
           <form onSubmit={(e) => { e.preventDefault(); handleCreateAndMove(); }}>
               <input 
                   autoFocus
                   placeholder="Folder Name" 
                   value={newFolderName}
                   onChange={(e) => setNewFolderName(e.target.value)}
                   className="w-full rounded-2xl p-3 bg-white/5 mb-4 outline-none focus:ring-2 focus:ring-[#6A11CB] text-white" 
               />
               <div className="flex justify-end gap-2">
                   <button 
                       type="button" 
                       onClick={() => setIsCreating(false)} 
                       className="px-3 py-2 text-white rounded-xl bg-white/5 text-sm"
                   >
                       Back
                   </button>
                   <button 
                       type="submit" 
                       className="px-3 py-2 rounded-xl bg-gradient-to-r text-white from-[#6A11CB] to-[#2575FC] text-sm"
                   >
                       Create & Move
                   </button>
               </div>
           </form>
       )}
    </ModalShell>
  );
}


