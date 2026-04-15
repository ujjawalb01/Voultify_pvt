import React, { useState, useEffect, useCallback } from 'react';
import FileCard from '../components/FileCard';
import { useAuth } from '../context/AuthContext';
import FilePreviewModal from '../components/FilePreviewModal';

export default function Trash() {
  const [files, setFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { token } = useAuth();

  const fetchTrash = useCallback(async () => {
    try {
      if(!token) return;
      const response = await fetch('https://voultback.onrender.com/api/file/trash', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
         const mapped = data.map(f => ({
            id: f._id,
            name: f.name,
            type: f.type, 
            url: f.url,
            size: f.size ? (f.size / (1024 * 1024)).toFixed(2) : 0, 
            modifiedAt: new Date(f.updatedAt).toLocaleDateString()
          }));
        setFiles(mapped);
      }
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const handleRestore = async (id) => {
    try {
      await fetch(`https://voultback.onrender.com/api/file/restore/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedFiles(prev => prev.filter(f => f.id !== id));
      fetchTrash(); // Refresh
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleSelect = (file) => {
    setSelectedFiles(prev => {
        const isSelected = prev.some(f => f.id === file.id);
        if (isSelected) {
            return prev.filter(f => f.id !== file.id);
        } else {
            return [...prev, file];
        }
    });
  };

  const handleBulkRestore = async () => {
   try {
       await fetch('https://voultback.onrender.com/api/file/bulk/restore', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
           body: JSON.stringify({ fileIds: selectedFiles.map(f => f.id) })
       });
       setSelectedFiles([]);
       fetchTrash();
   } catch (error) {
       console.error(error);
   }
  };

  const handleBulkPermanentDelete = async () => {
   if (!window.confirm(`Permanently delete ${selectedFiles.length} item(s)? This cannot be undone.`)) return;
   try {
       await fetch('https://voultback.onrender.com/api/file/bulk/permanent', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
           body: JSON.stringify({ fileIds: selectedFiles.map(f => f.id) })
       });
       setSelectedFiles([]);
       fetchTrash();
   } catch (error) {
       console.error(error);
   }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Delete this file forever? This cannot be undone.')) return;
    try {
      await fetch(`https://voultback.onrender.com/api/file/permanent/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedFiles(prev => prev.filter(f => f.id !== id));
      fetchTrash(); // Refresh
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Trash (Deleted Files)</h2>
      {files.length === 0 ? (
         <div className="rounded-2xl p-6 bg-zinc-100 dark:bg-white/5 text-sm text-zinc-600 dark:text-white dark:opacity-80 border border-zinc-200 dark:border-transparent">Trash is empty.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((f) => (
                <FileCard 
                    key={f.id} 
                    file={f} 
                    isTrash={true}
                    onRestore={handleRestore}
                    onDelete={handlePermanentDelete} 
                    onPreview={setPreviewFile}
                    selected={selectedFiles.some(sel => sel.id === f.id)}
                    onToggleSelect={handleToggleSelect}
                />
            ))}
        </div>
      )}
      {previewFile && (
        <FilePreviewModal
            file={previewFile}
            onClose={() => setPreviewFile(null)}
        />
      )}

      {/* Floating Bulk Action Bar */}
      {selectedFiles.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1a1625] border border-zinc-200 dark:border-white/10 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 whitespace-nowrap">
                  {selectedFiles.length} selected
              </span>
              <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                  <button onClick={() => setSelectedFiles(files)} className="text-sm px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300">Select All</button>
                  <button onClick={() => setSelectedFiles([])} className="text-sm px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300">Clear</button>
                  <button onClick={handleBulkRestore} className="text-sm px-2 py-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 text-green-600 dark:text-green-400 font-medium">Restore</button>
                  <button onClick={handleBulkPermanentDelete} className="text-sm px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 font-medium">Permanent Delete</button>
              </div>
          </div>
      )}
    </div>
  );
}
