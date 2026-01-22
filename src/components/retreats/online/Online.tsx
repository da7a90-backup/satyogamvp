'use client'
import StandardHeroSection from "@/components/shared/Hero";
import UpcomingRetreatsSection from "@/components/shared/RelatedOnline";
import StoreProductSection from "@/components/shared/StoreSuggestions";
import TestimonialSecondarySection from "@/components/shared/TestimonialSecondary";
import TwoPaneComponent from "@/components/shared/TwoPaneComponent";
import React from "react";

// Placeholder image URL from Cloudflare
const PLACEHOLDER_IMAGE = "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/65a18ef5-6885-4a17-a55c-97f3bc808400/public";

// Icon overlay for retreat cards
const ICON_OVERLAY = "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public";

interface OnlineRetreat {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  fixed_date: string;
  fixedDate?: string; // Alias
  location: string;
  duration: string;
  price?: number;
  booking_tagline: string;
  bookingTagline?: string; // Alias
  hero_background: string;
  heroBackground?: string; // Alias
  images: Array<{ src: string; alt: string }>;
  intro1_content?: string[];
  intro1Content?: string[]; // Alias
}

/**
 * Extracts duration from fixedDate string
 * e.g., "7-Day Retreat • December 27, 2024 - January 2, 2025" → "7 days"
 */
function extractDuration(fixedDate: string): string {
  // Handle undefined/null/empty values
  if (!fixedDate) return '3 days';

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
  // Handle undefined/null/empty values
  if (!fixedDate) return null;

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
 * Parse ISO date string or Date object
 */
function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  if (date instanceof Date) return date;
  try {
    return new Date(date);
  } catch {
    return null;
  }
}

/**
 * Filters retreats to only show upcoming ones (end date hasn't passed)
 * and sorts them by start date (closest first)
 * Uses start_date and end_date fields from API (ISO strings)
 */
