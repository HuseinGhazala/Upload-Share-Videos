'use client';
import { useState } from 'react';

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
  if (v === 'unlisted') return 'مخفي';
  return v;
}

function getRawUrl(video) {
  if (video.source === 'github' && video.public_id && video.ghOwner && video.ghRepo) {
    const branch = video.ghBranch || 'main';
    return `https://github.com/${video.ghOwner}/${video.ghRepo}/raw/refs/heads/${branch}/${video.public_id}`;
  }
  return video.rawUrl || video.sourceUrl || video.url;
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

  const hideWhenEmpty = !videos.length && !loading && listScope !== 'mine';

  if (hideWhenEmpty) return null;

  const title = listScope === 'mine' ? 'فيديوهاتي' : 'الفيديوهات';

  return (
    <section className="mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          {title}
          <span className="ms-2 text-sm font-normal bg-white/10 text-white/60 rounded-full px-2 py-0.5 tabular-nums">
            {pagination?.total ?? videos.length}
          </span>
        </h2>
        {sessionUser && onListScopeChange && (
          <div className="flex rounded-xl border border-white/15 p-1 bg-white/5 shrink-0">
            <button
              type="button"
              onClick={() => onListScopeChange('public')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                listScope !== 'mine' ? 'bg-indigo-600 text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              المتاحة للجميع
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
        <p className="text-white/45 text-sm mb-4">لم ترفع أي فيديو بعد.</p>
      ) : null}
      {loading && <p className="text-sm text-white/50 mb-3">جاري تحميل الفيديوهات…</p>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <div
            key={video.id}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden hover:border-indigo-500/50 transition-all duration-300 group"
          >
            <div className="relative bg-black aspect-video">
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={`صورة مصغّرة للفيديو`}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              ) : null}
              <video
                src={`${video.url}${video.visibility === 'public' ? '' : `?accessToken=${video.accessToken}`}`}
                controls
                preload="metadata"
                className="w-full h-full object-contain"
                onPlay={() => {
                  setPlaying(video.id);
                  onTrackView?.(video.id, video.visibility === 'public' ? null : video.accessToken);
                }}
                onPause={() => setPlaying(null)}
              />
              {playing !== video.id && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-white/20 transition">
                    <svg className="w-5 h-5 text-white translate-x-[1px]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4">
              <p className="text-sm font-semibold text-white truncate">{video.name}</p>
              <p className="text-xs text-white/40 mt-0.5">{formatSize(video.size)} · {formatDate(video.uploadedAt)}</p>
              <p className="text-xs text-white/50 mt-1">
                👁 {new Intl.NumberFormat('ar-SA').format(video.views || 0)} مشاهدة
              </p>

              {video.source && (
                <span
                  className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                    video.source === 'github'
                      ? 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
                      : video.source === 'local'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : 'bg-white/10 text-white/70 border border-white/20'
                  }`}
                >
                  {video.source === 'github'
                    ? '🐙 GitHub'
                    : video.source === 'local'
                      ? '💾 تخزين محلي'
                      : `📦 ${video.source}`}
                </span>
              )}
              <span className="mt-2 ms-2 inline-block text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/20">
                {visibilityAr(video.visibility)}
              </span>

              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => onCopy(video.rawUrl || video.url)}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 border border-indigo-500/30 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  نسخ الرابط
                </button>
                <button
                  onClick={() => onCopy(getRawUrl(video))}
                  className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/20 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 11-5.656-5.656l1.5-1.5m6.328-1.172a4 4 0 010-5.656l3-3a4 4 0 115.656 5.656l-1.5 1.5" />
                  </svg>
                  نسخ الرابط المباشر
                </button>
                <button
                  onClick={() => onCopy(`${video.url}${video.visibility === 'public' ? '' : `?accessToken=${video.accessToken}`}`)}
                  className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 border border-purple-500/20 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  نسخ رابط المشاهدة
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
            disabled={!pagination.hasPrev}
            className="px-3 py-2 text-sm rounded-lg border border-white/20 text-white/80 disabled:opacity-40"
          >
            السابق
          </button>
          <span className="px-3 py-2 text-sm text-white/70 tabular-nums">
            صفحة {pagination.page} من {pagination.totalPages}
          </span>
          <button
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
