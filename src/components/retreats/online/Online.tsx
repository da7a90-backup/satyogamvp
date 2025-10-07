'use client'
import StandardHeroSection from "@/components/shared/Hero";
import UpcomingRetreatsSection from "@/components/shared/RelatedOnline";
import StoreProductSection from "@/components/shared/StoreSuggestions";
import TestimonialSecondarySection from "@/components/shared/TestimonialSecondary";
import TwoPaneComponent from "@/components/shared/TwoPaneComponent";
import React from "react";


export default function OnlinePage({ data }: any) {

    const heroData = {tagline:"Online Retreats", background: "/onlineretreatherobanner.jpg", heading: "Online Retreats Led by Shunyamurti", subtext: "Livestreamed for a fully immersive experience wherever you are. Also offered onsite through the Shakti Saturation and Sevadhari programs."}
    const introData = {
        leftPane: {
          title: "A Personal Encounter with Shunyamurti",
          titleLineHeight: "120%"
        },
        rightPane: {
          type: 'paragraphs' as const,
          content: [
    "This retreat is a precious opportunity to receive initiation from Shunyamurti directly—an encounter that can shift your vibrational frequency immediately to the Presence of divine light and love. This in turn can bring full realization of your God-Self.",
    " Designed to open your heart and mind to be filled with the Light of the Supreme Real,",
    "these compact events also feature wisdom classes, meditation training, and optional meetings with an individual counselor.",
    ]
        }
      };

      // Example usage with sample data
const sampleData = {
    heading: "3 upcoming retreats",
    viewAllLink: {
      text: "View all",
      url: "/retreats"
    },
    cards: [
      {
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        iconOverlay: "/progicon.png",
        duration: "3 days",
        type: "Online Retreat",
        date: "Sept 29th - Oct 1st, 2025",
        category: "Weekend retreat",
        title: "Why Our Situation is Hopeless, Yet Hilarious",
        description: "Every ego eventually gets mired in a swamp of hopelessness. There is only one way out...",
        button: {
          text: "Learn more",
          url: "/retreat/hopeless-yet-hilarious"
        }
      },
      {
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        iconOverlay: "/progicon.png",
        duration: "3 days",
        type: "Online Retreat",
        date: "Sept 29th - Oct 1st, 2025",
        title: "Why Our Situation is Hopeless, Yet Hilarious",
        description: "Every ego eventually gets mired in a swamp of hopelessness. There is only one way out...",
        button: {
          text: "Learn more",
          url: "/retreat/hopeless-yet-hilarious"
        }
      },
      {
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        iconOverlay: "/progicon.png",
        duration: "3 days",
        type: "Online Retreat",
        date: "Sept 29th - Oct 1st, 2025",
        title: "Why Our Situation is Hopeless, Yet Hilarious",
        description: "Every ego eventually gets mired in a swamp of hopelessness. There is only one way out...",
        button: {
          text: "Learn more",
          url: "/retreat/hopeless-yet-hilarious"
        }
      }
    ]
  };

  const testimonialSecondaryData = {
    title: "Customer testimonials",
    subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    testimonials: [
      {
        quote: "It was truly a joy and adventure for me to be part of the retreat. I learned a lot of mind and heart expanding concepts.",
        name: "Idelle",
        location: "USA",
        avatar: "/avatars/idelle.jpg"
      },
      {
        quote: "It was truly a joy and adventure for me to be part of the retreat. I learned a lot of mind and heart expanding concepts.",
        name: "Idelle",
        location: "USA",
        avatar: "/avatars/idelle.jpg"
      },
      {
        quote: "Being connected with you helps me focus on what's important. Shunya opens these vast realms of understanding—it's rare and unforgettable.I loved the meditations, the teachings—this retreat nourished me in ways I didn't expect.",
        name: "Hector",
        location: "Costa Rica",
        avatar: "/avatars/hector.jpg"
      },
      {
        quote: "Being connected with you helps me focus on what's important. Shunya opens these vast realms of understanding—it's rare and unforgettable.I loved the meditations, the teachings—this retreat nourished me in ways I didn't expect.",
        name: "Hector",
        location: "Costa Rica",
        avatar: "/avatars/hector.jpg"
      }
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
        <UpcomingRetreatsSection data={sampleData}/>
        <TestimonialSecondarySection data={testimonialSecondaryData}/>
        <StoreProductSection data={pastRetreatsData} />
        </>
    )
}