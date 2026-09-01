'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ShoppingBag, Search, User, Heart, ChevronDown, 
  Menu, X, Sparkles, Check, Truck, ShieldCheck, AlertCircle, ArrowRight,
  Loader2, Lock, KeyRound, Eye, EyeOff, Phone
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, wishlistCount, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [readyToWearDropdownOpen, setReadyToWearDropdownOpen] = useState(false);
  const [luxuryPretDropdownOpen, setLuxuryPretDropdownOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Pre-Authentication Modal States
  const [adminAuthModalOpen, setAdminAuthModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Always open security credentials modal on clicking Admin Portal
  const handleAdminLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminAuthModalOpen(true);
  };

  const handleAdminModalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');
    setIsAdminLoggingIn(true);
    await new Promise(r => setTimeout(r, 450));

    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanPass = adminPassword.trim();

    if (
      (cleanEmail === 'zehrastudio3322@gmail.com' || cleanEmail === 'admin@zehrastudio.pk' || cleanEmail === 'admin' || cleanEmail === 'zehra' || cleanEmail === 'admin@zehra.com') &&
      (cleanPass === 'zehra2026' || cleanPass === 'admin12345' || cleanPass === '7860')
    ) {
      localStorage.setItem('zehra_admin_auth', 'authenticated_true');
      setIsAdminLoggingIn(false);
      setAdminAuthModalOpen(false);
      router.push('/admin');
    } else {
      setIsAdminLoggingIn(false);
      setAdminLoginError('Invalid credentials. Please enter valid email & password or click 1-Click Auto Fill.');
    }
  };

  const fillAdminDemo = () => {
    setAdminEmail('zehrastudio3322@gmail.com');
    setAdminPassword('zehra2026');
  };

  // Customer Account Login States
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [isCustomerLoggingIn, setIsCustomerLoggingIn] = useState(false);
  const [customerLoginSuccess, setCustomerLoginSuccess] = useState(false);

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail.trim()) return;
    setIsCustomerLoggingIn(true);
    await new Promise(r => setTimeout(r, 600));
    setIsCustomerLoggingIn(false);
    setCustomerLoginSuccess(true);
    setTimeout(() => {
      setCustomerLoginSuccess(false);
      setAccountModalOpen(false);
    }, 1200);
  };

  // Scroll detection for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide storefront Navbar on /admin routes (after all hooks are called)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>

      {/* 2. Main Luxury Sticky Navbar (Pristine White Background) */}
      <header 
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-stone-200/80 py-2 sm:py-2.5' 
            : 'bg-white border-b border-stone-200 py-2.5 sm:py-3.5'
        }`}
      >
        <div className="max-w-[1550px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 lg:gap-4">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-stone-800 hover:text-[#6B1D2F] flex-shrink-0"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Left Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 rounded-full overflow-hidden border border-[#C5A880]/60 shadow-2xs group-hover:border-[#6B1D2F] transition-all flex-shrink-0 bg-[#FAF7F2]">
              <Image 
                src="/logo.png" 
                alt="ZEHRA STUDIO" 
                width={40} 
                height={40} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-bold text-base sm:text-lg xl:text-xl tracking-[0.12em] text-[#18181B] group-hover:text-[#6B1D2F] transition-colors leading-none">
                ZEHRA STUDIO
              </span>
              <span className="text-[7.5px] sm:text-[8px] xl:text-[9px] tracking-[0.25em] sm:tracking-[0.3em] text-[#C5A880] uppercase font-bold mt-0.5 sm:mt-1">
                LUXURY PRET &amp; COUTURE
              </span>
            </div>
          </Link>

          {/* Center Main Navigation Links */}
          <nav className="hidden lg:flex items-center gap-3 lg:gap-4 xl:gap-6 whitespace-nowrap flex-shrink font-sans">
            <Link 
              href="/" 
              className="text-[11.5px] xl:text-[12.5px] font-bold text-[#18181B] hover:text-[#6B1D2F] transition-colors uppercase tracking-wider py-2 whitespace-nowrap relative group/link"
            >
              <span>HOME</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#C5A880] group-hover/link:w-full transition-all duration-300" />
            </Link>

            <Link 
              href="/shop?sort=newest" 
              className="text-[11.5px] xl:text-[12.5px] font-bold text-[#18181B] hover:text-[#6B1D2F] transition-colors uppercase tracking-wider py-2 whitespace-nowrap relative group/link"
            >
              <span>NEW ARRIVALS</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#C5A880] group-hover/link:w-full transition-all duration-300" />
            </Link>

            {/* Ready to Wear Dropdown */}
            <div 
              className="relative py-2 group cursor-pointer whitespace-nowrap"
              onMouseEnter={() => setReadyToWearDropdownOpen(true)}
              onMouseLeave={() => setReadyToWearDropdownOpen(false)}
            >
              <Link 
                href="/shop?category=ready-to-wear" 
                className="text-[11.5px] xl:text-[12.5px] font-bold text-[#18181B] group-hover:text-[#6B1D2F] transition-colors uppercase tracking-wider flex items-center gap-1 whitespace-nowrap"
              >
                <span>READY TO WEAR</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:rotate-180 transition-transform duration-300 flex-shrink-0" />
              </Link>

              {readyToWearDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-3.5 z-50 animate-slide-down">
                  <div className="text-[9.5px] font-extrabold text-[#C5A880] uppercase tracking-widest pb-2 border-b border-stone-100 mb-1.5">
                    COLLECTIONS &amp; CATEGORIES
                  </div>
                  <ul className="space-y-1 text-xs font-semibold text-stone-700">
                    <li><Link href="/shop?category=luxury-pret" className="block px-3 py-1.5 rounded-lg hover:bg-rose-50 hover:text-[#6B1D2F] transition-all">Luxury Pret</Link></li>
                    <li><Link href="/shop?category=ready-to-wear" className="block px-3 py-1.5 rounded-lg hover:bg-rose-50 hover:text-[#6B1D2F] transition-all">Ready To Wear</Link></li>
                    <li><Link href="/shop?category=raw-silk-chiffon" className="block px-3 py-1.5 rounded-lg hover:bg-rose-50 hover:text-[#6B1D2F] transition-all">Raw Silk &amp; Chiffon</Link></li>
                    <li><Link href="/shop?category=velvet-festive" className="block px-3 py-1.5 rounded-lg hover:bg-rose-50 hover:text-[#6B1D2F] transition-all">Velvet Festive</Link></li>
                    <li><Link href="/shop?category=bridal-couture" className="block px-3 py-1.5 rounded-lg hover:bg-rose-50 hover:text-[#6B1D2F] transition-all">Bridal &amp; Couture</Link></li>
                    <li className="pt-1.5 border-t border-stone-100"><Link href="/shop" className="block px-3 py-1.5 text-[#6B1D2F] font-bold">View All Catalog &rarr;</Link></li>
                  </ul>
                </div>
              )}
            </div>

            {/* Luxury Pret Dropdown */}
            <div 
              className="relative py-2 group cursor-pointer whitespace-nowrap"
              onMouseEnter={() => setLuxuryPretDropdownOpen(true)}
              onMouseLeave={() => setLuxuryPretDropdownOpen(false)}
            >
              <Link 
                href="/shop?category=luxury-pret" 
                className="text-[11.5px] xl:text-[12.5px] font-bold text-[#18181B] group-hover:text-[#6B1D2F] transition-colors uppercase tracking-wider flex items-center gap-1 whitespace-nowrap"
              >
                <span>LUXURY PRET</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:rotate-180 transition-transform duration-300 flex-shrink-0" />
              </Link>

              {luxuryPretDropdownOpen && (
                <div className="absolute top-full left-0 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 p-2.5 z-50 animate-slide-down">
                  <Link href="/shop?category=luxury-pret" className="block px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-rose-50 hover:text-[#6B1D2F] rounded-xl">
                    Luxury Pret Formals
                  </Link>
                  <Link href="/shop?category=velvet-festive" className="block px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-rose-50 hover:text-[#6B1D2F] rounded-xl">
                    Velvet Festive Edit
                  </Link>
                  <Link href="/shop?category=raw-silk-chiffon" className="block px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-rose-50 hover:text-[#6B1D2F] rounded-xl">
                    Raw Silk &amp; Chiffon
                  </Link>
                </div>
              )}
            </div>

            <Link 
              href="/shop?category=sale-clearance" 
              className="text-[11.5px] xl:text-[12.5px] font-bold text-[#6B1D2F] hover:text-[#18181B] transition-colors uppercase tracking-wider py-2 whitespace-nowrap relative group/link"
            >
              <span>TOP SALE</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#6B1D2F] group-hover/link:w-full transition-all duration-300" />
            </Link>

            <Link 
              href="/contact" 
              className="text-[11.5px] xl:text-[12.5px] font-bold text-[#18181B] hover:text-[#6B1D2F] transition-colors uppercase tracking-wider py-2 whitespace-nowrap relative group/link"
            >
              <span>CONTACT</span>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#C5A880] group-hover/link:w-full transition-all duration-300" />
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-3 flex-shrink-0">
            {/* Search Trigger */}
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-1.5 sm:p-2 text-stone-800 hover:text-[#6B1D2F] hover:bg-stone-50 rounded-full transition-colors flex-shrink-0"
              title="Search Catalog"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Discrete Luxury Admin Link */}
            <button 
              onClick={handleAdminLinkClick}
              className="p-1.5 sm:p-2 text-stone-500 hover:text-[#6B1D2F] hover:bg-stone-100 rounded-full transition-colors flex-shrink-0"
              title="Admin Portal"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A880] hover:text-[#6B1D2F]" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-slide-down">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-bold text-stone-800 hover:text-[#6B1D2F] py-2.5 border-b border-stone-100 uppercase tracking-wider">HOME</Link>
            <Link href="/shop?sort=newest" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-bold text-stone-800 hover:text-[#6B1D2F] py-2.5 border-b border-stone-100 uppercase tracking-wider">NEW ARRIVALS</Link>
            <Link href="/shop?category=luxury-pret" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-bold text-stone-800 hover:text-[#6B1D2F] py-2.5 border-b border-stone-100 uppercase tracking-wider">LUXURY PRET</Link>
            <Link href="/shop?category=ready-to-wear" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-bold text-stone-800 hover:text-[#6B1D2F] py-2.5 border-b border-stone-100 uppercase tracking-wider">READY TO WEAR</Link>
            <Link href="/shop?category=raw-silk-chiffon" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-bold text-stone-800 hover:text-[#6B1D2F] py-2.5 border-b border-stone-100 uppercase tracking-wider">RAW SILK &amp; CHIFFON</Link>
            <Link href="/shop?category=velvet-festive" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-bold text-stone-800 hover:text-[#6B1D2F] py-2.5 border-b border-stone-100 uppercase tracking-wider">VELVET FESTIVE</Link>
            <Link href="/shop?category=sale-clearance" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-bold text-[#6B1D2F] py-2.5 border-b border-stone-100 uppercase tracking-wider">TOP SALE &amp; CLEARANCE</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-bold text-stone-700 py-2.5 border-b border-stone-100 uppercase tracking-wider">CONTACT: 0309 43 29 812</Link>
            <button 
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleAdminLinkClick(e);
              }} 
              className="w-full flex items-center justify-between text-xs font-bold text-stone-700 bg-stone-100 hover:bg-[#6B1D2F] hover:text-white px-4 py-3 rounded-2xl transition-all uppercase tracking-wider mt-2 border border-stone-200"
            >
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#C5A880]" />
                ADMIN PORTAL
              </span>
              <ArrowRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>
        )}
      </header>

      {/* Admin Pre-Authentication Modal */}
      {adminAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl border border-[#E8DFC8] shadow-2xl p-6 sm:p-8 space-y-6 animate-scale-in relative overflow-hidden">
            
            {/* Top Gold Ornament */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C5A880] via-[#6B1D2F] to-[#C5A880]" />

            {/* Close Button */}
            <button 
              type="button"
              onClick={() => setAdminAuthModalOpen(false)} 
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2 pt-2">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#C5A880]/60 mx-auto shadow-md bg-[#FAF7F2]">
                <Image 
                  src="/logo.png" 
                  alt="ZEHRA STUDIO" 
                  width={56} 
                  height={56} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] font-black text-[#C5A880] uppercase tracking-[0.3em] block">
                ADMIN ACCESS REQUIRED
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#18181B]">
                Store Admin Portal
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Please enter administrator credentials to manage products, pricing, and live orders.
              </p>
            </div>

            {/* Error Notification */}
            {adminLoginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{adminLoginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleAdminModalLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
                  Admin Email / Username
                </label>
                <input
                  type="text"
                  required
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="zehrastudio3322@gmail.com"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-[#6B1D2F] rounded-xl text-xs text-[#18181B] focus:outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
                    Master Password / PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="text-[10px] text-[#6B1D2F] font-semibold hover:underline"
                  >
                    {showAdminPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 focus:border-[#6B1D2F] rounded-xl text-xs text-[#18181B] focus:outline-none transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isAdminLoggingIn}
                className={`w-full py-3.5 bg-[#6B1D2F] hover:bg-[#521423] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#6B1D2F]/30 flex items-center justify-center gap-2 ${
                  isAdminLoggingIn ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {isAdminLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C5A880]" />
                    <span>Verifying Master Access...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Unlock Admin Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Account Modal */}
      {accountModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setAccountModalOpen(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-700">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-rose-50 text-[#6B1D2F] rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-lg">ZS</div>
              <h3 className="text-lg font-bold text-[#18181B]">Zehra Studio Account Login</h3>
              <p className="text-xs text-stone-500">Sign in to track orders and save custom body measurements.</p>
            </div>
            <form onSubmit={handleCustomerLogin} className="space-y-3 pt-2">
              <input 
                type="text" 
                required
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="Phone Number or Email" 
                className="w-full bg-[#FCFAF7] border border-stone-300 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]" 
              />
              <input 
                type="password" 
                required
                value={customerPassword}
                onChange={e => setCustomerPassword(e.target.value)}
                placeholder="Password" 
                className="w-full bg-[#FCFAF7] border border-stone-300 rounded-xl px-4 py-3 text-xs text-stone-900 focus:outline-none focus:border-[#C5A880]" 
              />
              <button 
                type="submit"
                disabled={isCustomerLoggingIn}
                className="w-full btn-luxury-gold py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {isCustomerLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing In...</span>
                  </>
                ) : customerLoginSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Signed In Successfully!</span>
                  </>
                ) : (
                  <span>LOG IN TO ACCOUNT</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Search Modal (Fully responsive, no mobile cutoff) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 animate-fade-in">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-xl p-5 sm:p-7 shadow-2xl relative space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-[#18181B] flex items-center gap-2">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#6B1D2F]" />
                <span>Search Catalog</span>
              </h3>
              <button 
                onClick={() => setSearchOpen(false)} 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  setSearchOpen(false);
                  router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="flex items-center gap-2 w-full"
            >
              <input 
                type="text" 
                placeholder="Search by dress name, fabric, style..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-0 bg-[#FCFAF7] border border-stone-300 focus:border-[#C5A880] rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-stone-900 focus:outline-none transition-all placeholder:text-stone-400"
                autoFocus
              />
              <button 
                type="submit"
                className="btn-luxury-gold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold uppercase tracking-wider flex-shrink-0 whitespace-nowrap shadow-sm"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
