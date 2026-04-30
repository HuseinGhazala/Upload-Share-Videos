'use client';
import { useState, useCallback, useEffect } from 'react';

export function useVideoUpload() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, hasNext: false, hasPrev: false });

  const fetchVideos = useCallback(async (targetPage = 1) => {
    setLoadingList(true);
    setError(null);
    try {
      const res = await fetch(`/api/videos?page=${targetPage}&limit=6`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch videos');
      setUploadedVideos(data.items);
      setPagination(data.pagination);
      setPage(data.pagination.page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch stats');
      setStats(data.stats);
    } catch {
      // Keep stats optional for UI resiliency.
    }
  }, []);

  useEffect(() => {
    fetchVideos(1);
    fetchStats();
  }, [fetchStats, fetchVideos]);

  const upload = useCallback((file, visibility = 'public') => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);
      setProgress(0);

      const formData = new FormData();
      formData.append('video', file);
      formData.append('visibility', visibility);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgress(pct);
        }
      });

      xhr.addEventListener('load', () => {
        // #region agent log
        fetch('http://127.0.0.1:7531/ingest/2bbb9be2-9e09-4d6e-beb1-e45041ba6453',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1e3807'},body:JSON.stringify({sessionId:'1e3807',runId:'pre-fix',hypothesisId:'H2',location:'app/hooks/useVideoUpload.js:68',message:'client video upload response received',data:{status:xhr.status,responseLength:xhr.responseText?.length || 0},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              const videoEntry = data.video;
              setProgress(100);
              setLoading(false);
              fetchVideos(1);
              fetchStats();
              resolve(videoEntry);
            } else {
              throw new Error(data.error || 'Upload failed');
            }
          } catch (err) {
            setError(err.message);
            setLoading(false);
            reject(err);
          }
        } else {
          const msg = `Server error: ${xhr.status}`;
          setError(msg);
          setLoading(false);
          reject(new Error(msg));
        }
      });

      xhr.addEventListener('error', () => {
        const msg = 'Network error during upload';
        setError(msg);
        setLoading(false);
        reject(new Error(msg));
      });

      xhr.addEventListener('abort', () => {
        const msg = 'Upload aborted';
        setError(msg);
        setLoading(false);
        reject(new Error(msg));
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  }, [fetchStats, fetchVideos]);

  const trackView = useCallback(async (id, accessToken) => {
    const query = accessToken ? `?accessToken=${encodeURIComponent(accessToken)}` : '';
    await fetch(`/api/videos/${id}/view${query}`, { method: 'POST' });
    fetchStats();
  }, [fetchStats]);

  const reset = useCallback(() => {
    setProgress(0);
    setLoading(false);
    setError(null);
  }, []);

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
    setPage: fetchVideos,
    trackView,
    reset,
  };
}
