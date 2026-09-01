'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, Globe, Share2 } from 'lucide-react';

export const Footer: React.FC = () => {
  
  const pathname = usePathname();

  // Hide storefront Footer on /admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="bg-white text-stone-700 pt-16 pb-8 border-t border-stone-200">
      {/* Top Value Badges (Warm Ivory & Champagne) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-[#FAF7F2] rounded-3xl border border-[#E8DFC8] shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#C7A76C]/50 flex items-center justify-center text-[#881337] shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#18181B]">Free Nationwide Delivery</h4>
              <p className="text-xs text-stone-500">On all orders above RS. 5,000 across Pakistan</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#C7A76C]/50 flex items-center justify-center text-[#881337] shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#18181B]">100% Authentic Handcraft</h4>
              <p className="text-xs text-stone-500">Pure chiffon, micro velvet, and zardozi embroidery</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#C7A76C]/50 flex items-center justify-center text-[#881337] shadow-xs">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#18181B]">7-Day Easy Exchange</h4>
              <p className="text-xs text-stone-500">Hassle-free size replacement &amp; exchange policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10 mb-12">
        {/* Brand Info */}
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#C5A880]/60 shadow-xs flex-shrink-0 bg-[#FAF7F2]">
              <Image 
                src="/logo.png" 
                alt="ZEHRA STUDIO Logo" 
                width={48} 
                height={48} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
              />
            </div>
            <div>
              <span className="font-bold text-xl tracking-[0.15em] text-[#18181B] group-hover:text-[#6B1D2F] transition-colors leading-none block">
                ZEHRA STUDIO
              </span>
              <span className="text-[8.5px] tracking-[0.25em] text-[#C5A880] uppercase font-bold mt-1 block">
                LUXURY PRET &amp; COUTURE
              </span>
            </div>
          </Link>
          <p className="text-xs text-stone-500 leading-relaxed font-normal">
            ZEHRA STUDIO is Pakistan’s premier luxury fashion atelier offering pure silk formals, velvet couture, handmade chiffon ensembles, and ready to wear pret.
          </p>
          <div className="flex gap-2.5 text-stone-600 pt-1">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-stone-200 flex items-center justify-center hover:text-[#6B1D2F] hover:border-[#6B1D2F] transition-all shadow-2xs" title="Instagram">
              <Globe className="w-3.5 h-3.5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-stone-200 flex items-center justify-center hover:text-[#6B1D2F] hover:border-[#6B1D2F] transition-all shadow-2xs" title="Facebook">
              <Share2 className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Collections */}
        <div>
          <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wider mb-3.5 border-b border-stone-200 pb-2">
            Luxury Collections
          </h4>
          <ul className="space-y-2 text-xs text-stone-600">
            <li><Link href="/shop?category=luxury-pret" className="hover:text-[#6B1D2F] transition-colors font-medium">Luxury Pret</Link></li>
            <li><Link href="/shop?category=ready-to-wear" className="hover:text-[#6B1D2F] transition-colors font-medium">Ready To Wear</Link></li>
            <li><Link href="/shop?category=raw-silk-chiffon" className="hover:text-[#6B1D2F] transition-colors font-medium">Raw Silk &amp; Chiffon</Link></li>
            <li><Link href="/shop?category=velvet-festive" className="hover:text-[#6B1D2F] transition-colors font-medium">Velvet Festive</Link></li>
            <li><Link href="/shop?category=bridal-couture" className="hover:text-[#6B1D2F] transition-colors font-medium">Bridal &amp; Couture</Link></li>
            <li><Link href="/shop?category=sale-clearance" className="hover:text-[#6B1D2F] transition-colors font-medium text-[#6B1D2F]">Top Sale &amp; Clearance</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wider mb-3.5 border-b border-stone-200 pb-2">
            Customer Care
          </h4>
          <ul className="space-y-2 text-xs text-stone-600">
            <li><Link href="/shop" className="hover:text-[#6B1D2F] transition-colors">Track Your Order</Link></li>
            <li><Link href="/shop" className="hover:text-[#6B1D2F] transition-colors">Custom Stitching Guide</Link></li>
            <li><Link href="/shop" className="hover:text-[#6B1D2F] transition-colors">Shipping &amp; Delivery Policy</Link></li>
            <li><Link href="/shop" className="hover:text-[#6B1D2F] transition-colors">Returns &amp; Exchange Policy</Link></li>
            <li><Link href="/admin" className="hover:text-[#6B1D2F] transition-colors text-stone-400 text-[11px]">Staff Access</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wider mb-3.5 border-b border-stone-200 pb-2">
            Contact Support
          </h4>
          <div className="text-xs space-y-2.5 text-stone-600 font-medium">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#6B1D2F]" />
              <a href="tel:+923094329812" className="hover:text-[#6B1D2F] transition-colors">
                WhatsApp: 0309 43 29 812
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#6B1D2F]" />
              <a href="mailto:zehrastudioofficial@gmail.com" className="hover:text-[#6B1D2F] transition-colors">
                zehrastudioofficial@gmail.com
              </a>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#6B1D2F] flex-shrink-0 mt-0.5" />
              <span>Faisalabad, Pakistan &bull; Express Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center text-xs text-stone-500 gap-4">
        <div>&copy; {new Date().getFullYear()} ZEHRA STUDIO. All rights reserved.</div>
        <div className="flex gap-2 font-semibold text-[10px] text-stone-700">
          <span className="bg-[#FAF7F2] px-2.5 py-1 rounded border border-stone-200">CASH ON DELIVERY</span>
          <span className="bg-[#FAF7F2] px-2.5 py-1 rounded border border-stone-200">JAZZCASH</span>
          <span className="bg-[#FAF7F2] px-2.5 py-1 rounded border border-stone-200">EASYPAISA</span>
          <span className="bg-[#FAF7F2] px-2.5 py-1 rounded border border-stone-200">BANK TRANSFER</span>
        </div>
      </div>
    </footer>
  );
};
