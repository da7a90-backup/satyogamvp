// app/(main)/teachings/page.tsx
import { Metadata } from 'next';
import TeachingLibraryPage from '@/components/teachings/Teachings';

export const metadata: Metadata = {
  title: 'Teachings Library - Sat Yoga',
  description: 'Explore our collection of teachings, guided meditations, and wisdom from Shunyamurti to support your spiritual journey.',
};

export default function TeachingsPage() {
  // In a real implementation, you would fetch data from your API here
  return <TeachingLibraryPage />;
}