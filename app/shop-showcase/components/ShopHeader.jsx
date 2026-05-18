'use client';

import { memo } from 'react';
import Link from 'next/link';

function ShopHeader({ cartCount, onOpenCart }) {
  return (
    <header className="flex items-center justify-between gap-4 mb-10">
      <div>
        <Link href="/" className="text-xs text-white/45 hover:text-white/70">
          ← العودة إلى الصفحة الرئيسية
        </Link>
        <p className="text-lg font-semibold mt-1">متجر العرض التجريبي</p>
      </div>
      <button
        type="button"
        onClick={onOpenCart}
        className="relative inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium hover:bg-white/10"
      >
        <span aria-hidden>🛒</span>
        السلّة
        {cartCount > 0 ? (
          <span className="absolute -top-1.5 -left-1.5 min-w-[1.25rem] h-5 rounded-full bg-indigo-500 text-[10px] font-bold flex items-center justify-center px-1">
            {cartCount}
          </span>
        ) : null}
      </button>
    </header>
  );
}

export default memo(ShopHeader);
