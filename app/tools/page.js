'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function ToolsPage() {
  const [quality, setQuality] = useState(80);
  const [watermarkText, setWatermarkText] = useState('@ThemiifyMedia');
  const [watermarkPos, setWatermarkPos] = useState('bottom-left');
  const [watermarkOpacity, setWatermarkOpacity] = useState(80);

  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuAoKIrwlbOd5buD-EUx91N-JM2THGxDA21sGptapyZ_jiLLvzYBV6hI5XAszzCr-CJ41jq-D_IOTShgLY71m6CFLUCp4iOnErKwWywNgoUCplyKGM3FEgmQj5Br_QdyDC0xDJEbreJKXkbJGzeAEIIybW8jONoKZK-Eb_2VNtrI_J6BzRezKF-H0_3WD7srBY1m8viizcCWNWO4T9ZE0YTEMI9PGX4jm3It6fJkHkaOIv4jMwANKqGfEw');
  const imageInputRef = useRef(null);

  const [audioQuality, setAudioQuality] = useState(320);
  const [convertMode, setConvertMode] = useState('video');
  const [inputFormat, setInputFormat] = useState('WebM (متصفح)');
  const [outputFormat, setOutputFormat] = useState('MP4 (H.264 - عالمي)');

  const [qrUrl, setQrUrl] = useState('https://themiify.com/v/share-media-77x');
  const [qrIncludeLogo, setQrIncludeLogo] = useState(true);
  const [qrColor, setQrColor] = useState('#1E293B');
  const [qrErrorCorrection, setQrErrorCorrection] = useState(true);
  const [qrRounded, setQrRounded] = useState(false);

  const [compressMode, setCompressMode] = useState('balanced');

  const handleMove = useCallback((clientX) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    setSliderPosition((x / rect.width) * 100);
  }, [isDragging]);

  useEffect(() => {
    const handleMouseMove = (e) => handleMove(e.clientX);
    const handleTouchMove = (e) => handleMove(e.touches[0].clientX);
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMove]);

  const scrollToTool = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container">
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(14,19,44,0.06)]">
        <div className="h-16 w-full px-gutter flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-sm">
              <img alt="Themiify Official Logo" className="h-8 w-auto object-contain" src="/icon.svg" />
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">Themiify <span className="text-primary-container">Videos</span></span>
            </div>
            <div className="hidden xl:flex items-center gap-space-xs bg-warm-surface px-space-sm py-space-xs rounded-xl shadow-[0_1px_4px_rgba(255,94,30,0.1)]">
              <span className="material-symbols-outlined text-primary-container text-[18px]">verified</span>
              <span className="font-label-md text-label-md text-primary-container font-semibold">مجاني للجميع — بدون تسجيل ولا حساب</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-space-sm">
            <Link href="/" className="px-space-md py-space-xs rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">الرئيسية والرفع</Link>
            <Link href="/dashboard" className="px-space-md py-space-xs rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">إدارة المرفوعات والمكتبة</Link>
            <Link href="/tools" className="px-space-md py-space-xs transition-colors bg-surface-container text-on-surface font-semibold rounded-xl">أدوات الميديا</Link>
          </nav>
          <div className="flex items-center gap-space-md">
            <Link href="/#upload-zone" className="inline-flex items-center gap-space-xs bg-primary-container text-on-primary hover:bg-primary font-headline-sm text-headline-sm px-space-md py-space-xs rounded-xl shadow-[0_8px_24px_-4px_rgba(255,94,30,0.35)] transition-all">
              <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
              <span>ارفع ملفاً الآن</span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full pt-24 pb-space-2xl">
        <div className="relative w-full max-w-[1140px] mx-auto px-gutter py-space-xl">
        <div className="absolute -top-10 right-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-[110px] pointer-events-none -z-10"></div>
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-[#FFB59D]/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        
        {/* Hero Header */}
        <div className="flex flex-col items-center text-center gap-space-md mb-space-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEF4EE] text-[#AB3500] border border-primary/20 shadow-sm">
            <span className="text-primary text-base">⚡</span>
            <span className="font-label-md text-sm font-semibold tracking-wide">معالجة محلية داخل المتصفح (WebAssembly) — صفر استهلاك لخوادم وخصوصية 100%</span>
          </div>
          <h1 className="font-headline-xl text-[44px] md:text-[54px] font-extrabold text-on-surface tracking-tight max-w-3xl leading-[1.2]">
            مركز أدوات الميديا الذكية والمباشرة
          </h1>
          <p className="font-body-lg text-base md:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            أدوات احترافية سريعة لمعالجة وتجهيز ملفات الفيديو والصور مباشرة بضغطة زر: ضغط ذكي، استخراج الصوت، تحويل الصيغ، وتوليد رموز QR الآمنة دون مغادرة متصفحك إطلاقاً.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-space-sm mt-1">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-surface border border-outline-variant/30 text-on-surface-variant font-label-md text-xs shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-success-green">check_circle</span>
              <span>بدون رفع على سيرفر خارجي</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-surface border border-outline-variant/30 text-on-surface-variant font-label-md text-xs shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
              <span>خصوصية تامة ومشفرة 100%</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-surface border border-outline-variant/30 text-on-surface-variant font-label-md text-xs shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-[#F97316]">speed</span>
              <span>معالجة فائقة السرعة بذاكرة RAM</span>
            </div>
          </div>
        </div>

        {/* Quick Tool Navigation Filter Bar */}
        <div className="flex items-center justify-between flex-wrap gap-space-sm p-1.5 rounded-full bg-white dark:bg-surface border border-outline-variant/30 mb-space-xl shadow-sm">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button className="px-4 py-2 rounded-full font-label-md text-sm bg-primary text-on-primary shadow-sm font-semibold transition-all hover:bg-primary-hover flex items-center gap-1.5" onClick={() => scrollToTool('compressor')} type="button">
              <span className="material-symbols-outlined text-[18px]">photo_size_select_small</span>
              <span>ضاغط الصور</span>
            </button>
            <button className="px-4 py-2 rounded-full font-label-md text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5 font-medium" onClick={() => scrollToTool('audio-extractor')} type="button">
              <span className="material-symbols-outlined text-[18px]">music_note</span>
              <span>استخراج الصوت</span>
            </button>
            <button className="px-4 py-2 rounded-full font-label-md text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5 font-medium" onClick={() => scrollToTool('format-converter')} type="button">
              <span className="material-symbols-outlined text-[18px]">transform</span>
              <span>تحويل الصيغ</span>
            </button>
            <button className="px-4 py-2 rounded-full font-label-md text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5 font-medium" onClick={() => scrollToTool('qr-generator')} type="button">
              <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
              <span>صانع الـ QR الذكي</span>
            </button>
            <button className="px-4 py-2 rounded-full font-label-md text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center gap-1.5 font-medium" onClick={() => scrollToTool('watermark-studio')} type="button">
              <span className="material-symbols-outlined text-[18px]">branding_watermark</span>
              <span>العلامة المائية</span>
            </button>
          </div>
          <div className="px-4 py-1.5 flex items-center gap-2 font-label-sm text-xs text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-success-green animate-ping"></span>
            <span className="font-semibold text-on-surface">جاهز للعمل المباشر</span>
          </div>
        </div>

        {/* MAIN WORKBENCH GRID */}
        <div className="flex flex-col gap-space-2xl">
          {/* TOOL 1: Smart Image Compressor (Hero Interactive Card) */}
          <section className="rounded-2xl bg-white dark:bg-surface border border-outline-variant/30 p-space-lg md:p-space-xl shadow-[0_8px_30px_rgba(14,19,44,0.06)] relative overflow-hidden" id="compressor">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Tool Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-lg border-b border-outline-variant/30">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined text-[26px]">photo_size_select_small</span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-headline-lg text-2xl font-bold text-on-surface">ضاغط الصور الذكي</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E8F8F0] text-success-green text-xs font-bold border border-success-green/20">وفر حتى 82%</span>
                  </div>
                  <p className="font-body-md text-sm text-on-surface-variant mt-0.5">تقليل حجم صور PNG, JPG, WebP بدقة ذكية دون التضحية بنقاء الألوان والتفاصيل الدقيقة.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="font-label-md text-xs text-on-surface-variant font-medium">وضع المعالجة:</span>
                <div className="flex p-1 rounded-full bg-background border border-outline-variant/30 text-xs">
                  <button onClick={() => { setCompressMode('balanced'); setQuality(75); }} className={`px-3 py-1 rounded-full transition-colors ${compressMode === 'balanced' ? 'bg-primary text-on-primary font-semibold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`} type="button">متوازن</button>
                  <button onClick={() => { setCompressMode('max_compression'); setQuality(35); }} className={`px-3 py-1 rounded-full transition-colors ${compressMode === 'max_compression' ? 'bg-primary text-on-primary font-semibold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`} type="button">أقصى ضغط</button>
                  <button onClick={() => { setCompressMode('high_quality'); setQuality(95); }} className={`px-3 py-1 rounded-full transition-colors ${compressMode === 'high_quality' ? 'bg-primary text-on-primary font-semibold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`} type="button">فائق الجودة</button>
                </div>
              </div>
            </div>
            
            {/* Split Comparison Sandbox */}
            <div className="mt-space-lg grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
              <div className="lg:col-span-7 flex flex-col gap-space-sm">
                {(() => {
                  const origMB = imageFile ? (imageFile.size / (1024 * 1024)) : 1.54;
                  const origKB = origMB * 1024;
                  const currentSavings = Math.round(98 - (quality * 0.7)); 
                  const compKB = Math.max(10, Math.round(origKB * ((100 - currentSavings) / 100)));
                  return (
                    <>
                      <div 
                        className="relative w-full h-[320px] rounded-xl overflow-hidden border border-outline-variant/30 select-none bg-surface-container group shadow-inner" 
                        id="slider-container"
                        ref={containerRef}
                        onMouseDown={() => setIsDragging(true)}
                        onTouchStart={() => setIsDragging(true)}
                      >
                        <img className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="Optimized compressed preview" src={imagePreviewUrl} />
                        <div className="absolute top-3.5 left-3.5 z-10 px-3 py-1 rounded-full bg-surface-container/85 backdrop-blur-md border border-white/10 text-success-green font-label-xs text-xs font-semibold flex items-center gap-1.5 shadow-md">
                          <span className="w-2 h-2 rounded-full bg-success-green"></span>
                          <span dir="rtl">بعد الضغط: {compKB > 1024 ? (compKB / 1024).toFixed(2) + ' ميجابايت' : compKB + ' كيلوبايت'} (-{currentSavings}%)</span>
                        </div>
                        <div className="absolute inset-0 pointer-events-none" id="before-wrapper" style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}>
                          <img className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="Lossless original preview" src={imagePreviewUrl} />
                          <div className="absolute top-3.5 right-3.5 z-10 px-3 py-1 rounded-full bg-surface-container/85 backdrop-blur-md border border-white/10 text-white font-label-xs text-xs font-medium shadow-md">
                            <span dir="rtl">الأصل: {origMB.toFixed(2)} ميجابايت</span>
                          </div>
                        </div>
                        <div className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize z-20 shadow-[0_0_15px_rgba(255,94,30,0.9)]" id="slider-divider" style={{ left: `${sliderPosition}%` }}>
                          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 font-label-xs text-xs pointer-events-none flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px]">swipe</span>
                          <span>اسحب المقبض لمقارنة الجودة في الوقت الفعلي</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-space-sm text-center">
                        <div className="p-3 rounded-xl bg-background border border-outline-variant/30">
                          <span className="font-label-xs text-xs text-on-surface-variant block mb-0.5">الحجم الأصلي</span>
                          <span className="font-headline-md text-lg font-bold text-on-surface">{origMB.toFixed(2)} <span className="text-xs text-on-surface-variant">MB</span></span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#E8F8F0] border border-success-green/20">
                          <span className="font-label-xs text-xs text-success-green block mb-0.5">الحجم بعد التحسين</span>
                          <span className="font-headline-md text-lg font-bold text-success-green">{compKB > 1024 ? (compKB / 1024).toFixed(2) : compKB} <span className="text-xs text-success-green">{compKB > 1024 ? 'MB' : 'KB'}</span></span>
                        </div>
                        <div className="p-3 rounded-xl bg-primary-container/20 border border-primary/20">
                          <span className="font-label-xs text-xs text-[#AB3500] dark:text-primary-container block mb-0.5">معدل التوفير الفعلي</span>
                          <span className="font-headline-md text-lg font-bold text-primary">{currentSavings}%</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              <div className="lg:col-span-5 flex flex-col gap-space-md">
                <input type="file" ref={imageInputRef} className="hidden" accept="image/png, image/jpeg, image/webp, image/gif" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImageFile(file);
                    setImagePreviewUrl(URL.createObjectURL(file));
                  }
                }} />
                <div onClick={() => imageInputRef.current?.click()} className="p-space-lg rounded-xl border-2 border-dashed border-primary/40 hover:border-primary bg-primary-container/10 hover:bg-primary-container/20 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-surface border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                    <span className="material-symbols-outlined text-[26px]">add_photo_alternate</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-lg text-sm font-bold text-on-surface">اسحب صورتك هنا أو تصفح جهازك</span>
                    <span className="font-body-sm text-xs text-on-surface-variant">PNG, JPG, WebP أو GIF حتى 25 ميجابايت</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-background border border-outline-variant/30">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-xs text-on-surface-variant font-medium">مستوى جودة الصورة المطلوب:</span>
                    <span className="font-headline-md text-base font-bold text-primary">{quality}%</span>
                  </div>
                  <input className="w-full h-2 bg-outline-variant/30 rounded-lg appearance-none cursor-pointer accent-primary" max="95" min="30" onChange={(e) => { setQuality(e.target.value); setCompressMode('custom'); }} type="range" value={quality} />
                  <div className="flex justify-between font-label-xs text-[11px] text-on-surface-variant">
                    <span>أقصى توفير للحجم</span>
                    <span>توازن ذكي (موصى به)</span>
                    <span>مطابق للأصل</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none font-label-md text-xs text-on-surface-variant hover:text-on-surface">
                    <input defaultChecked className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary" type="checkbox" />
                    <span>تحويل تلقائي إلى صيغة WebP فائقة السرعة</span>
                  </label>
                </div>
                
                <button onClick={() => {
                  if (imageFile) {
                    Swal.fire({ title: 'نجاح', text: 'جاري محاكاة ضغط الصورة وتحميلها...', icon: 'success', confirmButtonText: 'حسناً', confirmButtonColor: '#FF5E1E' });
                  } else {
                    Swal.fire({ title: 'تنبيه', text: 'الرجاء رفع صورة أولاً!', icon: 'warning', confirmButtonText: 'حسناً', confirmButtonColor: '#FF5E1E' });
                  }
                }} className="w-full py-3 px-5 rounded-full bg-primary text-on-primary font-label-lg text-sm font-bold shadow-[0_4px_16px_rgba(255,94,30,0.3)] hover:bg-primary-hover hover:shadow-[0_6px_22px_rgba(255,94,30,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2" type="button">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  <span>تحميل الصورة المضغوطة مجاناً</span>
                </button>
              </div>
            </div>
          </section>

          {/* TWO COLUMN BENTO: Audio Extractor & Video Format Converter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
            {/* TOOL 2: Audio Extractor */}
            <section className="rounded-2xl bg-white dark:bg-surface border border-outline-variant/30 p-space-lg shadow-[0_8px_30px_rgba(14,19,44,0.04)] flex flex-col justify-between relative overflow-hidden" id="audio-extractor">
              <div>
                <div className="flex items-center gap-space-md pb-space-md border-b border-outline-variant/30">
                  <div className="w-11 h-11 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-lg font-bold text-on-surface">استخراج الصوت من الفيديو</h3>
                    <p className="font-body-sm text-xs text-on-surface-variant">حول مقاطع <bdi>MP4, MOV, WebM</bdi> إلى ملفات <bdi>MP3 / WAV</bdi> بنقاء أستوديو</p>
                  </div>
                </div>
                
                <div className="mt-space-md flex flex-col gap-space-md">
                  <div className="p-3.5 rounded-xl bg-background border border-outline-variant/30 flex items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-sm min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-surface-container flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-[24px]">play_circle</span>
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <span className="font-label-md text-sm text-on-surface truncate font-bold" dir="ltr" style={{textAlign: 'right'}}>podcast_interview_ep24_final.mp4</span>
                        <span className="font-label-xs text-xs text-on-surface-variant">04:32 دقيقة • 84.6 ميجابايت</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-primary-container/20 text-primary text-xs font-bold border border-primary/20" dir="ltr">MP4 ➔ MP3</span>
                  </div>
                  
                  <div className="p-3.5 rounded-xl bg-white dark:bg-surface border border-outline-variant/30 shadow-xs flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1.5 text-success-green font-medium">
                        <span className="w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
                        تم فصل المسار الصوتي بنجاح
                      </span>
                      <span className="font-mono font-bold text-on-surface" dir="ltr">{audioQuality} kbps {audioQuality === 320 ? 'High-Res' : audioQuality === 192 ? 'Standard' : 'Light'}</span>
                    </div>
                    <svg className="w-full h-10 text-primary" fill="currentColor" viewBox="0 0 400 40">
                      <rect height="8" opacity="0.4" rx="1.5" width="3" x="0" y="16"></rect>
                      <rect height="16" opacity="0.6" rx="1.5" width="3" x="6" y="12"></rect>
                      <rect height="24" opacity="0.8" rx="1.5" width="3" x="12" y="8"></rect>
                      <rect height="32" rx="1.5" width="3" x="18" y="4"></rect>
                      <rect height="20" opacity="0.9" rx="1.5" width="3" x="24" y="10"></rect>
                      <rect height="12" opacity="0.5" rx="1.5" width="3" x="30" y="14"></rect>
                      <rect height="28" rx="1.5" width="3" x="36" y="6"></rect>
                      <rect height="36" rx="1.5" width="3" x="42" y="2"></rect>
                      <rect height="16" opacity="0.7" rx="1.5" width="3" x="48" y="12"></rect>
                      <rect height="24" rx="1.5" width="3" x="60" y="8"></rect>
                      <rect height="32" rx="1.5" width="3" x="66" y="4"></rect>
                      <rect height="20" opacity="0.8" rx="1.5" width="3" x="72" y="10"></rect>
                      <rect height="28" rx="1.5" width="3" x="84" y="6"></rect>
                      <rect height="36" rx="1.5" width="3" x="96" y="2"></rect>
                      <rect height="24" rx="1.5" width="3" x="102" y="8"></rect>
                      <rect height="16" opacity="0.7" rx="1.5" width="3" x="108" y="12"></rect>
                      <rect height="28" rx="1.5" width="3" x="114" y="6"></rect>
                      <rect height="32" rx="1.5" width="3" x="132" y="4"></rect>
                      <rect height="36" rx="1.5" width="3" x="144" y="2"></rect>
                      <rect height="24" rx="1.5" width="3" x="150" y="8"></rect>
                      <rect height="28" rx="1.5" width="3" x="168" y="6"></rect>
                      <rect height="32" rx="1.5" width="3" x="174" y="4"></rect>
                      <rect height="36" rx="1.5" width="3" x="198" y="2"></rect>
                      <rect height="24" rx="1.5" width="3" x="204" y="8"></rect>
                      <rect height="32" rx="1.5" width="3" x="228" y="4"></rect>
                      <rect height="36" rx="1.5" width="3" x="240" y="2"></rect>
                      <rect height="28" rx="1.5" width="3" x="264" y="6"></rect>
                      <rect height="36" rx="1.5" width="3" x="288" y="2"></rect>
                      <rect height="32" rx="1.5" width="3" x="306" y="4"></rect>
                      <rect height="28" rx="1.5" width="3" x="318" y="6"></rect>
                      <rect height="36" rx="1.5" width="3" x="330" y="2"></rect>
                      <rect height="24" rx="1.5" width="3" x="348" y="8"></rect>
                      <rect height="32" rx="1.5" width="3" x="354" y="4"></rect>
                      <rect height="28" rx="1.5" width="3" x="366" y="6"></rect>
                      <rect height="36" rx="1.5" width="3" x="384" y="2"></rect>
                      <rect height="24" rx="1.5" width="3" x="396" y="8"></rect>
                    </svg>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <button onClick={() => setAudioQuality(128)} className={`p-2.5 rounded-xl border transition-all flex flex-col items-center ${audioQuality === 128 ? 'bg-primary-container/20 border-primary/40 text-primary shadow-xs' : 'bg-background border-outline-variant/30 hover:border-primary/40 text-on-surface-variant hover:text-on-surface'}`} type="button">
                      <span className={`text-[11px] ${audioQuality === 128 ? 'text-primary-container font-semibold' : 'text-on-surface-variant'}`}>حجم خفيف</span>
                      <span className={`text-sm font-bold text-on-surface`} dir="ltr">128 kbps</span>
                    </button>
                    <button onClick={() => setAudioQuality(192)} className={`p-2.5 rounded-xl border transition-all flex flex-col items-center ${audioQuality === 192 ? 'bg-primary-container/20 border-primary/40 text-primary shadow-xs' : 'bg-background border-outline-variant/30 hover:border-primary/40 text-on-surface-variant hover:text-on-surface'}`} type="button">
                      <span className={`text-[11px] ${audioQuality === 192 ? 'text-primary-container font-semibold' : 'text-on-surface-variant'}`}>قياسي متوازن</span>
                      <span className={`text-sm font-bold text-on-surface`} dir="ltr">192 kbps</span>
                    </button>
                    <button onClick={() => setAudioQuality(320)} className={`p-2.5 rounded-xl border transition-all flex flex-col items-center ${audioQuality === 320 ? 'bg-primary-container/20 border-primary/40 text-primary shadow-xs' : 'bg-background border-outline-variant/30 hover:border-primary/40 text-on-surface-variant hover:text-on-surface'}`} type="button">
                      <span className={`text-[11px] ${audioQuality === 320 ? 'text-primary-container font-semibold' : 'text-on-surface-variant'}`}>استوديو احترافي</span>
                      <span className={`text-sm font-bold text-on-surface`} dir="ltr">320 kbps</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-space-lg pt-space-md border-t border-outline-variant/30 flex items-center justify-between gap-space-sm">
                <span className="font-label-xs text-xs text-on-surface-variant">الحجم الناتج: ~ {audioQuality === 320 ? '10.4' : audioQuality === 192 ? '6.2' : '4.1'} ميجابايت <bdi>MP3</bdi></span>
                <button onClick={() => Swal.fire({ title: 'نجاح', text: 'بدء التحميل المستخرج...', icon: 'success', confirmButtonText: 'حسناً', confirmButtonColor: '#FF5E1E' })} className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-lg text-sm font-bold hover:bg-primary-hover shadow-[0_4px_14px_rgba(255,94,30,0.3)] transition-all flex items-center gap-1.5 active:scale-95" type="button">
                  <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
                  <span>استخراج وتحميل MP3</span>
                </button>
              </div>
            </section>

            {/* TOOL 3: Media Format Converter */}
            <section className="rounded-2xl bg-white dark:bg-surface border border-outline-variant/30 p-space-lg shadow-[0_8px_30px_rgba(14,19,44,0.04)] flex flex-col justify-between relative overflow-hidden" id="format-converter">
              <div>
                <div className="flex items-center gap-space-md pb-space-md border-b border-outline-variant/30">
                  <div className="w-11 h-11 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">sync_alt</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-lg font-bold text-on-surface">تحويل صيغ الفيديو والوسائط الذكي</h3>
                    <p className="font-body-sm text-xs text-on-surface-variant">تغيير الامتدادات بسلاسة للتوافق مع جميع المنصات ومواقع التواصل</p>
                  </div>
                </div>
                
                <div className="mt-space-md flex flex-col gap-space-md">
                  <div className="flex p-1 rounded-full bg-background border border-outline-variant/30">
                    <button onClick={() => setConvertMode('video')} className={`flex-1 py-1.5 rounded-full font-label-md text-xs font-bold text-center transition-colors ${convertMode === 'video' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`} type="button">تحويل فيديو <bdi>(MP4, WebM, MOV)</bdi></button>
                    <button onClick={() => setConvertMode('image')} className={`flex-1 py-1.5 rounded-full font-label-md text-xs text-center transition-colors ${convertMode === 'image' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`} type="button">تحويل صور <bdi>(WebP, JPG, PNG)</bdi></button>
                  </div>
                  
                  <div className="p-3.5 rounded-xl bg-white dark:bg-surface border border-outline-variant/30 flex items-center justify-between gap-space-sm shadow-xs">
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="font-label-xs text-xs text-on-surface-variant">الصيغة المصدر (الحالية):</span>
                      <select value={inputFormat} onChange={(e) => setInputFormat(e.target.value)} className="w-full bg-background border border-outline-variant/30 rounded-lg py-2 px-3 text-on-surface font-label-md text-xs focus:outline-none focus:border-primary">
                        {convertMode === 'video' ? (
                          <>
                            <option>WebM - متصفح</option>
                            <option>MOV - Apple iPhone</option>
                            <option>MKV - عالي الدقة</option>
                            <option>AVI - قديم</option>
                          </>
                        ) : (
                          <>
                            <option>HEIC - iPhone</option>
                            <option>PNG - شفاف</option>
                            <option>TIFF - خام</option>
                            <option>JPG - عادي</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary border border-primary/20 self-end mb-0.5">
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="font-label-xs text-xs text-on-surface-variant">التحويل إلى الصيغة:</span>
                      <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} className="w-full bg-background border border-outline-variant/30 rounded-lg py-2 px-3 text-on-surface font-label-md text-xs focus:outline-none focus:border-primary">
                        {convertMode === 'video' ? (
                          <>
                            <option>MP4 - H.264 عالمي</option>
                            <option>GIF - متحرك عالي الجودة</option>
                            <option>WebM - للويب الحديث</option>
                            <option>MP3 - صوت فقط</option>
                          </>
                        ) : (
                          <>
                            <option>WebP - جيل جديد</option>
                            <option>JPG - مضغوط</option>
                            <option>PNG - شفافية</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <span className="font-label-xs text-xs text-on-surface-variant">إعدادات مسبقة سريعة:</span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {convertMode === 'video' ? (
                        <>
                          <button onClick={() => setOutputFormat('MP4 - H.264 عالمي')} className="px-3 py-1 rounded-full bg-background border border-outline-variant/30 text-on-surface-variant cursor-pointer hover:border-primary hover:text-on-surface transition-colors" type="button">مخصص لقصص إنستجرام وريلز</button>
                          <button onClick={() => setOutputFormat('MP4 - H.264 عالمي')} className="px-3 py-1 rounded-full bg-background border border-outline-variant/30 text-on-surface-variant cursor-pointer hover:border-primary hover:text-on-surface transition-colors" type="button">ضغط للواتساب (أقل من 16 ميجابايت)</button>
                          <button onClick={() => setOutputFormat('WebM - للويب الحديث')} className="px-3 py-1 rounded-full bg-background border border-outline-variant/30 text-on-surface-variant cursor-pointer hover:border-primary hover:text-on-surface transition-colors" type="button">ترميز خفيف للويب WebM</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setOutputFormat('WebP - جيل جديد')} className="px-3 py-1 rounded-full bg-background border border-outline-variant/30 text-on-surface-variant cursor-pointer hover:border-primary hover:text-on-surface transition-colors" type="button">صور متوافقة مع الويب WebP</button>
                          <button onClick={() => setOutputFormat('JPG - مضغوط')} className="px-3 py-1 rounded-full bg-background border border-outline-variant/30 text-on-surface-variant cursor-pointer hover:border-primary hover:text-on-surface transition-colors" type="button">JPG عالي الجودة</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-space-lg pt-space-md border-t border-outline-variant/30 flex items-center justify-between gap-space-sm">
                <span className="font-label-xs text-xs text-on-surface-variant">محرك FFmpeg WebAssembly فوري</span>
                <button onClick={() => Swal.fire({ title: 'نجاح', text: `جاري تحويل ${inputFormat} إلى ${outputFormat}...`, icon: 'success', confirmButtonText: 'حسناً', confirmButtonColor: '#FF5E1E' })} className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-lg text-sm font-bold hover:bg-primary-hover shadow-[0_4px_14px_rgba(255,94,30,0.3)] transition-all flex items-center gap-1.5 active:scale-95" type="button">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>بدء التحويل الفوري</span>
                </button>
              </div>
            </section>
          </div>

          {/* TWO COLUMN BENTO: Custom QR Code Generator & Watermark Studio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            {/* TOOL 4: Custom QR Code Generator */}
            <section className="lg:col-span-5 rounded-2xl bg-white dark:bg-surface border border-outline-variant/30 p-space-lg shadow-[0_8px_30px_rgba(14,19,44,0.04)] flex flex-col justify-between relative overflow-hidden" id="qr-generator">
              <div>
                <div className="flex items-center gap-space-md pb-space-md border-b border-outline-variant/30">
                  <div className="w-11 h-11 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-lg font-bold text-on-surface">صانع كود الـ QR الذكي</h3>
                    <p className="font-body-sm text-xs text-on-surface-variant">توليد رمز استجابة سريعة أنيق لمشاركة روابط الميديا</p>
                  </div>
                </div>
                
                <div className="mt-space-md flex flex-col items-center gap-space-md">
                  <div className="p-space-md rounded-2xl bg-background border border-outline-variant/30 shadow-sm flex flex-col items-center justify-center relative group">
                    <svg className="w-44 h-44 transition-colors duration-300" style={{ color: qrColor }} fill="currentColor" viewBox="0 0 100 100">
                      <path d="M5,5 h24 v24 h-24 z M9,9 v16 h16 v-16 z M13,13 h8 v8 h-8 z"></path>
                      <path d="M71,5 h24 v24 h-24 z M75,9 v16 h16 v-16 z M79,13 h8 v8 h-8 z"></path>
                      <path d="M5,71 h24 v24 h-24 z M9,75 v16 h16 v-16 z M13,79 h8 v8 h-8 z"></path>
                      <rect height="5" rx="1.5" width="5" x="35" y="6"></rect>
                      <rect height="5" rx="1.5" width="10" x="45" y="6"></rect>
                      <rect height="5" rx="1.5" width="5" x="60" y="6"></rect>
                      <rect height="8" rx="1.5" width="5" x="35" y="16"></rect>
                      <rect height="5" rx="1.5" width="8" x="52" y="16"></rect>
                      <rect height="5" rx="1.5" width="8" x="6" y="35"></rect>
                      <rect height="5" rx="1.5" width="5" x="18" y="35"></rect>
                      <rect height="6" rx="1.5" width="6" x="26" y="42"></rect>
                      <rect height="12" rx="1.5" width="6" x="6" y="45"></rect>
                      <rect height="6" rx="1.5" width="8" x="16" y="55"></rect>
                      <rect height="6" rx="1.5" width="6" x="35" y="75"></rect>
                      <rect height="15" rx="1.5" width="6" x="45" y="72"></rect>
                      <rect height="6" rx="1.5" width="8" x="55" y="80"></rect>
                      <rect height="6" rx="1.5" width="5" x="68" y="72"></rect>
                      <rect height="6" rx="1.5" width="12" x="80" y="72"></rect>
                      <rect height="10" rx="1.5" width="8" x="85" y="84"></rect>
                      <rect height="8" rx="1.5" width="6" x="72" y="42"></rect>
                      <rect height="12" rx="1.5" width="8" x="85" y="35"></rect>
                      <rect height="6" rx="1.5" width="15" x="75" y="55"></rect>
                      {qrIncludeLogo && (
                        <>
                          <circle cx="50" cy="50" fill="#FF5E1E" r="13"></circle>
                          <path d="M45 44 L57 50 L45 56 Z" fill="#ffffff"></path>
                        </>
                      )}
                    </svg>
                    <span className="font-label-xs text-xs text-on-surface-variant mt-2 font-mono truncate max-w-full px-4" dir="ltr">{qrUrl}</span>
                  </div>
                  
                  <div className="w-full flex flex-col gap-1">
                    <span className="font-label-xs text-xs text-on-surface-variant">الرابط المباشر المراد تشفيره:</span>
                    <div className="flex items-center gap-2">
                      <input value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} className="w-full bg-background border border-outline-variant/30 rounded-lg py-2 px-3 text-on-surface font-mono text-xs focus:outline-none focus:border-primary" type="text" dir="ltr" style={{textAlign: 'left'}} />
                      <button onClick={() => {
                        navigator.clipboard.writeText(qrUrl);
                        Swal.fire({ title: 'تم النسخ!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true });
                      }} className="p-2 rounded-lg bg-background border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors shadow-xs" title="نسخ" type="button">
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full flex items-center justify-between text-xs text-on-surface-variant cursor-pointer select-none">
                    <span onClick={() => setQrIncludeLogo(!qrIncludeLogo)} className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full inline-block ${qrIncludeLogo ? 'bg-primary' : 'bg-surface-container'}`}></span> تضمين شعار <bdi>Themiify</bdi></span>
                    <span onClick={() => setQrErrorCorrection(!qrErrorCorrection)} className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full inline-block ${qrErrorCorrection ? 'bg-success-green' : 'bg-surface-container'}`}></span> تصحيح أخطاء <span dir="ltr">30%</span></span>
                    <span onClick={() => setQrRounded(!qrRounded)} className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full inline-block ${qrRounded ? 'bg-primary' : 'bg-surface-container'}`}></span> أركان دائرية</span>
                  </div>
                </div>
              </div>
              <div className="mt-space-lg pt-space-md border-t border-outline-variant/30 flex items-center justify-between gap-space-sm">
                <label className="flex-1 py-2 rounded-full bg-background border border-outline-variant/30 text-on-surface font-label-md text-xs hover:bg-surface-container transition-colors flex items-center justify-center gap-1.5 cursor-pointer relative overflow-hidden">
                  <span className="material-symbols-outlined text-[16px]">palette</span>
                  <span>تخصيص الألوان</span>
                  <input type="color" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" value={qrColor} onChange={(e) => setQrColor(e.target.value)} />
                </label>
                <button onClick={() => Swal.fire({ title: 'نجاح', text: 'جاري تحميل رمز الاستجابة السريعة...', icon: 'success', confirmButtonText: 'حسناً', confirmButtonColor: '#FF5E1E' })} className="flex-1 py-2 rounded-full bg-primary text-on-primary font-label-md text-xs font-bold shadow-[0_4px_14px_rgba(255,94,30,0.3)] hover:bg-primary-hover transition-transform flex items-center justify-center gap-1.5 active:scale-95" type="button">
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>تحميل <bdi>PNG</bdi> عالي الدقة</span>
                </button>
              </div>
            </section>

            {/* TOOL 5: Safe Watermark Studio */}
            <section className="lg:col-span-7 rounded-2xl bg-white dark:bg-surface border border-outline-variant/30 p-space-lg shadow-[0_8px_30px_rgba(14,19,44,0.04)] flex flex-col justify-between relative overflow-hidden" id="watermark-studio">
              <div>
                <div className="flex items-center gap-space-md pb-space-md border-b border-outline-variant/30">
                  <div className="w-11 h-11 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">branding_watermark</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-lg font-bold text-on-surface">أستوديو العلامة المائية الآمنة</h3>
                    <p className="font-body-sm text-xs text-on-surface-variant">أضف حقوقك وشعارك على الفيديوهات والصور بضغطة زر لمنع السرقة وإعادة النشر</p>
                  </div>
                </div>
                
                <div className="mt-space-md grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">
                  <div className="md:col-span-7 relative h-56 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container">
                    <img className="w-full h-full object-cover" alt="Watermark studio preview" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGKsIXep7xLSsx__eW0qTemTpOntzTERQ7-DqDNRA2mtj8L5OP2UwQa7BTORaqXqNnPdqM3yJIjy-XAK5NwuanAx3eHUXxmAjbuUJmyu1RUqtYpbc9I0fsxInGdoOQG1Cy8gxtRjYxazuKh0v6CRFUx_LLaq9XPJCh0xMRlnc0AGqJI3YdAjqVJu7Csd7nIcASEbnSzSEg0qCSEYSlcXr_NiRg9ApSLCyhylTtiFez7pBgQ4zUVICnfw" />
                    <div 
                      className={`absolute px-3 py-1.5 rounded-lg bg-surface-container/80 backdrop-blur-md border border-white/20 text-white font-label-md text-xs flex items-center gap-1.5 shadow-lg select-none ${
                        watermarkPos === 'top-right' ? 'top-3 right-3' :
                        watermarkPos === 'top-left' ? 'top-3 left-3' :
                        watermarkPos === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
                        watermarkPos === 'bottom-right' ? 'bottom-3 right-3' :
                        watermarkPos === 'bottom-left' ? 'bottom-3 left-3' :
                        'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 rotate-[-15deg] scale-150'
                      }`} 
                      id="watermark-preview"
                      style={{ opacity: watermarkOpacity / 100 }}
                    >
                      <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
                      <span className="font-bold">{watermarkText}</span>
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 text-white font-label-xs text-[11px]">
                      معاينة مباشرة
                    </div>
                  </div>
                  
                  <div className="md:col-span-5 flex flex-col gap-space-sm">
                    <div>
                      <label className="font-label-xs text-xs text-on-surface-variant block mb-1">نص العلامة المائية:</label>
                      <input className="w-full bg-background border border-outline-variant/30 rounded-lg py-1.5 px-3 text-on-surface font-label-md text-xs focus:outline-none focus:border-primary" onChange={(e) => setWatermarkText(e.target.value)} type="text" value={watermarkText} dir="auto" />
                    </div>
                    <div>
                      <label className="font-label-xs text-xs text-on-surface-variant block mb-1">موضع العلامة المائية:</label>
                      <div className="grid grid-cols-3 gap-1 bg-background p-1 rounded-lg border border-outline-variant/30">
                        <button onClick={() => setWatermarkPos('top-right')} className={`py-1 text-center rounded text-xs ${watermarkPos === 'top-right' ? 'bg-primary text-on-primary font-bold' : 'hover:bg-surface-container text-on-surface-variant'}`} type="button">أعلى يمين</button>
                        <button onClick={() => setWatermarkPos('center')} className={`py-1 text-center rounded text-xs ${watermarkPos === 'center' ? 'bg-primary text-on-primary font-bold' : 'hover:bg-surface-container text-on-surface-variant'}`} type="button">الوسط</button>
                        <button onClick={() => setWatermarkPos('top-left')} className={`py-1 text-center rounded text-xs ${watermarkPos === 'top-left' ? 'bg-primary text-on-primary font-bold' : 'hover:bg-surface-container text-on-surface-variant'}`} type="button">أعلى يسار</button>
                        <button onClick={() => setWatermarkPos('bottom-left')} className={`py-1 text-center rounded text-xs ${watermarkPos === 'bottom-left' ? 'bg-primary text-on-primary font-bold' : 'hover:bg-surface-container text-on-surface-variant'}`} type="button">أسفل يسار</button>
                        <button onClick={() => setWatermarkPos('tiled')} className={`py-1 text-center rounded text-xs ${watermarkPos === 'tiled' ? 'bg-primary text-on-primary font-bold' : 'hover:bg-surface-container text-on-surface-variant'}`} type="button">نمط مكرر</button>
                        <button onClick={() => setWatermarkPos('bottom-right')} className={`py-1 text-center rounded text-xs ${watermarkPos === 'bottom-right' ? 'bg-primary text-on-primary font-bold' : 'hover:bg-surface-container text-on-surface-variant'}`} type="button">أسفل يمين</button>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-label-xs text-xs text-on-surface-variant mb-1">
                        <span>درجة الشفافية:</span>
                        <span className="font-bold text-primary">{watermarkOpacity}%</span>
                      </div>
                      <input className="w-full h-1.5 bg-outline-variant/30 rounded appearance-none cursor-pointer accent-primary" max="100" min="10" onChange={(e) => setWatermarkOpacity(e.target.value)} type="range" value={watermarkOpacity} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-space-lg pt-space-md border-t border-outline-variant/30 flex items-center justify-between gap-space-sm">
                <span className="font-label-xs text-xs text-on-surface-variant">تحفظ الملفات دون أي أثر سحابي</span>
                <button onClick={() => Swal.fire({ title: 'نجاح', text: 'جاري تطبيق العلامة المائية وحفظ الوسائط...', icon: 'success', confirmButtonText: 'حسناً', confirmButtonColor: '#FF5E1E' })} className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-lg text-sm font-bold shadow-[0_4px_14px_rgba(255,94,30,0.3)] hover:bg-primary-hover transition-all flex items-center gap-1.5 active:scale-95" type="button">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>تطبيق وحفظ الوسائط</span>
                </button>
              </div>
            </section>
          </div>
        </div>
        
        {/* FAQ & SECURITY GUARANTEE BANNER */}
        <div className="mt-space-2xl rounded-2xl bg-white dark:bg-surface border border-outline-variant/30 p-space-lg md:p-space-xl shadow-[0_8px_30px_rgba(14,19,44,0.04)] relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg">
            <div className="flex flex-col gap-2 max-w-xl">
              <div className="flex items-center gap-2 text-success-green font-label-md text-xs font-bold">
                <span className="material-symbols-outlined text-[20px]">shield_person</span>
                <span>الأمان والخصوصية بنسبة 100%</span>
              </div>
              <h3 className="font-headline-lg text-2xl font-bold text-on-surface">
                كيف تعمل هذه الأدوات دون إرسال ملفاتك لأي خادم؟
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                نعتمد في Themiify على تقنيات المتصفح الحديثة (WebAssembly و HTML5 Canvas و Web Audio API). يتم فك وتشفير ومعالجة وسائطك مباشرة داخل ذاكرة جهازك العشوائية، ولا يغادر أي بايت واحد حاسوبك أو هاتفك.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 w-full md:w-auto">
              <Link className="px-6 py-3 rounded-full bg-primary text-on-primary font-label-lg text-sm font-bold shadow-[0_4px_16px_rgba(255,94,30,0.3)] hover:bg-primary-hover transition-transform text-center flex items-center justify-center gap-2" href="/">
                <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                <span>العودة لمركز الرفع والمشاركة</span>
              </Link>
              <Link className="px-6 py-3 rounded-full bg-background hover:bg-surface-container text-on-surface border border-outline-variant/30 font-label-md text-xs font-semibold text-center transition-colors" href="/dashboard">
                عرض ملفاتك المرفوعة الحالية
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mt-space-xl pt-space-lg border-t border-outline-variant/30">
            <div className="flex flex-col gap-1.5">
              <span className="font-label-lg text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                هل توجد حدود يومية للاستخدام؟
              </span>
              <span className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                كلا، الأدوات متاحة بلا قيود ومجاناً بالكامل لكافة المبدعين وصناع المحتوى دون أي تسجيل.
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-label-lg text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">signal_cellular_alt</span>
                هل يستهلك هذا باقة الإنترنت؟
              </span>
              <span className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                لا، لأن الملفات لا تُرفع ولا تُرسل لشبكة الإنترنت، العملية أسرع 10 مرات وتوفر بياناتك.
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-label-lg text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">devices</span>
                هل تعمل على الهواتف الذكية؟
              </span>
              <span className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                نعم، متوافقة كلياً مع متصفحات Safari على iPhone و Chrome على أجهزة Android بحجم شاشة متكيف.
              </span>
            </div>
          </div>
        </div>
      </div>
      </main>

      <footer className="w-full bg-surface-container-low py-space-2xl mt-auto">
        <div className="w-full px-gutter flex flex-col gap-space-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-sm">
                <img alt="Themiify Official Logo" className="h-7 w-auto object-contain" src="/icon.svg" />
                <span className="font-headline-md text-headline-md text-on-surface font-bold">Themiify Videos</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">منصة معالجة ورفع وسائط سريعة، فورية، ومصممة لخدمة المبدعين وصناع المحتوى بكفاءة تامة ودون تعقيد.</p>
            </div>
            <div className="flex flex-wrap items-center gap-space-lg">
              <a className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary-container transition-colors" href="https://themiify.com" target="_blank" rel="noopener noreferrer">خدمات Themiify</a>
              <Link className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary-container transition-colors" href="#">شروط الاستخدام</Link>
              <Link className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary-container transition-colors" href="#">سياسة الخصوصية</Link>
              <Link className="font-label-lg text-label-lg text-on-surface-variant hover:text-primary-container transition-colors" href="/tools">مركز الأدوات</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-md border-t border-outline-variant/30">
            <span className="font-body-sm text-body-sm text-on-surface-variant">© {new Date().getFullYear()} Themiify.com. جميع الحقوق محفوظة لشبكة منصات Themiify.</span>
            <div className="flex items-center gap-space-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-success-green"></span>
              <span className="font-label-md text-label-md text-on-surface-variant">أنظمة السيرفرات نشطة وتعمل بكفاءة 100%</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
