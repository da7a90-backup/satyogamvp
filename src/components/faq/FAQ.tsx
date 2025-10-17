'use client'


import React from "react";
import StandardHeroSection from "../shared/Hero";
import PhotoGallerySection from "../shared/PhotoGallerySection";
import FAQSection from "../shared/FAQ";
import ContactUsSection from "../shared/ContactUsSection";
import QuoteSection from "../shared/Quote";


// TypeScript interfaces for data structure
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  label: string;
  faqs: FAQItem[];
}

interface FAQSectionData {
  searchPlaceholder: string;
  categories: FAQCategory[];
}
interface FAQSectionProps {
  data?: FAQSectionData;
}
export function FAQ({data}:any){



// Externalized data structure - ready for Strapi CMS
const faqData: FAQSectionData = {
  searchPlaceholder: 'Search for queries',
  categories: [
    {
      id: 'all',
      label: 'View all',
      faqs: []
    },
    {
      id: 'general',
      label: 'General questions',
      faqs: [
        {
          question: 'Location',
          answer: "We are located in the mountains of Pérez Zeledón, about 4 hours from San José. From the city of San Isidro de El General, it's a 40-minute drive into the mountains on rural roads. After booking your stay, you'll receive a detailed map and travel info."
        },
        {
          question: 'What is the weather like?',
          answer: 'The climate at the ashram varies from cool and rainy to hot and humid. Mid-mornings are typically sunny and warm, with fog or rain often arriving around noon to mid-afternoon, followed by chilly nights and early mornings.\n\nElevation: 1100 meters (approx.)\n\nYear-round (rainy & dry seasons):\n• Avg temp: 20°C (68°F)\n• Low temp: 16°C (61°F)\n• High temp: 29°C (85°F)'
        },
        {
          question: 'What is your property like?',
          answer: 'We are nestled in the mountains of southern Costa Rica. The land includes tropical cloud forests, pastures, springs, rivers, organic gardens, and food forests. The terrain is hilly and can be muddy in the rainy season; but our roads, paths, and stairways are well maintained.'
        },
        {
          question: 'Whom do I contact for more information?',
          answer: 'Please reach out to Amrita, our Visit Coordinator.'
        },
        {
          question: 'What languages are spoken at Sat Yoga Ashram?',
          answer: 'All of our classes are generally offered in English.'
        },
        {
          question: 'Do I need health insurance?',
          answer: 'Yes. All guests must have accident and medical insurance and be financially prepared for medical expenses. See our Booking and Refund Policy (link) page for details.'
        },
        {
          question: 'Are scholarships available?',
          answer: 'We have limited scholarships for on-site retreats. Partial work-trade opportunities may be available for extended stays beyond the duration of the retreat or for returning visitors, depending on financial need and availability.\n\nPlease reach out to Amrita, our Visit Coordinator, for more information'
        },
        {
          question: 'Can I come for a day trip?',
          answer: 'No, we host visitors for a minimum one-week stay and only during one of our officially scheduled retreats. Please read more about our offerings at Staying At The Ashram'
        },
        {
          question: 'Can I extend my stay after the retreat?',
          answer: "You may apply to extend after the end of a retreat. If you're interested in extending your visit, speak with Amrita, our Visit Coordinator. (CONTACT)"
        },
        {
          question: 'How can I join the community?',
          answer: 'Becoming a member of our community is a multistep process that can take several months or even years. Serious seekers drawn to the monastic life should first attend one of our onsite retreats. From there, we can discuss the process in person.'
        }
      ]
    },
    {
      id: 'kitchen',
      label: 'Kitchen',
      faqs: []
    },
    {
      id: 'overnight',
      label: 'Overnight guests',
      faqs: []
    },
    {
      id: 'transportation',
      label: 'Transportation',
      faqs: []
    }
  ]
};
const heroData = {tagline:"", background: "/FAQBanner.jpg", heading: "FAQs", subtext: ""}
// TypeScript interfaces for data structure
interface GalleryImage {
  src: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
}

interface PhotoGallerySectionData {
  images: GalleryImage[];
}

// Externalized data structure - ready for Strapi CMS
const galleryData: PhotoGallerySectionData = {
  images: [
    {
      src: '/FAQ Gallery 1.jpg',
      alt: 'Guests arriving at ashram entrance',
      size: 'medium'
    },
    {
      src: '/FAQ Gallery 2.jpg',
      alt: 'Ashram buildings under starlit sky',
      size: 'medium'
    },
    {
      src: '/FAQ Gallery 3.jpg',
      alt: 'Person meditating by waterfall',
      size: 'medium'
    },
    {
      src: '/FAQ Gallery 4.jpg',
      alt: 'Meditation cushions in dharma hall',
      size: 'medium'
    },
    {
      src: '/FAQ Gallery 5.jpg',
      alt: 'Community members gathering in forest',
      size: 'medium'
    },
    {
      src: '/FAQ Gallery 6.jpg',
      alt: 'Person viewing sunset from balcony',
      size: 'medium'
    },
    {
      src: '/FAQ Gallery 7.jpg',
      alt: 'Mountain view at sunset',
      size: 'medium'
    },
    {
      src: '/FAQ Gallery 8.jpg',
      alt: 'Mountain view at sunset',
      size: 'medium'
    }
  ]
};



return (
  <>
  <StandardHeroSection data={heroData}/>
  <FAQSection data={faqData}/>
  <ContactUsSection/>
  <PhotoGallerySection data={galleryData}/>
  <QuoteSection data="this is a test quote for the FAQ page"/>
  </>
)




}