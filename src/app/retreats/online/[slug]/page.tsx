import { notFound } from 'next/navigation';
import OnlineRetreatPage from '@/components/retreats/online/retreatPage/OnlineRetreatPage';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getRetreatData(slug: string) {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/online-retreats/${slug}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching retreat:', error);
    return null;
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const retreatData = await getRetreatData(slug);

  if (!retreatData) {
    notFound();
  }

  const heroWithBackDataMinimal = {
    backLink: {
      text: "View all Online retreats",
      url: "/retreats/online"
    },
    background: retreatData.hero_background || "/orbanner.png"
  };

  const bookingData = {
    retreatType: 'online' as const,
    tagline: retreatData.booking_tagline || "ONLINE RETREAT",
    title: retreatData.title,
    basePrice: retreatData.price || 195,
    priceOptions: [
      {
        type: 'limited',
        label: 'Limited Access (12 days)',
        price: retreatData.price || 195,
        description: 'You will have access to all the retreat teachings for 12 days following the end of the retreat.'
      },
      {
        type: 'lifetime',
        label: 'Lifetime Access',
        price: (retreatData.price || 195) * 1.5,
        description: 'The online portal will remain open for you to return to it as often as you wish!'
      }
    ],
    memberDiscountPercentage: 10,
    scholarshipAvailable: true,
    scholarshipDeadline: "Contact us for scholarship information",
    fixedDate: retreatData.fixed_date,
    location: retreatData.location || "Online Retreat",
    images: retreatData.images || [],
    memberLabel: "Are you a member?*",
    memberOptions: ["Select an option ...", "Yes", "No"],
    buttonText: "Purchase Now",
    buttonUrl: `/purchase/${slug}`,
    infoButtonText: "More Info",
    infoButtonUrl: "#",
    membershipText: "Discover our",
    membershipLink: "memberships",
    membershipLinkUrl: "/memberships",
    membershipNote: "to receive discounts"
  };

  const introData1 = {
    leftPane: {
      title: retreatData.intro1_title || "About This Retreat",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: retreatData.intro1_content || []
    }
  };

  const introData2 = {
    leftPane: {
      title: retreatData.intro2_title || "This Retreat Includes:",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: retreatData.intro2_content || []
    }
  };

  const introData3 = {
    mediaPosition: "top" as const,
    topMedia: {
      type: 'image' as const,
      src: retreatData.intro3_media,
    },
    leftPane: {
      title: "About Shunyamurti",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: [
        "Shunyamurti's own search for a way to live in this world without self-betrayal and in constant process of growth and individuation, transcendence of the ego, and attunement to the Source of creative intelligence and love, has led to the unfoldment of this non-ordinary social-psycho-spiritual project.",
        "He is always learning, changing, deepening his understanding and empathy, and humbly correcting his course–guided by his connection to the One Supreme Being Whom he serves."
      ]
    }
  };

  const scheduleData = {
    tagline: "SAMPLE SCHEDULE",
    title: retreatData.agenda_title || "All Times Are In Costa Rica Time",
    items: retreatData.agenda_items || []
  };

  const testimonialData = {
    tagline: retreatData.testimonials?.tagline || "TESTIMONIALS",
    heading: retreatData.testimonials?.heading || "Reflections from Recent Retreatants",
    testimonials: retreatData.testimonials?.items || []
  };

  return (
    <OnlineRetreatPage
      heroData={heroWithBackDataMinimal}
      bookingData={bookingData}
      introData1={introData1}
      introData2={introData2}
      introData3={introData3}
      scheduleData={scheduleData}
      testimonialData={testimonialData}
    />
  );
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${FASTAPI_URL}/api/online-retreats`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.retreats.map((retreat: { slug: string }) => ({
      slug: retreat.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}