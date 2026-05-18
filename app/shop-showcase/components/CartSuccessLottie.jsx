'use client';

import { memo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

/** Lottie: short success feedback after add-to-cart */
function CartSuccessLottie({ visible, onDone }) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    if (!visible) return undefined;
    let cancelled = false;
    fetch('/shop/success-check.json')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {});
    const timer = setTimeout(() => onDone?.(), 2200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [visible, onDone]);

  if (!visible) return null;

  return (
    <div className="shop-lottie-toast" role="status" aria-live="polite">
      {animationData ? (
        <Lottie
          animationData={animationData}
          loop={false}
          className="shop-lottie-toast__icon"
        />
      ) : (
        <span className="shop-lottie-toast__icon flex items-center justify-center text-2xl">✓</span>
      )}
      <span className="text-sm font-medium text-emerald-200">تمت الإضافة إلى السلّة</span>
    </div>
  );
}

export default memo(CartSuccessLottie);
