'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Lenis smooth scroll, integrated with GSAP ScrollTrigger if present.
 * Respects prefers-reduced-motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const reduced = window.matchMedia?.(REDUCED_MOTION_QUERY).matches;
    if (reduced) return undefined;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });

    let rafId = 0;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    let scrollTriggerCleanup = null;
    (async () => {
      try {
        const { default: gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);

        const onScroll = () => ScrollTrigger.update();
        lenis.on('scroll', onScroll);

        const onTick = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(onTick);
        gsap.ticker.lagSmoothing(0);
        cancelAnimationFrame(rafId);

        scrollTriggerCleanup = () => {
          lenis.off('scroll', onScroll);
          gsap.ticker.remove(onTick);
        };
      } catch {
        // GSAP not installed — fall back to plain rAF loop above.
      }
    })();

    return () => {
      cancelAnimationFrame(rafId);
      scrollTriggerCleanup?.();
      lenis.destroy();
    };
  }, []);

  return null;
}
