'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import OnlineRetreatPage from '@/components/retreats/online/retreatPage/OnlineRetreatPage';

interface RetreatDetailModalProps {
  retreat: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function RetreatDetailModal({ retreat, isOpen, onClose }: RetreatDetailModalProps) {
  const [retreatData, setRetreatData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && retreat) {
      loadRetreatData();
    }
  }, [isOpen, retreat]);

  const loadRetreatData = async () => {
    try {
      setLoading(true);
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/retreats/${retreat.slug}`, {
        cache: 'no-store',
      });

      if (!response.ok) throw new Error('Failed to fetch retreat data');

      const data = await response.json();
      setRetreatData(data);
    } catch (error) {
      console.error('Error loading retreat data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const heroData = retreatData ? {
    backLink: {
      text: "Back to Dashboard",
      url: "/dashboard/user"
    },
    background: retreatData.hero_background || "/orbanner.png"
  } : null;

  const bookingData = retreatData ? {
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
    buttonUrl: `/purchase/${retreat.slug}`,
    infoButtonText: "More Info",
    infoButtonUrl: "#",
    membershipText: "Discover our",
    membershipLink: "memberships",
    membershipLinkUrl: "/memberships",
    membershipNote: "to receive discounts"
  } : null;

  const introData1 = retreatData ? {
    leftPane: {
      title: retreatData.intro1_title || "About This Retreat",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: retreatData.intro1_content || []
    }
  } : null;

  const introData2 = retreatData ? {
    leftPane: {
      title: retreatData.intro2_title || "This Retreat Includes:",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: retreatData.intro2_content || []
    }
  } : null;

  const introData3 = retreatData ? {
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
  } : null;

  const scheduleData = retreatData ? {
    tagline: "SAMPLE SCHEDULE",
    title: retreatData.agenda_title || "All Times Are In Costa Rica Time",
    items: retreatData.agenda_items || []
  } : null;

  const testimonialData = retreatData ? {
    tagline: retreatData.testimonials?.tagline || "TESTIMONIALS",
    heading: retreatData.testimonials?.heading || "Reflections from Recent Retreatants",
    testimonials: retreatData.testimonials?.items || []
  } : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FAF8F1]">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Back Button */}
      <button
        onClick={onClose}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-100 transition"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="font-semibold">Back to Dashboard</span>
      </button>

      {/* Content */}
      <div className="pt-16">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading retreat details...</p>
            </div>
          </div>
        ) : retreatData && heroData && bookingData && introData1 && introData2 && introData3 && scheduleData && testimonialData ? (
          <OnlineRetreatPage
            heroData={heroData}
            bookingData={bookingData}
            introData1={introData1}
            introData2={introData2}
            introData3={introData3}
            scheduleData={scheduleData}
            testimonialData={testimonialData}
          />
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-red-600">Failed to load retreat details</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#942017] transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
