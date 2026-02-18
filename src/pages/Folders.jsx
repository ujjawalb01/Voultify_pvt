import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileCard from '../components/FileCard';
import { useAuth } from '../context/AuthContext';
import { FolderPlus } from 'lucide-react';
import { NewFolderModal } from '../components/Modals';

export default function Folders() {
  const [folders, setFolders] = useState([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchFolders = async () => {
    try {
      if (!token) return;
      // Fetch all files. We might want a specific endpoint for just folders in the future, 
      // but filtering client-side for now or using the existing filter if backend supports it.
      // The backend getFiles filters by folderId if provided, or return all?
      // Wait, getFiles with folderId=null returns root files.
      // We need ALL folders, nested or not?
      // "showing all the folder we created". 
      // If we want ALL folders flattened, we might need a different API or logic.
      // For now, let's assume we want top-level folders? 
      // User said "all folder we created". 
      // If I have Folder A -> Folder B. 
      // Does Folders page show A and B? Or just A?
      // Usually "Folders" view shows root folders, and you navigate down.
      // But user said "not in dropdown ... show all folder we created".
      // Let's stick to Root folders for now as that's standard "My Files" behavior, 
      // OR if they want a flat list of ALL folders (like a search result).
      // Given the previous "Sidebar" context, it was likely Root folders (+ maybe 1 level deep?).
      // Let's fetch Root folders first.
      
      const response = await fetch('http://localhost:3000/api/file?folderId=', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Filter for folders only
        const folderOnly = data.filter(f => f.type === 'folder').map(f => ({
            id: f._id,
            name: f.name,
            type: f.type, 
            url: f.url,
            size: `${f.childCount || 0} items`, 
            modifiedAt: new Date(f.updatedAt).toLocaleDateString()
        }));
        setFolders(folderOnly);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  useEffect(() => {
    fetchFolders();
    const handleFileChange = () => fetchFolders();
    window.addEventListener('fileChange', handleFileChange);
    return () => window.removeEventListener('fileChange', handleFileChange);
  }, [token]);

  const handleFolderClick = (folder) => {
      // Navigate to the dynamic route, passing the name in state so we don't have to fetch it immediately if possible
      navigate(`/folders/${folder.id}`, { state: { folderName: folder.name } });
  };
  
  const handleCreateFolder = async (name) => {
      try {
        const response = await fetch('http://localhost:3000/api/file/folder', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ name, folderId: null }) // Create in root
        });
        if (response.ok) {
            setShowFolderModal(false);
            fetchFolders();
        }
      } catch (error) {
          console.error(error);
      }
  };

  const handleDelete = async (id) => {
      if (!window.confirm('Move folder to trash?')) return;
      try {
        await fetch(`http://localhost:3000/api/file/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        window.dispatchEvent(new Event('fileChange')); 
      } catch (error) {
        console.error(error);
      }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Folders</h2>
          <button onClick={() => setShowFolderModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition">
            <FolderPlus className="h-4 w-4" />
            <span>New Folder</span>
          </button>
      </div>

      {folders.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">
             <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <FolderPlus className="h-8 w-8 opacity-50" />
              </div>
            No folders found. Create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {folders.map((f) => (
             <FileCard 
                key={f.id} 
                file={f} 
                onDelete={handleDelete} 
                onFolderClick={handleFolderClick}
                onShare={() => alert('Cannot share folder link yet')}
             />
          ))}
        </div>
      )}
      
      {showFolderModal && (
        <NewFolderModal 
            onClose={() => setShowFolderModal(false)} 
            onCreate={handleCreateFolder} 
            currentFolderId={null}
        />
      )}
    </div>
  );
}
