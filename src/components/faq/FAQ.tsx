'use client'


import React, { useEffect, useState } from "react";
import StandardHeroSection from "../shared/Hero";
import PhotoGallerySection from "../shared/PhotoGallerySection";
import FAQSection from "../shared/FAQ";
import ContactUsSection from "../shared/ContactUsSection";
import QuoteSection from "../shared/Quote";


// TypeScript interfaces for data structure
interface FAQItem {
  id?: number;
  question: string;
  answer: string;
  order_index?: number;
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

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export function FAQ({data}:any){
  const [faqData, setFaqData] = useState<FAQSectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${FASTAPI_URL}/api/faqs?page=faq`);

        if (!response.ok) {
          throw new Error('Failed to fetch FAQs');
        }

        const data = await response.json();
        setFaqData(data);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load FAQs');
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);
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



if (loading) {
  return (
    <>
      <StandardHeroSection data={heroData}/>
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#942017] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    </>
  );
}

if (error) {
  return (
    <>
      <StandardHeroSection data={heroData}/>
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-red-600">
          <p>Error loading FAQs: {error}</p>
        </div>
      </div>
    </>
  );
}

return (
  <>
  <StandardHeroSection data={heroData}/>
  {faqData && <FAQSection data={faqData}/>}
  <ContactUsSection/>
  <PhotoGallerySection data={galleryData}/>
  <QuoteSection data="this is a test quote for the FAQ page"/>
  </>
)




}