import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="max-w-xl text-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Profile</h2>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-700 text-sm text-white font-medium transition-colors"
        >
          Logout
        </button>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl p-4 bg-white/5">
          <div className="text-sm opacity-70">Name</div>
          <div className="font-medium mt-1">{user.name || 'Not available'}</div>
        </div>
        <div className="rounded-2xl p-4 bg-white/5">
          <div className="text-sm opacity-70">Email</div>
          <div className="font-medium mt-1">{user.email || 'Not available'}</div>
        </div>
      </div>
    </div>
  );
}
