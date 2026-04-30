'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('App segment error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <h2 className="text-xl font-bold text-red-300">Something went wrong</h2>
        <p className="text-sm text-white/70 mt-2">
          A runtime error happened while rendering this page.
        </p>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
