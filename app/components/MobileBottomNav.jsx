'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Don't show on authentication pages or share links if needed
  if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/v/')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 w-full z-[100] pb-safe bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(14,19,44,0.06)] md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        <Link href="/" className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors ${pathname === '/' ? 'text-electric-citrus font-bold' : 'text-secondary hover:text-charcoal-navy'}`}>
          <span className={`material-symbols-outlined text-[24px] ${pathname === '/' ? 'bg-primary/10 px-4 py-0.5 rounded-full' : ''}`}>video_call</span>
          <span className="font-label-md text-[10px]">الرئيسية والرفع</span>
        </Link>
        <Link href="/dashboard" className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors ${pathname === '/dashboard' ? 'text-electric-citrus font-bold' : 'text-secondary hover:text-charcoal-navy'}`}>
          <span className={`material-symbols-outlined text-[24px] ${pathname === '/dashboard' ? 'bg-primary/10 px-4 py-0.5 rounded-full' : ''}`}>video_library</span>
          <span className="font-label-md text-[10px]">مكتبتي</span>
        </Link>
        <Link href="/tools" className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors ${pathname === '/tools' ? 'text-electric-citrus font-bold' : 'text-secondary hover:text-charcoal-navy'}`}>
          <span className={`material-symbols-outlined text-[24px] ${pathname === '/tools' ? 'bg-primary/10 px-4 py-0.5 rounded-full' : ''}`}>auto_fix_high</span>
          <span className="font-label-md text-[10px]">الأدوات</span>
        </Link>
        <Link href="/account" className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors ${pathname === '/account' ? 'text-electric-citrus font-bold' : 'text-secondary hover:text-charcoal-navy'}`}>
          <span className={`material-symbols-outlined text-[24px] ${pathname === '/account' ? 'bg-primary/10 px-4 py-0.5 rounded-full' : ''}`}>settings</span>
          <span className="font-label-md text-[10px]">الإعدادات</span>
        </Link>
      </div>
    </nav>
  );
}
