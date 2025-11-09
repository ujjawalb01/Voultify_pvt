import React, { useRef, useState } from 'react';
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

export function UploadModal({ onClose }) {
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
    selectedFiles.forEach(file => {
      formData.append('file', file); // 'files' should match your backend's expected field name
    });

    try {
      // IMPORTANT: Replace with your actual file upload endpoint
      const response = await fetch('https://mwnwp6z7-3000.inc1.devtunnels.ms/api/file/upload', {
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

export function NewFolderModal({ onClose, onCreate }) {
  const ref = useRef();
  return (
    <ModalShell title="Create folder" onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onCreate(ref.current.value); }}>
        <input ref={ref} placeholder="Folder name" className="w-full rounded-2xl p-3 bg-white/5 mb-3 outline-none focus:ring-2 focus:ring-[#6A11CB]" required />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 text-white rounded-xl bg-white/5">Cancel</button>
          <button className="px-3 py-2 rounded-xl bg-gradient-to-r text-white from-[#6A11CB] to-[#2575FC]">Create</button>
        </div>
      </form>
    </ModalShell>
  );
}


