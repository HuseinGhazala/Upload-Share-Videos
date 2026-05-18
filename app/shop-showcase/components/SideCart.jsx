'use client';

import { memo, useMemo } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useAutoAnimate } from '@formkit/auto-animate/react';

/** React Spring: physics-based slide-in cart from the right */
function SideCart({ open, items, onClose, onRemove, total }) {
  const [listRef] = useAutoAnimate({ duration: 280, easing: 'ease-out' });

  const backdropSpring = useSpring({
    opacity: open ? 1 : 0,
    pointerEvents: open ? 'auto' : 'none',
    config: { tension: 300, friction: 28 },
  });

  const panelSpring = useSpring({
    transform: open ? 'translateX(0%)' : 'translateX(100%)',
    config: { tension: 280, friction: 26, mass: 1 },
  });

  const itemCount = useMemo(
    () => items.reduce((sum, line) => sum + line.qty, 0),
    [items]
  );

  return (
    <>
      <animated.div
        role="button"
        tabIndex={-1}
        aria-label="إغلاق السلة"
        style={backdropSpring}
        onClick={onClose}
        onKeyDown={() => {}}
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm cursor-default"
      />
      <animated.aside
        style={panelSpring}
        className="fixed top-0 right-0 z-[75] h-full w-full max-w-md border-l border-white/10 bg-[#0c1020]/98 shadow-2xl flex flex-col"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold">سلّة المشتريات</h2>
            <p className="text-xs text-white/50">{itemCount} منتج في السلّة</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            إغلاق
          </button>
        </div>

        <ul ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <li className="text-center text-white/45 text-sm py-16">سلّتك فارغة حتى الآن</li>
          ) : (
            items.map((line) => (
              <li
                key={line.id}
                className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div
                  className="h-14 w-14 rounded-lg bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${line.image})` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{line.name}</p>
                  <p className="text-xs text-emerald-300 mt-0.5">
                    {line.price} ر.س × {line.qty}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(line.id)}
                  className="text-xs text-red-300 hover:text-red-200 shrink-0"
                >
                  حذف
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="p-5 border-t border-white/10">
          <div className="flex justify-between text-sm mb-4">
            <span className="text-white/60">الإجمالي</span>
            <span className="font-bold text-emerald-300">{total} ر.س</span>
          </div>
          <button
            type="button"
            disabled={items.length === 0}
            className="btn-primary w-full disabled:opacity-40"
          >
            متابعة عملية الشراء
          </button>
        </div>
      </animated.aside>
    </>
  );
}

export default memo(SideCart);
