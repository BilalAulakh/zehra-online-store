'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <a
      href="https://wa.me/923094329812?text=Hello%20Zehra%20Studio!%20I%20would%20like%20to%20inquire%20about%20a%20dress."
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 left-6 z-50 bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl whatsapp-pulse flex items-center gap-2 font-bold text-xs hover:bg-[#20ba5a] transition-all group"
    >
      <MessageCircle className="w-6 h-6 fill-current group-hover:rotate-12 transition-transform" />
      <span className="hidden sm:inline-block pr-1 font-semibold"></span>
    </a>
  );
};
