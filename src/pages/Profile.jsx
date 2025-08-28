import React from 'react';

export default function Profile() {
  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold mb-4">Profile</h2>
      <div className="rounded-2xl p-4 bg-white/5 mb-3">
        <div className="text-sm opacity-70">Name</div>
        <div className="font-medium">Ujjawal Sharma</div>
      </div>
      <div className="rounded-2xl p-4 bg-white/5">
        <div className="text-sm opacity-70">Email</div>
        <div className="font-medium">ujjawal@example.com</div>
      </div>
    </div>
  );
}
