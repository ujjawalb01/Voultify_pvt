import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Folder, Share2, Trash2, User, LogOut, ChevronRight, Grid, FolderPlus, X } from 'lucide-react';
import logo from '../assets/logo.jpg';
import { useAuth } from '../context/AuthContext';

function NavItem({ to, label, icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/5 transition ${
          isActive ? 'bg-gradient-to-r from-[#6A11CB] to-[#2575FC] text-white' : 'text-zinc-200'
        }`
      }
    >
      <span className="w-6">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </NavLink>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { token } = useAuth();

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0f0920] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="flex items-center justify-between p-4 mb-2">
        <div className="flex items-center gap-3">
            <img src={logo} alt="Voultify" className="h-11 w-11 object-contain rounded-lg" />
            <div>
            <div className="text-lg font-semibold">Voultify</div>
            <div className="text-xs opacity-70">Cloud Storage</div>
            </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-zinc-400 hover:text-white">
            <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="space-y-2 flex-1">
        <NavItem to="/dashboard" label="Dashboard" icon={<Grid className="h-4 w-4" />} onClick={onClose} />
        <NavItem to="/my-files" label="My Files" icon={<Folder className="h-4 w-4" />} onClick={onClose} />
        <NavItem to="/folders" label="Folders" icon={<FolderPlus className="h-4 w-4" />} onClick={onClose} />
        <NavItem to="/trash" label="Trash" icon={<Trash2 className="h-4 w-4" />} onClick={onClose} />
        <NavItem to="/profile" label="Profile" icon={<User className="h-4 w-4" />} onClick={onClose} />
      </nav>

      <div className="mt-auto p-3 rounded-xl bg-white/3">
        <div className="text-xs opacity-80">Storage</div>
        <div className="mt-2 text-sm font-medium">2.5 GB of 15 GB</div>
        <div className="mt-2 h-2 w-full rounded-full bg-white/10">
          <div className="h-2 rounded-full" style={{ width: '17%', backgroundImage: 'linear-gradient(90deg,#6A11CB,#2575FC)'}} />
        </div>
      </div>
    </aside>
  );
}
