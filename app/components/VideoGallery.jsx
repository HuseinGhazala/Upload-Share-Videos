'use client';
import { useState } from 'react';

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function formatSize(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function VideoGallery({ videos, onCopy, onTrackView, pagination, onPageChange, loading }) {
  const [playing, setPlaying] = useState(null);

  if (!videos.length && !loading) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">🎬</span> Uploaded Videos
        <span className="ml-2 text-sm font-normal bg-white/10 text-white/60 rounded-full px-2 py-0.5">
          {pagination?.total || videos.length}
        </span>
      </h2>
      {loading && <p className="text-sm text-white/50 mb-3">Loading videos...</p>}
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
                  alt={`${video.name} thumbnail`}
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
                    <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4">
              <p className="text-sm font-semibold text-white truncate">{video.name}</p>
              <p className="text-xs text-white/40 mt-0.5">{formatSize(video.size)} · {formatDate(video.uploadedAt)}</p>
              <p className="text-xs text-white/50 mt-1">👁 {video.views || 0} views</p>

              {video.source && (
                <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                  video.source === 'cloudinary'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : video.source === 'github'
                    ? 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                }`}>
                  {video.source === 'cloudinary'
                    ? '☁️ Cloudinary'
                    : video.source === 'github'
                    ? '🐙 GitHub'
                    : '💾 Local'}
                </span>
              )}
              <span className="mt-2 ml-2 inline-block text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/20">
                {video.visibility}
              </span>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => onCopy(video.url)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 border border-indigo-500/30 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </button>
                <button
                  onClick={() => onCopy(`${video.url}${video.visibility === 'public' ? '' : `?accessToken=${video.accessToken}`}`)}
                  className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 border border-purple-500/20 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Copy Access Link
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
            Prev
          </button>
          <span className="px-3 py-2 text-sm text-white/70">
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
            disabled={!pagination.hasNext}
            className="px-3 py-2 text-sm rounded-lg border border-white/20 text-white/80 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
