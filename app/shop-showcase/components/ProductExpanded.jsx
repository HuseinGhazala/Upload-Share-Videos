'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

/** Framer Motion: shared layoutId expansion from product card */
export default function ProductExpanded({ product, onClose, onAddToCart }) {
  return (
    <AnimatePresence>
      {product ? (
        <motion.div
          key="expanded-backdrop"
          className="shop-expanded-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.article
            layoutId={`product-shell-${product.id}`}
            className="shop-expanded-card"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div layoutId={`product-image-${product.id}`} className="relative aspect-[16/10]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="640px"
                className="object-cover"
                priority
              />
            </motion.div>
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">{product.desc}</p>
              <p className="text-xl font-bold text-emerald-300 mb-6">{product.price} ر.س</p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  className="btn-primary"
                >
                  أضف إلى السلّة
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/20 px-5 py-3 text-sm hover:bg-white/10"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
