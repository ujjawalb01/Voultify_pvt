import React from 'react';
import { FileText, Image, Folder, Star } from 'lucide-react';

const iconFor = (type) => {
  if (type === 'folder') return <Folder className="h-5 w-5" />;
  if (type === 'image') return <Image className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
};

export default function FileCard({ file }) {
  return (
    <div className="rounded-2xl p-3 bg-[#121026] border border-white/5 hover:border-violet-500/40">
      <div className="flex items-center justify-between mb-3">
        <div className="rounded-xl bg-white/5 p-2">{iconFor(file.type)}</div>
        <div className="text-yellow-300"><Star className="h-4 w-4" /></div>
      </div>
      <div className="font-medium truncate">{file.name}</div>
      <div className="text-xs opacity-60">{file.size ? `${file.size} GB` : '—'} • {file.modifiedAt}</div>
    </div>
  );
}
