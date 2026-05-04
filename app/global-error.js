'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{ fontFamily: '"Noto Sans Arabic", "Segoe UI", Tahoma, sans-serif' }}
        className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center p-6"
      >
        <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-right">
          <h2 className="text-xl font-bold text-red-300">خطأ في التطبيق</h2>
          <p className="text-sm text-white/70 mt-2">{error?.message || 'حدث خطأ غير متوقع.'}</p>
          <button
            onClick={reset}
            className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm"
          >
            إعادة التحميل
          </button>
        </div>
      </body>
    </html>
  );
}
