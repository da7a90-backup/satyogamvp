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
    
const heroData = {tagline:"", background: "/ssi.jpg", heading: "", subtext: ""}
return (
    <>
      <StandardHeroSection data={heroData} />
      <TwoPaneComponent data={ashramEndTimeData}/>
      <ImageCarouselSection data={images}/>
      <QuoteSection data={"A seeker of the Real should not follow a beaten path. The way to completion is to develop originality. Sat Yoga is not a path: we teach you how to use a compass and a machete, and we encourage you to cut a new path of your own."} />
      <TwoPaneComponent data={spiritualTribeData}/>
      <ShunyamurtiVideoSection/>
      <BlogSection/>
      <AshramRetreatsSection/>
          </>
)
}