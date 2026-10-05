'use client';
import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import VideoGallery from '@/app/components/VideoGallery';
import { useVideoUpload } from '@/app/hooks/useVideoUpload';
import { useAuth } from '@/app/providers/AuthProvider';
import Footer from '../components/Footer';
import MobileDashboard from '../components/MobileDashboard';

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 start-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl shadow-xl text-sm font-medium border backdrop-blur animate-fade-in transition-all
            ${t.type === 'success'
              ? 'bg-success-green/20 border-success-green/40 text-success-green'
              : 'bg-error-container border-error/40 text-error'}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    loadingList,
    uploadedVideos,
    pagination,
    setPage,
    trackView,
    listScope,
    setListScope,
    activeMediaTab,
    setActiveMediaTab,
    tabCounts,
  } = useVideoUpload();
  const [toasts, setToasts] = useState([]);

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
      return `${protocol}//${safeHost}${port ? ':' + port : ''}`;
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
    } catch { }
    navigator.clipboard.writeText(fullUrl)
      .then(() => showToast('تم نسخ الرابط إلى الحافظة بنجاح', 'success'))
      .catch(() => showToast('تعذّر نسخ الرابط، حاول مرة أخرى.', 'error'));
  }, [showToast]);

  return (
    <>
      <MobileDashboard uploadedVideos={uploadedVideos} loading={loadingList} />
      
      <div className="hidden md:block">
        <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(14,19,44,0.06)]">
        <div className="h-16 w-full px-gutter flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-sm">
              <img alt="Themiify Official Logo" className="h-8 w-auto object-contain rounded-lg" src="/logo.png" />
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">Themiify <span className="text-primary-container">Videos</span></span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-space-sm">
            <Link href="/" className="px-space-md py-space-xs rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">الرئيسية والرفع</Link>
            <Link href="/dashboard" className="px-space-md py-space-xs transition-colors bg-surface-container text-on-surface font-semibold rounded-xl">إدارة المرفوعات والمكتبة</Link>
            <Link href="/tools" className="px-space-md py-space-xs rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">أدوات الميديا</Link>
          </nav>
          <div className="flex items-center gap-space-md">
            <Link href="/" className="inline-flex items-center gap-space-xs bg-primary-container text-on-primary hover:bg-primary font-headline-sm text-headline-sm px-space-md py-space-xs rounded-xl shadow-[0_8px_24px_-4px_rgba(255,94,30,0.35)] transition-all">
              <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
              <span>ارفع ملفاً الآن</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full pt-20 pb-10 bg-surface min-h-[calc(100vh-16rem)]">
        <section id="library" className="w-full px-gutter">
          <div className="max-w-6xl mx-auto">
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
              activeMediaTab={activeMediaTab}
              onMediaTabChange={setActiveMediaTab}
              tabCounts={tabCounts}
            />
          </div>
        </section>
        </main>

        <Footer />
      </div>
      
      <Toast toasts={toasts} />
    </>
  );
}
