'use client';
import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import VideoUpload from './components/VideoUpload';
import VideoGallery from './components/VideoGallery';
import AppNavbar from './components/AppNavbar';
import { useVideoUpload } from './hooks/useVideoUpload';
import { useAuth } from './providers/AuthProvider';
import { MAX_VIDEO_BYTES_PER_UPLOAD } from '@/app/lib/plans';
import { getAttributionFromLocation, trackFunnelEvent } from '@/app/lib/analytics/funnel';
import { CinematicCard, CinematicSection, FloatOrb } from './components/ui/CinematicSection';

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
  const [firstUploadTracked, setFirstUploadTracked] = useState(false);

  useEffect(() => {
    if (!user) setListScope('public');
  }, [user, setListScope]);

  useEffect(() => {
    if (!user || !quota?.uploadAllowed || firstUploadTracked) return;
    if (!Array.isArray(uploadedVideos) || uploadedVideos.length === 0) return;
    setFirstUploadTracked(true);
    trackFunnelEvent('first_upload_after_activation', {
      uploadsCount: uploadedVideos.length,
      ...getAttributionFromLocation(),
    });
  }, [user, quota?.uploadAllowed, uploadedVideos, firstUploadTracked]);

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
    <main className="min-h-screen text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FloatOrb className="absolute -top-36 -start-12 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-[100px]" />
        <FloatOrb className="absolute top-1/3 -end-12 h-[24rem] w-[24rem] rounded-full bg-cyan-400/20 blur-[90px]" />
      </div>

      <div className="relative section-wrap py-10 sm:py-14">
        <AppNavbar />

        <CinematicSection className="text-center mb-12 sm:mb-16" y={24}>
          <div className="chip mb-5">
            <span className="text-base" aria-hidden>
              🇸🇦
            </span>
            منصّة سعودية — أسعار بالريال السعودي
          </div>
          <h1 className="headline-display bg-gradient-to-b from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
            تجربة رفع فيديو\nراقية وسريعة
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            هوية بصرية احترافية، تجربة استخدام سلسة، وباقات مرنة للمبدعين والفرق داخل المملكة.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/pricing?from=home_hero"
              onClick={() => trackFunnelEvent('view_pricing', { source: 'home_hero' })}
              className="btn-primary"
            >
              ابدأ اشتراكك الآن
            </Link>
            <Link
              href="/signup?from=home_hero"
              onClick={() => trackFunnelEvent('start_signup', { source: 'home_hero' })}
              className="btn-secondary"
            >
              إنشاء حساب
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="chip">تفعيل سريع</span>
            <span className="chip">واجهة أنيقة</span>
            <span className="chip">دعم عربي</span>
          </div>
        </CinematicSection>

        <CinematicSection className="mb-10 grid gap-4 sm:grid-cols-3" delay={0.1}>
          <CinematicCard className="p-5 text-sm">
            <p className="text-emerald-200 font-semibold mb-2">1) سجّل حسابك</p>
            <p className="text-white/60">خطوة سريعة ببريدك خلال أقل من دقيقة.</p>
          </CinematicCard>
          <CinematicCard className="p-5 text-sm">
            <p className="text-indigo-200 font-semibold mb-2">2) اختر الباقة المناسبة</p>
            <p className="text-white/60">اختر باقة تناسب حجم الاستخدام وخطة النشر.</p>
          </CinematicCard>
          <CinematicCard className="p-5 text-sm">
            <p className="text-amber-200 font-semibold mb-2">3) ارفع إيصال الدفع</p>
            <p className="text-white/60">نراجع الطلب ونفعّل الباقة سريعًا في نفس اليوم غالبًا.</p>
          </CinematicCard>
        </CinematicSection>

        <CinematicSection delay={0.1}>
          <div className="glass-panel p-6 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">محطة الرفع الذكية</h2>
              <span className="chip">حتى 50MB لكل فيديو</span>
            </div>
            <p className="text-sm text-white/60 mb-5">
              واجهة رفع محسّنة مع متابعة تقدم واضحة وتحكم دقيق في مستوى الظهور.
            </p>
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
        </CinematicSection>

        {stats && (
          <CinematicSection className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3" delay={0.1}>
            <motion.div whileHover={{ y: -2 }} className="glass-panel p-4 rounded-xl border">
              <p className="text-xs text-white/50">عدد الفيديوهات</p>
              <p className="text-xl font-bold tabular-nums">{stats.totalVideos}</p>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="glass-panel p-4 rounded-xl border">
              <p className="text-xs text-white/50">إجمالي المشاهدات</p>
              <p className="text-xl font-bold tabular-nums">{stats.totalViews}</p>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="glass-panel p-4 rounded-xl border">
              <p className="text-xs text-white/50">عامة</p>
              <p className="text-xl font-bold tabular-nums">{stats.byVisibility.public}</p>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="glass-panel p-4 rounded-xl border">
              <p className="text-xs text-white/50">خاصة ومخفيّة</p>
              <p className="text-xl font-bold tabular-nums">
                {stats.byVisibility.private + stats.byVisibility.unlisted}
              </p>
            </motion.div>
          </CinematicSection>
        )}

        <CinematicSection delay={0.08}>
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
        </CinematicSection>

        <CinematicSection className="mt-14 border-t border-white/10 pt-10" delay={0.15}>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              ✨
            </span>
            أدوات إضافية
          </h2>
          <p className="text-sm text-white/45 mb-6">
            معمل ضغط الصور واستخراج الصوت بتجربة سلسة وانسيابية في نفس الواجهة.
          </p>
          {showMediaLab ? (
            <MediaLab onToast={showToast} />
          ) : (
            <button
              type="button"
              onClick={() => setShowMediaLab(true)}
              className="btn-secondary"
            >
              تحميل الأدوات الإضافية
            </button>
          )}
        </CinematicSection>
      </div>

      <Toast toasts={toasts} />
    </main>
  );
}
