'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';

export default function AuthModal({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-background border border-outline-variant/30 rounded-3xl p-8 shadow-2xl z-10 overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          <div className="flex flex-col items-center text-center mt-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[32px] text-primary">lock</span>
            </div>
            <h3 className="text-2xl font-headline-md font-bold text-on-surface mb-3">
              مطلوب تسجيل الدخول
            </h3>
            <p className="text-on-surface-variant font-body-md mb-8">
              لا يمكنك رفع الملفات أو استخدام الأدوات بدون حساب. يرجى تسجيل الدخول أو إنشاء حساب جديد مجاناً للمتابعة.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                تسجيل الدخول لحسابك
              </Link>
              <Link
                href="/signup"
                className="w-full py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                إنشاء حساب جديد
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
