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
  if (!blob) throw new Error('فشل ضغط الصورة');

  const ext = format === 'png' ? 'png' : format === 'webp' ? 'webp' : 'jpg';
  return new File([blob], `${file.name.replace(/\.[^/.]+$/, '')}.${ext}`, { type: mime });
}

export default function MediaLab({ onToast }) {
  const [imageFile, setImageFile] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [audioResult, setAudioResult] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [maxWidth, setMaxWidth] = useState(1280);
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState('webp');
  const [compareSplit, setCompareSplit] = useState(50);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState('');
  const [optimizedPreviewUrl, setOptimizedPreviewUrl] = useState('');
  const [optimizedPreviewSize, setOptimizedPreviewSize] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);

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
        const optimized = await compressImage(imageFile, { maxWidth, quality, format });
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
  }, [imageFile, maxWidth, quality, format]);

  const savingText = useMemo(() => {
    const optimizedSize = imageResult?.optimizedSize || optimizedPreviewSize;
    if (!imageFile || !optimizedSize) return null;
    const diff = Math.max(0, imageFile.size - optimizedSize);
    const pct = imageFile.size ? Math.round((diff / imageFile.size) * 100) : 0;
    return `${new Intl.NumberFormat('ar-SA').format(pct)}٪ أقل حجماً (${formatBytes(diff)})`;
  }, [imageFile, imageResult?.optimizedSize, optimizedPreviewSize]);

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setImageLoading(true);
    try {
      const optimized = await compressImage(imageFile, { maxWidth, quality, format });
      const formData = new FormData();
      formData.append('image', optimized);

      const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'فشل رفع الصورة');

      setImageResult({
        ...data.item,
        optimizedSize: optimized.size,
        originalSize: imageFile.size,
      });
      onToast?.('تم تحسين الصورة ورفعها', 'success');
    } catch (error) {
      onToast?.(`❌ ${error.message}`, 'error');
    } finally {
      setImageLoading(false);
    }
  };

  const handleAudioUpload = async () => {
    if (!audioFile) return;
    setAudioLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      const res = await fetch('/api/upload-audio', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'فشل رفع الصوت');
      setAudioResult(data.item);
      onToast?.('تم رفع الملف الصوتي', 'success');
    } catch (error) {
      onToast?.(`❌ ${error.message}`, 'error');
    } finally {
      setAudioLoading(false);
    }
  };

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold">معمل الصور</h3>
        <p className="text-sm text-white/60 mt-1">ضغط الصور وتغيير الصيغة والعرض قبل الرفع — يوفّر بياناتك.</p>

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="mt-4 block w-full text-sm text-white/80"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />

        <div className="mt-4 grid grid-cols-3 gap-3">
          <label className="text-xs text-white/70">
            أقصى عرض
            <input
              type="number"
              className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-2 py-1"
              value={maxWidth}
              onChange={(e) => setMaxWidth(Number(e.target.value) || 1280)}
            />
          </label>
          <label className="text-xs text-white/70">
            الجودة
            <input
              type="number"
              min={10}
              max={100}
              className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-2 py-1"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value) || 75)}
            />
          </label>
          <label className="text-xs text-white/70">
            الصيغة
            <select
              className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-2 py-1"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="webp">WEBP</option>
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
            </select>
          </label>
        </div>

        {originalPreviewUrl && optimizedPreviewUrl && (
          <div className="mt-4">
            <p className="text-xs text-white/60 mb-2">معاينة مباشرة: قبل وبعد</p>
            <div className="relative w-full overflow-hidden rounded-xl border border-white/20 bg-black aspect-video">
              <Image
                src={originalPreviewUrl}
                alt="قبل التحسين"
                fill
                unoptimized
                sizes="100vw"
                className="absolute inset-0 w-full h-full object-contain"
              />
              <Image
                src={optimizedPreviewUrl}
                alt="بعد التحسين"
                fill
                unoptimized
                sizes="100vw"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ clipPath: `inset(0 0 0 ${compareSplit}%)` }}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/90"
                style={{ left: `${compareSplit}%` }}
              />
              <span className="absolute end-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px]">قبل</span>
              <span className="absolute start-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px]">بعد</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={compareSplit}
              onChange={(e) => setCompareSplit(Number(e.target.value))}
              className="mt-3 w-full"
            />
          </div>
        )}

        <button
          onClick={handleImageUpload}
          disabled={!imageFile || imageLoading}
          className="mt-4 px-4 py-2 rounded-lg border border-indigo-400/30 bg-indigo-500/20 disabled:opacity-50"
        >
          {imageLoading ? 'جاري التحسين…' : 'تحسين ورفع الصورة'}
        </button>

        {imageResult && (
          <div className="mt-4 text-sm text-white/70">
            <p>
              الرابط:{' '}
              <a className="text-indigo-300 underline" href={imageResult.url} target="_blank" rel="noreferrer">
                فتح الصورة
              </a>
            </p>
            <p>
              الأصلي: {formatBytes(imageResult.originalSize)} · بعد التحسين: {formatBytes(imageResult.optimizedSize)}
            </p>
            {savingText && <p className="text-green-300">{savingText}</p>}
          </div>
        )}
        {!imageResult && imageFile && (
          <div className="mt-4 text-sm text-white/70">
            <p>
              حجم المعاينة بعد التحسين: {previewLoading ? 'جاري الحساب…' : formatBytes(optimizedPreviewSize)}
            </p>
            {savingText && <p className="text-green-300">{savingText}</p>}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold">رفع أو استخراج الصوت</h3>
        <p className="text-sm text-white/60 mt-1">ارفع ملفاً صوتياً، أو فيديو لاستخراج رابط للصوت (حسب نوع الملف).</p>

        <input
          type="file"
          accept="audio/*,video/mp4,video/webm,video/quicktime"
          className="mt-4 block w-full text-sm text-white/80"
          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleAudioUpload}
          disabled={!audioFile || audioLoading}
          className="mt-4 px-4 py-2 rounded-lg border border-purple-400/30 bg-purple-500/20 disabled:opacity-50"
        >
          {audioLoading ? 'جاري الرفع…' : 'رفع أو استخراج الصوت'}
        </button>

        {audioResult && (
          <div className="mt-4 text-sm text-white/70">
            <p>
              رابط الصوت:{' '}
              <a className="text-purple-300 underline" href={audioResult.url} target="_blank" rel="noreferrer">
                فتح الصوت
              </a>
            </p>
            {audioResult.fromVideo ? <p className="text-green-300">تم استخراج الصوت من ملف الفيديو.</p> : null}
          </div>
        )}
      </div>
    </section>
  );
}
