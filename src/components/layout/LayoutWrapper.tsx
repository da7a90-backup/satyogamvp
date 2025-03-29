'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if the current path is a auth page
  const isAuthPage = 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/dashboard');
  
  return (
    <>
      {!isAuthPage && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}