import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // To get the auth token for the upload
import { encryptFile } from '../utils/encryption';

export function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#171127] p-4 shadow-2xl border border-zinc-200 dark:border-white/5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base text-zinc-900 dark:text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-white dark:opacity-80 dark:hover:opacity-100">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function UploadModal({ onClose, currentFolderId }) {
  const { token, user } = useAuth();
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
    
    try {
      // Encrypt all selected files before appending to FormData
      const encryptedFiles = await Promise.all(selectedFiles.map(async (file) => {
          const encryptedBlob = await encryptFile(file, user?._id || token);
          // Append the original name to the encrypted blob so we don't lose the extension/mimetype on the server
          return new File([encryptedBlob], file.name, { type: file.type });
      }));

      encryptedFiles.forEach(file => {
        formData.append('file', file); // 'files' should match your backend's expected field name
      });
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
        className="rounded-2xl border text-zinc-600 dark:text-white border-dashed border-zinc-300 dark:border-white/10 bg-zinc-50 hover:bg-zinc-100 dark:bg-transparent dark:hover:bg-white/5 p-6 text-center cursor-pointer transition-colors"
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
        <button type="button" onClick={onClose} className="px-3 py-2 text-zinc-700 dark:text-white rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 transition text-sm" disabled={isUploading}>Cancel</button>
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
        <input ref={ref} placeholder="Folder name" className="w-full rounded-2xl p-3 bg-zinc-100 dark:bg-white/5 mb-3 outline-none focus:ring-2 focus:ring-[#6A11CB] text-zinc-900 dark:text-white border border-zinc-200 dark:border-transparent" required />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 text-zinc-700 dark:text-white rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 transition">Cancel</button>
          <button className="px-3 py-2 rounded-xl bg-gradient-to-r text-white from-[#6A11CB] to-[#2575FC]">Create</button>
        </div>
      </form>
    </ModalShell>
  );
}

export function MoveFileModal({ onClose, fileToMove, filesToMove, onMove }) {
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { token } = useAuth();
  
  const activeFiles = filesToMove || (fileToMove ? [fileToMove] : []);
  const titleText = activeFiles.length > 1 ? `Move ${activeFiles.length} items` : `Move ${activeFiles[0]?.name}`;

  useEffect(() => {
    const fetchFolders = async () => {
       try {
         const response = await fetch('http://localhost:3000/api/file?folderId=', { 
            headers: { 'Authorization': `Bearer ${token}` }
         });
         const data = await response.json();
         // Filter out any folders that are currently being moved
         const folderOnly = data.filter(f => f.type === 'folder' && !activeFiles.some(af => af.id === f._id));
         setFolders(folderOnly);
       } catch (e) {
         console.error(e);
       }
    };
    if (token && !isCreating) fetchFolders();
  }, [token, activeFiles, isCreating]);

  const handleMove = () => {
    onMove(activeFiles, selectedFolderId);
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
              onMove(activeFiles, newFolder._id);
              onClose();
          }
      } catch (error) {
          console.error("Error creating folder:", error);
      }
  };

  return (
    <ModalShell title={isCreating ? "New Folder & Move" : titleText} onClose={onClose}>
       {!isCreating ? (
           <>
               <div className="space-y-2 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                  <div 
                     className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 transition ${selectedFolderId === null ? 'bg-[#6A11CB]/10 dark:bg-[#6A11CB]/20 border-[#6A11CB]' : 'bg-zinc-100 dark:bg-white/5 border-transparent hover:bg-zinc-200 dark:hover:bg-white/10'}`}
                     onClick={() => setSelectedFolderId(null)}
                  >
                     <div className="text-sm font-medium text-zinc-900 dark:text-white">My Files (Root)</div>
                  </div>
                  {folders.map(f => (
                     <div 
                       key={f._id}
                       className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 transition ${selectedFolderId === f._id ? 'bg-[#6A11CB]/10 dark:bg-[#6A11CB]/20 border-[#6A11CB]' : 'bg-zinc-100 dark:bg-white/5 border-transparent hover:bg-zinc-200 dark:hover:bg-white/10'}`}
                       onClick={() => setSelectedFolderId(f._id)}
                     >
                        <div className="text-sm font-medium text-zinc-900 dark:text-white">{f.name}</div>
                     </div>
                  ))}
                  {folders.length === 0 && <div className="text-zinc-500 text-sm text-center py-2">No other folders found.</div>}
               </div>
               <div className="flex justify-between items-center mt-4 border-t border-zinc-200 dark:border-white/5 pt-4">
                  <button 
                      onClick={() => setIsCreating(true)}
                      className="text-sm text-[#2575FC] hover:underline"
                  >
                      + New Folder
                  </button>
                  <div className="flex gap-2">
                      <button onClick={onClose} className="px-3 py-2 text-zinc-700 dark:text-white rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 transition text-sm">Cancel</button>
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
                   className="w-full rounded-2xl p-3 bg-zinc-100 dark:bg-white/5 mb-4 outline-none focus:ring-2 focus:ring-[#6A11CB] text-zinc-900 dark:text-white border border-zinc-200 dark:border-transparent" 
               />
               <div className="flex justify-end gap-2">
                   <button 
                       type="button" 
                       onClick={() => setIsCreating(false)} 
                       className="px-3 py-2 text-zinc-700 dark:text-white rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 transition text-sm"
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


