'use client';
import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { FREE_PUBLIC_MODE, MAX_VIDEO_BYTES_PER_UPLOAD } from '@/app/lib/plans';
import { MEDIA_ACCEPT, MEDIA_FORMATS_AR, isAllowedMediaFile } from '@/app/lib/mediaTypes';
import { LINK_TTL_OPTIONS } from '@/app/lib/linkTtl';
import { applyWatermarkToFile, supportsWatermark } from '@/app/lib/watermark';
import { compressVideoFile } from '@/app/lib/videoCompress';

const MAX_BATCH_FILES = 10;

export default function VideoUpload({
  onUpload,
  loading,
  progress,
  error,
  onToast,
  onCopy,
  isLoggedIn = false,
  canUpload = false,
  maxUploadBytes = MAX_VIDEO_BYTES_PER_UPLOAD,
  stats,
  setShowAuthModal = () => {},
}) {
  const effectiveCanUpload = isLoggedIn;
  const effectiveIsLoggedIn = isLoggedIn;
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [lastUploaded, setLastUploaded] = useState(null);
  const [batchResults, setBatchResults] = useState([]);
  const [visibility, setVisibility] = useState('public');
  const [linkTtl, setLinkTtl] = useState('none');
  const [watermarkText, setWatermarkText] = useState('');
  const [compressVideo, setCompressVideo] = useState(true);
  const [useWatermark, setUseWatermark] = useState(false);
  const [batchIndex, setBatchIndex] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const inputRef = useRef(null);
  const cameraRef = useRef(null);

  const maxMbRounded = Math.max(1, Math.round(maxUploadBytes / (1024 * 1024)));

  const validateFile = useCallback(
    (file) => {
      if (!isAllowedMediaFile(file.name, file.type)) {
        return `صيغة الملف غير مدعومة. الصيغ المتاحة: ${MEDIA_FORMATS_AR}.`;
      }
      if (file.size > maxUploadBytes) {
        const mb = Math.max(1, Math.round(maxUploadBytes / (1024 * 1024)));
        return `حجم الملف يتجاوز الحد المسموح (${mb} ميجابايت).`;
      }
      return null;
    },
    [maxUploadBytes]
  );

  const prepareFile = useCallback(
    async (file) => {
      let prepared = file;
      if (compressVideo && file.type.startsWith('video/')) {
        prepared = await compressVideoFile(file);
      }
      if (useWatermark && watermarkText.trim() && supportsWatermark(prepared)) {
        prepared = await applyWatermarkToFile(prepared, { text: watermarkText });
      }
      return prepared;
    },
    [compressVideo, useWatermark, watermarkText]
  );

  const handleFile = useCallback(
    async (file) => {
      if (!effectiveCanUpload) return;
      const err = validateFile(file);
      if (err) {
        setFileError(err);
        return;
      }
      setFileError('');
      setSelectedFile(file);
      setLastUploaded(null);
      setBatchResults([]);

      try {
        const prepared = await prepareFile(file);
        const result = await onUpload(prepared, visibility, linkTtl);
        setLastUploaded(result);
        setSelectedFile(null);
        onToast(
          file.type.startsWith('image/') ? 'تم رفع الصورة بنجاح' : 'تم رفع الفيديو بنجاح',
          'success'
        );
        return result;
      } catch (e) {
        onToast(e.message ? `تعذّر الرفع: ${e.message}` : 'تعذّر رفع الملف، حاول مرة أخرى.', 'error');
        throw e;
      }
    },
    [onUpload, onToast, visibility, linkTtl, effectiveCanUpload, validateFile, prepareFile]
  );

  const handleFiles = useCallback(
    async (fileList) => {
      if (!effectiveCanUpload) return;
      const files = Array.from(fileList || []).slice(0, MAX_BATCH_FILES);
      if (!files.length) return;

      if (files.length > MAX_BATCH_FILES) {
        onToast(`تم اختيار ${files.length} ملف — سيتم رفع أول ${MAX_BATCH_FILES} فقط.`, 'success');
      }

      setFileError('');
      setLastUploaded(null);
      setBatchResults([]);
      setBatchTotal(files.length);
      setBatchIndex(0);

      const results = [];
      for (let i = 0; i < files.length; i++) {
        setBatchIndex(i + 1);
        const file = files[i];
        const err = validateFile(file);
        if (err) {
          onToast(`${file.name}: ${err}`, 'error');
          continue;
        }
        try {
          const prepared = await prepareFile(file);
          const result = await onUpload(prepared, visibility, linkTtl);
          results.push(result);
        } catch (e) {
          onToast(`${file.name}: ${e.message || 'فشل الرفع'}`, 'error');
        }
      }

      setBatchTotal(0);
      setBatchIndex(0);
      setSelectedFile(null);

      if (results.length) {
        setBatchResults(results);
        setLastUploaded(results[results.length - 1]);
        onToast(`اكتمل رفع ${results.length} من ${files.length} ملف`, 'success');
      }
    },
    [effectiveCanUpload, validateFile, prepareFile, onUpload, visibility, linkTtl, onToast]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!effectiveCanUpload) {
      setShowAuthModal(true);
      return;
    }
    if (loading) return;
    const files = e.dataTransfer.files;
    if (files.length > 1) handleFiles(files);
    else if (files[0]) handleFile(files[0]);
  };

  const onInputChange = (e) => {
    if (!effectiveCanUpload) {
      e.target.value = '';
      return;
    }
    const files = e.target.files;
    if (files?.length > 1) handleFiles(files);
    else if (files?.[0]) handleFile(files[0]);
    e.target.value = '';
  };

  const onCameraChange = (e) => {
    if (!effectiveCanUpload) {
      e.target.value = '';
      return;
    }
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const displayError = fileError || error;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-space-xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm">
        <div>
          <div className="inline-flex items-center gap-space-xs bg-warm-surface px-space-sm py-space-xs rounded-lg text-primary-container font-label-md text-label-md mb-space-xs">
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>مركز الإعدادات المتقدمة</span>
          </div>
          <h2 className="font-headline-xl text-headline-xl text-on-surface">منطقة الرفع المجانية الذكية</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">حتى ٥٠ ميجابايت لكل ملف — ارفع فيديوهات وصور مباشرة بدون تسجيل مع خيارات تشفير فورية</p>
        </div>
        <div className="flex items-center gap-space-md bg-surface-container-lowest p-space-sm rounded-xl shadow-sm">
          <div className="text-center px-space-sm">
            <div className="font-headline-sm text-headline-sm text-on-surface">{stats?.totalVideos || 0}</div>
            <div className="font-label-md text-label-md text-on-surface-variant">ملفات جاهزة</div>
          </div>
          <div className="w-px h-6 bg-surface-container"></div>
          <div className="text-center px-space-sm">
            <div className="font-headline-sm text-headline-sm text-primary-container">{loading ? `${Math.round(progress)}%` : '0%'}</div>
            <div className="font-label-md text-label-md text-on-surface-variant">المعالجة الحالية</div>
          </div>
          <div className="w-px h-6 bg-surface-container"></div>
          <div className="text-center px-space-sm">
            <div className="font-headline-sm text-headline-sm text-success-green">مجاني</div>
            <div className="font-label-md text-label-md text-on-surface-variant">سرعة الرفع</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => {
              if (!effectiveCanUpload) {
                setShowAuthModal(true);
              } else if (!loading) {
                inputRef.current?.click();
              }
            }}
            className={`relative group bg-surface-container-lowest rounded-xl p-space-2xl text-center shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md flex flex-col items-center justify-center min-h-[360px] ${dragOver ? 'bg-warm-surface scale-[1.01]' : ''} ${loading ? 'pointer-events-none opacity-80' : ''}`}
            id="dropzone"
          >
            <input
              ref={inputRef}
              type="file"
              accept={MEDIA_ACCEPT}
              multiple
              className="hidden"
              onChange={onInputChange}
              disabled={loading || !effectiveCanUpload}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary-container/5 via-transparent to-transparent pointer-events-none rounded-xl"></div>
            
            <div className={`w-20 h-20 rounded-full bg-warm-surface flex items-center justify-center mb-space-lg shadow-[0_8px_24px_-4px_rgba(255,94,30,0.25)] transition-transform duration-300 ${dragOver ? 'scale-110' : 'group-hover:scale-105'}`}>
              <span className={`material-symbols-outlined text-[44px] ${loading ? 'text-primary animate-spin' : 'text-primary-container'}`}>
                {loading ? 'autorenew' : 'cloud_upload'}
              </span>
            </div>
            
            <h3 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs font-bold">
              {loading
                ? `جاري الرفع${batchTotal > 0 ? ' (' + batchIndex + '/' + batchTotal + ')' : ''}…`
                : dragOver
                    ? 'أفلِت الملفات هنا'
                    : 'اسحب ملفات (حتى 10) وأفلِتها هنا'}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-space-lg">
              أو انقر للاختيار — يدعم MP4 أو WebM أو MOV أو JPG أو PNG أو WebP أو GIF أو SVG، حتى 50 ميجابايت
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-space-sm relative z-10">
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (!effectiveCanUpload) {
                    setShowAuthModal(true);
                  } else {
                    inputRef.current?.click();
                  }
                }}
                disabled={loading}
                className="inline-flex items-center gap-space-xs bg-primary-container hover:bg-primary text-on-primary font-headline-sm text-headline-sm px-space-lg py-space-sm rounded-xl shadow-[0_8px_24px_-4px_rgba(255,94,30,0.35)] transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">file_open</span>
                <span>تصفح جهازك</span>
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!effectiveCanUpload) {
                    setShowAuthModal(true);
                  } else {
                    cameraRef.current?.click();
                  }
                }}
                disabled={loading}
                className="inline-flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface font-headline-sm text-headline-sm px-space-lg py-space-sm rounded-xl transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-primary-container text-[20px]">photo_camera</span>
                <span>التقاط من الكاميرا</span>
              </button>
              <input
                ref={cameraRef}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                className="hidden"
                onChange={onCameraChange}
                disabled={loading}
              />
            </div>

            <div className="mt-space-xl flex flex-wrap justify-center items-center gap-space-xs">
              <span className="bg-surface-container px-space-sm py-space-xs rounded-lg font-code-badge text-code-badge text-on-surface-variant font-bold">MP4</span>
              <span className="bg-surface-container px-space-sm py-space-xs rounded-lg font-code-badge text-code-badge text-on-surface-variant font-bold">WEBM</span>
              <span className="bg-surface-container px-space-sm py-space-xs rounded-lg font-code-badge text-code-badge text-on-surface-variant font-bold">MOV</span>
              <span className="bg-surface-container px-space-sm py-space-xs rounded-lg font-code-badge text-code-badge text-on-surface-variant font-bold">PNG</span>
              <span className="bg-surface-container px-space-sm py-space-xs rounded-lg font-code-badge text-code-badge text-on-surface-variant font-bold">JPG</span>
              <span className="bg-surface-container px-space-sm py-space-xs rounded-lg font-code-badge text-code-badge text-on-surface-variant font-bold">WEBP</span>
            </div>
          </div>

          {displayError && (
            <div className="bg-error-container p-space-md rounded-xl text-error font-body-sm text-body-sm shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {displayError}
            </div>
          )}

          {loading && selectedFile && (
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary-container text-[24px]">videocam</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface truncate">{selectedFile.name}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • جاري المعالجة...</p>
                  </div>
                </div>
                <div className="text-left">
                  <span className="font-headline-sm text-headline-sm text-primary-container font-bold">{Math.round(progress)}%</span>
                </div>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mb-space-sm">
                <div className="bg-primary-container h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-success-green text-[18px]">verified</span>
                  <span className="text-success-green font-semibold">يتم معالجة الملف</span>
                </div>
              </div>
            </div>
          )}
          
          {lastUploaded && (
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-success-green/20">
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-success-green/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-success-green text-[24px]">check_circle</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">اكتمل الرفع</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">تم حفظ الملف وتأمين الرابط</p>
                  </div>
                </div>
                <button onClick={() => onCopy(lastUploaded.shortUrl || lastUploaded.url)} className="text-primary-container hover:text-primary transition-colors flex items-center gap-space-xs font-label-md">
                  <span className="material-symbols-outlined text-[18px]">content_copy</span> نسخ الرابط
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary-container text-[20px]">admin_panel_settings</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">خيارات الخصوصية والأمان</h3>
              </div>
              <span className="bg-warm-surface text-primary-container font-label-md text-label-md px-space-sm py-space-xs rounded-lg font-bold">تحكم كامل</span>
            </div>
            
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-lg text-label-lg text-on-surface font-bold">مستوى الظهور</label>
              <div className="grid grid-cols-3 gap-space-xs bg-surface-container p-space-xs rounded-xl">
                <button 
                  onClick={() => setVisibility('public')}
                  className={`py-space-xs px-space-xs rounded-lg text-center font-label-md text-label-md transition-colors ${visibility === 'public' ? 'bg-surface-container-lowest text-on-surface font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} 
                  type="button"
                >
                  عام للجميع
                </button>
                <button 
                  onClick={() => setVisibility('unlisted')}
                  className={`py-space-xs px-space-xs rounded-lg text-center font-label-md text-label-md transition-colors ${visibility === 'unlisted' ? 'bg-surface-container-lowest text-on-surface font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} 
                  type="button"
                >
                  غير مُدرَج
                </button>
                <button 
                  onClick={() => setVisibility('private')}
                  className={`py-space-xs px-space-xs rounded-lg text-center font-label-md text-label-md flex items-center justify-center gap-space-xs transition-colors ${visibility === 'private' ? 'bg-surface-container-lowest text-on-surface font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  <span>رمز PIN</span>
                </button>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">غير مدرج: لا يظهر بالبحث أو القوائم، فقط لمن يمتلك الرابط الحصري.</p>
            </div>

            <div className="flex flex-col gap-space-xs">
              <label className="font-label-lg text-label-lg text-on-surface font-bold">مدة صلاحية الرابط</label>
              <div className="relative">
                <select 
                  value={linkTtl}
                  onChange={(e) => setLinkTtl(e.target.value)}
                  className="w-full h-11 px-space-md bg-surface-container text-on-surface rounded-xl font-body-md text-body-md appearance-none focus:outline-none focus:bg-surface-container-high transition-colors cursor-pointer"
                >
                  <option value="never">بدون انتهاء صلاحية (دائم)</option>
                  <option value="7d">أسبوع واحد (7 أيام)</option>
                  <option value="1d">يوم واحد (24 ساعة)</option>
                  <option value="1h">ساعة واحدة فقط</option>
                </select>
                <div className="absolute left-space-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant flex items-center">
                  <span className="material-symbols-outlined text-[20px]">expand_more</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-space-md pt-space-xs">
              <div className="flex flex-col gap-2 p-space-sm bg-surface-container rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-primary-container text-[20px]">branding_watermark</span>
                    <div>
                      <div className="font-label-lg text-label-lg text-on-surface font-semibold">علامة مائية Themiify</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">حماية حقوق الصور الترويجية</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={useWatermark} onChange={(e) => setUseWatermark(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                  </label>
                </div>
                {useWatermark && (
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="نص العلامة المائية"
                    className="w-full mt-2 rounded-lg bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none border border-surface-container-highest focus:border-primary-container transition-colors"
                  />
                )}
              </div>

              <div className="flex items-center justify-between p-space-sm bg-surface-container rounded-xl">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-primary-container text-[20px]">auto_fix_high</span>
                  <div>
                    <div className="font-label-lg text-label-lg text-on-surface font-semibold">ضغط الفيديو الذكي قبل الرفع</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">يقلل الحجم 65% مع الحفاظ على الجودة 4K</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={compressVideo} onChange={(e) => setCompressVideo(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                </label>
              </div>
            </div>

            <div className="bg-warm-surface p-space-md rounded-xl flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-primary-container text-[22px] shrink-0">info</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                سيرفراتنا لا تشارك أي بيانات، والملفات المرفوعة تخضع لنظام الحذف التلقائي الآمن وفق اختيارك.
              </p>
            </div>
          </div>

          {stats && (
            <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-around text-center">
              <div>
                <span className="font-label-md text-label-md text-on-surface-variant block">إجمالي الملفات</span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold">{stats.totalVideos || 0}</span>
              </div>
              <div className="w-px h-8 bg-surface-container"></div>
              <div>
                <span className="font-label-md text-label-md text-on-surface-variant block">المشاهدات النشطة</span>
                <span className="font-headline-md text-headline-md text-primary-container font-bold">{stats.totalViews || 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
