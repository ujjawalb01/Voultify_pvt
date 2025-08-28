import React from 'react';
import FileCard from '../components/FileCard';

const sample = [
  { id: 'a1', name: 'Project Docs', type: 'folder', size: 0, modifiedAt: '2025-08-10' },
  { id: 'a2', name: 'UI Wireframes.png', type: 'image', size: 1.2, modifiedAt: '2025-08-22' },
  { id: 'a3', name: 'SRS.pdf', type: 'pdf', size: 3.4, modifiedAt: '2025-08-18' },
];

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Overview</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {sample.map((f) => <FileCard key={f.id} file={f} />)}
      </div>
    </div>
  );
}
