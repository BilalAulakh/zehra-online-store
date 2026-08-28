'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, Star, ShieldCheck, Truck, Gem, 
  RotateCcw, Headphones, Play, Camera, ChevronRight, ChevronLeft, Sparkles, Plus, Package, Flame 
} from 'lucide-react';
import { getProducts, getCategories, Product, Category } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Shimmer';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  // Slider Refs
  const newArrivalsRef = useRef<HTMLDivElement>(null);
  const topSaleRef = useRef<HTMLDivElement>(null);
  const collectionsRef = useRef<HTMLDivElement>(null);
  const lookbookRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadHomeData() {
      try {
        const prodData = await getProducts(undefined, (streamingList) => {
          if (isMounted && streamingList && streamingList.length > 0) {
            setProducts(streamingList);
            setLoading(false);
          }
        });
        if (isMounted && prodData && Array.isArray(prodData)) {
          setProducts(prodData);
          setLoading(false);
        }

        try {
          const catData = await getCategories();
          if (isMounted && catData && Array.isArray(catData)) {
            setCategories(catData);
          }
        } catch (err) {
          console.error('Home categories error:', err);
        }
      } catch (err) {
        console.error('Home products error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered product groups
  const featuredProducts = products.filter(p => p.is_featured && p.images && p.images.length > 0 && p.images[0]);
  const newArrivals = products.filter(p => p.is_new);
  const topSaleProducts = products.filter(p => p.is_top_sale || (p.compare_at_price && p.compare_at_price > p.price));
  
  // Hero slides strictly prioritize marked featured products
  const productsWithImages = products.filter(p => p.images && p.images.length > 0 && p.images[0]);
  const heroProducts = featuredProducts.length > 0 ? featuredProducts.slice(0, 5) : productsWithImages.slice(0, 3);

  // Auto-play Hero Slider when multiple products exist
  useEffect(() => {
    if (heroProducts.length <= 1) return;
    const timer = setInterval(() => {
      setActiveHeroSlide(prev => (prev + 1) % heroProducts.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroProducts.length]);

  const handleNextHeroSlide = () => {
    if (heroProducts.length === 0) return;
    setActiveHeroSlide(prev => (prev + 1) % heroProducts.length);
  };

  const handlePrevHeroSlide = () => {
    if (heroProducts.length === 0) return;
    setActiveHeroSlide(prev => (prev - 1 + heroProducts.length) % heroProducts.length);
  };

  const scrollSlider = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const currentHeroProduct = heroProducts[activeHeroSlide] || null;

  return (
    <div className="space-y-10 sm:space-y-16 md:space-y-24 pb-16 bg-[#FCFAF7] text-[#18181B] font-sans selection:bg-[#C5A880] selection:text-white overflow-x-hidden">
      
      {/* 1. HERO SECTION (Crystal Clear, High Contrast Luxury Editorial) */}
      <section className="relative min-h-[72vh] sm:min-h-[82vh] flex items-end sm:items-center justify-start overflow-hidden bg-[#18181B]">
        {currentHeroProduct && currentHeroProduct.images?.[0] ? (
          <>
            <div className="absolute inset-0 z-0">
              <Image
                key={currentHeroProduct.id}
                src={currentHeroProduct.images[0]}
                alt={currentHeroProduct.title}
                fill
                priority
                unoptimized={currentHeroProduct.images[0]?.startsWith('data:')}
                className="object-cover object-center sm:object-[75%_center] lg:object-[80%_30%] transition-all duration-700 animate-fade-in"
              />
              {/* Rich contrast gradient for crystal clear text readability without white haze */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent sm:bg-gradient-to-r sm:from-stone-950/90 sm:via-stone-950/45 sm:to-transparent z-10 pointer-events-none" />
            </div>

            {heroProducts.length > 1 && (
              <>
                <button 
                  onClick={handlePrevHeroSlide}
                  className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/90 hover:bg-[#6B1D2F] text-stone-900 hover:text-white border border-white/40 items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-105"
                  title="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleNextHeroSlide}
                  className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/90 hover:bg-[#6B1D2F] text-stone-900 hover:text-white border border-white/40 items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-105"
                  title="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 w-full pt-16 pb-8 sm:py-20">
              <div className="max-w-lg space-y-3 sm:space-y-5 text-left animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#C5A880]/60 bg-stone-900/60 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-[#C5A880] uppercase tracking-[0.25em] shadow-xs">
                  <Sparkles className="w-3 h-3 text-[#C5A880]" />
                  <span>{currentHeroProduct.category || 'FEATURED ATELIER'}</span>
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-5xl font-bold text-white tracking-tight leading-[1.15]">
                    {currentHeroProduct.title}
                  </h1>
                  <div className="text-xl sm:text-2xl font-bold text-[#C5A880]">
                    PKR {currentHeroProduct.price.toLocaleString()}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-200 font-normal max-w-md leading-relaxed line-clamp-2 sm:line-clamp-3">
                  {currentHeroProduct.description || `${currentHeroProduct.fabric} - Handcrafted luxury design.`}
                </p>

                <div className="flex items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2">
                  <Link
                    href={`/product/${currentHeroProduct.slug || currentHeroProduct.id}`}
                    className="btn-luxury-gold px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs shadow-lg tracking-widest uppercase font-bold text-center"
                  >
                    VIEW ARTICLE
                  </Link>
                  <Link
                    href="/shop"
                    className="btn-luxury-outline px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs tracking-widest shadow-xs uppercase font-bold bg-white/95 hover:bg-[#6B1D2F] hover:text-white text-center"
                  >
                    SHOP CATALOG
                  </Link>
                </div>

                {heroProducts.length > 1 && (
                  <div className="flex items-center gap-1.5 pt-2 sm:pt-3">
                    {heroProducts.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveHeroSlide(idx)}
                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                          activeHeroSlide === idx ? 'w-7 sm:w-8 bg-[#C5A880]' : 'w-2 bg-white/50 hover:bg-white'
                        }`}
                        title={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 w-full py-16 sm:py-28 text-center sm:text-left">
            <div className="max-w-2xl space-y-5 animate-fade-in text-white">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C5A880]/60 bg-stone-900/60 backdrop-blur-md text-[10px] font-bold text-[#C5A880] uppercase tracking-[0.3em]">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>ZEHRA STUDIO &bull; OFFICIAL ATELIER</span>
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl sm:text-6xl font-bold text-white tracking-tight leading-[1.1]">
                  Luxury Pret &amp;
                </h1>
                <h2 className="text-3xl sm:text-6xl font-bold text-[#C5A880] tracking-tight">
                  Bespoke Couture.
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-stone-300 font-normal max-w-lg leading-relaxed">
                Handcrafted pure fabrics, micro velvet formals, and delicate handmade adda work with custom tailoring &amp; express nationwide delivery.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Link
                  href="/shop"
                  className="btn-luxury-gold w-full sm:w-auto px-8 py-3.5 rounded-full text-xs shadow-lg tracking-widest uppercase font-bold text-center"
                >
                  EXPLORE SHOP
                </Link>
                <Link
                  href="/admin"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs tracking-widest uppercase font-bold bg-white/90 hover:bg-white text-stone-900 text-center shadow-xs flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 text-[#6B1D2F]" /> ADD ARTICLES IN ADMIN
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. LUXURY BENEFITS STRIP */}
      <section className="bg-white border-y border-stone-200/80 py-5 sm:py-6 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6 text-left">
            <div className="flex items-center gap-2.5 p-1 sm:p-0">
              <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A880] flex-shrink-0" />
              <div>
                <div className="text-[10.5px] sm:text-xs font-bold text-[#18181B] uppercase tracking-wider">PREMIUM QUALITY</div>
                <div className="text-[9.5px] sm:text-[10.5px] text-stone-500 font-medium">Finest Fabric &amp; Stitching</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-1 sm:p-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A880] flex-shrink-0" />
              <div>
                <div className="text-[10.5px] sm:text-xs font-bold text-[#18181B] uppercase tracking-wider">FREE SHIPPING</div>
                <div className="text-[9.5px] sm:text-[10.5px] text-stone-500 font-medium">Across Pakistan</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-1 sm:p-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A880] flex-shrink-0" />
              <div>
                <div className="text-[10.5px] sm:text-xs font-bold text-[#18181B] uppercase tracking-wider">SECURE PAYMENTS</div>
                <div className="text-[9.5px] sm:text-[10.5px] text-stone-500 font-medium">100% Safe COD &amp; Bank</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-1 sm:p-0">
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A880] flex-shrink-0" />
              <div>
                <div className="text-[10.5px] sm:text-xs font-bold text-[#18181B] uppercase tracking-wider">EASY EXCHANGE</div>
                <div className="text-[9.5px] sm:text-[10.5px] text-stone-500 font-medium">Within 7 Days</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-1 sm:p-0 col-span-2 sm:col-span-1">
              <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A880] flex-shrink-0" />
              <div>
                <div className="text-[10.5px] sm:text-xs font-bold text-[#18181B] uppercase tracking-wider">24/7 WHATSAPP</div>
                <div className="text-[9.5px] sm:text-[10.5px] text-stone-500 font-medium">0309 43 29 812</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED COUTURE COLLECTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-stone-200/80 pb-4 gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-[#6B1D2F] uppercase tracking-[0.25em]">
              <Sparkles className="w-3 h-3 text-[#C5A880]" />
              <span>CURATED ARCHITECTURE</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-[#18181B] tracking-tight">
              Featured Collections
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => scrollSlider(collectionsRef, 'left')}
              className="w-8 h-8 rounded-full bg-white text-stone-700 border border-stone-200 hover:bg-[#6B1D2F] hover:text-white flex items-center justify-center transition-all shadow-xs"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => scrollSlider(collectionsRef, 'right')}
              className="w-8 h-8 rounded-full bg-white text-stone-700 border border-stone-200 hover:bg-[#6B1D2F] hover:text-white flex items-center justify-center transition-all shadow-xs"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {categories.filter(cat => cat.item_count > 0 && cat.image).length > 0 ? (
          <div 
            ref={collectionsRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
          >
            {categories.filter(cat => cat.item_count > 0 && cat.image).map((cat, idx) => (
              <Link 
                key={idx} 
                href={`/shop?category=${cat.slug}`} 
                className="flex-none w-[240px] sm:w-[290px] snap-start group relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-stone-200 bg-white"
              >
                <Image 
                  src={cat.image} 
                  alt={cat.name} 
                  fill 
                  unoptimized={cat.image?.startsWith('data:')}
                  loading="lazy"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
                
                <div className="absolute top-3.5 left-3.5 z-10">
                  <span className="bg-white/95 backdrop-blur-md border border-[#C5A880]/60 text-[#6B1D2F] text-[8.5px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-2xs">
                    {cat.item_count} {cat.item_count === 1 ? 'DESIGN' : 'DESIGNS'}
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 text-white flex justify-between items-end z-10">
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-bold tracking-wider uppercase leading-snug">{cat.name}</h3>
                    <p className="text-[10px] text-stone-300 font-light">Explore Luxury Edit</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/30 backdrop-blur-md group-hover:bg-[#C5A880] text-white group-hover:text-black flex items-center justify-center transition-all shadow-2xs">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat, idx) => (
              <Link 
                key={idx} 
                href={`/shop?category=${cat.slug}`}
                className="p-4 rounded-2xl bg-white border border-stone-200/80 hover:border-[#C5A880] text-center space-y-1 transition-all shadow-2xs hover:-translate-y-0.5 group"
              >
                <div className="w-8 h-8 rounded-full bg-[#F8F4ED] text-[#6B1D2F] flex items-center justify-center mx-auto text-xs font-bold font-serif group-hover:bg-[#6B1D2F] group-hover:text-white transition-colors">
                  0{idx + 1}
                </div>
                <div className="text-xs font-bold text-stone-800 group-hover:text-[#6B1D2F] transition-colors">{cat.name}</div>
                <div className="text-[10px] text-stone-400">View Designs &rarr;</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. NEW ARRIVALS SLIDER (Strictly Shows is_new Products) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-stone-200/80 pb-4 gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-[#6B1D2F] uppercase tracking-[0.25em]">
              <Sparkles className="w-3 h-3 text-[#C5A880]" />
              <span>FRESH OFF THE ATELIER</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-[#18181B] tracking-tight">
              New Arrivals Edition &rsquo;26
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => scrollSlider(newArrivalsRef, 'left')}
                className="w-8 h-8 rounded-full bg-white text-stone-700 border border-stone-200 hover:bg-[#6B1D2F] hover:text-white flex items-center justify-center transition-all shadow-xs"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => scrollSlider(newArrivalsRef, 'right')}
                className="w-8 h-8 rounded-full bg-white text-stone-700 border border-stone-200 hover:bg-[#6B1D2F] hover:text-white flex items-center justify-center transition-all shadow-xs"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Link href="/shop?sort=newest" className="text-xs font-bold text-[#6B1D2F] hover:text-[#C5A880] uppercase tracking-wider hidden sm:block transition-colors">
              ALL &rarr;
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-none w-[240px] sm:w-[280px]">
                <ProductCardSkeleton count={1} />
              </div>
            ))}
          </div>
        ) : (newArrivals.length > 0 ? newArrivals : products).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-6 space-y-3 shadow-2xs">
            <Package className="w-10 h-10 text-[#C5A880] mx-auto" />
            <h3 className="text-base font-bold text-[#18181B]">Store Catalog Ready</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Add your articles from the admin portal to showcase them here.
            </p>
          </div>
        ) : (
          <div 
            ref={newArrivalsRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
          >
            {(newArrivals.length > 0 ? newArrivals : products).map(product => (
              <div key={product.id} className="flex-none w-[240px] sm:w-[280px] snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. TOP SALE & BEST SELLERS SECTION (Separate & Distinct) */}
      {topSaleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-end justify-between border-b border-stone-200/80 pb-4 gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-[#6B1D2F] uppercase tracking-[0.25em]">
                <Flame className="w-3 h-3 text-[#C5A880]" />
                <span>LIMITED TIME OFFERS</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-[#18181B] tracking-tight">
                Top Sale &amp; Best Sellers
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => scrollSlider(topSaleRef, 'left')}
                  className="w-8 h-8 rounded-full bg-white text-stone-700 border border-stone-200 hover:bg-[#6B1D2F] hover:text-white flex items-center justify-center transition-all shadow-xs"
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => scrollSlider(topSaleRef, 'right')}
                  className="w-8 h-8 rounded-full bg-white text-stone-700 border border-stone-200 hover:bg-[#6B1D2F] hover:text-white flex items-center justify-center transition-all shadow-xs"
                  title="Scroll Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <Link href="/shop?category=sale-clearance" className="text-xs font-bold text-[#6B1D2F] hover:text-[#C5A880] uppercase tracking-wider hidden sm:block transition-colors">
                ALL SALE &rarr;
              </Link>
            </div>
          </div>

          <div 
            ref={topSaleRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
          >
            {topSaleProducts.map(product => (
              <div key={product.id} className="flex-none w-[240px] sm:w-[280px] snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. CINEMATIC CAMPAIGN BANNER */}
      <section className="relative min-h-[380px] sm:min-h-[460px] flex items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl max-w-7xl mx-auto border border-stone-200/80 shadow-xl bg-stone-950">
        {/* Background Ambient Video */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-45 pointer-events-none"
        >
          <source src="/campaign-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/50 to-stone-950/80" />

        <div className="relative z-10 text-center space-y-4 max-w-xl px-4 animate-fade-in">
          <button 
            onClick={() => setVideoModalOpen(true)}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#C5A880] text-white hover:bg-[#6B1D2F] flex items-center justify-center mx-auto shadow-2xl hover:scale-110 transition-all duration-300 ring-4 ring-white/10"
            title="Play Campaign Film"
          >
            <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1" />
          </button>
          
          <div className="space-y-2">
            <span className="text-[9.5px] sm:text-xs font-bold text-amber-200 uppercase tracking-[0.35em]">CAMPAIGN FILM ’26</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Not overdressed, just perfectly felt✨</h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed font-normal">
              Watch our master artisans bring traditional embroidery and bespoke couture to life.
            </p>
          </div>
        </div>

        {videoModalOpen && (
          <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border border-stone-700 shadow-2xl bg-black flex items-center justify-center">
              <button 
                onClick={() => setVideoModalOpen(false)} 
                className="absolute top-3 right-3 text-white hover:text-[#C5A880] font-bold z-20 text-xs bg-black/80 px-3 py-1.5 rounded-full border border-white/20 hover:bg-black transition-colors"
              >
                ✕ Close
              </button>
              <video
                className="w-full h-full object-contain"
                src="/campaign-video.mp4"
                controls
                autoPlay
                playsInline
              />
            </div>
          </div>
        )}
      </section>

      {/* 7. CUSTOMER VOICES / TESTIMONIAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#FAF7F2] via-[#F5EFEB] to-[#FAF7F2] text-stone-900 rounded-3xl p-6 sm:p-10 border border-[#E8DFC8] shadow-sm space-y-4">
          <div className="w-9 h-9 rounded-full bg-[#6B1D2F] text-white flex items-center justify-center font-bold text-base">
            &ldquo;
          </div>
          <div className="space-y-2">
            <span className="text-[9.5px] font-bold text-[#6B1D2F] uppercase tracking-widest">COUTURE CLIENT VOICES</span>
            <h3 className="text-xl sm:text-2xl font-bold leading-snug text-[#18181B]">
              &ldquo;The fabric finish, the intricate embroidery, and the custom stitching exceed every expectation. Zehra Studio is pure luxury.&rdquo;
            </h3>
          </div>
          <div className="flex items-center gap-2.5 pt-2 border-t border-[#E8DFC8]">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#18181B]">FATIMA TARIQ</div>
              <div className="text-[10px] text-stone-500 font-medium">Lahore, Pakistan &bull; Verified Client</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. VIP NEWSLETTER & INSTAGRAM STREAM */}
      <section className="bg-white text-stone-900 pt-10 pb-4 border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="space-y-4">
            <div className="text-center space-y-0.5">
              <span className="text-[9.5px] font-bold text-[#6B1D2F] uppercase tracking-[0.25em]">#ZEHRASTUDIO</span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#18181B]">Follow Our Atelier</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {products.slice(0, 4).map((p, i) => (
                <Link key={i} href={`/product/${p.slug || p.id}`} className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden group border border-stone-200 shadow-2xs block bg-stone-50">
                  {p.images?.[0] ? (
                    <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-stone-100" />
                  )}
                  <div className="absolute inset-0 bg-[#6B1D2F]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="w-5 h-5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* VIP Couture Club */}
          <div className="bg-gradient-to-r from-[#FAF7F2] via-[#F5EFEB] to-[#FAF7F2] rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center space-y-4 border border-[#E8DFC8] shadow-sm">
            <span className="text-[9.5px] font-bold text-[#6B1D2F] uppercase tracking-widest">VIP COUTURE CLUB</span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#18181B]">Receive Private Collection Previews</h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto font-normal">
              Subscribe to get exclusive early access to Eid Festive edits, bespoke designs, and private previews.
            </p>
            <form className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to Zehra Studio!'); }}>
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                className="flex-1 bg-white border border-stone-300 rounded-full px-4 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#C5A880] shadow-2xs"
              />
              <button type="submit" className="btn-luxury-gold text-xs px-6 py-2.5 rounded-full shadow-sm font-bold">
                JOIN VIP
              </button>
            </form>
          </div>

        </div>
      </section>

    </div>
  );
}
