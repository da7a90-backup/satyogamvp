import React from "react";


import OnlineRetreatsSection from "../about/aboutShunyamurti/OnlineRetreats";
import TwoPaneComponent from "../shared/TwoPaneComponent";
import QuoteSection from "../shared/Quote";
import ContactUsSection from "../shared/ContactUsSection";
import TestimonialCarousel from "../shared/Testimonial";
import StandardHeroSection from "../shared/Hero";
import UpcomingRetreatsSection from "../shared/RelatedOnline";
import TestimonialCarouselTertiary from "../shared/TestimonialTertiary";

export default function CoursesPage({ data }: any) {
// Data structure for Testimonial Carousel Section

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
 const testimonialCarouselData = {
   tagline: "TESTIMONIAL CARROUSEL",
   heading: "testimonials",
   testimonials: [
    {
      quote: "I've received so much in my month here; my cup overfloweth. It was like the nectar that I needed to heal. This is priceless, and I am so overjoyed that I've been here.",
      name: 'Mandy',
      location: 'UK',
      avatar: '/testimonial.png'
    },
    {
      quote: "I've so much in my month here; my cup overfloweth. It was like the nectar that I needed to heal. This is priceless, and I am so overjoyed that I've been here.",
      name: 'Mandy',
      location: 'UK',
      avatar: '/testimonial.png'
    }
  ]
 };
 

  const heroData = {tagline:"Courses", background: "/courseslanding.jpg", heading: "Online Training for Self-mastery", subtext: "Structured Online Courses for Spiritual Liberation and Self-realization."}
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

return (
    <>
    <StandardHeroSection data={heroData}/>
    <TwoPaneComponent data={introData}/>
    <UpcomingRetreatsSection data={sampleData}/>
    <TestimonialCarouselTertiary data={testimonialCarouselData}/>

    </>
)
}