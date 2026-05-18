'use client';
import { useEffect, useRef } from 'react';

export default function VideoPreview({ file }) {
  const videoRef = useRef(null);
  const urlRef = useRef(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    if (videoRef.current) videoRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!file) return null;

  const sizeMB = new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(
    file.size / (1024 * 1024)
  );

  return (
    <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-black/30">
      <video
        ref={videoRef}
        controls
        className="w-full max-h-64 object-contain bg-black"
        preload="metadata"
      />
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white truncate max-w-xs">{file.name}</p>
          <p className="text-xs text-white/50 mt-0.5">{sizeMB} ميجابايت</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          معاينة قبل الرفع
        </span>
      </div>
    </div>
  );
}
