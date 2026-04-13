'use client';
import { useState, useRef, useCallback } from 'react';
import VideoPreview from './VideoPreview';
import ProgressBar from './ProgressBar';

const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_SIZE = 50 * 1024 * 1024;

export default function VideoUpload({ onUpload, loading, progress, error, onToast }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [lastUploaded, setLastUploaded] = useState(null);
  const inputRef = useRef(null);

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload mp4, webm, or mov.';
    }
    if (file.size > MAX_SIZE) {
      return 'File exceeds 50MB limit.';
    }
    return null;
  };

  const handleFile = useCallback(
    async (file) => {
      const err = validateFile(file);
      if (err) {
        setFileError(err);
        return;
      }
      setFileError('');
      setSelectedFile(file);
      setLastUploaded(null);

      try {
        const result = await onUpload(file);
        setLastUploaded(result);
        setSelectedFile(null);
        onToast('✅ Video uploaded successfully!', 'success');
      } catch (e) {
        onToast('❌ ' + (e.message || 'Upload failed'), 'error');
      }
    },
    [onUpload, onToast]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const displayError = fileError || error;

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300
          ${dragOver ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]' : 'border-white/20 bg-white/5 hover:border-indigo-500/50 hover:bg-white/10'}
          ${loading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={onInputChange}
          disabled={loading}
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${dragOver ? 'bg-indigo-500/30 scale-110' : 'bg-white/10'}`}>
            {loading ? (
              <svg className="w-8 h-8 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-white font-semibold text-lg">
              {loading ? 'Uploading video...' : dragOver ? 'Drop it!' : 'Drag & drop your video'}
            </p>
            <p className="text-white/40 text-sm mt-1">
              {loading ? 'Please wait' : 'or click to browse · mp4, webm, mov · max 50MB'}
            </p>
          </div>
        </div>
      </div>

      {loading && <ProgressBar progress={progress} />}

      {displayError && (
        <div className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {displayError}
        </div>
      )}

      {selectedFile && !loading && <VideoPreview file={selectedFile} />}

      {lastUploaded && (
        <div className="mt-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-green-400 text-sm font-medium">✅ Upload complete!</p>
          <p className="text-white/50 text-xs mt-1 truncate">{lastUploaded.url}</p>
        </div>
      )}
    </div>
  );
}
