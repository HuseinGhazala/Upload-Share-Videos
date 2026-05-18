'use client';

import { memo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

function ProductCard({
  product,
  onAddToCart,
  onQuickView,
  onExpand,
}) {
  return (
    <motion.article
      layout
      layoutId={`product-shell-${product.id}`}
      className="glass-panel overflow-hidden group cursor-pointer"
      onClick={() => onExpand(product)}
    >
      <motion.div layoutId={`product-image-${product.id}`} className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge ? (
          <span className="absolute top-3 right-3 rounded-full bg-indigo-500/90 px-2.5 py-0.5 text-[10px] font-semibold">
            {product.badge}
          </span>
        ) : null}
      </motion.div>
      <div className="p-4">
        <h3 className="font-semibold text-sm sm:text-base mb-1">{product.name}</h3>
        <p className="text-xs text-white/50 line-clamp-2 mb-3">{product.desc}</p>
        <motion.div layoutId={`product-price-${product.id}`} className="flex items-center justify-between gap-2">
          <span className="text-emerald-300 font-bold">{product.price} ر.س</span>
          <motion.div layout="position" className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] hover:bg-white/10"
            >
              عرض سريع
            </button>
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="rounded-lg bg-indigo-500/90 px-2.5 py-1.5 text-[11px] font-semibold hover:bg-indigo-400"
            >
              أضف إلى السلّة
            </button>
          </motion.div>
        </motion.div>
      </div>
    </motion.article>
  );
}

export default memo(ProductCard);
