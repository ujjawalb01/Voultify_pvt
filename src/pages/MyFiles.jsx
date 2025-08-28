import React, { useState } from 'react';
import FileCard from '../components/FileCard';

const initial = [
  { id: 'f1', name: 'Project Docs', type: 'folder', size: 0, modifiedAt: '2025-08-10' },
  { id: 'f2', name: 'UI Wireframes.png', type: 'image', size: 1.2, modifiedAt: '2025-08-22' },
  { id: 'f3', name: 'SRS.pdf', type: 'pdf', size: 3.4, modifiedAt: '2025-08-18' },
  { id: 'f4', name: 'Team Notes.txt', type: 'doc', size: 0.2, modifiedAt: '2025-08-25' },
];

export default function MyFiles() {
  const [view, setView] = useState('grid');
  const [files] = useState(initial);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">My Files</h2>
        <div className="space-x-2">
          <button onClick={() => setView(view === 'grid' ? 'list' : 'grid')} className="px-3 py-1 rounded-xl bg-white/5">Toggle View</button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((f) => <FileCard key={f.id} file={f} />)}
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0f0920] border border-white/5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/5 p-2 w-10 h-10" />
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs opacity-60">{f.type} • {f.size ? `${f.size} GB` : '—'}</div>
                </div>
              </div>
              <div className="text-xs opacity-60">{f.modifiedAt}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
