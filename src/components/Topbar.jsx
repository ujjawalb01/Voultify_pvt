import React from 'react';
import { Search, Upload, Plus } from 'lucide-react';

// The component now accepts props for handling clicks
export default function Topbar({ onUploadClick, onNewFolderClick }) {
  return (
    <header className="sticky top-0 z-30 bg-[#0b0616]/60 backdrop-blur border-b border-white/5">
      <div className="mx-auto max-w-7xl flex items-center gap-4 px-6 py-4">
        <div className="flex-1 flex items-center gap-3 bg-white/5 rounded-2xl px-3 py-2">
          <Search className="h-4 w-4 opacity-70" />
          <input placeholder="Search files, types, dates..." className="bg-transparent outline-none w-full text-sm" />
        </div>

        <div className="flex items-center gap-3">
          {/* The onClick handlers are now connected */}
          <button 
            onClick={onUploadClick}
            className="inline-flex items-center gap-2  rounded-2xl px-3 py-2 bg-gradient-to-r from-[#6A11CB] to-[#2575FC] text-sm font-medium shadow"
          >
            <Upload className="h-4 w-4" /> Upload
          </button>

          <button 
            onClick={onNewFolderClick}
            className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-white/5 text-sm hover:bg-white/10"
          >
            <Plus className="h-4 w-4" /> New Folder
          </button>
        </div>
      </div>
    </header>
  );
}
