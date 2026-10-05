import React from 'react';
import Link from 'next/link';

export default function MobileDashboard({ uploadedVideos = [], loading = false }) {
  const totalStorage = 50 * 1024 * 1024; // 50MB
  const usedStorage = uploadedVideos.reduce((acc, curr) => acc + (curr.size || 0), 0);
  const usedPercentage = Math.min(100, (usedStorage / totalStorage) * 100).toFixed(1);
  const usedMB = (usedStorage / (1024 * 1024)).toFixed(1);
  const totalViews = uploadedVideos.reduce((acc, curr) => acc + (curr.views || 0), 0);
  
  return (
    <div className="flex flex-col min-h-screen bg-surface font-body-md text-body-md text-charcoal-navy md:hidden" dir="rtl">
      {/* Header */}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-24 bg-surface">
        <div className="flex flex-col w-full pb-10">
          
          {/* Overview & Storage Card */}
          <div className="px-gutter-mobile pt-space-md">
            <div className="bg-surface-container-lowest rounded-[32px] p-5 shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-warm-surface flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-electric-citrus text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_done</span>
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <h1 className="font-headline-sm text-base font-bold text-charcoal-navy truncate">مكتبة وسائطك والتحليلات</h1>
                    <p className="font-body-sm text-xs text-on-surface-variant truncate">إدارة الملفات وروابط CDN السريعة</p>
                  </div>
                </div>
                <span className="font-code-badge text-[10px] bg-warm-surface text-electric-citrus px-2 py-1 rounded-lg shrink-0 font-bold">
                  37% مستخدم
                </span>
              </div>
              
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center justify-between font-label-md text-xs">
                  <span className="text-charcoal-navy font-bold">{usedMB} MB من أصل 50 MB مجاناً</span>
                  <span className="text-on-surface-variant">متبقي {(50 - parseFloat(usedMB)).toFixed(1)} MB</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden flex">
                  <div className="h-full bg-electric-citrus rounded-full shadow-[0_0_8px_rgba(255,94,30,0.4)]" style={{ width: `${usedPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Stats Grid */}
          <div className="px-gutter-mobile mt-4">
            <div className="grid grid-cols-3 gap-2">
              
              {/* Total Views */}
              <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-warm-surface flex items-center justify-center">
                    <span className="material-symbols-outlined text-electric-citrus text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
                  </div>
                  <span className="font-code-badge text-[10px] text-success-green font-bold bg-success-green/10 px-1.5 py-0.5 rounded">+28%</span>
                </div>
                <div className="mt-2">
                  <span className="font-headline-sm text-lg font-bold text-charcoal-navy block leading-tight">{totalViews || 0}</span>
                  <span className="font-label-md text-[10px] text-on-surface-variant leading-none truncate block mt-0.5">المشاهدات</span>
                </div>
                <div className="mt-2 h-5 w-full flex items-end">
                  <svg className="w-full h-4 text-electric-citrus" fill="none" preserveAspectRatio="none" viewBox="0 0 40 16">
                    <path d="M0 13 Q 8 10, 16 12 T 28 6 T 40 2" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
                  </svg>
                </div>
              </div>
              
              {/* Bandwidth Saved */}
              <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-charcoal-navy text-[16px]">compress</span>
                  </div>
                  <span className="font-code-badge text-[10px] text-electric-citrus font-bold bg-warm-surface px-1.5 py-0.5 rounded">H.265</span>
                </div>
                <div className="mt-2">
                  <span className="font-headline-sm text-lg font-bold text-charcoal-navy block leading-tight">142 MB</span>
                  <span className="font-label-md text-[10px] text-on-surface-variant leading-none truncate block mt-0.5">بيانات وفرتها</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-on-surface-variant font-code-badge font-bold">
                  <span className="material-symbols-outlined text-success-green text-[14px]">eco</span>
                  <span>تقليل 84%</span>
                </div>
              </div>
              
              {/* CDN Latency */}
              <div className="bg-charcoal-navy rounded-2xl p-3 shadow-sm flex flex-col justify-between text-on-primary">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-surface-container-lowest/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-electric-citrus text-[16px]">bolt</span>
                  </div>
                  <span className="font-code-badge text-[10px] text-electric-citrus font-bold bg-black/20 px-1.5 py-0.5 rounded">CDN</span>
                </div>
                <div className="mt-2">
                  <span className="font-headline-sm text-lg font-bold text-on-primary block leading-tight">0.04s</span>
                  <span className="font-label-md text-[10px] text-surface-variant leading-none truncate block mt-0.5">سرعة التغذية</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-surface-container-high font-code-badge font-bold">
                  <span className="w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
                  <span>سلة &amp; زد</span>
                </div>
              </div>
              
            </div>
          </div>

          {/* Search & Sorting Toolbar */}
          <div className="px-gutter-mobile mt-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex items-center px-3 h-12 shadow-sm">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] ml-2">search</span>
                <input className="w-full bg-transparent font-body-sm text-sm text-charcoal-navy placeholder:text-on-surface-variant focus:outline-none" placeholder="ابحث باسم المقطع أو الوسم..." type="text" />
              </div>
              <button aria-label="ترتيب حسب" className="w-12 h-12 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center text-charcoal-navy shadow-sm active:scale-95 transition-transform shrink-0">
                <span className="material-symbols-outlined text-[22px]">swap_vert</span>
              </button>
              <button aria-label="تصفية متقدمة" className="w-12 h-12 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center text-charcoal-navy shadow-sm active:scale-95 transition-transform shrink-0">
                <span className="material-symbols-outlined text-[22px]">tune</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="mt-4 px-gutter-mobile overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 whitespace-nowrap py-1">
              <button className="bg-charcoal-navy text-on-primary px-4 py-2 rounded-xl font-label-md text-xs font-bold shadow-sm">
                الكل (8)
              </button>
              <button className="bg-surface-container-lowest border border-outline-variant/30 text-secondary hover:text-charcoal-navy px-4 py-2 rounded-xl font-label-md text-xs font-bold shadow-sm">
                الفيديوهات (5)
              </button>
              <button className="bg-surface-container-lowest border border-outline-variant/30 text-secondary hover:text-charcoal-navy px-4 py-2 rounded-xl font-label-md text-xs font-bold shadow-sm">
                الصور (3)
              </button>
              <button className="bg-surface-container-lowest border border-outline-variant/30 text-secondary hover:text-charcoal-navy px-4 py-2 rounded-xl font-label-md text-xs font-bold shadow-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-electric-citrus">lock</span>
                محمية بـ PIN (2)
              </button>
            </div>
          </div>

          {/* Media Library Feed */}
          <div className="px-gutter-mobile mt-4 flex flex-col gap-4">
            
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : uploadedVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-4 shadow-sm text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-2">video_library</span>
                <p className="font-headline-sm text-sm font-bold text-charcoal-navy">لم تقم برفع أي ملفات بعد</p>
                <p className="font-body-sm text-xs text-on-surface-variant mt-1">ابدأ برفع الفيديوهات والصور الخاصة بك الآن.</p>
              </div>
            ) : (
              uploadedVideos.map((video, index) => {
                const isImage = video.type && video.type.startsWith('image');
                return (
                  <div key={video.id || index} className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex gap-3">
                      <div className="relative w-28 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container-high border border-outline-variant/20">
                        {isImage ? (
                          <img className="w-full h-full object-cover" src={video.url} alt={video.title} />
                        ) : (
                          <video className="w-full h-full object-cover" src={video.url}></video>
                        )}
                        <span className="absolute bottom-1 right-1 bg-charcoal-navy/85 text-on-primary font-code-badge text-[9px] px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                          {isImage ? 'صورة' : 'فيديو'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-code-badge text-[9px] bg-warm-surface text-electric-citrus px-1.5 py-0.5 rounded font-bold border border-primary/10">نشط وعام</span>
                            <button className="text-on-surface-variant hover:text-charcoal-navy"><span className="material-symbols-outlined text-[18px]">more_vert</span></button>
                          </div>
                          <h2 className="font-headline-sm text-sm font-bold leading-tight text-charcoal-navy truncate mt-1" dir="ltr">{video.title || video.name}</h2>
                        </div>
                        <div className="flex items-center gap-3 font-label-md text-[10px] text-on-surface-variant font-medium">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[13px] text-electric-citrus">visibility</span>{video.views || 0}</span>
                          <span className="font-code-badge font-bold opacity-70">{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-outline-variant/20">
                      <button onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + video.url);
                        alert('تم النسخ!');
                      }} className="flex items-center justify-center gap-1.5 bg-warm-surface text-electric-citrus hover:bg-surface-container py-2.5 rounded-xl font-label-md text-xs font-bold active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-[16px]">link</span>
                        <span>نسخ الرابط</span>
                      </button>
                      <button className="flex items-center justify-center gap-1.5 bg-surface-container text-charcoal-navy hover:bg-surface-variant py-2.5 rounded-xl font-label-md text-xs font-bold active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-[16px]">code</span>
                        <span>تضمين سلة/زد</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
            
          </div>

          {/* Audience & Source Analytics Panel */}
          <div className="px-gutter-mobile mt-5">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-[32px] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warm-surface flex items-center justify-center">
                    <span className="material-symbols-outlined text-electric-citrus text-[22px]">query_stats</span>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-headline-sm text-sm font-bold text-charcoal-navy">تحليلات الزيارات السريعة</h2>
                    <p className="font-body-sm text-[11px] text-on-surface-variant font-medium">آخر 7 أيام عبر المتاجر ومواقع التواصل</p>
                  </div>
                </div>
                <span className="font-code-badge text-[10px] text-success-green font-bold bg-success-green/10 px-2 py-1 rounded">مباشر</span>
              </div>
              
              {/* Weekly Histogram Chart */}
              <div className="bg-surface-container-low/50 rounded-2xl p-4 mt-2 border border-outline-variant/20">
                <div className="flex items-end justify-between h-28 gap-2 pt-2 px-1">
                  <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-electric-citrus/30 rounded-t-lg transition-all" style={{ height: '40%' }}></div>
                    <span className="font-code-badge text-[10px] text-on-surface-variant font-bold">سبت</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-electric-citrus/40 rounded-t-lg transition-all" style={{ height: '55%' }}></div>
                    <span className="font-code-badge text-[10px] text-on-surface-variant font-bold">أحد</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-electric-citrus/50 rounded-t-lg transition-all" style={{ height: '48%' }}></div>
                    <span className="font-code-badge text-[10px] text-on-surface-variant font-bold">اثنين</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-electric-citrus/70 rounded-t-lg transition-all" style={{ height: '72%' }}></div>
                    <span className="font-code-badge text-[10px] text-on-surface-variant font-bold">ثلاثاء</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-electric-citrus/60 rounded-t-lg transition-all" style={{ height: '64%' }}></div>
                    <span className="font-code-badge text-[10px] text-on-surface-variant font-bold">أربعاء</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-electric-citrus rounded-t-lg shadow-sm" style={{ height: '96%' }}></div>
                    <span className="font-code-badge text-[10px] text-charcoal-navy font-bold">خميس</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-charcoal-navy rounded-t-lg" style={{ height: '82%' }}></div>
                    <span className="font-code-badge text-[10px] text-charcoal-navy font-bold">جمعة</span>
                  </div>
                </div>
              </div>
              
              {/* Traffic Channels Breakdown */}
              <div className="mt-5 flex flex-col gap-4">
                <h3 className="font-label-lg text-xs font-bold text-charcoal-navy">مصادر الزيارات الأساسية</h3>
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between font-label-md text-[11px]">
                    <span className="flex items-center gap-1.5 text-charcoal-navy font-bold">
                      <span className="w-2 h-2 rounded-full bg-electric-citrus"></span>متاجر سلة (تضمين المنتجات)
                    </span>
                    <span className="font-code-badge text-charcoal-navy font-bold">54%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div className="h-full bg-electric-citrus rounded-full" style={{ width: '54%' }}></div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between font-label-md text-[11px]">
                    <span className="flex items-center gap-1.5 text-charcoal-navy font-bold">
                      <span className="w-2 h-2 rounded-full bg-charcoal-navy"></span>إنستغرام وتيك توك
                    </span>
                    <span className="font-code-badge text-charcoal-navy font-bold">31%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div className="h-full bg-charcoal-navy rounded-full" style={{ width: '31%' }}></div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between font-label-md text-[11px]">
                    <span className="flex items-center gap-1.5 text-charcoal-navy font-bold">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>واتساب ومباشر
                    </span>
                    <span className="font-code-badge text-charcoal-navy font-bold">15%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Floating Action Bar for Upload */}
          <div className="px-gutter-mobile mt-6 mb-2">
            <Link href="/" className="w-full h-14 bg-electric-citrus hover:bg-primary text-white font-headline-sm text-base font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_24px_-4px_rgba(255,94,30,0.35)] active:scale-[0.98] transition-all">
              <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
              <span>+ رفع وسائط جديدة فوراً</span>
            </Link>
          </div>

        </div>
      </main>

    </div>
  );
}
