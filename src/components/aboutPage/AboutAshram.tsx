import React from "react";
import AboutHeroSection from "../about/aboutAshram/Hero";
import QuoteSection from "../about/aboutSatyoga/QuoteSection";
import BlogSection from "../about/aboutSatyoga/Blog";
import AshramEndTimeSection from "../about/aboutAshram/EndTimes";
import AshramActivitiesCarousel from "../about/aboutAshram/Activities";
import SpiritualTribeSection from "../about/aboutAshram/SpiriualTribe";
import ShunyamurtiVideoSection from "../about/aboutAshram/ShunyaVideo";
import AshramRetreatsSection from "../about/aboutAshram/StayingAtAshram";
import TwoPaneComponent from "../shared/TwoPaneComponent";
import { ashramEndTimeData, spiritualTribeData } from "@/lib/data";

export default function AboutAshramPage({ data }: any) {

return (
    <>
      <AboutHeroSection />
      <TwoPaneComponent data={ashramEndTimeData}/>
      <AshramActivitiesCarousel/>
      <QuoteSection/>
      <TwoPaneComponent data={spiritualTribeData}/>
      <ShunyamurtiVideoSection/>
      <BlogSection/>
      <AshramRetreatsSection/>
          </>
)
}