// app/(main)/teachings/page.tsx
import { Metadata } from 'next';
import TeachingsPage from '@/components/teachings/Teachings';

export const metadata: Metadata = {
  title: 'Teachings Library - Sat Yoga',
  description: 'Explore our collection of teachings, guided meditations, and wisdom from Shunyamurti to support your spiritual journey.',
};

export default function TeachingPage() {
  // In a real implementation, you would fetch data from your API here
  return <TeachingsPage />;
}