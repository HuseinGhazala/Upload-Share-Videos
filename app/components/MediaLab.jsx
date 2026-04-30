'use client';

import { useEffect, useMemo, useState } from 'react';

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  return `${(bytes / 1024).toFixed(1)} KB`;
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
  if (!blob) throw new Error('Failed to compress image');

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
    return `${formatBytes(diff)} saved (${pct}%)`;
  }, [imageFile, imageResult?.optimizedSize, optimizedPreviewSize]);

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setImageLoading(true);
    try {
      // #region agent log
      fetch('http://127.0.0.1:7531/ingest/2bbb9be2-9e09-4d6e-beb1-e45041ba6453',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e3807'},body:JSON.stringify({sessionId:'1e3807',runId:'pre-fix',hypothesisId:'H4',location:'app/components/MediaLab.jsx:103',message:'client image optimization start',data:{name:imageFile.name,type:imageFile.type,size:imageFile.size,maxWidth,quality,format},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const optimized = await compressImage(imageFile, { maxWidth, quality, format });
      const formData = new FormData();
      formData.append('image', optimized);

      const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
      const data = await res.json();
      // #region agent log
      fetch('http://127.0.0.1:7531/ingest/2bbb9be2-9e09-4d6e-beb1-e45041ba6453',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e3807'},body:JSON.stringify({sessionId:'1e3807',runId:'pre-fix',hypothesisId:'H4',location:'app/components/MediaLab.jsx:111',message:'client image upload response',data:{status:res.status,success:Boolean(data?.success),optimizedSize:optimized.size},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (!res.ok || !data.success) throw new Error(data.error || 'Image upload failed');

      setImageResult({
        ...data.item,
        optimizedSize: optimized.size,
        originalSize: imageFile.size,
      });
      onToast?.('✅ Image optimized and uploaded', 'success');
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
      // #region agent log
      fetch('http://127.0.0.1:7531/ingest/2bbb9be2-9e09-4d6e-beb1-e45041ba6453',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e3807'},body:JSON.stringify({sessionId:'1e3807',runId:'pre-fix',hypothesisId:'H5',location:'app/components/MediaLab.jsx:130',message:'client audio upload start',data:{name:audioFile.name,type:audioFile.type,size:audioFile.size},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const formData = new FormData();
      formData.append('audio', audioFile);
      const res = await fetch('/api/upload-audio', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Audio upload failed');
      setAudioResult(data.item);
      onToast?.('✅ Audio uploaded successfully', 'success');
    } catch (error) {
      onToast?.(`❌ ${error.message}`, 'error');
    } finally {
      setAudioLoading(false);
    }
  };

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold">Image Optimizer (Squoosh-style)</h3>
        <p className="text-sm text-white/60 mt-1">Convert format, reduce quality, and resize before upload.</p>

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="mt-4 block w-full text-sm text-white/80"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />

        <div className="mt-4 grid grid-cols-3 gap-3">
          <label className="text-xs text-white/70">
            Max Width
            <input
              type="number"
              className="mt-1 w-full rounded-md bg-white/10 border border-white/20 px-2 py-1"
              value={maxWidth}
              onChange={(e) => setMaxWidth(Number(e.target.value) || 1280)}
            />
          </label>
          <label className="text-xs text-white/70">
            Quality
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
            Format
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
            <p className="text-xs text-white/60 mb-2">Live Before / After Preview</p>
            <div className="relative w-full overflow-hidden rounded-xl border border-white/20 bg-black aspect-video">
              <img
                src={originalPreviewUrl}
                alt="Before optimization"
                className="absolute inset-0 w-full h-full object-contain"
              />
              <img
                src={optimizedPreviewUrl}
                alt="After optimization"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ clipPath: `inset(0 0 0 ${compareSplit}%)` }}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/90"
                style={{ left: `${compareSplit}%` }}
              />
              <span className="absolute left-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px]">Before</span>
              <span className="absolute right-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px]">After</span>
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
          {imageLoading ? 'Optimizing...' : 'Optimize + Upload Image'}
        </button>

        {imageResult && (
          <div className="mt-4 text-sm text-white/70">
            <p>Uploaded: <a className="text-indigo-300 underline" href={imageResult.url} target="_blank">Open image</a></p>
            <p>Original: {formatBytes(imageResult.originalSize)} | Optimized: {formatBytes(imageResult.optimizedSize)}</p>
            {savingText && <p className="text-green-300">{savingText}</p>}
          </div>
        )}
        {!imageResult && imageFile && (
          <div className="mt-4 text-sm text-white/70">
            <p>Preview optimized size: {previewLoading ? 'Calculating...' : formatBytes(optimizedPreviewSize)}</p>
            {savingText && <p className="text-green-300">{savingText}</p>}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold">Audio Upload / Extract</h3>
        <p className="text-sm text-white/60 mt-1">Upload audio directly, or upload video to generate an MP3 link.</p>

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
          {audioLoading ? 'Uploading...' : 'Upload / Extract Audio'}
        </button>

        {audioResult && (
          <div className="mt-4 text-sm text-white/70">
            <p>
              Audio link:{' '}
              <a className="text-purple-300 underline" href={audioResult.url} target="_blank">
                Open audio
              </a>
            </p>
            {audioResult.fromVideo ? <p className="text-green-300">Audio extracted from video input.</p> : null}
          </div>
        )}
      </div>
    </section>
  );
}
