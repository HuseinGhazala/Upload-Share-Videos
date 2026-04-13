'use client';
import { useState, useCallback } from 'react';
import VideoUpload from './components/VideoUpload';
import VideoGallery from './components/VideoGallery';
import { useVideoUpload } from './hooks/useVideoUpload';

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl shadow-xl text-sm font-medium border backdrop-blur animate-fade-in transition-all
            ${t.type === 'success'
              ? 'bg-green-900/80 border-green-500/40 text-green-300'
              : 'bg-red-900/80 border-red-500/40 text-red-300'}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { upload, progress, loading, error, uploadedVideos, removeVideo, reset } = useVideoUpload();
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const handleCopy = useCallback((url) => {
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl)
      .then(() => showToast('📋 Link copied to clipboard!', 'success'))
      .catch(() => showToast('Failed to copy link', 'error'));
  }, [showToast]);

  return (
    <main className="min-h-screen bg-[#0a0a12] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Video Upload Platform 🚀
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-br from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent leading-tight">
            Upload & Share Videos
          </h1>
          <p className="mt-4 text-white/40 text-lg max-w-xl mx-auto">
            Drag, drop, and stream. Powered by Cloudinary with local fallback.
          </p>
        </div>

        {/* Upload Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-2xl">
          <VideoUpload
            onUpload={upload}
            loading={loading}
            progress={progress}
            error={error}
            onToast={showToast}
          />
        </div>

        {/* Gallery */}
        <VideoGallery
          videos={uploadedVideos}
          onRemove={removeVideo}
          onCopy={handleCopy}
        />
      </div>

      <Toast toasts={toasts} />
    </main>
  );
}
