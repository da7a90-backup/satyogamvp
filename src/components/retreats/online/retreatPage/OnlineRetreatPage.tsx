'use client'
import HeroWithBackLink from "@/components/shared/HeroWithBL";
import ProductComponent from "@/components/shared/ProductComponent";
import TestimonialCarouselTertiary from "@/components/shared/TestimonialTertiary";
import TwoPaneComponent from "@/components/shared/TwoPaneComponent";
import ScheduleSection from "@/components/shared/TypicalDay";
import React from "react";

interface OnlineRetreatPageProps {
  heroData: any;
  bookingData: any;
  introData1: any;
  introData2: any;
  introData3: any;
  scheduleData: any;
  testimonialData: any;
}

export default function OnlineRetreatPage({ 
  heroData, 
  bookingData, 
  introData1, 
  introData2, 
  introData3, 
  scheduleData, 
  testimonialData 
}: OnlineRetreatPageProps) {
  return (
    <>
      <HeroWithBackLink data={heroData}/>
      <ProductComponent data={bookingData}/>
      <TwoPaneComponent data={introData1}/>
      <TwoPaneComponent data={introData2}/>
      <TwoPaneComponent data={introData3}/>
      <ScheduleSection data={scheduleData}/>
      <TestimonialCarouselTertiary data={testimonialData}/>
    </>
  )
}