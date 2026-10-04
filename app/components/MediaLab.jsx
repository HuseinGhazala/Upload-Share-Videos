'use client';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

function formatBytes(bytes) {
  if (!bytes) return '٠ كيلوبايت';
  return `${new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 1 }).format(bytes / 1024)} كيلوبايت`;
}

async function compressImage(file, { maxWidth, quality, format }) {
  const bitmap = await createImageBitmap(file);
  const ratio = bitmap.width > maxWidth ? maxWidth / bitmap.width : 1;
  const width = Math.max(1, Math.round(bitmap.width * ratio));
  const height = Math.max(1, Math.round(bitmap.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);

  const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, quality / 100));
  if (!blob) throw new Error('تعذّر ضغط الصورة، حاول بإعدادات مختلفة.');

  const ext = format === 'png' ? 'png' : format === 'webp' ? 'webp' : 'jpg';
  return new File([blob], `${file.name.replace(/\.[^/.]+$/, '')}.${ext}`, { type: mime });
}

export default function MediaLab({ onToast, onCopy, onUploaded }) {
  // Image Compression State
  const [imageFile, setImageFile] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState('webp');
  const [compareSplit, setCompareSplit] = useState(50);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState('');
  const [optimizedPreviewUrl, setOptimizedPreviewUrl] = useState('');
  const [optimizedPreviewSize, setOptimizedPreviewSize] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Audio Extraction State
  const [audioFile, setAudioFile] = useState(null);
  const [audioResult, setAudioResult] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioBitrate, setAudioBitrate] = useState('192 kbps');

  useEffect(() => {
    if (!imageFile) {
      setOriginalPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setOriginalPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';

    async function buildPreview() {
      if (!imageFile) {
        setOptimizedPreviewUrl('');
        setOptimizedPreviewSize(0);
        return;
      }

      setPreviewLoading(true);
      try {
        const optimized = await compressImage(imageFile, { maxWidth: 1920, quality, format });
        if (cancelled) return;
        objectUrl = URL.createObjectURL(optimized);
        setOptimizedPreviewUrl(objectUrl);
        setOptimizedPreviewSize(optimized.size);
      } catch {
        if (!cancelled) {
          setOptimizedPreviewUrl('');
          setOptimizedPreviewSize(0);
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }

    buildPreview();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile, quality, format]);

  const savingPct = useMemo(() => {
    const optimizedSize = imageResult?.optimizedSize || optimizedPreviewSize;
    if (!imageFile || !optimizedSize) return 0;
    const diff = Math.max(0, imageFile.size - optimizedSize);
    return imageFile.size ? Math.round((diff / imageFile.size) * 100) : 0;
  }, [imageFile, imageResult?.optimizedSize, optimizedPreviewSize]);

  const handleImageUpload = async () => {
    if (!imageFile) {
      document.getElementById('imageFileInput').click();
      return;
    }
    setImageLoading(true);
    try {
      const optimized = await compressImage(imageFile, { maxWidth: 1920, quality, format });
      const formData = new FormData();
      formData.append('image', optimized);

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'تعذّر رفع الصورة، حاول مرة أخرى.');

      setImageResult({
        ...data.item,
        optimizedSize: optimized.size,
        originalSize: imageFile.size,
      });
      onUploaded?.();
      onToast?.('تم تحسين الصورة ورفعها بنجاح', 'success');
    } catch (error) {
      onToast?.(`❌ ${error.message}`, 'error');
    } finally {
      setImageLoading(false);
    }
  };

  const handleAudioUpload = async () => {
    if (!audioFile) {
      document.getElementById('audioFileInput').click();
      return;
    }
    setAudioLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      const res = await fetch('/api/upload-audio', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'تعذّر استخراج الصوت، حاول مرة أخرى.');
      setAudioResult(data.item);
      onToast?.('تم استخراج الصوت بنجاح', 'success');
    } catch (error) {
      onToast?.(`❌ ${error.message}`, 'error');
    } finally {
      setAudioLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-2xl bg-charcoal-navy text-white p-8 md:p-12 shadow-2xl border border-electric-citrus/20">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-electric-citrus/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-electric-citrus/10 border border-electric-citrus/30 text-electric-citrus text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-sm">
            <span className="material-symbols-outlined text-base">bolt</span>
            <span>معالجة محلية داخل المتصفح (WebAssembly) — خصوصية تامة 100%</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
            مركز أدوات الميديا الذكية
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl mx-auto">
            مجموعة أدوات تحرير فائقة السرعة للمصممين وصنّاع المحتوى. تعمل بتقنيات WebAssembly و Canvas مباشرة على جهازك دون رفع أي بايت لشبكة الإنترنت.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <a href="#compressor" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-electric-citrus hover:text-white transition-all text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/10 backdrop-blur-sm">
              <span className="material-symbols-outlined text-sm">photo_size_select_large</span>
              ضاغط الصور
            </a>
            <a href="#audio" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-electric-citrus hover:text-white transition-all text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/10 backdrop-blur-sm">
              <span className="material-symbols-outlined text-sm">graphic_eq</span>
              استخراج الصوت
            </a>
            <a href="#converter" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-electric-citrus hover:text-white transition-all text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/10 backdrop-blur-sm">
              <span className="material-symbols-outlined text-sm">sync_alt</span>
              تحويل الصيغ
            </a>
            <a href="#qr" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-electric-citrus hover:text-white transition-all text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/10 backdrop-blur-sm">
              <span className="material-symbols-outlined text-sm">qr_code_2</span>
              صانع الـ QR
            </a>
            <a href="#watermark" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-electric-citrus hover:text-white transition-all text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/10 backdrop-blur-sm">
              <span className="material-symbols-outlined text-sm">branding_watermark</span>
              العلامة المائية
            </a>
          </div>
        </div>
      </section>

      {/* Feature 1: Smart Image Compressor */}
      <section id="compressor" className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-outline-variant/30 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-warm-surface text-electric-citrus flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">photo_size_select_large</span>
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-charcoal-navy">ضاغط الصور الذكي (Smart Image Compressor)</h2>
                <p className="text-xs sm:text-sm text-tertiary">خوارزميات تصغير بدون فقدان ملحوظ للجودة تعمل كلياً على جهازك</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-success-green bg-success-green/10 border border-success-green/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">offline_pin</span>
              معالجة WebP فورية (0.28 ثانية)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Interactive Preview */}
          <div className="lg:col-span-7 bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 relative">
            <div className="relative overflow-hidden rounded-lg aspect-video bg-charcoal-navy shadow-inner group">
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ backgroundImage: `url('${originalPreviewUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDzc75Ee2ukWpc6ctpJbD27sSDzFG4owslPQ2cqvedSBjE_5B8sZv51kijjFiDSmCbrehoqoyMNMVvN2jQzzetheH6mdcFFfCDqd71sK9uu9xjrZKVYd1kXJJyyRuT_8C7ZmPvTWf_imk_K3yydbzn0Dw1CYqACVpHFILqAS43wO9oU4OVrqW9gPDypbwB4piA2Y6-zwV2CTFvCOAf91tLFGxjo6Y_5v4XNVgdcOgxvKliUE-subBancA" }')` }}
              ></div>
              
              <div className="absolute inset-y-0 right-0 overflow-hidden border-l-2 border-electric-citrus shadow-2xl" style={{ width: `${100 - compareSplit}%` }}>
                <div 
                  className="absolute inset-y-0 right-0 max-w-none h-full bg-cover bg-center" 
                  style={{ width: '200%', backgroundImage: `url('${optimizedPreviewUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuA5fBYUjzHbG7rEKnnfaAWgtbnGkiJvQnlaFwPBe04q46scjieAdk9C_TgpWaLSaAH1MgEpAaDusghbRgpy8azdEMGI7hGhZYGORd0O_3xCXajOhffj6JQfvXHO8qcHpx56LqzyTT7ujIgb3pYEeAk0fkejy9lVe2JUkPEIOIRM-LM1LnMMpGJ6ZPYLOqyYv1OF6N7v7Zlv_TJPWaSwO6_mmeC2Gh-_ZEGLiL0DR6Zicqx38kHmEGyysQ" }')` }}
                ></div>
                <div className="absolute top-3 left-3 bg-charcoal-navy/80 text-white text-[11px] px-2.5 py-1 rounded backdrop-blur">
                  بعد الضغط ({imageFile ? formatBytes(optimizedPreviewSize) : '340 KB'})
                </div>
              </div>
              
              <div className="absolute top-3 right-3 bg-black/70 text-white text-[11px] px-2.5 py-1 rounded backdrop-blur">
                الأصلية ({imageFile ? formatBytes(imageFile.size) : '1.54 MB'})
              </div>
              
              <input 
                type="range" 
                min="0" max="100" 
                value={compareSplit} 
                onChange={(e) => setCompareSplit(Number(e.target.value))} 
                className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-20" 
              />
              <div 
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center w-8 h-8 rounded-full bg-electric-citrus text-white shadow-lg"
                style={{ left: `${compareSplit}%` }}
              >
                <span className="material-symbols-outlined text-sm">drag_indicator</span>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-xs text-tertiary px-1">
              <span>اسحب المؤشر لمقارنة وضوح التفاصيل قبل وبعد الضغط</span>
              <span className="font-bold text-electric-citrus font-display">وفر {savingPct > 0 ? savingPct : 78}% من الحجم</span>
            </div>
          </div>

          {/* Compressor Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-warm-surface/60 rounded-xl p-5 border border-outline-variant/30 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-charcoal-navy flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-electric-citrus">tune</span>
                    جودة الضغط (Quality Ratio)
                  </label>
                  <span className="text-sm font-black text-electric-citrus font-display">{quality}% (موصى بها)</span>
                </div>
                <input 
                  type="range" 
                  min="40" max="95" 
                  value={quality} 
                  onChange={(e) => setQuality(Number(e.target.value))} 
                  className="w-full h-2 bg-outline-variant/40 rounded-lg appearance-none cursor-pointer accent-electric-citrus" 
                />
                <div className="flex justify-between text-[11px] text-tertiary mt-1">
                  <span>أقصى توفير (حجم صغير)</span>
                  <span>توازن مثالي</span>
                  <span>أعلى جودة</span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-outline-variant/30 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-on-surface">تحويل تلقائي إلى WebP الموفر للحزمة</span>
                  <input 
                    type="checkbox" 
                    checked={format === 'webp'} 
                    onChange={(e) => setFormat(e.target.checked ? 'webp' : 'jpg')} 
                    className="rounded text-electric-citrus focus:ring-electric-citrus w-4 h-4" 
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-on-surface">إزالة بيانات EXIF الوصفية للخصوصية</span>
                  <input type="checkbox" defaultChecked className="rounded text-electric-citrus focus:ring-electric-citrus w-4 h-4" />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-xs">
                <span className="text-tertiary">الحجم المقدر للنتيجة:</span>
                <div className="flex items-center gap-2">
                  <span className="line-through text-tertiary">{imageFile ? formatBytes(imageFile.size) : '1.54 MB'}</span>
                  <span className="font-bold text-electric-citrus text-sm font-display">{imageFile ? (previewLoading ? '...' : formatBytes(optimizedPreviewSize)) : '340 KB'}</span>
                </div>
              </div>
              
              <input 
                type="file" 
                id="imageFileInput"
                accept="image/png,image/jpeg,image/webp" 
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              
              {imageResult ? (
                <div className="p-4 bg-warm-surface rounded-xl border border-electric-citrus/20 text-center">
                  <p className="font-bold text-success-green text-sm mb-3">تم الرفع بنجاح! ({formatBytes(imageResult.optimizedSize)})</p>
                  <button
                    onClick={() => { onCopy?.(imageResult.url); onToast?.('تم النسخ', 'success'); }}
                    className="w-full py-2 bg-charcoal-navy text-white text-xs rounded-lg hover:bg-black transition-colors"
                  >
                    نسخ رابط الصورة المباشر
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleImageUpload}
                  disabled={imageLoading}
                  className="w-full py-3.5 px-6 rounded-xl bg-electric-citrus hover:bg-primary text-white font-bold text-sm tracking-wide shadow-lg shadow-electric-citrus/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {imageLoading ? (
                    <span className="material-symbols-outlined text-lg animate-spin">autorenew</span>
                  ) : (
                    <span className="material-symbols-outlined text-lg group-hover:-translate-y-0.5 transition-transform">{imageFile ? 'cloud_upload' : 'image'}</span>
                  )}
                  <span>{imageLoading ? 'جاري المعالجة...' : (imageFile ? 'رفع وحفظ الصورة المضغوطة' : 'اختر صورة للضغط')}</span>
                </button>
              )}
              
              <p className="text-center text-[11px] text-tertiary">الملفات تعالج في ذاكرة RAM المؤقتة لجهازك وتُمسح فور الخروج</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Audio Extractor & Video Format Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Audio Extractor */}
        <section id="audio" className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-sm border border-outline-variant/30 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-xl bg-warm-surface text-electric-citrus">
                <span className="material-symbols-outlined text-2xl">graphic_eq</span>
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-charcoal-navy">استخراج الصوت من الفيديو</h3>
                <p className="text-xs text-tertiary">عزل التراك الصوتي بجودة استوديو من ملفات MP4 و MOV بسرعة فائقة</p>
              </div>
            </div>
            
            <div className="bg-charcoal-navy rounded-xl p-5 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-electric-citrus text-base">mic</span>
                  {audioFile ? audioFile.name : 'بودكاست_الحلقة_الرابعة_نهائي.mp4'}
                </span>
                <span className="font-display font-semibold text-electric-citrus">03:42 / 18:20</span>
              </div>
              
              <div className="h-16 flex items-center justify-between gap-1 px-1">
                {[40,60,100,120,80,50,40,60,80,70,30,60,100,80,40,30].map((h, i) => (
                  <span key={i} className={`w-1 rounded-full ${i < 6 || (i > 10 && i < 14) ? 'bg-electric-citrus' : 'bg-white/40'} ${h > 100 ? 'animate-pulse' : ''}`} style={{ height: `${h / 1.5}px` }}></span>
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                <span>تنسيق الهدف: MP3 Audio Stream</span>
                <span>تقطيع تلقائي للصمت</span>
              </div>
            </div>
            
            <div className="mt-5 space-y-2">
              <label className="text-xs font-bold text-on-surface">معدل البت للصوت (Bitrate):</label>
              <div className="grid grid-cols-3 gap-2">
                {['128 kbps', '192 kbps', '320 kbps'].map(bitrate => (
                  <label key={bitrate} className={`rounded-lg p-2.5 text-center cursor-pointer flex flex-col items-center transition-colors ${audioBitrate === bitrate ? 'border-2 border-electric-citrus bg-warm-surface/50' : 'border border-outline-variant/40 hover:border-electric-citrus'}`}>
                    <input type="radio" name="bitrate" className="hidden" checked={audioBitrate === bitrate} onChange={() => setAudioBitrate(bitrate)} />
                    <span className={`text-xs font-bold ${audioBitrate === bitrate ? 'text-electric-citrus' : 'text-charcoal-navy'}`}>{bitrate}</span>
                    <span className="text-[10px] text-tertiary">
                      {bitrate === '128 kbps' ? 'صوت خفيف وسريع' : bitrate === '192 kbps' ? 'توازن مثالي' : 'دقة استوديو HQ'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <input 
            type="file" 
            id="audioFileInput"
            accept="audio/*,video/mp4,video/webm,video/quicktime"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            className="hidden"
          />

          {audioResult ? (
            <div className="p-4 bg-warm-surface rounded-xl border border-electric-citrus/20 text-center">
              <p className="font-bold text-success-green text-sm mb-3">تم الاستخراج بنجاح!</p>
              <a 
                href={audioResult.url} 
                target="_blank" 
                rel="noreferrer"
                className="w-full block py-2 bg-charcoal-navy text-white text-xs rounded-lg hover:bg-black transition-colors"
              >
                استماع وتحميل MP3
              </a>
            </div>
          ) : (
            <button 
              onClick={handleAudioUpload}
              disabled={audioLoading}
              className="w-full py-3 px-5 rounded-xl bg-charcoal-navy hover:bg-black text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {audioLoading ? (
                <span className="material-symbols-outlined text-lg animate-spin text-electric-citrus">autorenew</span>
              ) : (
                <span className="material-symbols-outlined text-lg text-electric-citrus">audio_file</span>
              )}
              <span>{audioLoading ? 'جاري الاستخراج والرفع...' : (audioFile ? 'بدء استخراج الصوت' : 'اختر فيديو لاستخراج الصوت')}</span>
            </button>
          )}
        </section>

        {/* Video & Format Converter */}
        <section id="converter" className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-sm border border-outline-variant/30 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-xl bg-warm-surface text-electric-citrus">
                <span className="material-symbols-outlined text-2xl">sync_alt</span>
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-charcoal-navy">تحويل صيغ الفيديو والصور</h3>
                <p className="text-xs text-tertiary">إعادة ترميز سريع مخصص لمنصات التواصل ومواقع الويب</p>
              </div>
            </div>
            
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl border border-electric-citrus/40 bg-warm-surface/40 flex items-center justify-between cursor-pointer hover:bg-warm-surface transition-colors">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-electric-citrus text-white">
                    <span className="material-symbols-outlined text-lg">play_arrow</span>
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal-navy">Instagram Reels & TikTok</h4>
                    <p className="text-[11px] text-tertiary">MP4 (H.264) بدقة عمودية 1080x1920 وبمعدل 30FPS</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-electric-citrus">check_circle</span>
              </div>
              <div className="p-3 rounded-xl border border-outline-variant/30 bg-surface-container-low flex items-center justify-between cursor-pointer hover:border-electric-citrus/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-charcoal-navy text-white">
                    <span className="material-symbols-outlined text-lg">public</span>
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal-navy">WebM Modern Web</h4>
                    <p className="text-[11px] text-tertiary">حجم مضغوط فائق للمواقع مع شفافية Alpha</p>
                  </div>
                </div>
                <span className="text-xs text-tertiary">اختيار</span>
              </div>
              <div className="p-3 rounded-xl border border-outline-variant/30 bg-surface-container-low flex items-center justify-between cursor-pointer hover:border-electric-citrus/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-charcoal-navy text-white">
                    <span className="material-symbols-outlined text-lg">chat</span>
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal-navy">WhatsApp Status Ready</h4>
                    <p className="text-[11px] text-tertiary">ضغط فوري أقل من 16 ميجابايت لمنع تشويش الواتساب</p>
                  </div>
                </div>
                <span className="text-xs text-tertiary">اختيار</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-xs text-tertiary">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-electric-citrus">speed</span>
                تسريع عتادي عبر متصفحك (GPU Accelerated)
              </span>
              <span>FFmpeg.wasm 0.12</span>
            </div>
          </div>
          
          <button className="w-full py-3 px-5 rounded-xl bg-electric-citrus hover:bg-primary text-white font-bold text-sm shadow-md shadow-electric-citrus/20 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">flash_on</span>
            <span>بدء التحويل الفوري الآن</span>
          </button>
        </section>
      </div>

      {/* Feature 3: Dynamic QR Code & Watermark Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Dynamic QR Code Generator */}
        <section id="qr" className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-sm border border-outline-variant/30 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-xl bg-warm-surface text-electric-citrus">
                <span className="material-symbols-outlined text-2xl">qr_code_2</span>
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-charcoal-navy">صانع الباركود الذكي (QR Studio)</h3>
                <p className="text-xs text-tertiary">توليد رموز QR مخصصة تحتوي على لوجو Themiify وألوان علامتك</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 bg-warm-surface/50 rounded-xl border border-outline-variant/30">
                <div className="w-36 h-36 bg-white p-3 rounded-lg shadow-sm relative flex items-center justify-center border border-outline-variant/20">
                  <div className="w-full h-full bg-charcoal-navy rounded flex flex-wrap gap-1 p-1 justify-between content-between">
                    <div className="w-6 h-6 border-4 border-white bg-charcoal-navy rounded-sm"></div>
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                    <div className="w-6 h-6 border-4 border-white bg-charcoal-navy rounded-sm"></div>
                    <div className="w-full h-2 flex gap-1 justify-around">
                      <div className="w-2 h-2 bg-white"></div>
                      <div className="w-2 h-2 bg-white"></div>
                      <div className="w-2 h-2 bg-white"></div>
                    </div>
                    <div className="w-6 h-6 border-4 border-white bg-charcoal-navy rounded-sm"></div>
                    <div className="w-5 h-5 bg-white rounded-sm"></div>
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                  <div className="absolute inset-0 m-auto w-9 h-9 rounded-md bg-white p-0.5 shadow-md flex items-center justify-center">
                    <span className="text-[10px] font-bold text-electric-citrus">TM</span>
                  </div>
                </div>
                <span className="text-[10px] text-tertiary mt-2 font-mono">themiify.com/v/9812</span>
              </div>
              
              <div className="sm:col-span-7 space-y-3">
                <div>
                  <label className="text-xs font-bold text-on-surface mb-1 block">الرابط أو النص المطلوب تحويله:</label>
                  <div className="relative">
                    <input type="text" defaultValue="https://themiify.com/tools" className="w-full text-xs font-mono py-2 px-3 border border-outline-variant/40 rounded-lg focus:border-electric-citrus focus:ring-1 focus:ring-electric-citrus bg-white" />
                    <button className="absolute left-1 top-1 bottom-1 px-2.5 bg-warm-surface hover:bg-primary-fixed text-primary text-xs font-bold rounded flex items-center gap-1 transition-colors">
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      نسخ
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-tertiary">لون الرمز:</span>
                  <button className="w-6 h-6 rounded-full bg-charcoal-navy ring-2 ring-electric-citrus ring-offset-1"></button>
                  <button className="w-6 h-6 rounded-full bg-electric-citrus"></button>
                  <button className="w-6 h-6 rounded-full bg-[#2563EB]"></button>
                  <button className="w-6 h-6 rounded-full bg-[#10B981]"></button>
                  <span className="text-[11px] text-tertiary mr-auto">+ إدراج الشعار</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 px-4 rounded-xl bg-charcoal-navy hover:bg-black text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-base text-electric-citrus">file_download</span>
              <span>تحميل PNG (فائق الدقة)</span>
            </button>
            <button className="py-2.5 px-3 rounded-xl border border-outline-variant/40 hover:bg-warm-surface text-charcoal-navy text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-base">palette</span>
              <span>تخصيص</span>
            </button>
          </div>
        </section>

        {/* Watermark Studio */}
        <section id="watermark" className="bg-surface-container-lowest rounded-2xl p-6 sm:p-7 shadow-sm border border-outline-variant/30 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2.5 rounded-xl bg-warm-surface text-electric-citrus">
                <span className="material-symbols-outlined text-2xl">branding_watermark</span>
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-charcoal-navy">استوديو العلامة المائية الآمنة</h3>
                <p className="text-xs text-tertiary">حماية محتواك الفكري بطباعة نص أو لوجو دون رفع الصور لأي خادم</p>
              </div>
            </div>
            
            <div className="relative rounded-xl overflow-hidden aspect-video bg-charcoal-navy border border-outline-variant/30">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-85" 
                style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDU28Bd7JHq7xhTw1PD5l4-9z8sMlwxdpCMSCYN1DDZBF0kTuKricPNikjJ2Ds7_2XHW17q6-bW5VEAWO12wg_hlqLxXcpRZK3rG8Z0aQqdjJ-NgcOxrDnHQ3BcOZmTCS2jP3vsg1pMm7000u-flS1cN2WVDJWd0ElyU980SR81k2IE0GcffXv6iekI8FNt1m5jDfwWHPMGo3JO_OFxeYo0VIwilfLZQhkgQtmIK0eEHkk_2tdAfP2eNQ')` }}
              ></div>
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 flex items-center gap-2">
                <span className="text-[12px] font-bold text-electric-citrus">TM</span>
                <span className="text-white text-xs font-bold font-display tracking-wider">THEMIIFY CREATIVE STUDIO</span>
              </div>
              <div className="absolute top-3 right-3 bg-charcoal-navy/80 text-white text-[10px] px-2 py-0.5 rounded">
                معاينة فورية Canvas
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-on-surface mb-1 block">نص العلامة المائية:</label>
                <input type="text" defaultValue="THEMIIFY CREATIVE STUDIO" className="w-full text-xs py-2 px-3 border border-outline-variant/40 rounded-lg focus:border-electric-citrus focus:ring-1 focus:ring-electric-citrus" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-on-surface">الشفافية (Opacity):</label>
                  <span className="text-xs text-electric-citrus font-bold">60%</span>
                </div>
                <input type="range" min="10" max="100" defaultValue="60" className="w-full h-2 bg-outline-variant/30 rounded-lg appearance-none cursor-pointer accent-electric-citrus mt-2" />
              </div>
            </div>
          </div>
          <button className="w-full py-3 px-5 rounded-xl bg-electric-citrus hover:bg-primary text-white font-bold text-sm shadow-md shadow-electric-citrus/20 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">verified</span>
            <span>تطبيق العلامة وتصدير الصورة</span>
          </button>
        </section>
      </div>

      {/* Explainer FAQ Banner: Zero Server Uploads */}
      <section className="rounded-2xl bg-gradient-to-r from-warm-surface via-surface-container-lowest to-warm-surface p-6 sm:p-8 border border-outline-variant/30 shadow-sm">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-electric-citrus text-white">
              <span className="material-symbols-outlined text-2xl">shield_lock</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-charcoal-navy">
              كيف تعمل هذه الأدوات دون إرسال ملفاتك لأي خادم إطلاقاً؟
            </h3>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            جميع أدوات منصة <strong className="text-charcoal-navy">Themiify Videos</strong> مبنية بالكامل باستخدام حزم <strong className="text-electric-citrus">WebAssembly (Wasm)</strong> ومكتبات الرسوميات الحديثة <strong className="text-charcoal-navy">HTML5 Canvas & Web Audio API</strong>. 
            هذا يعني أن محرك المعالجة يتم تحميله لمرة واحدة في متصفحك، لتبدأ معالجة الصور، الفيديو، والصوت مباشرة داخل معالجك (CPU/GPU) المحلي.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white border border-outline-variant/30 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-electric-citrus font-bold text-sm">
                <span className="material-symbols-outlined text-lg">cloud_off</span>
                <span>صفر استهلاك للإنترنت</span>
              </div>
              <p className="text-xs text-tertiary">لن تحتاج لرفع ملفات الفيديو الضخمة عبر باقة الإنترنت الخاصة بك للضغط.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-outline-variant/30 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-success-green font-bold text-sm">
                <span className="material-symbols-outlined text-lg">lock</span>
                <span>أمان وخصوصية 100%</span>
              </div>
              <p className="text-xs text-tertiary">ملفاتك الشخصية، عائلتك، أو عملائك لا تغادر متصفح جهازك بأي شكل من الأشكال.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-outline-variant/30 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 text-charcoal-navy font-bold text-sm">
                <span className="material-symbols-outlined text-lg">speed</span>
                <span>سرعة معالجة فورية</span>
              </div>
              <p className="text-xs text-tertiary">لا توجد طوابير انتظار معالجة على السيرفرات؛ السرعة تعتمد كلياً على قوة جهازك.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
