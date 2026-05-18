'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Hero from './components/Hero';
import FeatureSection from './components/FeatureSection';
import ProductGrid from './components/ProductGrid';
import ProductExpanded from './components/ProductExpanded';
import SideCart from './components/SideCart';
import QuickViewModal from './components/QuickViewModal';
import CartSuccessLottie from './components/CartSuccessLottie';
import ShopHeader from './components/ShopHeader';
import './shop-showcase.css';

export default function ShopShowcaseClient() {
  const gridRef = useRef(null);
  const [category, setCategory] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [lottieVisible, setLottieVisible] = useState(false);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, line) => sum + line.qty, 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, line) => sum + line.price * line.qty, 0),
    [cartItems]
  );

  const handleAddToCart = useCallback((product) => {
    setCartItems((prev) => {
      const existing = prev.find((line) => line.id === product.id);
      if (existing) {
        return prev.map((line) =>
          line.id === product.id ? { ...line, qty: line.qty + 1 } : line
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          qty: 1,
        },
      ];
    });
    setLottieVisible(true);
  }, []);

  const handleRemoveFromCart = useCallback((id) => {
    setCartItems((prev) => prev.filter((line) => line.id !== id));
  }, []);

  const scrollToProducts = useCallback(() => {
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <main className="min-h-screen text-white pb-20">
      <div className="section-wrap py-10 sm:py-14">
        <ShopHeader cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />

        <Hero onShopNow={scrollToProducts} />

        <ProductGrid
          gridRef={gridRef}
          category={category}
          onCategoryChange={setCategory}
          onAddToCart={handleAddToCart}
          onQuickView={setQuickViewProduct}
          onExpand={setExpandedProduct}
        />

        <FeatureSection />
      </div>

      <SideCart
        open={cartOpen}
        items={cartItems}
        total={cartTotal}
        onClose={() => setCartOpen(false)}
        onRemove={handleRemoveFromCart}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <ProductExpanded
        product={expandedProduct}
        onClose={() => setExpandedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartSuccessLottie visible={lottieVisible} onDone={() => setLottieVisible(false)} />
    </main>
  );
}
