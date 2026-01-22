import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RetreatOverviewClient from './RetreatOverviewClient';

interface RetreatOverviewPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for the retreat overview
export async function generateMetadata(
  { params }: RetreatOverviewPageProps
): Promise<Metadata> {
  const { slug } = await params;

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/api/retreats/${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        title: 'Retreat Overview - Sat Yoga',
      };
    }

    const retreat = await response.json();

    return {
      title: `${retreat.title} - Overview`,
      description: retreat.subtitle || 'Online retreat portal',
    };
  } catch (error) {
    console.error('Error fetching retreat for metadata:', error);
    return {
      title: 'Retreat Overview - Sat Yoga',
    };
  }
}

export const dynamic = 'force-dynamic';

export default async function RetreatOverviewPage(
  { params }: RetreatOverviewPageProps
) {
  const { slug } = await params;

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/api/retreats/${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      notFound();
    }

    const retreat = await response.json();

    return <RetreatOverviewClient retreat={retreat} />;
  } catch (error) {
    console.error('Error fetching retreat:', error);
    notFound();
  }
}
