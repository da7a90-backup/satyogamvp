// app/(main)/teachings/page.tsx
import { Metadata } from 'next';
import CoursesPage from '@/components/courses/CoursesPage';

export const metadata: Metadata = {
  title: 'Teachings Library - Sat Yoga',
  description: 'Explore our collection of teachings, guided meditations, and wisdom from Shunyamurti to support your spiritual journey.',
};

export const dynamic = 'force-dynamic';

export default function CoursePage() {
  return <CoursesPage />;
}