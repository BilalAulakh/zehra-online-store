import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { QuickViewModal } from '@/components/QuickViewModal';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ZEHRA STUDIO | Pakistani Luxury Women’s Clothing Online',
  description: 'Shop premium Pakistani women’s clothing at ZEHRA STUDIO. Explore handmade stitched dresses, velvet formals, chiffon ensembles, and elegant pret collections with free delivery across Pakistan.',
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png' },
    ],
    shortcut: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="min-h-screen flex flex-col antialiased bg-[#FCFAF7] text-[#18181B] selection:bg-[#C5A880] selection:text-white text-[13px] sm:text-[14px] overflow-x-hidden font-sans">
        <CartProvider>
          <Navbar />
          <main className="flex-1 w-full overflow-x-hidden">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <QuickViewModal />
          <WhatsAppWidget />
        </CartProvider>
      </body>
    </html>
  );
}
