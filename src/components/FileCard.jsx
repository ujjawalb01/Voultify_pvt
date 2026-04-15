import React, { useState, useEffect, useRef } from 'react';
import { FileText, Image, Folder, Star, Share2, MoreVertical, Trash2, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { decryptFile } from '../utils/encryption';

export default function FileCard({ file, onDelete, onRestore, isTrash, onShare, onFolderClick, onMove, onPreview, selected, onToggleSelect }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  
  const { token, user } = useAuth();
  const [decryptedCoverUrl, setDecryptedCoverUrl] = useState(null);
  const [coverLoading, setCoverLoading] = useState(false);

  const isImage = file.type?.includes('image');
  const isVideo = file.type?.includes('video');
  const originalUrl = file.url?.startsWith('http') ? file.url : `https://voultback.onrender.com${file.url}`;

  // Decrypt the cover photo (image/video) on mount
  useEffect(() => {
    let objectUrl = null;

    const loadCover = async () => {
        if (!file || !file.url || (!isImage && !isVideo)) return;
        setCoverLoading(true);
        try {
            const response = await fetch(originalUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Cover fetch failed');
            
            const encryptedBlob = await response.blob();
            const decryptedBlob = await decryptFile(encryptedBlob, user?._id || token, file.type);
            
            objectUrl = URL.createObjectURL(decryptedBlob);
            setDecryptedCoverUrl(objectUrl);
        } catch (err) {
            console.error("Cover decryption error:", err);
        } finally {
            setCoverLoading(false);
        }
    };

    loadCover();

    return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, token, isImage, isVideo, originalUrl]);

  const handleOpen = (e) => {
    // If clicking menu button or inside menu, don't open file
    if (e.target.closest('.action-menu-container') || showMenu) return;

    if (file.type === 'folder') {
        if (onFolderClick) onFolderClick(file);
        return;
    }

    // All files must go through the Preview Modal now so they can be decrypted locally
    if (onPreview) {
        onPreview(file);
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    if (onToggleSelect) onToggleSelect(file);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
        onClick={handleOpen}
        className="group relative rounded-xl flex flex-col bg-gradient-to-r from-[#6A11CB] to-[#2575FC] dark:bg-[#1b1b2e] dark:bg-none border border-transparent dark:border-white/5 hover:shadow-xl hover:shadow-[#6A11CB]/30 transition-all cursor-pointer aspect-[1.15/1]"
    >
      {/* Media Cover Layer */}
      <div className="flex-1 bg-black/10 dark:bg-black/20 w-full relative flex items-center justify-center border-b border-white/10 dark:border-white/5 rounded-t-xl overflow-hidden">
        {(isImage || isVideo) ? (
          <>
            {coverLoading ? (
               <div className="w-16 h-16 rounded-2xl bg-black/20 flex items-center justify-center animate-pulse"></div>
            ) : decryptedCoverUrl ? (
               <>
                 {isImage && <img src={decryptedCoverUrl} alt={file.name} className="w-full h-full object-cover" />}
                 {isVideo && <video src={decryptedCoverUrl} className="w-full h-full object-cover" />}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               </>
            ) : (
               <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <FileText className="h-8 w-8" />
               </div>
            )}
          </>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400">
             {file.type === 'folder' ? <Folder className="h-8 w-8 text-blue-400" /> : <FileText className="h-8 w-8" />}
          </div>
        )}
      </div>

      {/* Selection Checkbox */}
      {(onToggleSelect) && (
          <div 
              className={`absolute top-2 left-2 z-50 p-1.5 rounded-full bg-white/20 dark:bg-black/40 backdrop-blur-md transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} cursor-pointer hover:bg-white/40 dark:hover:bg-black/60 flex items-center justify-center`}
              onClick={handleCheckboxClick}
              title="Select file"
          >
              <input 
                  type="checkbox" 
                  checked={!!selected} 
                  onChange={() => {}} // Controlled by wrapper click
                  className="w-4 h-4 rounded border-white/20 bg-transparent text-violet-500 focus:ring-0 cursor-pointer accent-violet-500 pointer-events-none"
              />
          </div>
      )}

      {/* Floating Menu Button */}
      <div className="absolute top-2 right-2 action-menu-container z-50" ref={menuRef}>
          <button 
              onClick={toggleMenu}
              className="p-1.5 rounded-full bg-white/20 dark:bg-black/40 backdrop-blur-md text-white dark:text-white/80 hover:bg-white/40 dark:hover:bg-black/60 transition-colors"
              title="Options"
          >
              <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
              <div className="absolute right-0 top-8 z-50 w-40 rounded-xl bg-white dark:bg-[#0f0920] border border-zinc-200 dark:border-white/10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col py-1">
                      {!isTrash ? (
                          <>
                              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); if(onShare) onShare(file); }} className="px-4 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2 z-50"><Share2 className="h-4 w-4" /> Share</button>
                              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); if(onMove) onMove(file); }} className="px-4 py-2.5 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white flex items-center gap-2 z-50"><Folder className="h-4 w-4" /> Move</button>
                              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); if(onDelete) onDelete(file.id); }} className="px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 z-50"><Trash2 className="h-4 w-4" /> Delete</button>
                          </>
                      ) : (
                          <>
                              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); if(onRestore) onRestore(file.id); }} className="px-4 py-2.5 text-left text-sm text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 flex items-center gap-2 z-50"><RotateCcw className="h-4 w-4" /> Restore</button>
                              <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); if(onDelete) onDelete(file.id); }} className="px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 z-50"><Trash2 className="h-4 w-4" /> Permanent</button>
                          </>
                      )}
                  </div>
              </div>
          )}
      </div>

      {/* Details Footer */}
      <div className="h-16 px-4 bg-black/5 dark:bg-gradient-to-br dark:from-[#1b1b2e] dark:to-[#161229] flex items-center gap-3 shrink-0 rounded-b-xl border-t border-white/10 dark:border-transparent">
          <div className={`p-2 rounded-lg shrink-0 ${file.type === 'folder' ? 'bg-white/20 text-white dark:bg-blue-500/20 dark:text-blue-400' : isVideo ? 'bg-white/20 text-white dark:bg-purple-500/20 dark:text-purple-400' : isImage ? 'bg-white/20 text-white dark:bg-blue-500/20 dark:text-blue-400' : 'bg-white/20 text-white dark:bg-violet-500/20 dark:text-violet-400'}`}>
              {file.type === 'folder' ? <Folder className="h-4 w-4" /> : isImage ? <Image className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate text-sm leading-tight">{file.name}</div>
              <div className="text-[10px] text-white/70 dark:text-zinc-500 truncate mt-0.5">
                  {file.size} • {file.modifiedAt}
              </div>
          </div>
      </div>
    </div>
  );
}
