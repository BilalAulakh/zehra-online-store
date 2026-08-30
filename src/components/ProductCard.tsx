'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Eye, Star, Zap, Loader2 } from 'lucide-react';
import { Product } from '@/lib/supabase';

import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const discountPercent = product.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) 
    : 0;

  // 1-Click Instant Checkout when clicking BUY NOW / QUICK ADD
  const handleQuickBuy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAddingToCart) return;
    setIsAddingToCart(true);
    addToCart(product, 1, selectedSize);
    await new Promise(r => setTimeout(r, 450));
    router.push('/checkout');
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <>
      <div 
        className="group relative bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-[#C7A76C] transition-all duration-500 shadow-xs hover:shadow-xl flex flex-col justify-between"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        
      >
        {/* Product Image Box with React Shimmer placeholder */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF9F6]">
          {!imageLoaded && (
            <div className="absolute inset-0 shimmer-card z-0" />
          )}

          <Link href={`/product/${product.slug}`} className="block w-full h-full relative z-1">
            {(() => {
              const currentSrc = (isHovered && product.images?.[1]) ? product.images[1] : (product.images?.[0] || '/images/a1.webp');
              const isBase64 = currentSrc.startsWith('data:');
              return (
                <Image
                  src={currentSrc}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  unoptimized={isBase64}
                  loading="lazy"
                  className="object-cover object-top group-hover:scale-105 transition-all duration-500 ease-out"
                />
              );
            })()}
          </Link>

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
            {product.is_new && (
              <span className="bg-[#6B1D2F] text-white text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                NEW
              </span>
            )}
            {product.is_top_sale && (
              <span className="bg-[#C5A880] text-stone-900 text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                TOP SALE
              </span>
            )}
            {discountPercent > 0 && !product.is_top_sale && (
              <span className="bg-[#C5A880] text-stone-900 text-[8.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Top Right Wishlist Heart Toggle */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              inWishlist 
                ? 'bg-rose-50 text-[#6B1D2F] border border-rose-200 shadow-xs' 
                : 'bg-white/90 backdrop-blur-md text-stone-700 hover:text-[#6B1D2F] hover:bg-white shadow-2xs'
            }`}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Hover Quick Action Buttons */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={() => setQuickViewOpen(true)}
              className="flex-1 bg-white/95 backdrop-blur-md hover:bg-[#6B1D2F] hover:text-white text-stone-900 font-bold text-[9.5px] uppercase tracking-wider py-2 rounded-xl shadow-md flex items-center justify-center gap-1 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>QUICK VIEW</span>
            </button>
            <button
              onClick={handleQuickBuy}
              disabled={isAddingToCart}
              className="flex-1 bg-[#C5A880] hover:bg-[#6B1D2F] text-white font-bold text-[9.5px] uppercase tracking-wider py-2 rounded-xl shadow-md flex items-center justify-center gap-1 transition-all disabled:opacity-75"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>ADDING...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>BUY NOW</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product Information */}
        <div className="p-3.5 space-y-1.5 bg-white flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[9.5px] text-stone-500 font-bold uppercase tracking-wider mb-1">
              <span>{product.fabric || product.category || 'LUXURY PRET'}</span>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-3 h-3 fill-current" />
                <span>{product.rating || 5.0}</span>
              </div>
            </div>

            <Link href={`/product/${product.slug}`} className="block group-hover:text-[#6B1D2F] transition-colors">
              <h3 className="text-xs font-bold text-[#18181B] line-clamp-1 leading-snug">
                {product.title}
              </h3>
            </Link>
          </div>

          {/* Size Pill Selector */}
          <div className="flex items-center gap-1 pt-0.5">
            {['S', 'M', 'L', 'XL'].map((sz) => (
              <button
                key={sz}
                onClick={(e) => { e.preventDefault(); setSelectedSize(sz); }}
                className={`text-[8.5px] font-bold w-5 h-5 rounded flex items-center justify-center border transition-all ${
                  selectedSize === sz
                    ? 'bg-[#6B1D2F] text-white border-[#6B1D2F] shadow-2xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-[#C5A880]'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Price Box & Instant Order Trigger */}
          <div className="flex items-center justify-between pt-1.5 border-t border-stone-100">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-[#18181B]">
                PKR {product.price.toLocaleString()}
              </span>
              {product.compare_at_price && (
                <span className="text-[10.5px] text-stone-400 line-through">
                  PKR {product.compare_at_price.toLocaleString()}
                </span>
              )}
            </div>

            <button
              onClick={handleQuickBuy}
              disabled={isAddingToCart}
              className="bg-[#FAF7F2] text-[#6B1D2F] border border-[#C5A880]/50 hover:bg-[#6B1D2F] hover:text-white px-2.5 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all shadow-2xs disabled:opacity-75"
              title="Buy Now - Instant Checkout"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-3 h-3 text-[#6B1D2F] animate-spin" />
                  <span>ADDING...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 text-[#C5A880]" />
                  <span>BUY NOW</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button 
              onClick={() => setQuickViewOpen(false)} 
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 z-10 font-bold text-lg p-1 rounded-full hover:bg-stone-100"
            >
              ✕
            </button>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100">
              <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
            </div>
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-[#881337] uppercase tracking-widest">{product.fabric}</span>
                <h3 className="text-lg font-extrabold text-[#18181B]">{product.title}</h3>
                <div className="text-base font-black text-[#881337] mt-1">PKR {product.price.toLocaleString()}</div>
                <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">{product.description}</p>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-stone-700">Select Size:</div>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        selectedSize === sz ? 'bg-[#881337] text-white border-[#881337] shadow-xs' : 'bg-white text-stone-700 border-stone-200 hover:border-[#C7A76C]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={async (e) => {
                    await handleQuickBuy(e);
                    setQuickViewOpen(false);
                  }}
                  disabled={isAddingToCart}
                  className="w-full btn-luxury-gold py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg disabled:opacity-75"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>PROCEEDING TO CHECKOUT...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>BUY NOW &bull; INSTANT CHECKOUT</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
