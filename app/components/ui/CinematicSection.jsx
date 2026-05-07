'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function CinematicSection({
  children,
  className = '',
  delay = 0,
  y = 36,
  once = true,
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y }}
      whileInView={reducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{
        duration: reducedMotion ? 0 : 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function FloatOrb({ className = '' }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={className}
      animate={reducedMotion ? {} : { y: [0, -18, 0], opacity: [0.45, 0.68, 0.45] }}
      transition={reducedMotion ? {} : { duration: 8, ease: 'easeInOut', repeat: Infinity }}
    />
  );
}

export function CinematicCard({ children, className = '' }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      whileHover={reducedMotion ? {} : { y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`glass-panel ${className}`}
    >
      {children}
    </motion.div>
  );
}
