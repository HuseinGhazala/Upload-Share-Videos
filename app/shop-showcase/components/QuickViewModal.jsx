'use client';

import { memo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CSSTransition } from 'react-transition-group';

/** React Transition Group: mount/unmount quick-view with CSS fades */
function QuickViewModal({ product, onClose, onAddToCart }) {
  const backdropRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!product) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  return (
    <CSSTransition
      in={Boolean(product)}
      timeout={300}
      classNames="shop-modal-backdrop"
      unmountOnExit
      nodeRef={backdropRef}
    >
      <div
        ref={backdropRef}
        className="shop-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label="عرض سريع للمنتج"
        onClick={onClose}
      >
        <CSSTransition
          in={Boolean(product)}
          timeout={300}
          classNames="shop-modal-panel"
          unmountOnExit
          nodeRef={panelRef}
        >
          <div
            ref={panelRef}
            className="shop-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {product ? (
              <>
                <div className="relative aspect-video">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="520px"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                  <p className="text-sm text-white/60 mb-4">{product.desc}</p>
                  <p className="text-lg font-bold text-emerald-300 mb-5">{product.price} ر.س</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onAddToCart(product);
                        onClose();
                      }}
                      className="btn-primary flex-1"
                    >
                      أضف إلى السلّة
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-white/20 px-4 py-3 text-sm hover:bg-white/10"
                    >
                      إغلاق النافذة
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </CSSTransition>
      </div>
    </CSSTransition>
  );
}

export default memo(QuickViewModal);
