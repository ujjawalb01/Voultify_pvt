import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useOutletContext, useParams, useNavigate } from 'react-router-dom';
import FileCard from '../components/FileCard';
import { useAuth } from '../context/AuthContext';
import { Upload, FolderPlus, ArrowLeft, ChevronRight, Home } from 'lucide-react';
import { UploadModal, NewFolderModal, MoveFileModal } from '../components/Modals';

export default function MyFiles() {
  const [view, setView] = useState('grid');
  const [files, setFiles] = useState([]);
  const [folderStack, setFolderStack] = useState([]); // Array of {id, name}
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [fileToMove, setFileToMove] = useState(null);
  
  const { token } = useAuth();
  const location = useLocation();
  const { folderId: paramFolderId } = useParams();
  const navigate = useNavigate();
  const { searchQuery } = useOutletContext() || { searchQuery: '' }; 
  
  const currentFolder = folderStack.length > 0 ? folderStack[folderStack.length - 1] : null;
  const isFoldersContext = location.pathname.startsWith('/folders');

  const formatBytes = (bytes, decimals = 2) => {
      if (!+bytes) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const fetchFiles = useCallback(async () => {
      try {
        let url = `http://localhost:3000/api/file?`; 
        if (searchQuery) {
            url += `search=${encodeURIComponent(searchQuery)}`;
        } else if (currentFolder) {
            url += `folderId=${currentFolder.id}`;
        } else {
             // If we are at /folders/:id but stack is empty, it means we haven't synced yet.
             // Don't fetch root files, just wait.
             if (paramFolderId) return; 

             // If we are at root of My Files, load root.
             url += `folderId=`; 
        }

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const mapped = data.map(f => ({
            id: f._id,
            name: f.name,
            type: f.type, // 'folder' or mimetype
            url: f.url,
            // If folder, show item count. If file, show formatted size.
            size: f.type === 'folder' ? `${f.childCount || 0} items` : (f.size ? formatBytes(f.size) : '0 Bytes'),
            modifiedAt: new Date(f.updatedAt).toLocaleDateString()
          }));
          setFiles(mapped);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      }
  }, [token, currentFolder, searchQuery]);

  // Effect to handle URL params (Entry point)
  // Effect to handle URL params (Entry point)
  useEffect(() => {
    if (paramFolderId) {
        // Safe comparison ensuring both are strings
        const currentStackId = folderStack.length > 0 ? String(folderStack[0].id) : null;
        const targetId = String(paramFolderId);
        
        if (currentStackId !== targetId) {
             const name = location.state?.folderName || 'Folder';
             setFolderStack([{ id: targetId, name: name }]);
        }
    } else if (location.pathname === '/my-files' && folderStack.length > 0 && !location.state?.folderId) {
        // Logic handled by navigateRoot usually.
    }
    
    // Handle legacy state navigation only if NOT using params
    if (location.state?.folderId && !paramFolderId) {
         setFolderStack([{ id: location.state.folderId, name: location.state.folderName }]);
         // Clear state to prevent loop if we were using it? 
         // But replacing state here might be causing the "loop" feeling if it triggers location update
         window.history.replaceState({}, document.title); 
    }
  }, [paramFolderId, location.state, location.pathname]); // Removed folderStack from dependency to avoid infinite loop potential if logic was flawed

  useEffect(() => {
    if (token) fetchFiles();
    
    const handleFileChange = () => fetchFiles();
    window.addEventListener('fileChange', handleFileChange);
    return () => window.removeEventListener('fileChange', handleFileChange);
  }, [token, fetchFiles]);

  const handleDelete = async (id) => {
    if (!window.confirm('Move file to trash?')) return;
    try {
      await fetch(`http://localhost:3000/api/file/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchFiles(); 
    } catch (error) {
      console.error(error);
    }
  };

  const handleShare = (file) => {
    if (file.url) {
        const fullUrl = file.url.startsWith('http') ? file.url : `http://localhost:3000${file.url}`;
        navigator.clipboard.writeText(fullUrl);
        alert('File link copied to clipboard!');
    } else {
        alert('Cannot share folders or files without a URL.');
    }
  };
  
  const handleFolderClick = (folder) => {
      // If we are in folders context, navigate to subfolder route?
      // Or just push to stack?
      // Since we implemented the stack logic which is consistent with /folders/:id,
      // pushing to stack updates the view.
      // However, if we want the URL to update for deep linking:
      if (isFoldersContext) {
           navigate(`/folders/${folder.id}`, { state: { folderName: folder.name } });
      } else {
           setFolderStack([...folderStack, { id: folder.id, name: folder.name }]);
      }
  };
  
  const navigateToBreadcrumb = (index) => {
      setFolderStack(folderStack.slice(0, index + 1));
  };

  const navigateRoot = () => {
      if (isFoldersContext) {
          navigate('/folders'); // Go back to folders list
      } else {
          setFolderStack([]); // Go to My Files root
          navigate('/my-files');
      }
  };

  const handleCreateFolder = async (name) => {
      try {
        const response = await fetch('http://localhost:3000/api/file/folder', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ name, folderId: currentFolder?.id })
        });
        if (response.ok) {
            setShowFolderModal(false);
            fetchFiles();
        }
      } catch (error) {
          console.error(error);
      }
  };
  
  const initiateMove = (file) => {
      setFileToMove(file);
      setShowMoveModal(true);
  };
  
  const handleMoveFile = async (fileId, targetFolderId) => {
      try {
          const response = await fetch(`http://localhost:3000/api/file/move/${fileId}`, {
              method: 'PUT',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({ folderId: targetFolderId })
          });
          if(response.ok) {
              fetchFiles();
          } else {
              const err = await response.json();
              alert(err.msg);
          }
      } catch (error) {
          console.error(error);
      }
  }; 

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <button onClick={navigateRoot} className={`flex items-center gap-1 hover:text-white transition ${folderStack.length === 0 ? 'text-white font-semibold' : 'text-zinc-400'}`}>
                {isFoldersContext ? <FolderPlus className="h-4 w-4" /> : <Home className="h-4 w-4" />}
                <span>{isFoldersContext ? 'Folders' : 'My Files'}</span>
            </button>
            {folderStack.map((folder, index) => (
                <React.Fragment key={folder.id}>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                    <button 
                        onClick={() => navigateToBreadcrumb(index)}
                        className={`whitespace-nowrap hover:text-white transition ${index === folderStack.length - 1 ? 'text-white font-semibold' : 'text-zinc-400'}`}
                    >
                        {folder.name}
                    </button>
                </React.Fragment>
            ))}
        </div>
        
        <div className="flex items-center gap-3">
             <button onClick={() => setShowFolderModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition">
                <FolderPlus className="h-4 w-4" />
                <span className="hidden sm:inline">New Folder</span>
            </button>
            <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6A11CB] to-[#2575FC] text-white transition hover:shadow-lg hover:shadow-blue-500/20">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
            </button>
             <button onClick={() => setView(view === 'grid' ? 'list' : 'grid')} className="px-3 py-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white">
                {view === 'grid' ? 'List' : 'Grid'}
            </button>
        </div>
      </div>
      
       {/* File List */}
      {files.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 min-h-[50vh]">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                  <FolderPlus className="h-8 w-8 opacity-50" />
              </div>
              <p>This folder is empty</p>
          </div>
      ) : (
          view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {files.map((f) => (
                  <FileCard 
                    key={f.id} 
                    file={f} 
                    onDelete={handleDelete} 
                    onShare={handleShare} 
                    onFolderClick={handleFolderClick}
                    onMove={initiateMove}
                  />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0f0920] border border-white/5 group hover:bg-white/5 transition-colors">
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => f.type === 'folder' ? handleFolderClick(f) : null}
                  >
                    <div className={`rounded-lg p-2 w-10 h-10 flex items-center justify-center ${f.type === 'folder' ? 'bg-blue-500/20 text-blue-400' : 'bg-violet-500/20 text-violet-400'}`}>
                        <div className="text-sm font-bold uppercase">{f.type === 'folder' ? f.name.charAt(0) : 'Doc'}</div>
                    </div>
                    <div>
                      <div className="font-medium text-white">{f.name}</div>
                      <div className="text-xs text-zinc-500">{f.size}</div>
                    </div>
                  </div>
                   <div className="flex items-center gap-4">
                      <div className="text-xs text-zinc-500 hidden sm:block">{f.modifiedAt}</div>
                      
                       {/* Context Actions for List View (Simplified) */}
                      <button onClick={() => handleDelete(f.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-400/10 rounded-lg">Delete</button>
                      <button onClick={() => initiateMove(f)} className="text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg">Move</button>
                   </div>
                </div>
              ))}
            </div>
          )
      )}

      {/* Modals */}
      {showUploadModal && (
        <UploadModal 
            onClose={() => setShowUploadModal(false)} 
            currentFolderId={currentFolder?.id}
        />
      )}
      {showFolderModal && (
        <NewFolderModal 
            onClose={() => setShowFolderModal(false)} 
            onCreate={handleCreateFolder} 
            currentFolderId={currentFolder?.id}
        />
      )}
      {showMoveModal && fileToMove && (
        <MoveFileModal
            fileToMove={fileToMove}
            onClose={() => { setShowMoveModal(false); setFileToMove(null); }}
            onMove={handleMoveFile}
        />
      )}
    </div>
  );
}
