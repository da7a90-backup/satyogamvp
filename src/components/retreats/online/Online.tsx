'use client'
import StandardHeroSection from "@/components/shared/Hero";
import UpcomingRetreatsSection from "@/components/shared/RelatedOnline";
import StoreProductSection from "@/components/shared/StoreSuggestions";
import TestimonialSecondarySection from "@/components/shared/TestimonialSecondary";
import TwoPaneComponent from "@/components/shared/TwoPaneComponent";
import { onlineRetreatsData, type OnlineRetreat } from "@/lib/data";
import React from "react";

/**
 * Extracts duration from fixedDate string
 * e.g., "7-Day Retreat • December 27, 2024 - January 2, 2025" → "7 days"
 */
 function extractDuration(fixedDate: string): string {
  if (fixedDate.includes('7-Day')) return '7 days';
  if (fixedDate.includes('5-Day')) return '5 days';
  if (fixedDate.includes('3-Day')) return '3 days';
  
  // Try to calculate from date range
  const dateRangeMatch = fixedDate.match(/(\w+ \d+, \d{4}) - (\w+ \d+, \d{4})/);
  if (dateRangeMatch) {
    const startDate = new Date(dateRangeMatch[1]);
    const endDate = new Date(dateRangeMatch[2]);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} days`;
  }
  
  return '3 days'; // Default fallback
}

/**
 * Extracts end date from fixedDate string for filtering
 * e.g., "December 27, 2024 - January 2, 2025" → Date object for Jan 2, 2025
 */
 function extractEndDate(fixedDate: string): Date | null {
  // Try to find date range pattern
  const dateRangeMatch = fixedDate.match(/-\s*(\w+ \d+, \d{4})/);
  if (dateRangeMatch) {
    return new Date(dateRangeMatch[1]);
  }
  
  // Try to find single date pattern
  const singleDateMatch = fixedDate.match(/(\w+ \d+(?:st|nd|rd|th)? - \w+ \d+(?:st|nd|rd|th)?, \d{4})/);
  if (singleDateMatch) {
    // Extract end date from range like "Sept 29th - Oct 1st, 2025"
    const cleanDate = singleDateMatch[1].replace(/(\d+)(st|nd|rd|th)/g, '$1');
    const parts = cleanDate.split('-');
    if (parts.length === 2) {
      const endPart = parts[1].trim();
      return new Date(endPart);
    }
  }
  
  return null;
}

/**
 * Filters retreats to only show upcoming ones (end date hasn't passed)
 * Ready for Strapi API integration
 */
 function getUpcomingRetreats(retreats: OnlineRetreat[]): OnlineRetreat[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  
  return retreats.filter(retreat => {
    const endDate = extractEndDate(retreat.fixedDate);
    
    // If we can't parse the date, include it anyway
    if (!endDate) return true;
    
    // Include if end date is today or in the future
    return endDate >= today;
  });
}

/**
 * Transforms online retreat data into UpcomingRetreatsSection card format
 */
 function transformRetreatsToCards(retreats: OnlineRetreat[]) {
  return retreats.map(retreat => ({
    image: retreat.images[0]?.src || retreat.heroBackground,
    iconOverlay: "/progicon.png",
    duration: extractDuration(retreat.fixedDate),
    type: retreat.location,
    date: retreat.fixedDate,
    category: retreat.bookingTagline,
    title: retreat.title,
    description: retreat.intro1Content[0],
    button: {
      text: "Learn more",
      url: `/retreats/online/${retreat.slug}`
    }
  }));
}

/**
 * Complete utility to get upcoming retreats in card format
 * Usage: const cards = getUpcomingRetreatCards(onlineRetreatsData);
 */
export function getUpcomingRetreatCards(retreats: OnlineRetreat[]) {
  const upcomingRetreats = getUpcomingRetreats(retreats);
  return transformRetreatsToCards(upcomingRetreats);
}
export default function OnlinePage({ data }: any) {
  const heroData = {
    tagline: "Online Retreats", 
    background: "/onlineretreatherobanner.jpg", 
    heading: "Online Retreats Led by Shunyamurti", 
    subtext: "Livestreamed for a fully immersive experience wherever you are. Also offered onsite through the Shakti Saturation and Sevadhari programs."
  };

  const introData = {
    leftPane: {
      title: "Transmissions of Truth for a World in Crisis",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: [
        "Since the founding of the Sat Yoga Ashram, these retreats have been momentous and grounding tribal gatherings as well as the centerpiece of our wisdom school curriculum. For each retreat, Shunyamurti chooses a title and theme that speak to a current topic of study into which we dive more deeply.",
        "Originally, these retreats were offered only at the ashram; but, since the lockdowns of 2020, we have been offering them as livestream events. Now, both our local ashram community and onsite guests can join together with our global sangha to have our hearts nourished, to receive direct guidance from Shunyamurti on the path to Self-Realization, and to raise the vibrational frequency of the morphogenic field.",
        "These retreats are a rare opportunity to ask Shunyamurti the most precious questions from your heart, to communicate and share with the Sat Yoga community and with online retreat participants worldwide, and to deepen your meditation practice while being immersed in the energy field transmitted from the ashram.",
      ]
    }
  };

  // Get upcoming retreats dynamically from data
  const upcomingCards = getUpcomingRetreatCards(onlineRetreatsData);
  const upcomingRetreatsData = {
    heading: `${upcomingCards.length} upcoming ${upcomingCards.length === 1 ? 'retreat' : 'retreats'}`,
    viewAllLink: undefined, // No "View all" link since we're on the retreats page
    cards: upcomingCards
  };

  const testimonialSecondaryData = {
    title: "Testimonials",
    subtitle: "A few words from people who attended previous online retreats",
    testimonials: [
      {
        quote: "It was truly a joy and adventure for me to be part of the retreat. I learned a lot of mind and heart expanding concepts.",
        name: "Idelle",
        location: "USA",
        avatar: "/illustrations.png"
      },
      {
        quote: "We extend infinite gratitude for the gift of the scholarship—deep bows and much love to Shunyamurti and the whole community.",
        name: "Angela",
        location: "Canada",
        avatar: "/illustrations.png"
      },
      {
        quote: "It was an illuminating and transformative retreat—filled with wisdom that touched me deeply. I feel truly blessed to be part of our collective dream and a member of the Sat Yoga family.",
        name: "Anthony",
        location: "USA",
        avatar: "/illustrations.png"
      },
      {
        quote: "Being connected with you helps me focus on what's important. Shunya opens these vast realms of understanding—it's rare and unforgettable. I loved the meditations, the teachings—this retreat nourished me in ways I didn't expect.",
        name: "Hector",
        location: "Costa Rica",
        avatar: "/illustrations.png"
      },
      {
        quote: "Wow, awesome retreat packed with information. I find myself with a renewed commitment to quieting the mind and doing the work for liberation.",
        name: "Judy",
        location: "USA",
        avatar: "/illustrations.png"
      },
    ]
  };

  const pastRetreatsData = {
    tagline: "STORE",
    heading: "Discover past retreats",
    description: "Since 2017, we've offered over forty 3-, 5-, and 7-day retreats—each a gateway into the timeless wisdom of Shunyamurti. With uniquely titled classes, guided meditations, and profound discourses in video and audio formats, these retreats remain powerful tools for ongoing transformation. All are now easily accessible from your personalized Dashboard.",
    productsHeading: "Latest courses",
    viewAllLink: {
      text: "View all",
      url: "/store"
    },
    products: [
      {
        image: "/storeproduct1.png",
        hasVideo: true,
        hasAudio: true,
        category: "Past online retreat",
        title: "Name of the product",
        price: "$155.00",
        subtitle: "Ramana's revelation of liberating truth",
        description: "Lorem ipsum dolor sit amet consectet...",
        cartUrl: "/cart/add/product1"
      },
      {
        image: "/storeproduct2.png",
        hasVideo: true,
        hasAudio: true,
        category: "Past online retreat",
        title: "Name of the product",
        price: "$155.00",
        subtitle: "Ramana's revelation of liberating truth",
        description: "Lorem ipsum dolor sit amet consectet...",
        cartUrl: "/cart/add/product2"
      },
      {
        image: "/storeproduct3.png",
        hasVideo: true,
        hasAudio: true,
        category: "Past online retreat",
        title: "Name of the product",
        price: "$155.00",
        subtitle: "Ramana's revelation of liberating truth",
        description: "Lorem ipsum dolor sit amet consectet...",
        cartUrl: "/cart/add/product3"
      }
    ]
  };

  return (
    <>
      <StandardHeroSection data={heroData}/>
      <TwoPaneComponent data={introData}/>
      <UpcomingRetreatsSection data={upcomingRetreatsData}/>
      <TestimonialSecondarySection data={testimonialSecondaryData}/>
      <StoreProductSection data={pastRetreatsData} />
    </>
  );
}