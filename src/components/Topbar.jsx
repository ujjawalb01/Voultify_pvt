import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Upload, Plus, User } from 'lucide-react';
import logo from '../assets/logo.jpg';
import { useAuth } from '../context/AuthContext';

// The component now accepts props for handling clicks and search
export default function Topbar({ onUploadClick, onNewFolderClick, searchQuery, setSearchQuery, onMenuClick }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 bg-white/60 dark:bg-[#0b0616]/60 backdrop-blur border-b border-zinc-200 dark:border-white/5">
      <div className="mx-auto flex items-center gap-3 px-4 py-4 md:px-6">
        <div className="flex items-center gap-3 lg:hidden">
            <button onClick={onMenuClick} className="p-2 -ml-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <div className="space-y-1.5">
                    <div className="w-6 h-0.5 bg-current"></div>
                    <div className="w-6 h-0.5 bg-current"></div>
                    <div className="w-6 h-0.5 bg-current"></div>
                </div>
            </button>
            <img src={logo} alt="Voultify" className="h-8 w-8 rounded-md" />
            <span className="font-semibold text-lg hidden sm:block">Voultify</span>
        </div>

        <div className="flex-1 flex items-center gap-3 bg-zinc-100 dark:bg-white/5 rounded-2xl px-3 py-2 ml-2 lg:ml-0">
          <Search className="h-4 w-4 text-zinc-500 dark:opacity-70" />
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
            className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-zinc-100 dark:bg-white/5 text-sm hover:bg-zinc-200 dark:hover:bg-white/10"
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Folder</span>
          </button>
          
          <div className="w-px h-6 bg-zinc-200 dark:bg-white/10 mx-1 hidden sm:block"></div>
          
          <div className="flex items-center gap-2">
            <Link to="/profile" className="block hover:opacity-80 transition-opacity">
                {user?.avatarUrl ? (
                  <img src={`https://voultback.onrender.com${user.avatarUrl}`} alt="Profile" className="h-9 w-9 rounded-xl object-cover border border-zinc-200 dark:border-white/10" />
                ) : (
                  <div className="h-9 w-9 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center border border-zinc-200 dark:border-white/10">
                    <User className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                  </div>
                )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
