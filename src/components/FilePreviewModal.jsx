import React, { useEffect, useState } from 'react';
import { X, FileText, Image as ImageIcon, Video, Music, ExternalLink, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { decryptFile } from '../utils/encryption';

export default function FilePreviewModal({ file, onClose }) {
  const { token, user } = useAuth();
  const [decryptedUrl, setDecryptedUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Prevent scrolling on body when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    let objectUrl = null;

    const loadDecryptedFile = async () => {
        if (!file || !file.url) return;
        setIsLoading(true);
        setError(null);
        try {
            const rawUrl = file.url.startsWith('http') ? file.url : `https://voultback.onrender.com${file.url}`;
            
            // Fetch the encrypted blob from the server
            const response = await fetch(rawUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to download file');
            
            const encryptedBlob = await response.blob();
            
            // Decrypt the blob using the stable user key
            const decryptedBlob = await decryptFile(encryptedBlob, user?._id || token, file.type);
            
            // Generate a local useable URL for the browser
            objectUrl = URL.createObjectURL(decryptedBlob);
            setDecryptedUrl(objectUrl);
        } catch (err) {
            console.error("Decryption error:", err);
            setError("Could not load or decrypt the file.");
        } finally {
            setIsLoading(false);
        }
    };

    loadDecryptedFile();

    // Cleanup object URL on unmount to free memory
    return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, token]);

  if (!file) return null;

  const originalUrl = file.url?.startsWith('http') ? file.url : `https://voultback.onrender.com${file.url}`;
  
  const isImage = file.type?.includes('image');
  const isVideo = file.type?.includes('video');
  const isAudio = file.type?.includes('audio');
  const isPdf = file.type === 'application/pdf';

  const handleOpenNewTab = () => {
    // If we have a decrypted local URL, open that if possible, but blobs can't always be opened directly in new tabs safely across browsers.
    // However, since we want them to *view* it, window.open(objectUrl) usually works.
    if (decryptedUrl) {
        window.open(decryptedUrl, '_blank');
    } else {
        window.open(originalUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Container */}
      <div className="relative w-full h-full max-w-6xl max-h-full flex flex-col bg-[#0f0920] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1b1b2e]/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`p-2 rounded-lg ${
              isImage ? 'bg-blue-500/20 text-blue-400' :
              isVideo ? 'bg-purple-500/20 text-purple-400' :
              isAudio ? 'bg-pink-500/20 text-pink-400' :
              'bg-violet-500/20 text-violet-400'
            }`}>
              {isImage ? <ImageIcon className="w-5 h-5" /> :
               isVideo ? <Video className="w-5 h-5" /> :
               isAudio ? <Music className="w-5 h-5" /> :
               <FileText className="w-5 h-5" />}
            </div>
            <h2 className="text-white font-medium truncate shrink" title={file.name}>{file.name}</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleOpenNewTab}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            <a 
              href={decryptedUrl || originalUrl} 
              download={file.name}
              target="_blank" 
              rel="noreferrer"
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <button 
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-black/20 flex items-center justify-center relative">
          
          {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
                  <div className="text-white text-sm font-medium">Decrypting file securely...</div>
              </div>
          )}

          {error && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="text-red-400 mb-2">Failed to display file</div>
                  <div className="text-zinc-500 text-sm">{error}</div>
              </div>
          )}

          {decryptedUrl && isImage && (
            <img 
              src={decryptedUrl} 
              alt={file.name} 
              className="max-w-full max-h-full object-contain"
            />
          )}

          {decryptedUrl && isVideo && (
            <video 
              src={decryptedUrl} 
              controls 
              autoPlay
              className="max-w-full max-h-full w-full outline-none"
            >
              Your browser does not support the video tag.
            </video>
          )}

          {decryptedUrl && isAudio && (
            <div className="w-full max-w-md p-8 bg-[#1b1b2e] rounded-2xl border border-white/5 flex flex-col items-center gap-6">
               <div className="w-24 h-24 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 animate-pulse">
                  <Music className="w-12 h-12" />
               </div>
               <div className="text-center w-full">
                 <p className="text-white font-medium truncate mb-4">{file.name}</p>
                 <audio src={decryptedUrl} controls autoPlay className="w-full outline-none" />
               </div>
            </div>
          )}

          {decryptedUrl && isPdf && (
            <iframe 
               src={`${decryptedUrl}#toolbar=0`} 
               title={file.name}
               className="w-full h-full border-none bg-white"
            />
          )}

          {!isImage && !isVideo && !isAudio && !isPdf && (
            <div className="flex flex-col items-center gap-6 p-8">
               <div className="w-32 h-32 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <FileText className="w-16 h-16" />
               </div>
               <div className="text-center max-w-md">
                 <h3 className="text-xl text-white font-medium mb-2">No Preview Available</h3>
                 <p className="text-zinc-400 mb-6">This file type cannot be previewed directly in the app. You can open it in a new tab or download it.</p>
                 <button 
                    onClick={handleOpenNewTab}
                    className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" /> Open File
                 </button>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
