import React from "react";

import RetreatCardsSection from "./RetreatsAvailable";
import WhichRetreatSection from "./WhichRetreatIsRightForMe";
import WhatWillYouEncounterSection from "./WhatWillYouEncounter";
import OnlineRetreatsSection from "../about/aboutShunyamurti/OnlineRetreats";
import TwoPaneComponent from "../shared/TwoPaneComponent";
import QuoteSection from "../shared/Quote";
import ContactUsSection from "../shared/ContactUsSection";
import TestimonialCarousel from "../shared/Testimonial";
import StandardHeroSection from "../shared/Hero";

export default function AshramStayPage({ data, onlineRetreats = [] }: any) {
  // Map What Will You Encounter galleries from API
  const encounterGalleries = data?.whatWillYouEncounter?.content?.galleries || [];

  // Map hero data from API with fallback
  const heroData = data?.hero ? {
    tagline: data.hero.tagline || "Ashram Onsite Retreats",
    background: data.hero.backgroundImage || "",
    heading: data.hero.heading || "Staying at the Ashram",
    subtext: data.hero.subheading || "Visit, Study, and Serve at the Sat Yoga Ashram, Costa Rica"
  } : {
    tagline: "Ashram Onsite Retreats",
    background: "",
    heading: "Staying at the Ashram",
    subtext: "Visit, Study, and Serve at the Sat Yoga Ashram, Costa Rica"
  };

  // Map why participate section from API with fallback
  const whyParticipateData = data?.whyParticipate ? {
    leftPane: {
      title: data.whyParticipate.heading || "Why Participate in Ashram Life?",
      titleLineHeight: data.whyParticipate.titleLineHeight || "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: data.whyParticipate.content || [
        "An ashram is designed to provide the ideal environment for opening the mind and heart to our Infinite Nature. To fully heal from the wounds of egoic consciousness and become receptive to transmission of the Supreme Light of Being requires surrender to a higher will and to the support of a spiritual community.",
        "Very few are called to become permanent members of an ashram community, but all seekers of Truth can benefit from participating in ashram life for a time—taking a break from the world, immersing yourself in community dharma and spiritual practice, and learning to live ecologically on a small plot of land.",
        "Yet, most importantly, what will happen is that you will be invited into a new relationship with the God-Self that requires you to take radical responsibility for the transformation of consciousness needed for Liberation. As Jesus famously said, you cannot put new wine into old wineskins. You need a new mind—and a new identity."
      ]
    }
  } : {
    leftPane: {
      title: "Why Participate in Ashram Life?",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: [
        "An ashram is designed to provide the ideal environment for opening the mind and heart to our Infinite Nature. To fully heal from the wounds of egoic consciousness and become receptive to transmission of the Supreme Light of Being requires surrender to a higher will and to the support of a spiritual community.",
        "Very few are called to become permanent members of an ashram community, but all seekers of Truth can benefit from participating in ashram life for a time—taking a break from the world, immersing yourself in community dharma and spiritual practice, and learning to live ecologically on a small plot of land.",
        "Yet, most importantly, what will happen is that you will be invited into a new relationship with the God-Self that requires you to take radical responsibility for the transformation of consciousness needed for Liberation. As Jesus famously said, you cannot put new wine into old wineskins. You need a new mind—and a new identity."
      ]
    }
  };

  // Map quote from API with fallback
  const quoteText = data?.quote?.quote || "An ashram is designed to provide the ideal environment for opening the mind and heart to our Infinite Nature.";

  // Map testimonials from API with fallback
  const testimonials = data?.testimonials?.content || [];

  // Map online retreats from API to expected format
  const upcomingRetreat = onlineRetreats.length > 0 ? {
    slug: onlineRetreats[0].slug,
    title: onlineRetreats[0].title,
    heroBackground: onlineRetreats[0].hero_background || "",
    bookingTagline: onlineRetreats[0].booking_tagline || "ONLINE RETREAT",
    fixedDate: onlineRetreats[0].fixed_date,
    location: onlineRetreats[0].location || "Online Retreat",
    basePrice: onlineRetreats[0].price,
    images: onlineRetreats[0].images || [],
    intro1Content: onlineRetreats[0].intro1_content || [],
    buttonUrl: `/retreats/online/${onlineRetreats[0].slug}`
  } : null;

  return (
    <>
      <StandardHeroSection data={heroData}/>
      <TwoPaneComponent data={whyParticipateData}/>
      <RetreatCardsSection data={data}/>
      <QuoteSection data={quoteText} />
      <WhichRetreatSection/>
      {encounterGalleries.length > 0 && <WhatWillYouEncounterSection galleries={encounterGalleries} />}
      <TestimonialCarousel
        tagline={data?.testimonials?.tagline || "TESTIMONIAL CAROUSEL"}
        testimonials={testimonials}
      />
      <ContactUsSection/>
      {upcomingRetreat && <OnlineRetreatsSection retreat={upcomingRetreat as any} />}
    </>
  )
}