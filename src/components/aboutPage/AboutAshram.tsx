import React from "react";
import BlogSection from "../about/aboutSatyoga/Blog";
import ShunyamurtiVideoSection from "../about/aboutAshram/ShunyaVideo";
import AshramRetreatsSection from "../about/aboutAshram/StayingAtAshram";
import TwoPaneComponent from "../shared/TwoPaneComponent";
import { ashramEndTimeData, spiritualTribeData } from "@/lib/data";
import ImageCarouselSection, { CarouselImage } from "../shared/ImageCarousel";
import QuoteSection from "../shared/Quote";
import StandardHeroSection from "../shared/Hero";

export default function AboutAshramPage({ data }: any) {
    const images: CarouselImage[] = [
        {
          src: "/ASHRAM_Gallery 1.jpg",
          alt: "Satsang with Shunyamurti"
        },
        {
          src: "/ASHRAM_Gallery 2.jpg",
          alt: "Music and meditation practice"
        },
        {
          src: "/ASHRAM_Gallery 3.jpg", 
          alt: "Kitchen and community service"
        },
        {
          src: "/ASHRAM_Gallery 4.jpg",
          alt: "Outdoor meditation"
        },
        {
          src: "/ASHRAM_Gallery 5.jpg",
          alt: "Group study and contemplation"
        },
        {
          src: "/ASHRAM_Gallery 6.jpg",
          alt: "Group study and contemplation"
        }
      ];
    
const heroData = {tagline:"About", background: "/ssi.jpg", heading: "Our Ashram", subtext: "The Challenge of Interbeing"}

const shunyamurtiVideoData = {
  mediaPosition: 'top' as const,
  topMedia: {
    type: 'video' as const,
    src: 'https://www.youtube.com/embed/1z4ryQt0duM?feature=shared', // Replace with actual video ID
    thumbnail: '/shunyavideo.png',
    aspectRatio: '16/9',
    videoType: 'youtube' as const
  },
  leftPane: {
    title: "" // Empty title, we just want the description
  },
  rightPane: {
    type: 'paragraphs' as const,
    gap: '16px',
    content: [
      "In this short video, recorded during a recent satsang, Shunyamurti explains some of the work of the community, and the vision for a network of flourishing self-sustaining, spiritual communities."
    ]
  }
};
return (
    <>
      <StandardHeroSection data={heroData} />
      <TwoPaneComponent data={ashramEndTimeData}/>
      <ImageCarouselSection data={images}/>
      <QuoteSection data={"Living in a serious transformational community is a great privilege and opportunity . . . and perhaps the ultimate rite of passage."} />
      <TwoPaneComponent data={spiritualTribeData}/>
      <TwoPaneComponent data={shunyamurtiVideoData}/>
      <BlogSection/>
      <AshramRetreatsSection/>
          </>
)
}