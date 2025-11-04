import React from "react";
import QuestionsAnswersSection from "../about/aboutShunyamurti/QnA";
import SriRamanaConnectionSection from "../about/aboutShunyamurti/SriRamana";
import BooksSection from "../about/aboutShunyamurti/Books";
import OnlineRetreatsSection from "../about/aboutShunyamurti/OnlineRetreats";
import FreeTeachingsSection from "../about/aboutSatyoga/Teachings";
import TwoPaneComponent from "../shared/TwoPaneComponent";
import { onlineRetreatsData } from "@/lib/data";
import QuoteSection from "../shared/Quote";
import StandardHeroSection from "../shared/Hero";
import EncountersSection from '../about/aboutShunyamurti/Testimonial';

interface AboutShunyaPageProps {
  data: any;
  books: any[];
}

export default function AboutShunyaPage({ data, books }: AboutShunyaPageProps) {
  // Map API data to component structure
  const heroData = data.hero ? {
    tagline: data.hero.tagline || "About",
    background: data.hero.backgroundImage || "",
    heading: data.hero.heading || "Shunyamurti",
    subtext: data.hero.subheading || ""
  } : {
    tagline: "About",
    background: "",
    heading: "Shunyamurti",
    subtext: ""
  };

  // Map whatIsShunyamurti section
  const whatIsShunyamurtiData = data.whatIsShunyamurti ? {
    leftPane: {
      title: data.whatIsShunyamurti.heading,
      titleLineHeight: data.whatIsShunyamurti.titleLineHeight
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: data.whatIsShunyamurti.content || []
    }
  } : null;

  // Map curriculum vitae section
  const curriculumVitaeData = data.curriculumVitae ? {
    leftPane: {
      tagline: data.curriculumVitae.tagline,
      title: data.curriculumVitae.heading
    },
    rightPane: {
      type: 'sections' as const,
      content: data.curriculumVitae.content || []
    },
    backgroundElements: data.curriculumVitae.backgroundElements ?
      Object.values(data.curriculumVitae.backgroundElements) as Array<{ image: string; desktop?: React.CSSProperties; mobile?: React.CSSProperties }> : []
  } : null;

  // Map encounters section
  const encountersData = data.encounters ? {
    tagline: data.encounters.tagline || "ENCOUNTERS WITH SHUNYAMURTI",
    encounters: data.encounters.content || []
  } : {
    tagline: "ENCOUNTERS WITH SHUNYAMURTI",
    encounters: []
  };

  // Quote data
  const quoteText = data.quote?.quote || "A seeker of the Real should not follow a beaten path...";
  const quoteDecoration = data.quote?.backgroundElements?.labyrinth;

  // QnA data
  const qnaData = data.qna ? {
    mediaPosition: 'bottom' as const,
    topMedia: {
      type: 'video' as const,
      src: data.qna.videoUrl,
      thumbnail: data.qna.videoThumbnail,
      aspectRatio: '1312/738',
      videoType: 'youtube' as const
    },
    leftPane: {
      title: data.qna.heading || "Questions and Answers with Shunyamurti"
    },
    rightPane: {
      type: 'paragraphs' as const,
      gap: '16px',
      content: data.qna.content || []
    }
  } : null;

  // Sri Ramana data
  const sriRamanaBackground = data.sriRamana?.backgroundImage;

  return (
    <>
      <StandardHeroSection data={heroData} />
      {whatIsShunyamurtiData && <TwoPaneComponent data={whatIsShunyamurtiData} />}
      {qnaData && <TwoPaneComponent data={qnaData} />}
      <QuoteSection data={quoteText} backgroundDecoration={quoteDecoration} />
      <BooksSection books={books} />
      {curriculumVitaeData && <TwoPaneComponent data={curriculumVitaeData} />}

      {/* Encounters Section */}
      {encountersData.encounters.length > 0 && (
        <EncountersSection
          tagline={encountersData.tagline}
          encounters={encountersData.encounters}
        />
      )}

      <SriRamanaConnectionSection backgroundImage={sriRamanaBackground} />
      {onlineRetreatsData.length > 0 && <OnlineRetreatsSection retreat={onlineRetreatsData[0] as any} />}
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