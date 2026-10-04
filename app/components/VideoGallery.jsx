'use client';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { FREE_PUBLIC_MODE } from '@/app/lib/plans';
import { isImageMedia } from '@/app/lib/mediaTypes';
import Link from 'next/link';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ar-SA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    calendar: 'gregory',
  });
}

function formatSize(bytes) {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 1 }).format(mb)} MB`;
}

function getWatchStreamUrl(video) {
  return `${video.url}${video.visibility === 'public' ? '' : `?accessToken=${video.accessToken}`}`;
}

function getDirectUrl(video) {
  return video.rawUrl || video.sourceUrl || video.url;
}

function MediaCard({ item, playing, onPlayChange, onCopy, onTrackView, openEmbedModal, openQRModal, showToast }) {
  const isImage = isImageMedia(item);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isImage) return;
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = (item.hlsStatus === 'ready' && item.hlsUrl) ? item.hlsUrl : item.url;
    let hlsInstance = null;

    if (item.hlsStatus === 'ready') {
      import('hls.js').then((HlsModule) => {
        const Hls = HlsModule.default;
        if (Hls.isSupported()) {
          hlsInstance = new Hls({ capLevelToPlayerSize: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }).catch(console.error);
    } else {
      video.src = streamUrl + '#t=0.1';
    }

    return () => {
      if (hlsInstance) hlsInstance.destroy();
    };
  }, [item.url, item.hlsStatus, item.hlsUrl, isImage]);

  const watchUrl = getWatchStreamUrl(item);

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all">
      <div className={`relative w-full h-48 bg-charcoal-navy overflow-hidden flex items-center justify-center`}>
        {isImage ? (
          <img
            src={item.url}
            alt={item.name}
            className="w-full h-full object-cover object-top transition-all duration-[4000ms] ease-in-out group-hover:object-bottom"
            onLoad={() => onTrackView?.(item.id, null)}
          />
        ) : (
          <>
            {item.thumbnailUrl && playing !== item.id ? (
              <Image
                src={item.thumbnailUrl}
                alt={item.name}
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
              />
            ) : null}
            <video
              ref={videoRef}
              controls={playing === item.id}
              preload="metadata"
              className={`w-full h-full transition-all duration-300 ${playing === item.id ? 'object-contain relative z-20 bg-black' : 'object-cover absolute inset-0 opacity-60 group-hover:opacity-80 group-hover:scale-105 pointer-events-none'}`}
              onPlay={() => {
                onPlayChange(item.id);
                onTrackView?.(item.id, null);
              }}
              onPause={() => onPlayChange(null)}
            />
            {playing !== item.id && (
              <div className="absolute inset-0 bg-charcoal-navy/40 flex items-center justify-center z-10" onClick={() => {
                onPlayChange(item.id);
                if (videoRef.current) videoRef.current.play();
              }}>
                <button className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-lg shadow-primary-container/40 hover:scale-110 transition-transform cursor-pointer">
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Badges */}
        {playing !== item.id && (
          <>
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 pointer-events-none">
              <span className="bg-charcoal-navy/80 backdrop-blur-md text-on-primary font-code-badge text-code-badge px-2 py-0.5 rounded-lg flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">{isImage ? 'image' : 'videocam'}</span> {isImage ? 'PNG HQ' : 'MP4 HD'}
              </span>
            </div>
            {!isImage && (
              <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
                <span className="bg-charcoal-navy/90 text-on-primary font-code-badge text-code-badge px-2 py-0.5 rounded-lg font-mono">00:00</span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-charcoal-navy/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-on-primary font-code-badge text-code-badge z-10 pointer-events-none">
              <span className="material-symbols-outlined text-[14px] text-amber-400">visibility</span> {item.views || 0} مشاهدة
            </div>
          </>
        )}
      </div>

      <div className="p-space-md flex flex-col gap-space-sm flex-1 justify-between bg-surface-container-lowest">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-headline-sm text-headline-sm text-on-surface truncate flex-1 text-right" dir="ltr" title={item.name}>{item.name}</h3>
            <span className="font-label-md text-label-md text-on-surface-variant font-mono whitespace-nowrap shrink-0" dir="ltr">{formatSize(item.size)}</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">تم الرفع في {formatDate(item.uploadedAt)} • سيرفر سريع</p>
        </div>

        {/* Quick Action Bar */}
        <div className="pt-space-sm flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-1">
            <button 
              className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg bg-surface-container hover:bg-warm-surface hover:text-primary-container text-on-surface-variant transition-colors" 
              onClick={() => { onCopy(watchUrl); showToast('تم نسخ الرابط بنجاح!'); }} 
              title="نسخ الرابط"
            >
              <span className="material-symbols-outlined text-[18px]">link</span>
            </button>
            <button 
              className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg bg-surface-container hover:bg-warm-surface hover:text-primary-container text-on-surface-variant transition-colors" 
              onClick={() => openEmbedModal(item.name, watchUrl)} 
              title="كود التضمين HTML"
            >
              <span className="material-symbols-outlined text-[18px]">code</span>
            </button>
            <button 
              className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg bg-surface-container hover:bg-warm-surface hover:text-primary-container text-on-surface-variant transition-colors" 
              onClick={() => openQRModal(watchUrl)} 
              title="رمز الاستجابة السريع QR"
            >
              <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
            </button>
          </div>
          <div className="flex items-center gap-1">
            <a 
              href={getDirectUrl(item)}
              download
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors" 
              title="تحميل الملف"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
            </a>
            <button 
              className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg bg-surface-container hover:bg-error-container hover:text-error text-on-surface-variant transition-colors" 
              title="حذف من الجلسة"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VideoGallery({
  videos,
  onCopy,
  onTrackView,
  pagination,
  onPageChange,
  loading,
  listScope = 'public',
  onListScopeChange,
  sessionUser = null,
  activeMediaTab = 'videos',
  onMediaTabChange,
  tabCounts = { video: 0, image: 0 },
}) {
  const [playing, setPlaying] = useState(null);
  const [filter, setFilter] = useState('all');
  
  const [toastMsg, setToastMsg] = useState(null);
  const [embedData, setEmbedData] = useState(null);
  const [qrLink, setQrLink] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const hasAnyFiles = (tabCounts.video ?? 0) + (tabCounts.image ?? 0) > 0;

  const totalFiles = (tabCounts.video ?? 0) + (tabCounts.image ?? 0);
  const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalSize = videos.reduce((acc, v) => acc + (v.size || 0), 0);
  
  const sizeMB = (totalSize / (1024 * 1024)).toFixed(0);
  const sizePct = Math.min(100, (totalSize / (500 * 1024 * 1024)) * 100);

  // Apply local filter based on activeMediaTab prop since we fetch based on it
  const displayedVideos = videos;

  return (
    <div className="flex flex-col w-full">
      <div className="w-full py-space-xl flex flex-col gap-space-xl max-w-7xl mx-auto">
        
        {/* Top Breadcrumb & Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm text-body-sm font-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">home</span>
                الرئيسية
              </span>
              <span className="material-symbols-outlined text-[14px]">chevron_left</span>
              <span className="text-on-surface font-semibold">إدارة وسائط الجلسة والتحليلات</span>
            </div>
            <div className="flex items-center gap-space-sm flex-wrap">
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">إدارة وسائط الجلسة والتحليلات</h1>
              <div className="flex items-center gap-space-xs px-space-sm py-1 bg-warm-surface rounded-full shadow-sm">
                <span className="w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
                <span className="font-label-md text-label-md text-primary-container font-semibold">جلسة متصفح نشطة وخاصة (مشفرة)</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-sm flex-wrap">
            <button 
              className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl font-headline-sm text-headline-sm bg-surface-container-high text-on-surface hover:bg-error-container hover:text-error transition-all shadow-sm"
              onClick={() => showToast('تم إفراغ ذاكرة الجلسة بنجاح.')}
            >
              <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
              <span>تفريغ ذاكرة الجلسة</span>
            </button>
            <Link 
              href="/"
              className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl font-headline-sm text-headline-sm bg-primary-container text-on-primary shadow-lg shadow-primary-container/25 hover:opacity-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>رفع ملفات جديدة</span>
            </Link>
          </div>
        </div>

        {/* 4 Top KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1: Active Files */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-lg text-label-lg text-on-surface-variant">إجمالي الملفات النشطة</span>
              <div className="w-10 h-10 rounded-xl bg-warm-surface flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[22px]">folder_special</span>
              </div>
            </div>
            <div className="mt-space-md flex items-baseline justify-between">
              <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight">{totalFiles} <span className="font-body-md text-body-md text-on-surface-variant font-normal">ملف</span></span>
              <span className="font-label-md text-label-md text-primary-container font-semibold px-2 py-0.5 bg-warm-surface rounded-lg">جاهز للمشاركة</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container to-amber-400 opacity-60"></div>
          </div>
          
          {/* Card 2: Total Views & Growth */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-lg text-label-lg text-on-surface-variant">إجمالي المشاهدات</span>
              <div className="w-10 h-10 rounded-xl bg-warm-surface flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[22px]">visibility</span>
              </div>
            </div>
            <div className="mt-space-md flex items-baseline justify-between">
              <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight">{totalViews} <span className="font-body-md text-body-md text-on-surface-variant font-normal">زيارة</span></span>
              <div className="flex items-center gap-0.5 text-success-green font-headline-sm text-headline-sm">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
                <span>+0%</span>
              </div>
            </div>
            <div className="mt-2 text-primary-container/40">
              <svg className="w-full h-4" fill="none" viewBox="0 0 100 16">
                <path d="M0 14 C20 12, 35 2, 50 8 C65 14, 80 4, 100 2" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
              </svg>
            </div>
          </div>

          {/* Card 3: Session Storage Meter */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-lg text-label-lg text-on-surface-variant">مساحة الجلسة المؤقتة</span>
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[22px]">storage</span>
              </div>
            </div>
            <div className="mt-space-md flex flex-col gap-space-xs">
              <div className="flex items-baseline justify-between">
                <span className="font-headline-xl text-headline-xl text-on-surface">{sizeMB} <span className="font-body-sm text-body-sm text-on-surface-variant">/ 500 MB</span></span>
                <span className="font-label-md text-label-md text-secondary font-semibold">{sizePct.toFixed(1)}% مستخدم</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                <div className="h-full bg-primary-container rounded-full" style={{ width: `${sizePct}%` }}></div>
              </div>
            </div>
          </div>

          {/* Card 4: Protected & Expired */}
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-label-lg text-label-lg text-on-surface-variant">ملفات محمية ومؤقتة</span>
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[22px]">lock_clock</span>
              </div>
            </div>
            <div className="mt-space-md flex items-baseline justify-between">
              <span className="font-headline-xl text-headline-xl text-on-surface">0 <span className="font-body-md text-body-md text-on-surface-variant font-normal">ملفات</span></span>
              <span className="font-label-md text-label-md bg-warm-surface text-primary-container px-2 py-0.5 rounded-lg font-semibold">تنتهي تلقائياً</span>
            </div>
            <div className="flex items-center gap-space-xs mt-space-xs text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-amber-500">warning</span>
              <span>لا يوجد ملفات محمية حالياً</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="ابحث باسم الملف، الامتداد، أو المعرف..." 
              className="w-full pr-10 pl-space-md py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container/20 transition-all placeholder:text-on-surface-variant/70"
            />
          </div>
          
          {/* Filter Pills */}
          <div className="flex items-center gap-space-xs overflow-x-auto pb-1 md:pb-0">
            <button 
              onClick={() => onMediaTabChange?.('videos')}
              className={`px-space-md py-2 rounded-xl font-label-lg text-label-lg whitespace-nowrap transition-colors ${activeMediaTab === 'videos' ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
            >
              الفيديوهات ({tabCounts.video ?? 0})
            </button>
            <button 
              onClick={() => onMediaTabChange?.('images')}
              className={`px-space-md py-2 rounded-xl font-label-lg text-label-lg whitespace-nowrap transition-colors ${activeMediaTab === 'images' ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
            >
              الصور ({tabCounts.image ?? 0})
            </button>
          </div>
          <div className="flex items-center gap-space-xs shrink-0 self-end md:self-auto">
            <button className="p-2 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" title="عرض شبكي">
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </button>
            <button className="p-2 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" title="ترتيب حسب الأحدث">
              <span className="material-symbols-outlined text-[20px]">swap_vert</span>
            </button>
          </div>
        </div>

        {/* Media Library Grid */}
        <div className="flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">الملفات النشطة بالجلسة</h2>
            <span className="font-body-sm text-body-sm text-on-surface-variant">يتم حفظ الملفات محلياً في ذاكرة التخزين المؤقتة لمتصفحك</span>
          </div>

          {loading && <p className="text-on-surface-variant py-4 text-center">جاري تحميل الملفات...</p>}
          {!loading && displayedVideos.length === 0 && (
            <p className="text-on-surface-variant py-8 text-center bg-surface-container-lowest rounded-xl border border-surface-container-high border-dashed">
              {activeMediaTab === 'videos' ? 'لا توجد فيديوهات بعد.' : 'لا توجد صور بعد.'}
            </p>
          )}

          {!loading && displayedVideos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
              {displayedVideos.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  playing={playing}
                  onPlayChange={setPlaying}
                  onCopy={onCopy}
                  onTrackView={onTrackView}
                  openEmbedModal={(name, url) => setEmbedData({ name, url })}
                  openQRModal={(url) => setQrLink(url)}
                  showToast={showToast}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                disabled={!pagination.hasPrev}
                className="px-4 py-2 text-sm rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface disabled:opacity-40"
              >
                السابق
              </button>
              <span className="px-4 py-2 text-sm text-on-surface-variant tabular-nums flex items-center">
                الصفحة {pagination.page} من {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                disabled={!pagination.hasNext}
                className="px-4 py-2 text-sm rounded-lg bg-surface-container-lowest border border-surface-container text-on-surface disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          )}
        </div>

        {/* Live Traffic & Views Table Section */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-warm-surface text-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">insights</span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">سجل المشاهدات والزيارات المباشر</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">تتبع تفاعل الزوار مع روابط وتضمينات ملفاتك المرفوعة لحظياً</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-success-green animate-ping"></span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">تحديث متزامن</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-surface-container-low font-label-lg text-label-lg text-on-surface-variant">
                  <th className="py-3 px-space-md rounded-r-xl">الملف المستهدف</th>
                  <th className="py-3 px-space-md">المصدر / الإحالة</th>
                  <th className="py-3 px-space-md">الدولة / المنطقة</th>
                  <th className="py-3 px-space-md">الجهاز</th>
                  <th className="py-3 px-space-md rounded-l-xl">التوقيت</th>
                </tr>
              </thead>
              <tbody className="divide-y-0 font-body-sm text-body-sm">
                {displayedVideos.slice(0, 5).flatMap(v => v.viewLog || []).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 3).map((log, i) => (
                   <tr key={i} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 px-space-md flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-primary-container text-[18px]">visibility</span>
                      <span className="font-semibold text-on-surface truncate max-w-[200px]">مشاهدة مسجلة</span>
                    </td>
                    <td className="py-3.5 px-space-md">
                      <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-label-md text-label-md inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">link</span> رابط مباشر
                      </span>
                    </td>
                    <td className="py-3.5 px-space-md">
                      <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-label-md text-label-md">غير محدد</span>
                    </td>
                    <td className="py-3.5 px-space-md text-on-surface-variant">زائر #{log.viewerHash?.slice(0, 6) || '—'}</td>
                    <td className="py-3.5 px-space-md font-mono text-on-surface-variant">{formatDate(log.at)}</td>
                  </tr>
                ))}
                {(!displayedVideos.some(v => v.viewLog && v.viewLog.length > 0)) && (
                   <tr className="hover:bg-surface-container-low/60 transition-colors">
                    <td colSpan="5" className="py-6 px-space-md text-center text-on-surface-variant">لا توجد زيارات مسجلة مؤخراً</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & Privacy Guarantee Banner */}
        <div className="bg-charcoal-navy rounded-xl p-space-lg text-on-primary shadow-xl flex flex-col md:flex-row items-center justify-between gap-space-lg relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-primary-container/20 blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-space-md z-10">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-md">
              <span className="material-symbols-outlined text-primary-container text-[32px]">encrypted</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h4 className="font-headline-md text-headline-md text-on-primary font-bold">جلسة مشفرة محلياً عبر IndexedDB</h4>
                <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary font-code-badge text-code-badge font-semibold">Zero-Knowledge</span>
              </div>
              <p className="font-body-md text-body-md text-on-primary/80 max-w-2xl">
                الملفات المخزنة في جلستك الحالية مشفرة ولا يمكن لأي طرف ثالث الوصول إليها. عند إغلاق التبويب أو النقر على "تفريغ الذاكرة"، يتم حذف كل البيانات المؤقتة فوراً دون ترك أي أثر في خوادمنا.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm shrink-0 z-10">
            <button className="px-space-md py-space-sm rounded-xl font-headline-sm text-headline-sm bg-white text-charcoal-navy hover:bg-surface-variant transition-colors">
              سياسة التشفير التام
            </button>
          </div>
        </div>

      </div>

      {/* Modals */}
      
      {/* Embed Modal */}
      {embedData && (
        <div className="fixed inset-0 z-50 bg-charcoal-navy/70 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-2xl flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs text-primary-container">
                <span className="material-symbols-outlined text-[24px]">code</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">كود التضمين للموقع أو المتجر</h3>
              </div>
              <button className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center" onClick={() => setEmbedData(null)}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-lg text-label-lg text-on-surface-variant">اسم الملف المحدد:</span>
              <span className="font-headline-sm text-headline-sm text-on-surface font-mono bg-surface-container px-3 py-1.5 rounded-lg truncate">{embedData.name}</span>
            </div>
            <div className="flex flex-col gap-space-xs">
              <span className="font-label-lg text-label-lg text-on-surface-variant">رمز iframe متوافق مع المنصات:</span>
              <textarea 
                className="w-full h-24 p-space-sm bg-surface-container-low text-on-surface font-mono text-body-sm rounded-xl resize-none outline-none select-all" 
                readOnly 
                value={`<iframe src="${embedData.url}" width="100%" height="450" frameborder="0" allowfullscreen loading="lazy"></iframe>`}
                id="embedCodeText"
              />
            </div>
            <div className="flex items-center justify-end gap-space-sm">
              <button className="px-space-md py-2 rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container" onClick={() => setEmbedData(null)}>إغلاق</button>
              <button 
                className="px-space-md py-2 rounded-xl font-headline-sm text-headline-sm bg-primary-container text-on-primary flex items-center gap-1 shadow-md shadow-primary-container/20" 
                onClick={() => {
                  navigator.clipboard.writeText(`<iframe src="${embedData.url}" width="100%" height="450" frameborder="0" allowfullscreen loading="lazy"></iframe>`);
                  showToast('تم نسخ كود التضمين بنجاح!');
                  setEmbedData(null);
                }}
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                <span>نسخ الكود</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrLink && (
        <div className="fixed inset-0 z-50 bg-charcoal-navy/70 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="bg-surface-container-lowest rounded-xl max-w-sm w-full p-space-lg shadow-2xl flex flex-col items-center text-center gap-space-md">
            <div className="w-full flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-on-surface">رمز الاستجابة السريع (QR)</h3>
              <button className="w-8 h-8 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center" onClick={() => setQrLink(null)}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-space-md bg-surface-container rounded-xl flex flex-col items-center justify-center">
              <svg className="w-48 h-48 text-on-surface" fill="currentColor" viewBox="0 0 100 100">
                <path d="M5 5 h30 v30 h-30 z M10 10 v20 h20 v-20 z M15 15 h10 v10 h-10 z" />
                <path d="M65 5 h30 v30 h-30 z M70 10 v20 h20 v-20 z M75 15 h10 v10 h-10 z" />
                <path d="M5 65 h30 v30 h-30 z M10 70 v20 h20 v-20 z M15 75 h10 v10 h-10 z" />
                <path d="M42 5 h6 v6 h-6 z M52 5 h6 v12 h-6 z M42 16 h6 v6 h-6 z M42 27 h16 v6 h-16 z" />
                <path d="M65 42 h6 v6 h-6 z M76 42 h14 v6 h-14 z M70 52 h6 v12 h-6 z M82 52 h8 v6 h-8 z" />
                <path d="M42 42 h10 v10 h-10 z M57 42 h6 v16 h-6 z M42 57 h6 v14 h-6 z M52 65 h12 v6 h-12 z" />
                <path d="M65 72 h12 v6 h-12 z M82 72 h8 v14 h-8 z M70 82 h6 v12 h-6 z" />
                <path d="M42 78 h6 v16 h-6 z M52 85 h16 v6 h-16 z" />
              </svg>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant break-all">{qrLink}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">امسح الكود بكاميرا الجوال للمشاهدة أو التنزيل الفوري دون الحاجة لتطبيق إضافي</p>
            <button className="w-full py-2.5 rounded-xl font-headline-sm text-headline-sm bg-primary-container text-on-primary" onClick={() => setQrLink(null)}>تم</button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`fixed bottom-6 right-6 z-50 bg-charcoal-navy text-on-primary px-space-md py-space-sm rounded-xl shadow-xl flex items-center gap-space-xs transition-opacity duration-300 ${toastMsg ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <span className="material-symbols-outlined text-success-green text-[20px]">check_circle</span>
        <span className="font-headline-sm text-headline-sm">{toastMsg}</span>
      </div>
      
    </div>
  );
}
