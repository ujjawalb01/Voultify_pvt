import React from 'react';
import { NavLink } from 'react-router-dom';
import { Grid, Folder, Share2, Trash2, User } from 'lucide-react';
import logo from '../assets/logo.jpg';

function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
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

export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen p-4 bg-[#0f0920] border-r border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <img src={logo} alt="Voultify" className="h-11 w-11 object-contain rounded-lg" />
        <div>
          <div className="text-lg font-semibold">Voultify</div>
          <div className="text-xs opacity-70">Cloud Storage</div>
        </div>
      </div>

      <nav className="space-y-2">
        <NavItem to="/dashboard" label="Dashboard" icon={<Grid className="h-4 w-4" />} />
        <NavItem to="/my-files" label="My Files" icon={<Folder className="h-4 w-4" />} />
        <NavItem to="/shared" label="Shared" icon={<Share2 className="h-4 w-4" />} />
        <NavItem to="/trash" label="Trash" icon={<Trash2 className="h-4 w-4" />} />
        <NavItem to="/profile" label="Profile" icon={<User className="h-4 w-4" />} />
      </nav>

      <div className="mt-6 p-3 rounded-xl bg-white/3">
        <div className="text-xs opacity-80">Storage</div>
        <div className="mt-2 text-sm font-medium">2.5 GB of 15 GB</div>
        <div className="mt-2 h-2 w-full rounded-full bg-white/10">
          <div className="h-2 rounded-full" style={{ width: '17%', backgroundImage: 'linear-gradient(90deg,#6A11CB,#2575FC)'}} />
        </div>
      </div>
    </aside>
  );
}
