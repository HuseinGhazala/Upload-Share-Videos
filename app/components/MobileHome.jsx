import React from 'react';
import Link from 'next/link';
import { useAuth } from '../providers/AuthProvider';
import { useVideoUpload } from '../hooks/useVideoUpload';

export default function MobileHome({ 
  onUploadClick, 
  uploadedVideos, 
  progress, 
  loading 
}) {
  const { user } = useAuth();
  const latestVideo = uploadedVideos && uploadedVideos.length > 0 ? uploadedVideos[0] : null;
  const embedUrl = latestVideo ? `cdn.themiify.com${latestVideo.url}` : `cdn.themiify.com/v/991a`;
  
  return (
    <div className="flex flex-col min-h-screen bg-surface font-body-md text-body-md text-charcoal-navy md:hidden" dir="rtl">
      {/* Mobile Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
        <div className="h-16 px-gutter-mobile flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <img alt="Brand logo" className="h-8 w-auto object-contain rounded-lg" src="/logo.png" />
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-sm text-headline-sm text-charcoal-navy tracking-tight font-bold">Themiify</span>
                <span className="font-label-md text-[10px] bg-warm-surface text-electric-citrus px-1 py-0.5 rounded-md font-semibold">مجاني 100%</span>
              </div>
              <span className="text-[10px] leading-tight text-on-surface-variant font-label-md">Home Upload</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <button aria-label="الإشعارات" className="w-10 h-10 flex items-center justify-center text-charcoal-navy rounded-xl hover:bg-warm-surface active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_8px_rgba(255,94,30,0.25)]">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Main Content */}
      <main className="flex-1 flex flex-col relative w-full pt-20 pb-24 bg-surface">
        <div className="flex flex-col w-full px-gutter-mobile gap-space-lg select-none pb-12">
          
          {/* 1. Top Promo Announcement Pill */}
          <div className="flex items-center gap-space-sm p-space-xs pr-space-sm bg-warm-surface rounded-full shadow-[0_2px_8px_rgba(255,94,30,0.06)]">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-electric-citrus text-on-primary shrink-0 shadow-[0_2px_6px_rgba(255,94,30,0.3)]">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
            </span>
            <p className="font-label-md text-[11px] text-charcoal-navy truncate font-bold flex-1">
              استضافة فورية وسريعة • خصوصية مشفرة 100%
            </p>
            <span className="font-code-badge text-[10px] bg-surface-container-lowest text-electric-citrus px-2 py-1 rounded-full font-bold shrink-0">
              مجاني فوراً
            </span>
          </div>

          {/* 2. Hero Mobile Header */}
          <div className="flex flex-col gap-space-xs text-right mt-2">
            <div className="inline-flex items-center gap-1.5 self-start bg-surface-container-high px-space-sm py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-electric-citrus animate-ping"></span>
              <span className="font-label-md text-xs text-on-primary-fixed-variant font-semibold">Themiify Cloud v2.4</span>
            </div>
            <h1 className="font-headline-xl-mobile text-3xl text-charcoal-navy leading-tight tracking-tight mt-2 font-bold">
              ارفع فيديوهاتك وصورك <br/>
              <span className="text-electric-citrus relative inline-block mt-1">
                مجاناً وفوراً
                <span className="absolute bottom-1 left-0 right-0 h-2 bg-warm-surface -z-10 rounded-full"></span>
              </span>
            </h1>
            <p className="font-body-md text-sm text-secondary leading-relaxed mt-2">
              بدون حساب أو تسجيل مسبق. وسائطك تُعالج محلياً بأمان، ولا تظهر لمحركات البحث أو لزوار آخرين إلا برابطك الخاص.
            </p>
            
            {/* Mini Feature Pills Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="flex items-center gap-1.5 p-2 bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/20">
                <span className="material-symbols-outlined text-electric-citrus text-[16px]">verified_user</span>
                <span className="font-label-md text-[11px] font-bold text-charcoal-navy">بدون تسجيل دخول</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/20">
                <span className="material-symbols-outlined text-electric-citrus text-[16px]">video_file</span>
                <span className="font-label-md text-[11px] font-bold text-charcoal-navy">حتى 50MB للملف</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/20">
                <span className="material-symbols-outlined text-electric-citrus text-[16px]">lock</span>
                <span className="font-label-md text-[11px] font-bold text-charcoal-navy">خصوصية تامة 100%</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/20">
                <span className="material-symbols-outlined text-electric-citrus text-[16px]">share</span>
                <span className="font-label-md text-[11px] font-bold text-charcoal-navy">روابط مسرّعة</span>
              </div>
            </div>
          </div>

          {/* 3. 3-Step Flow (Compact Horizontal Stack) */}
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-sm font-bold text-charcoal-navy">كيف يعمل في 3 ثوانٍ؟</span>
              <span className="font-label-md text-xs text-secondary font-medium">آمن وتلقائي</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-gutter-mobile px-gutter-mobile snap-x">
              <div className="snap-start flex-none w-[160px] p-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-lg font-bold text-electric-citrus">01</span>
                  <span className="material-symbols-outlined text-secondary text-[20px]">touch_app</span>
                </div>
                <p className="font-label-lg text-sm text-charcoal-navy font-bold mt-1">اختر ملفك</p>
                <p className="font-body-sm text-[11px] text-secondary leading-snug">اسحب أو انقر للاختيار مباشرة من المعرض</p>
              </div>
              <div className="snap-start flex-none w-[160px] p-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-lg font-bold text-electric-citrus">02</span>
                  <span className="material-symbols-outlined text-secondary text-[20px]">cloud_sync</span>
                </div>
                <p className="font-label-lg text-sm text-charcoal-navy font-bold mt-1">ارفع بأمان</p>
                <p className="font-body-sm text-[11px] text-secondary leading-snug">يُحفظ في مفتاح جلستك المشفر فوراً</p>
              </div>
              <div className="snap-start flex-none w-[160px] p-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-lg font-bold text-electric-citrus">03</span>
                  <span className="material-symbols-outlined text-secondary text-[20px]">link</span>
                </div>
                <p className="font-label-lg text-sm text-charcoal-navy font-bold mt-1">شارك الكود</p>
                <p className="font-body-sm text-[11px] text-secondary leading-snug">انسخ الرابط المباشر أو وسم التضمين</p>
              </div>
            </div>
          </div>

          {/* 4. Mobile Upload Zone */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[32px] p-5 shadow-lg shadow-primary/5 flex flex-col gap-4 relative overflow-hidden mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success-green animate-pulse shadow-[0_0_8px_#10B981]"></span>
                <span className="font-headline-sm text-sm font-bold text-charcoal-navy">مركز الرفع المباشر</span>
              </div>
              <span className="font-code-badge text-[10px] font-bold bg-warm-surface text-electric-citrus px-2 py-1 rounded-md">
                حد أقصى 50MB
              </span>
            </div>
            
            {/* Live Upload Quick Stats Counter */}
            <div className="grid grid-cols-3 gap-2 bg-warm-surface/70 p-2.5 rounded-xl text-center">
              <div className="flex flex-col">
                <span className="font-label-md text-[10px] text-secondary">الملفات</span>
                <span className="font-headline-sm text-sm font-bold text-charcoal-navy">{uploadedVideos?.length || 0} جاهزة</span>
              </div>
              <div className="flex flex-col border-r border-l border-outline-variant/20">
                <span className="font-label-md text-[10px] text-secondary">المعالجة</span>
                <span className="font-headline-sm text-sm font-bold text-electric-citrus">{loading ? progress + '%' : '100%'}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-[10px] text-secondary">السرعة</span>
                <span className="font-headline-sm text-sm font-bold text-charcoal-navy">1.4 MB/s</span>
              </div>
            </div>

            {/* Interactive Dropzone */}
            <div 
              className="relative group bg-surface-container-low hover:bg-warm-surface/60 transition-colors p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 cursor-pointer shadow-inner border border-dashed border-primary/20" 
              onClick={onUploadClick}
            >
              <div className="w-16 h-16 rounded-full bg-electric-citrus/10 flex items-center justify-center text-electric-citrus shadow-[0_4px_16px_rgba(255,94,30,0.2)] group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-headline-sm text-sm font-bold text-charcoal-navy">
                  انقر لاختيار الفيديوهات أو الصور
                </p>
                <p className="font-body-sm text-xs text-secondary">
                  أو اسحب الملفات إلى هنا مباشرة (حتى 10 ملفات)
                </p>
              </div>
              
              <div className="flex items-center justify-center flex-wrap gap-1.5 pt-2">
                <span className="font-code-badge text-[10px] px-1.5 py-0.5 bg-surface-container-lowest text-secondary rounded shadow-sm">MP4</span>
                <span className="font-code-badge text-[10px] px-1.5 py-0.5 bg-surface-container-lowest text-secondary rounded shadow-sm">MOV</span>
                <span className="font-code-badge text-[10px] px-1.5 py-0.5 bg-surface-container-lowest text-secondary rounded shadow-sm">WEBM</span>
                <span className="font-code-badge text-[10px] px-1.5 py-0.5 bg-surface-container-lowest text-secondary rounded shadow-sm">PNG</span>
                <span className="font-code-badge text-[10px] px-1.5 py-0.5 bg-surface-container-lowest text-secondary rounded shadow-sm">JPG</span>
              </div>
            </div>
            
            <button 
              className="w-full min-h-[48px] bg-electric-citrus text-white font-headline-sm text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(255,94,30,0.35)] active:scale-95 transition-all mt-1" 
              onClick={onUploadClick}
            >
              <span className="material-symbols-outlined text-[22px]">folder_open</span>
              <span>تصفح الملفات</span>
            </button>
          </div>

          {/* Embed Player Teaser */}
          <div className="bg-[#0E132C] text-white rounded-[24px] p-5 shadow-xl flex flex-col gap-4 relative overflow-hidden mt-4">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/30 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-start justify-between z-10">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                  <span className="material-symbols-outlined text-[22px]">storefront</span>
                </span>
                <div className="flex flex-col">
                  <span className="font-headline-sm text-sm font-bold">تضمين لمتجر سلة وزد</span>
                  <span className="font-label-md text-xs text-gray-400">مشغل فائق السرعة بدون بطء</span>
                </div>
              </div>
              <span className="font-code-badge text-[10px] bg-white/10 text-primary-fixed-dim px-2 py-1 rounded font-bold">CDN 0.04s</span>
            </div>
            
            <div className="bg-black/30 p-3 rounded-xl flex items-center justify-between font-mono text-[10px] text-gray-300 z-10 border border-white/5" dir="ltr">
              <div className="truncate flex-1 pr-2">
                &lt;themiify-player src="{embedUrl}" autoplay&gt;&lt;/themiify-player&gt;
              </div>
              <button 
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(`<themiify-player src="${embedUrl}" autoplay></themiify-player>`);
                  alert('تم نسخ الكود!');
                }}
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
              </button>
            </div>
          </div>

          {/* Quick Tools Link Banner */}
          <Link href="/tools" className="p-4 bg-warm-surface border border-outline-variant/30 rounded-[24px] shadow-sm flex items-center justify-between hover:bg-warm-surface/80 active:scale-[0.99] transition-all mt-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-container-lowest text-electric-citrus flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[24px]">construction</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-sm font-bold text-charcoal-navy">أدوات تحرير الوسائط الذكية</span>
                <span className="font-body-sm text-[11px] text-secondary">ضغط الصور، استخراج الصوت، رمز QR</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-electric-citrus text-[22px] bg-white rounded-full p-1 shadow-sm">arrow_back</span>
          </Link>
        </div>
      </main>

    </div>
  );
}
