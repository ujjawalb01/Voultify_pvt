import React from 'react';
import { Outlet } from 'react-router-dom'; // Outlet is a placeholder for child routes
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#0b0616] text-white">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <main className="p-6">
          {/* Child pages like Dashboard, MyFiles, etc., will be rendered here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}