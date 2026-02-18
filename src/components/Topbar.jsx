import React from 'react';
import { Search, Upload, Plus } from 'lucide-react';
import logo from '../assets/logo.jpg';

// The component now accepts props for handling clicks and search
export default function Topbar({ onUploadClick, onNewFolderClick, searchQuery, setSearchQuery, onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 bg-[#0b0616]/60 backdrop-blur border-b border-white/5">
      <div className="mx-auto flex items-center gap-3 px-4 py-4 md:px-6">
        <div className="flex items-center gap-3 lg:hidden">
            <button onClick={onMenuClick} className="p-2 -ml-2 text-zinc-400 hover:text-white">
                <div className="space-y-1.5">
                    <div className="w-6 h-0.5 bg-current"></div>
                    <div className="w-6 h-0.5 bg-current"></div>
                    <div className="w-6 h-0.5 bg-current"></div>
                </div>
            </button>
            <img src={logo} alt="Voultify" className="h-8 w-8 rounded-md" />
            <span className="font-semibold text-lg hidden sm:block">Voultify</span>
        </div>

        <div className="flex-1 flex items-center gap-3 bg-white/5 rounded-2xl px-3 py-2 ml-2 lg:ml-0">
          <Search className="h-4 w-4 opacity-70" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..." 
            className="bg-transparent outline-none w-full text-sm" 
          />
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* The onClick handlers are now connected */}
          <button 
            onClick={onUploadClick}
            className="inline-flex items-center gap-2  rounded-2xl px-3 py-2 bg-gradient-to-r from-[#6A11CB] to-[#2575FC] text-sm font-medium shadow"
          >
            <Upload className="h-4 w-4" /> <span className="hidden sm:inline">Upload</span>
          </button>

          <button 
            onClick={onNewFolderClick}
            className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-white/5 text-sm hover:bg-white/10"
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Folder</span>
          </button>
        </div>
      </div>
    </header>
  );
}
