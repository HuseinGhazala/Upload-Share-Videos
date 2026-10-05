'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('App segment error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-charcoal-navy flex flex-col items-center justify-center p-gutter relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-error/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full rounded-[32px] border border-outline-variant/10 bg-surface/5 backdrop-blur-2xl p-space-xl text-center shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative z-10">
        <div className="w-20 h-20 rounded-full bg-error/10 border border-error/20 text-error flex items-center justify-center mx-auto mb-space-md shadow-[0_0_30px_rgba(186,26,26,0.15)] relative">
          <div className="absolute inset-0 border-2 border-error/30 rounded-full animate-ping opacity-20"></div>
          <span className="material-symbols-outlined text-[40px]">warning</span>
        </div>
        
        <h2 className="font-headline-md text-2xl font-bold text-white mb-2 tracking-tight">عذراً، حدث خطأ غير متوقع</h2>
        <p className="font-body-sm text-[15px] text-gray-400 mb-space-xl leading-relaxed">
          تعذر عرض هذه الصفحة بشكل صحيح. لا تقلق، لم تفقد بياناتك. جرب تحديث الصفحة الآن.
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full px-5 py-4 rounded-2xl bg-primary text-white font-label-lg text-base font-bold shadow-[0_8px_24px_rgba(255,94,30,0.4)] hover:bg-primary-hover hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[22px]">refresh</span>
            تحديث الصفحة والمحاولة
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-5 py-3 rounded-2xl bg-white/5 text-gray-300 font-label-lg text-sm font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            العودة للرئيسية
          </button>
        </div>
      </div>
    </main>
  );
}
