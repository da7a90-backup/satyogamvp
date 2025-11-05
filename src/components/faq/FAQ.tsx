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
  const [galleryApiData, setGalleryApiData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch FAQs
        const faqResponse = await fetch(`${FASTAPI_URL}/api/faqs?page=faq`);
        if (!faqResponse.ok) {
          throw new Error('Failed to fetch FAQs');
        }
        const faqsData = await faqResponse.json();
        setFaqData(faqsData);

        // Fetch gallery data
        const galleryResponse = await fetch(`${FASTAPI_URL}/api/faqs/gallery`);
        if (galleryResponse.ok) {
          const gallery = await galleryResponse.json();
          setGalleryApiData(gallery);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroData = {
    tagline: "",
    background: galleryApiData?.bannerImage || "/FAQBanner.jpg",
    heading: "FAQs",
    subtext: ""
  };

  // TypeScript interfaces for data structure
  interface GalleryImage {
    src: string;
    alt: string;
    size?: 'small' | 'medium' | 'large';
  }

  interface PhotoGallerySectionData {
    images: GalleryImage[];
  }

  // Use gallery data from API or fallback to empty array
  const galleryData: PhotoGallerySectionData = {
    images: (galleryApiData?.galleryImages || []).map((img: any) => ({
      src: img.url,
      alt: img.alt,
      size: 'medium' as const
    }))
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