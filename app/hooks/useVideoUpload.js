'use client';
import { useState, useCallback, useEffect } from 'react';
import { VIDEO_UPLOAD_CHUNK_BYTES } from '../lib/uploadChunkSize';

function messageForUploadFailure(xhr) {
  let jsonError = '';
  try {
    const j = JSON.parse(xhr.responseText || '{}');
    if (typeof j.error === 'string' && j.error.trim()) jsonError = j.error.trim();
  } catch {
    // ignore
  }
  if (xhr.status === 503 || xhr.status === 504) {
    return (
      'انتهت مهلة الاستجابة أو الخدمة غير متاحة حالياً. جرّب ملفاً أصغر أو أعد المحاولة لاحقاً.' +
      (jsonError ? ` (${jsonError})` : '')
    );
  }
  if (jsonError) return jsonError;
  return `خطأ من الخادم (${xhr.status})`;
}

async function uploadChunked(file, visibility, linkTtl, setProgress) {
  const startRes = await fetch('/api/upload/chunked/start', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
      visibility,
      linkTtl,
    }),
  });
  const start = await startRes.json().catch(() => ({}));
  if (!startRes.ok || !start.success) {
    throw new Error(start.error || `تعذر بدء الرفع (${startRes.status})`);
  }

  const { sessionId, sessionToken, chunkSizeBytes, totalChunks } = start;

  for (let i = 0; i < totalChunks; i++) {
    const startByte = i * chunkSizeBytes;
    const endByte = Math.min(startByte + chunkSizeBytes, file.size);
    const chunk = file.slice(startByte, endByte);

    const fd = new FormData();
    fd.append('sessionId', sessionId);
    fd.append('sessionToken', sessionToken);
    fd.append('index', String(i));
    fd.append('part', chunk, `part-${i}`);

    const partRes = await fetch('/api/upload/chunked/part', {
      method: 'POST',
      credentials: 'include',
      body: fd,
    });
    const partJson = await partRes.json().catch(() => ({}));
    if (!partRes.ok || !partJson.success) {
      throw new Error(partJson.error || `فشل الجزء ${i + 1} من ${totalChunks} (${partRes.status})`);
    }

    setProgress(Math.min(95, Math.round(((i + 1) / totalChunks) * 95)));
  }

  const doneRes = await fetch('/api/upload/chunked/complete', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, sessionToken }),
  });
  const done = await doneRes.json().catch(() => ({}));
  if (!doneRes.ok || !done.success) {
    throw new Error(done.error || 'تعذر إتمام الرفع');
  }
  setProgress(100);
  return done.video;
}

function uploadViaServer(file, visibility, linkTtl, setProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('visibility', visibility);
    formData.append('linkTtl', linkTtl);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            resolve(data.video);
          } else {
            reject(new Error(data.error || 'فشل الرفع'));
          }
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(messageForUploadFailure(xhr)));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('خطأ في الشبكة أثناء الرفع'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('أُلغي الرفع'));
    });

    xhr.withCredentials = true;
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

export function useVideoUpload() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, hasNext: false, hasPrev: false });
  const [listScope, setListScope] = useState('public');
  const [activeMediaTab, setActiveMediaTab] = useState('videos');
  const [tabCounts, setTabCounts] = useState({ video: 0, image: 0 });

  const fetchVideos = useCallback(
    async (targetPage = 1, mediaTab = activeMediaTab) => {
      setLoadingList(true);
      setError(null);
      try {
        const mineParam = listScope === 'mine' ? '&mine=1' : '';
        const mediaKind = mediaTab === 'images' ? 'image' : 'video';
        const res = await fetch(
          `/api/videos?page=${targetPage}&limit=6&mediaKind=${mediaKind}${mineParam}`,
          { credentials: 'include' }
        );
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'تعذر تحميل قائمة الملفات');
        setUploadedVideos(data.items);
        setPagination(data.pagination);
        setPage(data.pagination.page);
        if (data.counts) {
          setTabCounts({ video: data.counts.video ?? 0, image: data.counts.image ?? 0 });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingList(false);
      }
    },
    [listScope, activeMediaTab]
  );

  const fetchStats = useCallback(async () => {
    try {
      const mineQuery = listScope === 'mine' ? '?mine=1' : '';
      const res = await fetch(`/api/stats${mineQuery}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'تعذر تحميل الإحصائيات');
      setStats(data.stats);
      if (data.stats) {
        setTabCounts({
          video: data.stats.totalVideoFiles ?? 0,
          image: data.stats.totalImageFiles ?? 0,
        });
      }
    } catch {
      setStats(null);
    }
  }, [listScope]);

  useEffect(() => {
    fetchVideos(1, activeMediaTab);
    fetchStats();
  }, [listScope, activeMediaTab, fetchVideos, fetchStats]);

  const upload = useCallback(
    async (file, visibility = 'public', linkTtl = 'never') => {
      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        const video =
          file.size > VIDEO_UPLOAD_CHUNK_BYTES
            ? await uploadChunked(file, visibility, linkTtl, setProgress)
            : await uploadViaServer(file, visibility, linkTtl, setProgress);
        setProgress(100);
        fetchVideos(1, activeMediaTab);
        fetchStats();
        return video;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [activeMediaTab, fetchStats, fetchVideos]
  );

  const trackView = useCallback(async (id, accessToken) => {
    const query = accessToken ? `?accessToken=${encodeURIComponent(accessToken)}` : '';
    const res = await fetch(`/api/videos/${id}/view${query}`, { method: 'POST', credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (data.success && typeof data.views === 'number') {
      setUploadedVideos((prev) =>
        prev.map((video) =>
          video.id === id ? { ...video, views: data.views, lastViewedAt: data.lastViewedAt } : video
        )
      );
    }
    fetchStats();
  }, [fetchStats]);

  const reset = useCallback(() => {
    setProgress(0);
    setLoading(false);
    setError(null);
  }, []);

  const changeMediaTab = useCallback(
    (tab) => {
      setActiveMediaTab(tab);
      fetchVideos(1, tab);
    },
    [fetchVideos]
  );

  return {
    upload,
    progress,
    loading,
    loadingList,
    error,
    uploadedVideos,
    stats,
    page,
    pagination,
    setPage: (p) => fetchVideos(p, activeMediaTab),
    listScope,
    setListScope,
    activeMediaTab,
    setActiveMediaTab: changeMediaTab,
    tabCounts,
    trackView,
    reset,
  };
}
