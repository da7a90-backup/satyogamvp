// app/layout.tsx

import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import AuthProvider from '@/components/auth/AuthProvider';

// Initialize the Inter font with subset optimization
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Metadata for all pages (SEO)
export const metadata: Metadata = {
  title: {
    default: 'Sat Yoga - Spiritual Growth and Self-Discovery',
    template: '%s | Sat Yoga'
  },
  description: 'Explore transformative teachings, retreats, and courses at Sat Yoga. Join our community dedicated to spiritual awakening and self-discovery.',
  keywords: ['meditation', 'yoga', 'spiritual growth', 'retreats', 'mindfulness'],
  openGraph: {
    title: 'Sat Yoga - Spiritual Growth and Self-Discovery',
    description: 'Explore transformative teachings, retreats, and courses at Sat Yoga. Join our community dedicated to spiritual awakening and self-discovery.',
    url: 'https://satyoga.com',
    siteName: 'Sat Yoga',
    locale: 'en_US',
    type: 'website',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}