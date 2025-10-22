import React from "react";

import RetreatCardsSection from "./RetreatsAvailable";
import WhichRetreatSection from "./WhichRetreatIsRightForMe";
import WhatWillYouEncounterSection from "./WhatWillYouEncounter";
import OnlineRetreatsSection from "../about/aboutShunyamurti/OnlineRetreats";
import TwoPaneComponent from "../shared/TwoPaneComponent";
import { whyParticipateData } from "@/lib/data";
import QuoteSection from "../shared/Quote";
import ContactUsSection from "../shared/ContactUsSection";
import TestimonialCarousel from "../shared/Testimonial";
import StandardHeroSection from "../shared/Hero";

export default function AshramStayPage({ data }: any) {
// Data structure for Testimonial Carousel Section

 const testimonialCarouselData = {
    tagline: "TESTIMONIAL CARROUSEL",
    testimonials: [
      {
        id: 1,
        quote: "I've received so much in my month here; my cup overfloweth. It was like the nectar that I needed to heal. This is priceless, and I am so overjoyed that I've been here.",
        author: 'Mandy',
        location: 'UK',
        video: '/testimonial.png'
      },
      {
        id: 2,
        quote: "I've so much in my month here; my cup overfloweth. It was like the nectar that I needed to heal. This is priceless, and I am so overjoyed that I've been here.",
        author: 'Mandy',
        location: 'UK',
        video: '/testimonial.png'
      }
    ]
  };

  const heroData = {tagline:"Ashram Onsite Retreats", background: "/ashramstaybanner.jpg", heading: "Staying at the Ashram", subtext: "Visit, Study, and Serve at the Sat Yoga Ashram, Costa Rica"}

return (
    <>
    <StandardHeroSection data={heroData}/>
    <TwoPaneComponent data={whyParticipateData}/>
    <RetreatCardsSection/>
    <QuoteSection data={"An ashram is designed to provide the ideal environment for opening the mind and heart to our Infinite Nature."} />
    <WhichRetreatSection/>
    <WhatWillYouEncounterSection/>
    <TestimonialCarousel data={testimonialCarouselData}/>
    <ContactUsSection/>
    <OnlineRetreatsSection/>
    </>
)
}