function getUpcomingRetreats(retreats: OnlineRetreat[]): OnlineRetreat[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  const filtered = retreats.filter(retreat => {
    // Use end_date field from API (already an ISO string)
    const endDate = parseDate((retreat as any).end_date);

    // If we can't parse the date, exclude it (likely past retreat)
    if (!endDate) return false;

    // Include if end date is today or in the future
    return endDate >= today;
  });

  // Sort by start date, closest first
  return filtered.sort((a, b) => {
    const dateA = parseDate((a as any).start_date);
    const dateB = parseDate((b as any).start_date);

    // If we can't parse dates, keep original order
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1; // Put unparseable dates at end
    if (!dateB) return -1;

    // Sort ascending (closest date first)
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Transforms online retreat data into UpcomingRetreatsSection card format
 */
function transformRetreatsToCards(retreats: OnlineRetreat[], iconOverlay?: string) {
  return retreats.map(retreat => {
    // Handle both API format (snake_case) and static format (camelCase)
    const fixedDate = retreat.fixed_date || retreat.fixedDate || '';
    const bookingTagline = retreat.booking_tagline || retreat.bookingTagline || '';
    const heroBackground = retreat.hero_background || retreat.heroBackground || '';
    const intro1Content = retreat.intro1_content || retreat.intro1Content || [];

    return {
      image: retreat.images?.[0]?.src || heroBackground || PLACEHOLDER_IMAGE,
      iconOverlay: iconOverlay || ICON_OVERLAY,
      duration: retreat.duration || extractDuration(fixedDate),
      type: retreat.location,
      date: fixedDate,
      category: bookingTagline,
      title: retreat.title,
      description: intro1Content[0] || retreat.subtitle || '',
      button: {
        text: "Learn more",
        url: `/retreats/online/${retreat.slug}`
      }
    };
  });
}

/**
 * Complete utility to get upcoming retreats in card format
 * Usage: const cards = getUpcomingRetreatCards(onlineRetreatsData, iconOverlay);
 */
export function getUpcomingRetreatCards(retreats: OnlineRetreat[], iconOverlay?: string) {
  const upcomingRetreats = getUpcomingRetreats(retreats);
  return transformRetreatsToCards(upcomingRetreats, iconOverlay);
}
interface Product {
  id: string;
  slug: string;
  title: string;
  short_description?: string;
  price: number;
  thumbnail_url?: string;
  featured_image?: string;
  categories?: string[];
  type: string;
}

export default function OnlinePage({ data, retreats = [], products = [] }: { data?: any; retreats?: OnlineRetreat[]; products?: Product[] }) {
  const heroData = {
    tagline: data?.hero?.tagline || "Online Retreats",
    background: data?.hero?.backgroundImage,
    heading: data?.hero?.heading || "Online Retreats Led by Shunyamurti",
    subtext: data?.hero?.subheading || "Livestreamed for a fully immersive experience wherever you are. Also offered onsite through the Shakti Saturation and Sevadhari programs."
  };

  const introData = {
    leftPane: {
      title: data?.intro?.heading || "Transmissions of Truth for a World in Crisis",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: data?.intro?.content || [
        "Since the founding of the Sat Yoga Ashram, these retreats have been momentous and grounding tribal gatherings as well as the centerpiece of our wisdom school curriculum. For each retreat, Shunyamurti chooses a title and theme that speak to a current topic of study into which we dive more deeply.",
        "Originally, these retreats were offered only at the ashram; but, since the lockdowns of 2020, we have been offering them as livestream events. Now, both our local ashram community and onsite guests can join together with our global sangha to have our hearts nourished, to receive direct guidance from Shunyamurti on the path to Self-Realization, and to raise the vibrational frequency of the morphogenic field.",
        "These retreats are a rare opportunity to ask Shunyamurti the most precious questions from your heart, to communicate and share with the Sat Yoga community and with online retreat participants worldwide, and to deepen your meditation practice while being immersed in the energy field transmitted from the ashram.",
      ]
    }
  };

  // Get upcoming retreats dynamically from API data
  const iconOverlay = data?.retreatCards?.iconOverlay || ICON_OVERLAY;
  const upcomingRetreats = getUpcomingRetreats(retreats);

  // Featured retreat (first/closest one)
  const featuredRetreat = upcomingRetreats.length > 0 ? {
    ...upcomingRetreats[0],
    heroBackground: upcomingRetreats[0].hero_background || upcomingRetreats[0].heroBackground || upcomingRetreats[0].images?.[0]?.src || PLACEHOLDER_IMAGE,
    bookingTagline: upcomingRetreats[0].booking_tagline || upcomingRetreats[0].bookingTagline || '',
    fixedDate: upcomingRetreats[0].fixed_date || upcomingRetreats[0].fixedDate || '',
    intro1Content: upcomingRetreats[0].intro1_content || upcomingRetreats[0].intro1Content || []
  } : null;

  // Next 3 retreats (excluding the featured one)
  const nextRetreats = upcomingRetreats.slice(1, 4);
  const upcomingCards = transformRetreatsToCards(nextRetreats, iconOverlay);

  const upcomingRetreatsData = {
    heading: `${upcomingCards.length} upcoming ${upcomingCards.length === 1 ? 'retreat' : 'retreats'}`,
    viewAllLink: undefined,
    cards: upcomingCards,
    featuredRetreat: featuredRetreat
  };

  const testimonialSecondaryData = {
    title: data?.testimonials?.heading || "Testimonials",
    subtitle: data?.testimonials?.subheading || "A few words from people who attended previous online retreats",
    testimonials: data?.testimonials?.content || []
  };

  // Transform API products to StoreProductSection format
  const transformedProducts = products.map(product => ({
    image: product.featured_image || product.thumbnail_url || PLACEHOLDER_IMAGE,
    hasVideo: true, // Assuming retreats have video content
    hasAudio: true, // Assuming retreats have audio content
    category: product.categories?.[0] || "Past online retreat",
    title: product.title,
    price: `$${Number(product.price).toFixed(2)}`,
    subtitle: product.short_description?.substring(0, 50) || "",
    description: product.short_description?.substring(0, 50) + "..." || "",
    cartUrl: `/store/${product.slug}`
  }));

  const pastRetreatsData = {
    tagline: "STORE",
    heading: "Discover past retreats",
    description: "Since 2017, we've offered over forty 3-, 5-, and 7-day retreats—each a gateway into the timeless wisdom of Shunyamurti. With uniquely titled classes, guided meditations, and profound discourses in video and audio formats, these retreats remain powerful tools for ongoing transformation. All are now easily accessible from your personalized Dashboard.",
    productsHeading: "Latest retreats",
    viewAllLink: {
      text: "View all",
      url: "/store"
    },
    products: transformedProducts.length > 0 ? transformedProducts : [
      // Fallback to placeholder if no products
      {
        image: PLACEHOLDER_IMAGE,
        hasVideo: true,
        hasAudio: true,
        category: "Past online retreat",
        title: "No products available",
        price: "$0.00",
        subtitle: "",
        description: "Check back soon for new retreats",
        cartUrl: "/store"
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