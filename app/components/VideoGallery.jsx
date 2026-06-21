'use client';
import Image from 'next/image';
import { useState } from 'react';
import { FREE_PUBLIC_MODE } from '@/app/lib/plans';
import { isImageMedia } from '@/app/lib/mediaTypes';

function formatDate(iso) {
  return new Date(iso).toLocaleString('ar-SA', {
    dateStyle: 'medium',
    timeStyle: 'short',
    calendar: 'gregory',
  });
}

function formatSize(bytes) {
  const mb = bytes / (1024 * 1024);
  return `${new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(mb)} ميجابايت`;
}

function visibilityAr(v) {
  if (v === 'public') return 'عام';
  if (v === 'private') return 'خاص';
  if (v === 'unlisted') return 'غير مُدرَج';
  return v;
}

function getRawUrl(video) {
  if (video.source === 'github' && video.public_id && video.ghOwner && video.ghRepo) {
    const branch = video.ghBranch || 'main';
    return `https://github.com/${video.ghOwner}/${video.ghRepo}/raw/refs/heads/${branch}/${video.public_id}`;
  }
  return video.rawUrl || video.sourceUrl || video.url;
}

function getWatchStreamUrl(video) {
  return `${video.url}${video.visibility === 'public' ? '' : `?accessToken=${video.accessToken}`}`;
}

function MediaCard({ item, playing, onPlayChange, onCopy, onTrackView }) {
  const isImage = isImageMedia(item);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden hover:border-indigo-500/50 transition-all duration-300 group">
      <div className={`relative bg-black ${isImage ? 'aspect-square' : 'aspect-video'}`}>
        <div className="absolute top-2 start-2 z-10 rounded-full bg-black/70 backdrop-blur px-2.5 py-1 text-[11px] text-white/90 border border-white/15 tabular-nums">
          👁 {new Intl.NumberFormat('ar-SA').format(item.views || 0)}
        </div>
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.name}
            className="w-full h-full object-contain"
            onLoad={() => onTrackView?.(item.id, null)}
          />
        ) : (
          <>
            {item.thumbnailUrl ? (
              <Image
                src={item.thumbnailUrl}
                alt="صورة مصغّرة للفيديو"
                fill
                unoptimized
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            ) : null}
            <video
              src={item.url}
              controls
              preload="none"
              className="w-full h-full object-contain"
              onPlay={() => {
                onPlayChange(item.id);
                onTrackView?.(item.id, null);
              }}
              onPause={() => onPlayChange(null)}
            />
            {playing !== item.id && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-white/20 transition">
                  <svg className="w-5 h-5 text-white translate-x-[1px]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4">
        <p className="text-sm font-semibold text-white truncate">{item.name}</p>
        <p className="text-xs text-white/40 mt-0.5">
          {formatSize(item.size)} · {formatDate(item.uploadedAt)}
        </p>

        {item.source && (
          <span
            className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
              item.source === 'github'
                ? 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
                : item.source === 'local'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  : 'bg-white/10 text-white/70 border border-white/20'
            }`}
          >
            {item.source === 'github'
              ? '🐙 GitHub'
              : item.source === 'local'
                ? '💾 تخزين محلّي'
                : `📦 ${item.source}`}
          </span>
        )}
        <span className="mt-2 ms-2 inline-block text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/20">
          {visibilityAr(item.visibility)}
        </span>

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={() => onCopy(item.rawUrl || item.url)}
            className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 border border-indigo-500/30 transition"
          >
            نسخ الرابط
          </button>
          <button
            type="button"
            onClick={() => onCopy(getRawUrl(item))}
            className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/20 transition"
          >
            رابط مباشر
          </button>
          <button
            type="button"
            onClick={() => onCopy(getWatchStreamUrl(item))}
            className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 border border-purple-500/20 transition"
          >
            رابط المشاهدة
          </button>
        </div>
      </div>
    </div>
  );
}

function MediaGrid({ items, emptyLabel, playing, onPlayChange, onCopy, onTrackView }) {
  if (!items.length) {
    return <p className="text-white/45 text-sm py-6 text-center">{emptyLabel}</p>;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <MediaCard
          key={item.id}
          item={item}
          playing={playing}
          onPlayChange={onPlayChange}
          onCopy={onCopy}
          onTrackView={onTrackView}
        />
      ))}
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
}) {
  const [playing, setPlaying] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');

  const videoItems = videos.filter((item) => !isImageMedia(item));
  const imageItems = videos.filter((item) => isImageMedia(item));
  const activeItems = activeTab === 'videos' ? videoItems : imageItems;

  const hideWhenEmpty = !videos.length && !loading;

  if (hideWhenEmpty) return null;

  const title = listScope === 'mine' ? 'فيديوهاتي' : 'مرفوعاتك';

  return (
    <section className="mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📁</span>
          {title}
          <span className="ms-2 text-sm font-normal bg-white/10 text-white/60 rounded-full px-2 py-0.5 tabular-nums">
            {pagination?.total ?? videos.length}
          </span>
        </h2>
        {!FREE_PUBLIC_MODE && sessionUser && onListScopeChange && (
          <div className="flex rounded-xl border border-white/15 p-1 bg-white/5 shrink-0">
            <button
              type="button"
              onClick={() => onListScopeChange('public')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                listScope !== 'mine' ? 'bg-indigo-600 text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              العامة
            </button>
            <button
              type="button"
              onClick={() => onListScopeChange('mine')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                listScope === 'mine' ? 'bg-indigo-600 text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              فيديوهاتي
            </button>
          </div>
        )}
      </div>

      {!videos.length && !loading && listScope === 'mine' ? (
        <p className="text-white/45 text-sm mb-4">لم تقم برفع أي ملف حتى الآن.</p>
      ) : null}
      {loading && <p className="text-sm text-white/50 mb-3">جاري تحميل الملفات…</p>}

      <div className="flex rounded-xl border border-white/15 p-1 bg-white/5 w-fit mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'videos' ? 'bg-indigo-600 text-white' : 'text-white/70 hover:text-white'
          }`}
        >
          <span aria-hidden>🎬</span>
          الفيديوهات
          <span className="text-xs bg-white/15 rounded-full px-1.5 py-0.5 tabular-nums">{videoItems.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('images')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
            activeTab === 'images' ? 'bg-indigo-600 text-white' : 'text-white/70 hover:text-white'
          }`}
        >
          <span aria-hidden>🖼️</span>
          الصور
          <span className="text-xs bg-white/15 rounded-full px-1.5 py-0.5 tabular-nums">{imageItems.length}</span>
        </button>
      </div>

      <MediaGrid
        items={activeItems}
        emptyLabel={activeTab === 'videos' ? 'لا توجد فيديوهات بعد.' : 'لا توجد صور بعد.'}
        playing={playing}
        onPlayChange={setPlaying}
        onCopy={onCopy}
        onTrackView={onTrackView}
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
            disabled={!pagination.hasPrev}
            className="px-3 py-2 text-sm rounded-lg border border-white/20 text-white/80 disabled:opacity-40"
          >
            السابق
          </button>
          <span className="px-3 py-2 text-sm text-white/70 tabular-nums">
            الصفحة {pagination.page} من {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
            disabled={!pagination.hasNext}
            className="px-3 py-2 text-sm rounded-lg border border-white/20 text-white/80 disabled:opacity-40"
          >
            التالي
          </button>
        </div>
      )}
    </section>
  );
}
