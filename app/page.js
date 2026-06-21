'use client';
import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
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
      جاري تحميل الأدوات الإضافية…
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
    activeMediaTab,
    setActiveMediaTab,
    tabCounts,
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
      .then(() => showToast('تم نسخ الرابط إلى الحافظة بنجاح', 'success'))
      .catch(() => showToast('تعذّر نسخ الرابط، حاول مرة أخرى.', 'error'));
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
              ✨
            </span>
            مجاني للجميع — بدون تسجيل ولا حساب
          </div>
          <h1 className="headline-display bg-gradient-to-b from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
            ارفع فيديوهاتك وصورك مجاناً
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            ارفع فيديوهات وصور مباشرة دون تسجيل. ملفاتك خاصة بك فقط — لا يراها زوار آخرون، ولا تظهر أي مكتبة عند فتح الموقع.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href="#upload-zone" className="btn-primary">
              ابدأ الرفع الآن
            </a>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="chip">بدون تسجيل دخول</span>
            <span className="chip">فيديو وصور</span>
            <span className="chip">ملفاتك خاصة بك</span>
            <span className="chip">روابط مشاركة آمنة</span>
          </div>
        </CinematicSection>

        <CinematicSection className="mb-10 grid gap-4 sm:grid-cols-3" delay={0.1}>
          <CinematicCard className="p-5 text-sm">
            <p className="text-emerald-200 font-semibold mb-2">١. اختر ملفك</p>
            <p className="text-white/60">اسحب فيديو أو صورة وأفلِته في منطقة الرفع، أو انقر للاختيار من جهازك.</p>
          </CinematicCard>
          <CinematicCard className="p-5 text-sm">
            <p className="text-indigo-200 font-semibold mb-2">٢. ارفع الملف</p>
            <p className="text-white/60">يُحفظ الملف في جلسة متصفّحك فقط — لن يراه أي زائر آخر على الموقع.</p>
          </CinematicCard>
          <CinematicCard className="p-5 text-sm">
            <p className="text-amber-200 font-semibold mb-2">٣. شارك الرابط</p>
            <p className="text-white/60">انسخ رابط المشاركة لإرساله لمن تريد — بدون رابط لن يستطيع أحد مشاهدة الملف.</p>
          </CinematicCard>
        </CinematicSection>

        <CinematicSection delay={0.1}>
          <div id="upload-zone" className="glass-panel p-6 sm:p-8 scroll-mt-24">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">منطقة الرفع المجانية</h2>
              <span className="chip">حتى ٥٠ ميجابايت لكل ملف</span>
            </div>
            <p className="text-sm text-white/60 mb-5">
              ارفع فيديوهات وصور مباشرة بدون تسجيل، مع شريط تقدّم مباشر وروابط مشاركة آمنة.
            </p>
          <VideoUpload
            onUpload={upload}
            loading={loading}
            progress={progress}
            error={error}
            onToast={showToast}
            onCopy={handleCopy}
            isLoggedIn={Boolean(user)}
            canUpload={Boolean(user) && Boolean(quota?.uploadAllowed)}
            maxUploadBytes={quota?.maxUploadBytes ?? MAX_VIDEO_BYTES_PER_UPLOAD}
          />
          </div>
        </CinematicSection>

        {stats && stats.totalVideos > 0 && (
          <CinematicSection className="mt-6 space-y-4" delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <motion.div whileHover={{ y: -2 }} className="glass-panel p-4 rounded-xl border">
                <p className="text-xs text-white/50">إجمالي الملفات</p>
                <p className="text-xl font-bold tabular-nums">{stats.totalVideos}</p>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} className="glass-panel p-4 rounded-xl border">
                <p className="text-xs text-white/50">فيديو / صورة</p>
                <p className="text-xl font-bold tabular-nums">
                  {stats.totalVideoFiles ?? 0} / {stats.totalImageFiles ?? 0}
                </p>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} className="glass-panel p-4 rounded-xl border">
                <p className="text-xs text-white/50">إجمالي المشاهدات</p>
                <p className="text-xl font-bold tabular-nums">{stats.totalViews}</p>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} className="glass-panel p-4 rounded-xl border">
                <p className="text-xs text-white/50">خاصة وغير مُدرَجة</p>
                <p className="text-xl font-bold tabular-nums">
                  {stats.byVisibility.private + stats.byVisibility.unlisted}
                </p>
              </motion.div>
            </div>
            {Array.isArray(stats.recentViews) && stats.recentViews.length > 0 && (
              <div className="glass-panel p-4 rounded-xl border">
                <p className="text-xs text-white/50 mb-3">آخر المشاهدات</p>
                <ul className="space-y-2 text-sm">
                  {stats.recentViews.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3 text-white/70">
                      <span className="truncate">
                        {item.mediaKind === 'image' ? '🖼️' : '🎬'} {item.name}
                      </span>
                      <span className="text-white/40 text-xs shrink-0 tabular-nums">
                        {item.views} ·{' '}
                        {new Date(item.lastViewedAt).toLocaleString('ar-SA', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
            activeMediaTab={activeMediaTab}
            onMediaTabChange={setActiveMediaTab}
            tabCounts={tabCounts}
          />
        </CinematicSection>

        <CinematicSection className="mt-14 border-t border-white/10 pt-10" delay={0.15}>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              ✨
            </span>
            أدوات مساعدة
          </h2>
          <p className="text-sm text-white/45 mb-6">
            ضغط الصور واستخراج الصوت من الفيديو ضمن نفس الواجهة، بسرعة وبضغطة واحدة.
          </p>
          {showMediaLab ? (
            <MediaLab onToast={showToast} onCopy={handleCopy} onUploaded={() => setPage(1)} />
          ) : (
            <button
              type="button"
              onClick={() => setShowMediaLab(true)}
              className="btn-secondary"
            >
              فتح الأدوات المساعدة
            </button>
          )}
        </CinematicSection>
      </div>

      <Toast toasts={toasts} />
    </main>
  );
}
