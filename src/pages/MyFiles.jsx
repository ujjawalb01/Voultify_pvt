import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useOutletContext, useParams, useNavigate } from 'react-router-dom';
import FileCard from '../components/FileCard';
import { useAuth } from '../context/AuthContext';
import { Upload, FolderPlus, ArrowLeft, ChevronRight, Home } from 'lucide-react';
import { UploadModal, NewFolderModal, MoveFileModal } from '../components/Modals';
import FilePreviewModal from '../components/FilePreviewModal';

export default function MyFiles() {
  const [view, setView] = useState('grid');
  const [files, setFiles] = useState([]);
  const [folderStack, setFolderStack] = useState([]); // Array of {id, name}
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [fileToMove, setFileToMove] = useState(null);
  const [filesToMove, setFilesToMove] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
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
      setSelectedFiles(prev => prev.filter(f => f.id !== id));
      fetchFiles(); 
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

  const handleBulkDelete = async () => {
   if (!window.confirm(`Move ${selectedFiles.length} item(s) to trash?`)) return;
   try {
       await fetch('http://localhost:3000/api/file/bulk/delete', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
           body: JSON.stringify({ fileIds: selectedFiles.map(f => f.id) })
       });
       setSelectedFiles([]);
       fetchFiles();
   } catch (error) {
       console.error(error);
   }
  };

  const handleBulkShare = () => {
    const urls = selectedFiles
        .filter(f => f.url)
        .map(file => file.url.startsWith('http') ? file.url : `http://localhost:3000${file.url}`);
    
    if (urls.length > 0) {
        navigator.clipboard.writeText(urls.join('\n'));
        alert(`${urls.length} link(s) copied to clipboard!`);
    } else {
        alert('No shareable files selected.');
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
      setSelectedFiles([]);
      if (isFoldersContext) {
           navigate(`/folders/${folder.id}`, { state: { folderName: folder.name } });
      } else {
           setFolderStack([...folderStack, { id: folder.id, name: folder.name }]);
      }
  };
  
  const navigateToBreadcrumb = (index) => {
      setSelectedFiles([]);
      setFolderStack(folderStack.slice(0, index + 1));
  };

  const navigateRoot = () => {
      setSelectedFiles([]);
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
      setFilesToMove(null);
      setShowMoveModal(true);
  };
  
  const handleMoveFile = async (activeFiles, targetFolderId) => {
      const fileIds = activeFiles.map(f => f.id);
      try {
          const response = await fetch(`http://localhost:3000/api/file/bulk/move`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({ fileIds, folderId: targetFolderId })
          });
          if(response.ok) {
              setSelectedFiles([]);
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
            <button onClick={navigateRoot} className={`flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition ${folderStack.length === 0 ? 'text-zinc-900 dark:text-white font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {isFoldersContext ? <FolderPlus className="h-4 w-4" /> : <Home className="h-4 w-4" />}
                <span>{isFoldersContext ? 'Folders' : 'My Files'}</span>
            </button>
            {folderStack.map((folder, index) => (
                <React.Fragment key={folder.id}>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                    <button 
                        onClick={() => navigateToBreadcrumb(index)}
                        className={`whitespace-nowrap hover:text-zinc-900 dark:hover:text-white transition ${index === folderStack.length - 1 ? 'text-zinc-900 dark:text-white font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}
                    >
                        {folder.name}
                    </button>
                </React.Fragment>
            ))}
        </div>
        
        <div className="flex items-center gap-3">
             <button onClick={() => setView(view === 'grid' ? 'list' : 'grid')} className="px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-transparent text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-sm dark:shadow-none">
                {view === 'grid' ? 'List' : 'Grid'}
            </button>
        </div>
      </div>
      
       {/* File List */}
      {files.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 min-h-[50vh]">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <FolderPlus className="h-8 w-8 opacity-50 text-zinc-400 dark:text-white" />
              </div>
              <p>This folder is empty</p>
          </div>
      ) : (
          view === 'grid' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 sm:gap-6">
              {files.map((f) => (
                  <FileCard 
                    key={f.id} 
                    file={f} 
                    onDelete={handleDelete} 
                    onShare={handleShare} 
                    onFolderClick={handleFolderClick}
                    onMove={initiateMove}
                    onPreview={setPreviewFile}
                    selected={selectedFiles.some(sel => sel.id === f.id)}
                    onToggleSelect={handleToggleSelect}
                  />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#6A11CB] to-[#2575FC] dark:bg-[#0f0920] dark:bg-none border border-transparent dark:border-white/5 group hover:shadow-lg dark:hover:bg-white/5 transition-all shadow-sm dark:shadow-none">
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => {
                        if (f.type === 'folder') {
                            handleFolderClick(f);
                        } else {
                            setPreviewFile(f);
                        }
                    }}
                  >
                    <input 
                       type="checkbox"
                       checked={selectedFiles.some(sel => sel.id === f.id)}
                       onChange={() => handleToggleSelect(f)}
                       onClick={(e) => e.stopPropagation()}
                       className="w-4 h-4 rounded border-white/20 bg-transparent text-violet-500 focus:ring-0 cursor-pointer accent-violet-500 hidden sm:block"
                    />
                    <div className={`rounded-lg p-2 w-10 h-10 flex items-center justify-center overflow-hidden flex-shrink-0 ${f.type === 'folder' ? 'bg-white/20 text-white dark:bg-blue-500/20 dark:text-blue-400' : 'bg-white/20 text-white dark:bg-violet-500/20 dark:text-violet-400'}`}>
                        {f.type === 'folder' ? <div className="text-sm font-bold uppercase">{f.name.charAt(0)}</div> : 
                         <div className="text-sm font-bold uppercase">Doc</div>}
                    </div>
                    <div>
                      <div className="font-medium text-white">{f.name}</div>
                      <div className="text-xs text-white/70 dark:text-zinc-500">{f.size}</div>
                    </div>
                  </div>
                   <div className="flex items-center gap-4">
                      <div className="text-xs text-zinc-500 hidden sm:block">{f.modifiedAt}</div>
                      
                       {/* Context Actions for List View (Simplified) */}
                      <button onClick={() => handleDelete(f.id)} className="text-white hover:text-red-300 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 dark:hover:bg-red-400/10 rounded-lg">Delete</button>
                      <button onClick={() => initiateMove(f)} className="text-white hover:text-zinc-200 dark:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 dark:hover:bg-white/10 rounded-lg">Move</button>
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
      {showMoveModal && (fileToMove || filesToMove) && (
        <MoveFileModal
            fileToMove={fileToMove}
            filesToMove={filesToMove}
            onClose={() => { setShowMoveModal(false); setFileToMove(null); setFilesToMove(null); }}
            onMove={handleMoveFile}
        />
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
                  <button onClick={handleBulkShare} className="text-sm px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 text-blue-600 dark:text-blue-400">Share</button>
                  <button onClick={() => { setFileToMove(null); setFilesToMove(selectedFiles); setShowMoveModal(true); }} className="text-sm px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-300">Move</button>
                  <button onClick={handleBulkDelete} className="text-sm px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 font-medium">Delete</button>
              </div>
          </div>
      )}
    </div>
  );
}
