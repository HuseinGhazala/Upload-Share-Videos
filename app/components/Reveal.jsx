'use client';

import { motion, useReducedMotion } from 'framer-motion';

const PRESETS = {
  'fade-up': { from: { opacity: 0, y: 28 }, to: { opacity: 1, y: 0 } },
  'fade-down': { from: { opacity: 0, y: -28 }, to: { opacity: 1, y: 0 } },
  'fade-left': { from: { opacity: 0, x: 28 }, to: { opacity: 1, x: 0 } },
  'fade-right': { from: { opacity: 0, x: -28 }, to: { opacity: 1, x: 0 } },
  fade: { from: { opacity: 0 }, to: { opacity: 1 } },
  'zoom-in': { from: { opacity: 0, scale: 0.94 }, to: { opacity: 1, scale: 1 } },
};

/**
 * Drop-in scroll reveal for any element/section.
 * Usage: <Reveal preset="fade-up" delay={0.1}>...</Reveal>
 */
export default function Reveal({
  children,
  preset = 'fade-up',
  delay = 0,
  duration = 0.7,
  amount = 0.2,
  once = true,
  as: Tag = 'div',
  className = '',
  ...rest
}) {
  const reducedMotion = useReducedMotion();
  const variant = PRESETS[preset] || PRESETS['fade-up'];
  const MotionTag = motion[Tag] || motion.div;

  if (reducedMotion) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      initial={variant.from}
      whileInView={variant.to}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
