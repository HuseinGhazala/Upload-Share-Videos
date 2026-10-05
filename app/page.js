'use client';
import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import VideoUpload from './components/VideoUpload';
import { useVideoUpload } from './hooks/useVideoUpload';
import { useAuth } from './providers/AuthProvider';
import MobileHome from './components/MobileHome';
import Footer from './components/Footer';
import { MAX_VIDEO_BYTES_PER_UPLOAD } from '@/app/lib/plans';
import { getAttributionFromLocation, trackFunnelEvent } from '@/app/lib/analytics/funnel';

const MediaLab = dynamic(() => import('./components/MediaLab'), {
  loading: () => (
    <div className="rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant flex justify-center items-center h-64">
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
              ? 'bg-success-green/20 border-success-green/40 text-success-green'
              : 'bg-error-container border-error/40 text-error'}`}
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
    error,
    uploadedVideos,
    stats,
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
      {/* Mobile Layout (Visible only on mobile devices) */}
      <MobileHome 
        onUploadClick={() => document.getElementById('desktop-upload-btn')?.click()} 
        uploadedVideos={uploadedVideos} 
        progress={progress} 
        loading={loading} 
      />

      {/* Desktop Layout (Hidden on mobile) */}
      <div className="hidden md:block">
        <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(14,19,44,0.06)]">
        <div className="h-16 w-full px-gutter flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-sm">
              <img alt="Themiify Official Logo" className="h-8 w-auto object-contain rounded-lg" src="/logo.png" />
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">Themiify <span className="text-primary-container">Videos</span></span>
            </div>
            <div className="hidden xl:flex items-center gap-space-xs bg-warm-surface px-space-sm py-space-xs rounded-xl shadow-[0_1px_4px_rgba(255,94,30,0.1)]">
              <span className="material-symbols-outlined text-primary-container text-[18px]">verified</span>
              <span className="font-label-md text-label-md text-primary-container font-semibold">مجاني للجميع — بدون تسجيل ولا حساب</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-space-sm">
            <Link href="/" className="px-space-md py-space-xs transition-colors bg-surface-container text-on-surface font-semibold rounded-xl">الرئيسية والرفع</Link>
            <Link href="/dashboard" className="px-space-md py-space-xs rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">إدارة المرفوعات والمكتبة</Link>
            <Link href="/tools" className="px-space-md py-space-xs rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">أدوات الميديا</Link>
          </nav>
          <div className="flex items-center gap-space-md">
            <a href="#upload-zone" className="inline-flex items-center gap-space-xs bg-primary-container text-on-primary hover:bg-primary font-headline-sm text-headline-sm px-space-md py-space-xs rounded-xl shadow-[0_8px_24px_-4px_rgba(255,94,30,0.35)] transition-all">
              <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
              <span>ارفع ملفاً الآن</span>
            </a>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 bg-surface min-h-[calc(100vh-16rem)]">
        <div className="flex flex-col w-full">
          <div className="relative w-full overflow-hidden">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute top-72 left-1/6 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
            
            <section className="w-full px-gutter pt-space-lg pb-space-md">
              <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-space-md bg-warm-surface p-space-md rounded-xl shadow-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center shadow-sm">
                    <img alt="Themiify Official Logo" className="w-7 h-7 object-contain rounded-md" src="/logo.png" />
                  </div>
                  <div>
                    <div className="flex items-center gap-space-xs">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                      <span className="font-headline-sm text-headline-sm text-on-surface">خدمة الاستضافة السحابية الفورية من Themiify</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">رفع وسائطك التقنية وإدارتها بدون حساب، آمنة ومحمية بالكامل بتكنولوجيا مشفرة</p>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-lg shadow-sm">
                  <span className="material-symbols-outlined text-primary-container text-[20px]">bolt</span>
                  <span className="font-label-md text-label-md text-primary-container font-bold">جاهز للإرسال الفوري • بدون قيود</span>
                </div>
              </div>
            </section>

            <section className="w-full px-gutter py-space-xl text-center">
              <div className="max-w-4xl mx-auto flex flex-col items-center">
                <div className="inline-flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-sm mb-space-md">
                  <span className="material-symbols-outlined text-primary-container text-[18px]">verified</span>
                  <span className="font-label-lg text-label-lg text-on-surface font-semibold">✨ مجاني للجميع — بدون تسجيل ولا حساب</span>
                </div>
                <h1 className="font-display-hero text-display-hero text-on-surface mb-space-md tracking-tight">
                  ارفع فيديوهاتك وصورك <span className="text-primary-container">مجاناً وفوراً</span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-space-lg">
                  ارفع فيديوهات وصور مباشرة دون تسجيل. ملفاتك خاصة بك فقط — لا يراها زوار آخرون، ولا تظهر أي مكتبة عند فتح الموقع، بأعلى سرعة نقل سحابية.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-space-sm mb-space-xl">
                  <div className="inline-flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-primary-container text-[18px]">lock_open</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">بدون تسجيل دخول</span>
                  </div>
                  <div className="inline-flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-primary-container text-[18px]">movie</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">فيديو وصور حتى 50MB</span>
                  </div>
                  <div className="inline-flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-primary-container text-[18px]">shield</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">ملفاتك خاصة بك 100%</span>
                  </div>
                  <div className="inline-flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-lg shadow-sm">
                    <span className="material-symbols-outlined text-primary-container text-[18px]">share</span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">روابط مشاركة آمنة وسريعة</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="w-full px-gutter pb-space-2xl">
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-space-lg">
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-space-md">
                    <span className="font-headline-xl text-headline-xl text-primary-container/20">01</span>
                    <div className="w-10 h-10 rounded-lg bg-warm-surface flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-container text-[22px]">touch_app</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-space-xs">١. اختر ملفك</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      اسحب فيديو أو صورة وأفلِته في منطقة الرفع، أو انقر للاختيار من جهازك فوراً.
                    </p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-space-md">
                    <span className="font-headline-xl text-headline-xl text-primary-container/20">02</span>
                    <div className="w-10 h-10 rounded-lg bg-warm-surface flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-container text-[22px]">security</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-space-xs">٢. ارفع الملف</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      يُحفظ الملف في جلسة متصفّحك فقط — لن يراه أي زائر آخر على الموقع على الإطلاق.
                    </p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-space-md">
                    <span className="font-headline-xl text-headline-xl text-primary-container/20">03</span>
                    <div className="w-10 h-10 rounded-lg bg-warm-surface flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-container text-[22px]">link</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-space-xs">٣. شارك الرابط</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      انسخ رابط المشاركة لإرساله لمن تريد — بدون رابط لن يستطيع أحد مشاهدة الملف.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="upload-zone" className="w-full px-gutter pb-space-2xl scroll-mt-24">
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
                stats={stats}
              />
            </section>

            <section className="w-full px-gutter pb-space-2xl">
              <div className="max-w-6xl mx-auto bg-charcoal-navy text-on-primary rounded-xl p-space-xl relative overflow-hidden shadow-xl">
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary-container/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -left-20 -top-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center relative z-10">
                  <div className="lg:col-span-7 flex flex-col gap-space-md">
                    <div className="inline-flex items-center gap-space-xs bg-white/10 px-space-md py-space-xs rounded-full w-fit">
                      <span className="material-symbols-outlined text-primary-container text-[18px]">verified</span>
                      <span className="font-label-md text-label-md text-white font-semibold">بنية تحتية لمتاجر Themiify و زد وسلة</span>
                    </div>
                    <h2 className="font-headline-xl text-headline-xl text-white font-bold leading-tight">
                      أسرع مشغل فيديو مدمج لصفحات الهبوط وزيادة المبيعات
                    </h2>
                    <p className="font-body-md text-body-md text-gray-300">
                      ارفع مقاطع الريلز، تجارب العملاء وفيديوهات استعراض المنتجات بدون أن تبطئ متجرك الإلكتروني ثانية واحدة. تخلص من إعلانات يوتيوب الخارجية واستمتع بروابط استضافة نقية 100%.
                    </p>
                    <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                      <Link href="/tools" className="inline-flex items-center gap-space-xs bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-headline-sm px-space-lg py-space-sm rounded-xl shadow-[0_8px_24px_-4px_rgba(255,94,30,0.35)] transition-all">
                        <span className="material-symbols-outlined text-[20px]">construction</span>
                        <span>استكشف أدوات الميديا الذكية</span>
                      </Link>
                      <a href="https://themiify.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-space-xs bg-white/10 hover:bg-white/20 text-white font-headline-sm text-headline-sm px-space-lg py-space-sm rounded-xl transition-all">
                        <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                        <span>خدمات تصميم المتاجر Themiify</span>
                      </a>
                    </div>
                  </div>
                  <div className="lg:col-span-5 bg-white/5 rounded-xl p-space-md backdrop-blur-md">
                    <div className="flex items-center justify-between mb-space-sm">
                      <div className="flex items-center gap-space-xs">
                        <span className="w-3 h-3 rounded-full bg-error"></span>
                        <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                        <span className="w-3 h-3 rounded-full bg-success-green"></span>
                      </div>
                      <span className="font-code-badge text-code-badge text-gray-400">Themiify Video Embed Code</span>
                    </div>
                    <div className="bg-black/40 rounded-lg p-space-sm font-code-badge text-code-badge text-gray-300 overflow-x-auto text-left" dir="ltr">
                      <span className="text-primary-container">&lt;iframe</span><br />
                      &nbsp;&nbsp;src=<span className="text-success-green">"https://videos.themiify.com/v/921a8b"</span><br />
                      &nbsp;&nbsp;width=<span className="text-primary-container">"100%"</span><br />
                      &nbsp;&nbsp;loading=<span className="text-success-green">"lazy"</span><br />
                      &nbsp;&nbsp;allow=<span className="text-success-green">"autoplay; fullscreen"</span><br />
                      <span className="text-primary-container">&gt;&lt;/iframe&gt;</span>
                    </div>
                    <div className="mt-space-md flex items-center justify-between text-gray-300 font-label-md text-label-md">
                      <span className="flex items-center gap-space-xs text-success-green">
                        <span className="material-symbols-outlined text-[16px]">speed</span>
                        <span>تحميل فوري 0.04s CDN</span>
                      </span>
                      <span className="text-primary-container font-semibold">جاهز للنسخ المباشر</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>


          </div>
        </div>
      </main>

        <Footer />
      </div>
      <Toast toasts={toasts} />
    </>
  );
}
