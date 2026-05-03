'use client';
import { useState, useCallback, useEffect } from 'react';

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
      'Gateway timeout or service unavailable (' +
      xhr.status +
      '). The server may have a short request limit. Try again, use a smaller file, or enable Cloudinary so uploads go browser→Cloudinary (not through hosting).' +
      (jsonError ? ` ${jsonError}` : '')
    );
  }
  if (jsonError) return jsonError;
  return `Server error: ${xhr.status}`;
}

function xhrPromise(xhr, uploadProgress) {
  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && uploadProgress) {
        uploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener('load', () => resolve(xhr));
    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));
  });
}

/** Browser → Cloudinary (large body skips shared hosting). */
async function uploadDirectToCloudinary(params, file, visibility, setProgress) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('api_key', params.apiKey);
  fd.append('timestamp', String(params.timestamp));
  fd.append('signature', params.signature);
  fd.append('folder', params.folder);
  fd.append('public_id', params.publicId);

  const xhr = new XMLHttpRequest();
  const done = xhrPromise(xhr, setProgress);
  xhr.open('POST', params.uploadUrl);
  xhr.send(fd);
  const res = await done;

  if (res.status < 200 || res.status >= 300) {
    let msg = `Cloudinary upload failed (${res.status})`;
    try {
      const err = JSON.parse(res.responseText || '{}');
      if (err.error?.message) msg = err.error.message;
      else if (typeof err.error === 'string') msg = err.error;
    } catch {
      // keep msg
    }
    throw new Error(msg);
  }

  const cld = JSON.parse(res.responseText);
  if (cld.error) {
    const em = cld.error.message || cld.error || 'Cloudinary upload failed';
    throw new Error(typeof em === 'string' ? em : 'Cloudinary upload failed');
  }

  const reg = await fetch('/api/upload/register-cloudinary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      public_id: cld.public_id,
      visibility,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    }),
  });
  const data = await reg.json();
  if (!reg.ok || !data.success) {
    throw new Error(data.error || 'Could not save video after Cloudinary upload');
  }
  return data.video;
}

function uploadViaServer(file, visibility, setProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('visibility', visibility);

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
            reject(new Error(data.error || 'Upload failed'));
          }
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(messageForUploadFailure(xhr)));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

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

  const upload = useCallback(
    async (file, visibility = 'public') => {
      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        const paramsRes = await fetch('/api/upload/cloudinary-params', { method: 'POST' });
        const params = await paramsRes.json();

        if (paramsRes.status === 429) {
          throw new Error(params.error || 'Too many upload requests. Try again in a minute.');
        }
        if (!params.enabled && params.error) {
          throw new Error(params.error);
        }

        let video;
        if (params.enabled) {
          video = await uploadDirectToCloudinary(params, file, visibility, setProgress);
        } else {
          video = await uploadViaServer(file, visibility, setProgress);
        }

        setProgress(100);
        fetchVideos(1);
        fetchStats();
        return video;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchStats, fetchVideos]
  );

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
