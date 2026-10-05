import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0E132C] text-white py-16 mt-auto border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      
      {/* Decorative Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <img alt="Themiify Official Logo" className="h-10 w-auto object-contain rounded-xl shadow-[0_0_15px_rgba(255,94,30,0.3)] bg-white/5 p-1" src="/logo.png" />
              <span className="font-headline-md text-2xl font-bold tracking-tight">Themiify <span className="text-primary">Videos</span></span>
            </div>
            <p className="font-body-md text-sm text-gray-400 max-w-md leading-relaxed">
              منصة معالجة ورفع وسائط سريعة، فورية، ومصممة لخدمة المبدعين وصناع المحتوى بكفاءة تامة، سرية مطلقة، وبدون تعقيد. كل ما تحتاجه في متصفحك.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary hover:border-primary transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary hover:border-primary transition-all duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-6">
            <h3 className="font-headline-md text-lg font-bold text-white relative inline-block">
              أدوات سريعة
              <span className="absolute -bottom-2 left-0 right-1/2 h-0.5 bg-primary rounded-full"></span>
            </h3>
            <ul className="flex flex-col gap-3 font-body-md text-sm text-gray-400">
              <li><Link href="/" className="hover:text-primary transition-colors hover:translate-x-[-4px] inline-block transform duration-300">رفع فيديو جديد</Link></li>
              <li><Link href="/tools#compressor" className="hover:text-primary transition-colors hover:translate-x-[-4px] inline-block transform duration-300">ضغط الصور وتصغيرها</Link></li>
              <li><Link href="/tools#audio-extractor" className="hover:text-primary transition-colors hover:translate-x-[-4px] inline-block transform duration-300">استخراج الصوت MP3</Link></li>
              <li><Link href="/tools#qr-generator" className="hover:text-primary transition-colors hover:translate-x-[-4px] inline-block transform duration-300">صانع الباركود QR</Link></li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div className="flex flex-col gap-6">
            <h3 className="font-headline-md text-lg font-bold text-white relative inline-block">
              روابط هامة
              <span className="absolute -bottom-2 left-0 right-1/2 h-0.5 bg-primary rounded-full"></span>
            </h3>
            <ul className="flex flex-col gap-3 font-body-md text-sm text-gray-400">
              <li><a href="https://themiify.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:translate-x-[-4px] inline-block transform duration-300">خدمات شبكة Themiify</a></li>
              <li><Link href="#" className="hover:text-primary transition-colors hover:translate-x-[-4px] inline-block transform duration-300">شروط الاستخدام</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors hover:translate-x-[-4px] inline-block transform duration-300">سياسة الخصوصية والأمان</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors hover:translate-x-[-4px] inline-block transform duration-300">تواصل معنا</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
          <p className="font-body-sm text-sm text-gray-500 text-center sm:text-right">
            © {new Date().getFullYear()} <span className="text-white font-semibold">Themiify.com</span>. جميع الحقوق محفوظة لشبكة منصات ثيمفاي.
          </p>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="font-label-md text-xs font-medium text-gray-300">
              أنظمة السيرفرات تعمل بكفاءة 100%
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
