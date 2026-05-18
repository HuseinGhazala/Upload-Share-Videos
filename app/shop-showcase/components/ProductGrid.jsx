'use client';

import { useMemo } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { LayoutGroup } from 'framer-motion';
import ProductCard from './ProductCard';
import { CATEGORIES, PRODUCTS } from '../data/products';

/** @formkit/auto-animate: smooth list reflow on filter changes */
export default function ProductGrid({
  category,
  onCategoryChange,
  onAddToCart,
  onQuickView,
  onExpand,
  gridRef,
}) {
  const [animateParent] = useAutoAnimate({ duration: 320, easing: 'ease-in-out' });

  const filtered = useMemo(() => {
    if (category === 'all') return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === category);
  }, [category]);

  return (
    <section ref={gridRef} id="products" className="mb-8 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">منتجاتنا</h2>
          <p className="text-sm text-white/55 mt-1">
            تتحرّك الشبكة تلقائياً عند تغيير التصنيف، بفضل AutoAnimate.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onCategoryChange(c.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium border transition ${
                category === c.id
                  ? 'bg-indigo-500/90 border-indigo-400/50 text-white'
                  : 'border-white/15 text-white/70 hover:bg-white/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <LayoutGroup id="shop-products">
        <div ref={animateParent} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onQuickView={onQuickView}
              onExpand={onExpand}
            />
          ))}
        </div>
      </LayoutGroup>

      {filtered.length === 0 ? (
        <p className="text-center text-white/50 text-sm py-12">لا توجد منتجات ضمن هذا التصنيف حالياً.</p>
      ) : null}
    </section>
  );
}
