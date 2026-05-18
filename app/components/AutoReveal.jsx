'use client';

import { useEffect } from 'react';

/**
 * Global scroll-reveal: any element with [data-animate="fade-up|fade|zoom-in|..."]
 * gets animated when it enters the viewport. No per-component wiring required.
 *
 * Optional attributes:
 *   data-animate-delay="120"   — milliseconds (default 0)
 *   data-animate-once="false"  — replay every time it scrolls in (default true)
 */
export default function AutoReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      document.querySelectorAll('[data-animate]').forEach((el) => {
        el.classList.add('is-revealed');
      });
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target;
          if (entry.isIntersecting) {
            const delay = Number(target.getAttribute('data-animate-delay') || 0);
            window.setTimeout(() => target.classList.add('is-revealed'), delay);
            const once = target.getAttribute('data-animate-once') !== 'false';
            if (once) observer.unobserve(target);
          } else {
            const once = target.getAttribute('data-animate-once') !== 'false';
            if (!once) target.classList.remove('is-revealed');
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
    );

    const targets = document.querySelectorAll('[data-animate]:not(.is-revealed)');
    targets.forEach((el) => observer.observe(el));

    const mutation = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches?.('[data-animate]:not(.is-revealed)')) observer.observe(node);
          node
            .querySelectorAll?.('[data-animate]:not(.is-revealed)')
            .forEach((el) => observer.observe(el));
        });
      });
    });
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);

  return null;
}
