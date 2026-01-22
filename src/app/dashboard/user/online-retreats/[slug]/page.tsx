import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DashboardRetreatPurchaseClient from './DashboardRetreatPurchaseClient';

interface DashboardRetreatPurchasePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for the retreat
export async function generateMetadata(
  { params }: DashboardRetreatPurchasePageProps
): Promise<Metadata> {
  const { slug } = await params;

  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/api/retreats/${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        title: 'Retreat Not Found - Sat Yoga',
      };
    }

    const retreat = await response.json();

    return {
      title: `${retreat.title} - Online Retreats`,
      description: retreat.subtitle || retreat.intro1_content?.[0] || 'Join us for this transformative online retreat',
      openGraph: {
        title: retreat.title,
        description: retreat.subtitle || retreat.intro1_content?.[0] || '',
        images: retreat.hero_background
          ? [
              {
                url: retreat.hero_background,
                alt: retreat.title,
              },
            ]
          : [],
      },
    };
  } catch (error) {
    console.error('Error fetching retreat for metadata:', error);
    return {
      title: 'Online Retreats - Sat Yoga',
      description: 'Join transformative online retreats with Shunyamurti',
    };
  }
}

// Helper function to format retreat dates
function formatRetreatDate(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = start.getFullYear();

  // If same month: "December 27-29, 2025"
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`;
  }

  // If different months: "December 27 - January 2, 2025"
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}

export default async function DashboardRetreatPurchasePage(
  { params }: DashboardRetreatPurchasePageProps
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

    const retreatData = await response.json();

    // Transform data to match component expectations
    const retreat = {
      ...retreatData,
      // Compute fixed_date from start_date and end_date
      fixed_date: retreatData.start_date && retreatData.end_date
        ? formatRetreatDate(retreatData.start_date, retreatData.end_date)
        : null,
      // Map price_lifetime to price for component
      price: retreatData.price_lifetime || retreatData.price_limited || 395,
      // Transform testimonial_data to testimonials object format
      testimonials: retreatData.testimonial_data || {
        tagline: retreatData.testimonial_tagline || "TESTIMONIALS",
        heading: retreatData.testimonial_heading || "Reflections from Recent Retreatants",
        items: []
      },
    };

    return <DashboardRetreatPurchaseClient retreat={retreat} />;
  } catch (error) {
    console.error('Error fetching retreat:', error);
    notFound();
  }
}
