'use client';

import React, { useEffect, useState } from "react";


import OnlineRetreatsSection from "../about/aboutShunyamurti/OnlineRetreats";
import TwoPaneComponent from "../shared/TwoPaneComponent";
import QuoteSection from "../shared/Quote";
import ContactUsSection from "../shared/ContactUsSection";
import TestimonialCarousel from "../shared/Testimonial";
import StandardHeroSection from "../shared/Hero";
import UpcomingRetreatsSection from "../shared/RelatedOnline";
import TestimonialCarouselTertiary from "../shared/TestimonialTertiary";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export default function CoursesPage({ data }: any) {
  const [heroData, setHeroData] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${FASTAPI_URL}/api/courses-page/hero`).then(res => res.json()),
      fetch(`${FASTAPI_URL}/api/courses-page/instructor-avatar`).then(res => res.json())
    ])
    .then(([hero, avatar]) => {
      setHeroData(hero);
      setAvatarUrl(avatar.avatar);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to load courses data:', err);
      setLoading(false);
    });
  }, []);

  if (loading || !heroData || !avatarUrl) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#942017]"></div>
      </div>
    );
  }
// Data structure for Testimonial Carousel Section

const introData = {
    leftPane: {
      title: "Prepare to Ascend to the Next Level of Your Spiritual Attainment",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: [
"Welcome to Sat Yoga’s Online Courses portal. The once-hidden, initiatory teachings of our Wisdom School—long reserved for those at the Ashram—are now accessible to seekers around the world. Through these online trainings, our global sangha can receive the liberating knowledge that lights the path to Self-realization.",
"Wherever you are, you can now receive the full dose of supreme understanding, distilled by Shunyamurti from his own illumination and comprehensive study of the world’s wisdom teachings and then integrated with advanced science and psychology. This unrivaled curriculum will help you build a foundation of clarity and power, based on proven principles, and establish your consciousness in its true nature.",
]
    }
  };
 const testimonialCarouselData = {
   tagline: "TESTIMONIAL CARROUSEL",
   heading: "testimonials",
   testimonials: [
    {
      quote: "Like so much of the wisdom that Shunyamurti abundantly shares with so much love, this meditation 'course' is profoundly simple, yet simply profound… Pure gold for the soul… Thank you from the depth of my Be-ing!",
      name: 'Timothy',
      location: 'Canada',
      avatar: avatarUrl
    },
    {
      quote: "Gratitude in overload, I appreciate the guidance and feel much clearer on the path, more in tune with the 'Self' and being in 'The now.'",
      name: 'Marié',
      location: 'South Africa',
      avatar: avatarUrl
    },
    {
      quote: "Having been meditating for over 50 years now and not having a teacher I never felt I was really understanding meditation but since listening to Shunyamurti I have found real meaning. It's changed my perception towards reality.",
      name: 'Gordon',
      location: 'UK',
      avatar: avatarUrl
    },
    {
      quote: "Sat Yoga is truth to me. Thank you for gracing my soul with your presence post Guru purnima. Love and peace from India.",
      name: 'Hussain',
      location: 'India',
      avatar: avatarUrl
    }
  ]
 };
  const sampleData = {
    heading: "3 upcoming retreats",
    viewAllLink: {
      text: "View all",
      url: "/retreats"
    },
    cards: [
      {
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        iconOverlay: "/progicon.png",
        duration: "3 days",
        type: "Online Retreat",
        date: "Sept 29th - Oct 1st, 2025",
        category: "Weekend retreat",
        title: "Why Our Situation is Hopeless, Yet Hilarious",
        description: "Every ego eventually gets mired in a swamp of hopelessness. There is only one way out...",
        button: {
          text: "Learn more",
          url: "/retreat/hopeless-yet-hilarious"
        }
      },
      {
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        iconOverlay: "/progicon.png",
        duration: "3 days",
        type: "Online Retreat",
        date: "Sept 29th - Oct 1st, 2025",
        title: "Why Our Situation is Hopeless, Yet Hilarious",
        description: "Every ego eventually gets mired in a swamp of hopelessness. There is only one way out...",
        button: {
          text: "Learn more",
          url: "/retreat/hopeless-yet-hilarious"
        }
      },
      {
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        iconOverlay: "/progicon.png",
        duration: "3 days",
        type: "Online Retreat",
        date: "Sept 29th - Oct 1st, 2025",
        title: "Why Our Situation is Hopeless, Yet Hilarious",
        description: "Every ego eventually gets mired in a swamp of hopelessness. There is only one way out...",
        button: {
          text: "Learn more",
          url: "/retreat/hopeless-yet-hilarious"
        }
      }
    ]
  };

return (
    <>
    <StandardHeroSection data={heroData}/>
    <TwoPaneComponent data={introData}/>
    {/* <UpcomingRetreatsSection data={sampleData}/> */}
    <TestimonialCarouselTertiary data={testimonialCarouselData}/>

    </>
)
}