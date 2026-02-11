'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import OnlineRetreatPage from '@/components/retreats/online/retreatPage/OnlineRetreatPage';

interface DashboardRetreatPurchaseClientProps {
  retreat: any;
}

export default function DashboardRetreatPurchaseClient({ retreat }: DashboardRetreatPurchaseClientProps) {
  const router = useRouter();

  // Prepare data for OnlineRetreatPage component
  const heroData = {
    backLink: {
      text: "Back to Retreats",
      url: "/dashboard/user/retreats"
    },
    background: retreat.hero_background || "/orbanner.png"
  };

  const bookingData = {
    retreatType: 'online' as const,
    tagline: retreat.booking_tagline || "ONLINE RETREAT",
    title: retreat.title,
    retreatSlug: retreat.slug,
    basePrice: parseFloat(retreat.price_limited?.toString() || '195'),
    priceOptions: [
      {
        type: 'limited',
        label: 'Limited Access (12 days)',
        price: parseFloat(retreat.price_limited?.toString() || '195'),
        description: 'You will have access to all the retreat teachings for 12 days following the end of the retreat.'
      },
      {
        type: 'lifetime',
        label: 'Lifetime Access',
        price: parseFloat(retreat.price_lifetime?.toString() || '395'),
        description: 'The online portal will remain open for you to return to it as often as you wish!'
      }
    ],
    memberDiscountPercentage: 10,
    scholarshipAvailable: true,
    scholarshipDeadline: "Contact us for scholarship information",
    fixedDate: retreat.fixed_date,
    location: retreat.location || "Online Retreat",
    images: retreat.images || [],
    memberLabel: "Are you a member?*",
    memberOptions: ["Select an option ...", "Yes", "No"],
    buttonText: "Purchase Now",
    buttonUrl: `/dashboard/user/online-retreats/${retreat.slug}/payment`,
    infoButtonText: "More Info",
    infoButtonUrl: "#",
    membershipText: "Discover our",
    membershipLink: "memberships",
    membershipLinkUrl: "/memberships",
    membershipNote: "to receive discounts"
  };

  const introData1 = {
    leftPane: {
      title: retreat.intro1_title || "About This Retreat",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: retreat.intro1_content || []
    }
  };

  const introData2 = {
    leftPane: {
      title: retreat.intro2_title || "This Retreat Includes:",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: retreat.intro2_content || []
    }
  };

  const introData3 = {
    mediaPosition: "top" as const,
    ...(retreat.intro3_media && {
      topMedia: {
        type: 'image' as const,
        src: retreat.intro3_media,
      }
    }),
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
    title: retreat.agenda_title || "All Times Are In Costa Rica Time",
    items: retreat.agenda_items || []
  };

  const testimonialData = {
    tagline: retreat.testimonials?.tagline || "TESTIMONIALS",
    heading: retreat.testimonials?.heading || "Reflections from Recent Retreatants",
    testimonials: retreat.testimonials?.items || []
  };

  return (
    <div className="flex flex-col bg-[#FAF8F1] min-h-screen">
      {/* Header */}
      <div className="flex flex-col px-8 pt-8 pb-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/user/retreats')}
            className="flex items-center gap-2 text-[#7D1A13] hover:text-[#7D1A13]/80 transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="text-base font-bold">Back to Retreats</span>
          </button>
        </div>
      </div>

      {/* Retreat Content */}
      <OnlineRetreatPage
        heroData={heroData}
        bookingData={bookingData}
        introData1={introData1}
        introData2={introData2}
        introData3={introData3}
        scheduleData={scheduleData}
        testimonialData={testimonialData}
      />
    </div>
  );
}
