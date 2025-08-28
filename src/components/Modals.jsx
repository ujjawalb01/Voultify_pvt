import React, { useRef } from 'react';

export function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl bg-[#171127] p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className="text-sm opacity-80">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function UploadModal({ onClose }) {
  return (
    <ModalShell title="Upload files" onClose={onClose}>
      <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
        <div className="mb-3">Drag & drop files here or</div>
        <button className="bg-gradient-to-r from-[#6A11CB] to-[#2575FC] text-white px-4 py-2 rounded-xl">Choose files</button>
      </div>
    </ModalShell>
  );
}

export function NewFolderModal({ onClose, onCreate }) {
  const ref = useRef();
  return (
    <ModalShell title="Create folder" onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onCreate(ref.current.value); }}>
        <input ref={ref} placeholder="Folder name" className="w-full rounded-2xl p-2 bg-white/5 mb-3" />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded-xl bg-white/5">Cancel</button>
          <button className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#6A11CB] to-[#2575FC]">Create</button>
        </div>
      </form>
    </ModalShell>
  );
}
