'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-surface flex flex-col items-center justify-center p-gutter">
        <div className="max-w-md w-full rounded-2xl border border-error/30 bg-error-container p-space-lg text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-space-md">
            <span className="material-symbols-outlined text-[32px]">report</span>
          </div>
          <h2 className="font-headline-md text-xl font-bold text-on-error-container">عطل في النظام</h2>
          <p className="font-body-sm text-sm text-on-surface-variant mt-2 mb-space-lg leading-relaxed">{error?.message || 'حدث خطأ غير متوقع في التطبيق. نعتذر عن هذا الخلل.'}</p>
          <button
            onClick={reset}
            className="w-full px-5 py-3 rounded-xl bg-error text-on-error font-label-lg font-bold shadow-[0_4px_14px_rgba(179,38,30,0.3)] hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            إعادة التحميل
          </button>
        </div>
      </body>
    </html>
  );
}
