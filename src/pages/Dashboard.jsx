import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileCard from '../components/FileCard';
import { useAuth } from '../context/AuthContext';
import FilePreviewModal from '../components/FilePreviewModal';

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const formatBytes = (bytes, decimals = 2) => {
      if (!+bytes) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  useEffect(() => {
    const fetchRecentFiles = async () => {
      try {
        if (!token) return;
        const response = await fetch('https://voultback.onrender.com/api/file', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Map and slice to show only recent 6
          const mapped = data.slice(0, 6).map(f => ({
            id: f._id,
            name: f.name,
            type: f.type, 
            url: f.url,
            size: f.type === 'folder' ? `${f.childCount || 0} items` : (f.size ? formatBytes(f.size) : '0 Bytes'),
            modifiedAt: new Date(f.updatedAt).toLocaleDateString()
          }));
          setFiles(mapped);
        }
      } catch (error) {
        console.error('Error fetching dashboard files:', error);
      }
    };

    fetchRecentFiles();
    
    // Listen for file changes
    const handleFileChange = () => fetchRecentFiles();
    window.addEventListener('fileChange', handleFileChange);
    return () => window.removeEventListener('fileChange', handleFileChange);
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Move file to trash?')) return;
    try {
      await fetch(`https://voultback.onrender.com/api/file/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Refresh logic is already handled by window event listener but we trigger it to be safe
      window.dispatchEvent(new Event('fileChange')); 
    } catch (error) {
      console.error(error);
    }
  };

  const handleShare = (file) => {
    if (file.url) {
        const fullUrl = file.url.startsWith('http') ? file.url : `https://voultback.onrender.com${file.url}`;
        navigator.clipboard.writeText(fullUrl);
        alert('File link copied to clipboard!');
    } else {
         alert('Cannot share folders or files without a URL.');
    }
  };

  const handleFolderClick = (folder) => {
      navigate('/my-files', { state: { folderId: folder.id, folderName: folder.name } });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Overview (Recent Files)</h2>
      {files.length === 0 ? (
        <div className="text-zinc-500 dark:text-white/50 text-sm">No files uploaded yet. Start by clicking "Upload".</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {files.map((f) => (
             <FileCard 
                key={f.id} 
                file={f} 
                onDelete={handleDelete} 
                onShare={handleShare} 
                onFolderClick={handleFolderClick}
                onPreview={setPreviewFile}
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
    </div>
  );
}
