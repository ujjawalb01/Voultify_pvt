import React, { useState, useEffect, useRef } from 'react';
import { FileText, Image, Folder, Star, Share2, MoreVertical, Trash2, RotateCcw } from 'lucide-react';

export default function FileCard({ file, onDelete, onRestore, isTrash, onShare, onFolderClick, onMove }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const handleOpen = (e) => {
    if (e.target.closest('button') || showMenu) return;

    if (file.type === 'folder') {
        if (onFolderClick) onFolderClick(file);
        return;
    }
    if (file.url) {
        const fullUrl = file.url.startsWith('http') ? file.url : `http://localhost:3000${file.url}`;
        window.open(fullUrl, '_blank');
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
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

  const isImage = file.type?.includes('image');

  return (
    <div 
        onClick={handleOpen}
        className="group relative rounded-3xl p-4 bg-gradient-to-br from-[#1b1b2e] to-[#161229] border border-white/5 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`rounded-2xl p-3 ${file.type === 'folder' ? 'bg-blue-500/20 text-blue-400' : 'bg-violet-500/20 text-violet-400'}`}>
            {file.type === 'folder' ? <Folder className="h-6 w-6" /> : 
             isImage ? <Image className="h-6 w-6" /> : 
             <FileText className="h-6 w-6" />}
        </div>
        
        {/* Three Dots Menu Button */}
        <div className="relative" ref={menuRef}>
            <button 
                onClick={toggleMenu}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
                <MoreVertical className="h-5 w-5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
                <div className="absolute right-0 top-8 z-50 w-40 rounded-xl bg-[#0f0920] border border-white/10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex flex-col py-1">
                        {!isTrash ? (
                            <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onShare(file); }}
                                    className="px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                >
                                    <Share2 className="h-4 w-4" /> Share
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onMove(file); }}
                                    className="px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                >
                                    <Folder className="h-4 w-4" /> Move
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(file.id); }}
                                    className="px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" /> Delete
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onRestore(file.id); }}
                                    className="px-4 py-2.5 text-left text-sm text-green-400 hover:bg-green-500/10 flex items-center gap-2"
                                >
                                    <RotateCcw className="h-4 w-4" /> Restore
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(file.id); }}
                                    className="px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" /> Permanent
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>

      <div>
          <div className="font-semibold text-zinc-100 truncate text-sm mb-1">{file.name}</div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>{file.size}</span>
              <span>•</span>
              <span>{file.modifiedAt}</span>
          </div>
      </div>
    </div>
  );
}
