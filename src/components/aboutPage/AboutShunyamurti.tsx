import React from "react";
import QuestionsAnswersSection from "../about/aboutShunyamurti/QnA";
import SriRamanaConnectionSection from "../about/aboutShunyamurti/SriRamana";
import BooksSection from "../about/aboutShunyamurti/Books";
import OnlineRetreatsSection from "../about/aboutShunyamurti/OnlineRetreats";
import FreeTeachingsSection from "../about/aboutSatyoga/Teachings";
import TwoPaneComponent from "../shared/TwoPaneComponent";
import { curriculumVitaeData, whatIsShunyamurtiData } from "@/lib/data";
import QuoteSection from "../shared/Quote";
import StandardHeroSection from "../shared/Hero";
// In your page component (e.g., AboutShunyaPage.tsx)

import EncountersSection from '../about/aboutShunyamurti/Testimonial';

export default function AboutShunyaPage({ data }: any) {
  const heroData = {
    tagline: "About", 
    background: "/aboutshunyabanner.jpg", 
    heading: "Shunyamurti", 
    subtext: ""
  };

  const encountersData = {
    tagline: "ENCOUNTERS WITH SHUNYAMURTI",
    encounters: [
      {
        id: 1,
        text: "In this heartfelt compilation, seekers from around the world share their encounters with Shunyamurti—moments of insight, transformation, and remembrance. Each is a testament to the uncanny and life-transforming power of a true encounter—a transmission that changes everything.",
        author: "Lauren",
        location: "The Netherlands",
        media: {
          type: 'video' as const,
          src: 'https://www.youtube.com/embed/Ut4iguf7n6U',
          videoType: 'youtube' as const
          // No thumbnail - will auto-fetch from YouTube
        }
      },
      {
        id: 2,
        text: "Meeting Shunyamurti was like coming home to a truth I had always known but forgotten. His presence awakened something deep within me that had been dormant for years. The transformation was immediate and lasting.",
        author: "Michael",
        location: "United States",
        media: {
          type: 'image' as const,
          src: '/encounter2-image.jpg'
        }
      },
      {
        id: 3,
        text: "Through Shunyamurti's teachings, I discovered the joy of surrender and the peace that comes from letting go of the ego's constant demands. His wisdom opened doorways I never knew existed.",
        author: "Sofia",
        location: "Spain"
        // No media = text-only
      }
    ]
  };

  return (
    <>
      <StandardHeroSection data={heroData} />
      <TwoPaneComponent data={whatIsShunyamurtiData} />
      <QuestionsAnswersSection />
      <QuoteSection data={"A seeker of the Real should not follow a beaten path..."} />
      <BooksSection />
      <TwoPaneComponent data={curriculumVitaeData} />
      
      {/* Encounters Section */}
      <EncountersSection 
        tagline={encountersData.tagline}
        encounters={encountersData.encounters}
      />
      
      <SriRamanaConnectionSection />
      <OnlineRetreatsSection />
    </>
  );
}

// KEY POINTS:
// ✅ Aspect ratio is FORCED to 616/400 (no customization)
// ✅ YouTube videos auto-fetch thumbnails if not provided
// ✅ Each encounter can have: video, image, or no media
// ✅ Videos show thumbnail → click → load embed and autoplay
// ✅ Data structure:
//    {
//      id: number,
//      text: string,
//      author: string,
//      location: string,
//      media?: {
//        type: 'video' | 'image',
//        src: string,
//        thumbnail?: string,  // Optional for videos
//        videoType?: 'youtube' | 'cloudflare'  // Required for videos
//      }
//    }