'use client';

export default function ProgressBar({ progress }) {
  return (
    <div className="w-full mt-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-indigo-300">Uploading...</span>
        <span className="text-sm font-semibold text-white">{progress}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          <span className="absolute inset-0 animate-pulse bg-white/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}
