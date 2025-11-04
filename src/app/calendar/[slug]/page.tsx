// app/(main)/calendar/[slug]/page.tsx
// DISABLED: Old Strapi implementation - needs to be rebuilt for FastAPI backend
import { notFound } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  // Disabled until rebuilt for FastAPI backend
  return notFound();
}
