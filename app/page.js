'use client';
import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import VideoUpload from './components/VideoUpload';
import VideoGallery from './components/VideoGallery';
import AppNavbar from './components/AppNavbar';
import { useVideoUpload } from './hooks/useVideoUpload';
import { useAuth } from './providers/AuthProvider';
import { MAX_VIDEO_BYTES_PER_UPLOAD } from '@/app/lib/plans';

const MediaLab = dynamic(() => import('./components/MediaLab'), {
  loading: () => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
      جاري تحميل أدوات إضافية...
    </div>
  ),
});

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 start-6 z-50 flex flex-col gap-2 max-w-sm">
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
  const { user, quota } = useAuth();
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
    listScope,
    setListScope,
  } = useVideoUpload();
  const [toasts, setToasts] = useState([]);
  const [showMediaLab, setShowMediaLab] = useState(false);

  useEffect(() => {
    if (!user) setListScope('public');
  }, [user, setListScope]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const handleCopy = useCallback((url) => {
    const baseUrl = (() => {
      const { protocol, hostname, port } = window.location;
      const safeHost = hostname === '0.0.0.0' ? 'localhost' : hostname;
      return `${protocol}//${safeHost}${port ? `:${port}` : ''}`;
    })();
    let fullUrl = url.startsWith('http') ? url : baseUrl + url;
    try {
      const parsed = new URL(fullUrl);
      if (parsed.hostname === '0.0.0.0') {
        const currentHost = window.location.hostname === '0.0.0.0' ? 'localhost' : window.location.hostname;
        parsed.hostname = currentHost;
        if (!parsed.port && window.location.port) parsed.port = window.location.port;
        fullUrl = parsed.toString();
      }
    } catch {
      // Keep original URL if parsing fails.
    }
    navigator.clipboard.writeText(fullUrl)
      .then(() => showToast('تم نسخ الرابط إلى الحافظة', 'success'))
      .catch(() => showToast('تعذر نسخ الرابط', 'error'));
  }, [showToast]);

  return (
    <main className="min-h-screen bg-[#050810] text-white">
      {/* خلفية بلمسة ألوان وطنية خفيفة */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 start-0 w-80 h-80 bg-emerald-700/12 rounded-full blur-2xl" />
        <div className="absolute -top-20 end-0 w-72 h-72 bg-indigo-600/15 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-16">
        <AppNavbar />

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300/95 text-sm font-medium mb-4">
            <span className="text-base" aria-hidden>
              🇸🇦
            </span>
            منصّة سعودية — أسعار بالريال السعودي
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            رفع ومشاركة الفيديو
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-br from-white via-emerald-100/90 to-indigo-200 bg-clip-text text-transparent leading-tight">
            ارفع فيديوهاتك وشاركها بثقة
          </h1>
          <p className="mt-4 text-white/45 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            باقات واضحة بالريال السعودي، بدون تعقيد — مناسبة للمبدعين والأفراد والفرق داخل المملكة.
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
            isLoggedIn={Boolean(user)}
            canUpload={Boolean(user) && Boolean(quota?.uploadAllowed)}
            maxUploadBytes={quota?.maxUploadBytes ?? MAX_VIDEO_BYTES_PER_UPLOAD}
          />
        </div>

        {stats && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50">عدد الفيديوهات</p>
              <p className="text-xl font-bold tabular-nums">{stats.totalVideos}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50">إجمالي المشاهدات</p>
              <p className="text-xl font-bold tabular-nums">{stats.totalViews}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50">عامة</p>
              <p className="text-xl font-bold tabular-nums">{stats.byVisibility.public}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50">خاصة ومخفيّة</p>
              <p className="text-xl font-bold tabular-nums">
                {stats.byVisibility.private + stats.byVisibility.unlisted}
              </p>
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
          listScope={listScope}
          onListScopeChange={setListScope}
          sessionUser={user}
        />

        <div className="mt-14 border-t border-white/10 pt-10">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              ✨
            </span>
            أدوات إضافية
          </h2>
          <p className="text-sm text-white/45 mb-6">معمل ضغط الصور ورفع الصوت — اختياري بجانب الفيديو.</p>
          {showMediaLab ? (
            <MediaLab onToast={showToast} />
          ) : (
            <button
              type="button"
              onClick={() => setShowMediaLab(true)}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/85 hover:bg-white/10 transition"
            >
              تحميل الأدوات الإضافية
            </button>
          )}
        </div>
      </div>

      <Toast toasts={toasts} />
    </main>
  );
}
