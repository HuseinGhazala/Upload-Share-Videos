'use client';

import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Framer Motion: staggered hero entrance */
export default function Hero({ onShopNow }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/25 via-violet-600/15 to-emerald-500/10 p-8 sm:p-12 mb-14">
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-2xl"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80 mb-4"
        >
          عرض تقني — ست مكتبات أنيميشن في صفحة واحدة
        </motion.span>
        <motion.h1 variants={item} className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
          تجربة تسوّق عصرية{' '}
          <span className="bg-gradient-to-l from-emerald-300 to-indigo-300 bg-clip-text text-transparent">
            سلسة ومبهرة
          </span>
        </motion.h1>
        <motion.p variants={item} className="text-white/65 text-sm sm:text-base leading-relaxed mb-6">
          نموذج استعراضي يجمع Framer Motion و React Spring و AutoAnimate و Lottie و GSAP و
          React Transition Group، يستثمر كل مكتبة فيما تتميّز فيه.
        </motion.p>
        <motion.div variants={item} className="flex flex-wrap gap-3">
          <button type="button" onClick={onShopNow} className="btn-primary">
            تصفّح المنتجات
          </button>
          <a
            href="#features"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
          >
            استعراض المميزات
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
