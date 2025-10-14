// app/(main)/teachings/page.tsx
import { Metadata } from 'next';
import TeachingsPage from '@/components/teachings/Teachings';
import CoursesPage from '@/components/courses/CoursesPage';

export const metadata: Metadata = {
  title: 'Teachings Library - Sat Yoga',
  description: 'Explore our collection of teachings, guided meditations, and wisdom from Shunyamurti to support your spiritual journey.',
};

export default function CoursePage() {
  // In a real implementation, you would fetch data from your API here
  return <CoursesPage />;
}