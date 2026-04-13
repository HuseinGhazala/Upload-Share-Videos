'use client';
import { useState, useCallback } from 'react';

export function useVideoUpload() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedVideos, setUploadedVideos] = useState([]);

  const upload = useCallback((file) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);
      setProgress(0);

      const formData = new FormData();
      formData.append('video', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgress(pct);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              const videoEntry = {
                id: Date.now(),
                url: data.url,
                public_id: data.public_id,
                source: data.source,
                name: file.name,
                size: file.size,
                uploadedAt: new Date().toISOString(),
              };
              setUploadedVideos((prev) => [videoEntry, ...prev]);
              setProgress(100);
              setLoading(false);
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
  }, []);

  const removeVideo = useCallback((id) => {
    setUploadedVideos((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setLoading(false);
    setError(null);
  }, []);

  return { upload, progress, loading, error, uploadedVideos, removeVideo, reset };
}
