'use client';
import { useState, useCallback } from 'react';
import VideoUpload from './components/VideoUpload';
import VideoGallery from './components/VideoGallery';
import MediaLab from './components/MediaLab';
import { useVideoUpload } from './hooks/useVideoUpload';

const DEPLOYED_SITE_URL = 'https://dimgrey-toad-847466.hostingersite.com';

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
  const {
    upload,
    progress,
    loading,
    loadingList,
    error,
    uploadedVideos,
    stats,
    pagination,
    setPage,
    trackView,
  } = useVideoUpload();
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const handleCopy = useCallback((url) => {
    const baseUrl = DEPLOYED_SITE_URL;
    let fullUrl = url.startsWith('http') ? url : baseUrl + url;
    try {
      const parsed = new URL(fullUrl);
      if (parsed.hostname === '0.0.0.0') {
        parsed.hostname = 'dimgrey-toad-847466.hostingersite.com';
        parsed.protocol = 'https:';
        parsed.port = '';
        fullUrl = parsed.toString();
      }
    } catch {
      // Keep original URL if parsing fails.
    }
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

        {stats && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50">Total Videos</p>
              <p className="text-xl font-bold">{stats.totalVideos}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50">Total Views</p>
              <p className="text-xl font-bold">{stats.totalViews}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50">Public</p>
              <p className="text-xl font-bold">{stats.byVisibility.public}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50">Private + Unlisted</p>
              <p className="text-xl font-bold">{stats.byVisibility.private + stats.byVisibility.unlisted}</p>
            </div>
          </div>
        )}

        {/* Gallery */}
        <VideoGallery
          videos={uploadedVideos}
          onCopy={handleCopy}
          onTrackView={trackView}
          pagination={pagination}
          onPageChange={setPage}
          loading={loadingList}
        />

        <MediaLab onToast={showToast} />
      </div>

      <Toast toasts={toasts} />
    </main>
  );
}
