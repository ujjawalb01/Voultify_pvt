import React, { useState, useEffect, useCallback } from 'react';
import FileCard from '../components/FileCard';
import { useAuth } from '../context/AuthContext';

export default function Trash() {
  const [files, setFiles] = useState([]);
  const { token } = useAuth();

  const fetchTrash = useCallback(async () => {
    try {
      if(!token) return;
      const response = await fetch('http://localhost:3000/api/file/trash', {
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
      await fetch(`http://localhost:3000/api/file/restore/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTrash(); // Refresh
    } catch (error) {
      console.error(error);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Delete this file forever? This cannot be undone.')) return;
    try {
      await fetch(`http://localhost:3000/api/file/permanent/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTrash(); // Refresh
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Trash (Deleted Files)</h2>
      {files.length === 0 ? (
         <div className="rounded-2xl p-6 bg-white/5 text-sm opacity-80">Trash is empty.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((f) => (
                <FileCard 
                    key={f.id} 
                    file={f} 
                    isTrash={true}
                    onRestore={handleRestore}
                    onDelete={handlePermanentDelete} 
                />
            ))}
        </div>
      )}
    </div>
  );
}
