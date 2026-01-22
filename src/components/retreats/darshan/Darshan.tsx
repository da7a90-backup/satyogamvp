'use client'
import React from "react";
import QuoteSection from "@/components/shared/Quote";
import ContactUsSection from "@/components/shared/ContactUsSection";
import StandardHeroSection from "@/components/shared/Hero";
import IncludedSection from "@/components/shared/Included";
import TwoPaneComponent from "@/components/shared/TwoPaneComponent";
import ImageCarouselSection, { CarouselImage } from "@/components/shared/ImageCarousel";
import ScheduleSection from "@/components/shared/TypicalDay";
import ProductComponent from "@/components/shared/ProductComponent";
import RelatedProgramsSection from "@/components/shared/RelatedOnsite";
import TestimonialCarousel from "@/components/shared/Testimonial";



export default function DarshanPage({ data, retreatData }: any) {
  // Use retreat data from API - included items section
  const shaktiIncludedData = {
    sectionTitle: retreatData?.included_title || "Included in this 7-day retreat",
    items: retreatData?.included_items || []
  };

  // Use retreat data from API - intro section
  const introData = {
    leftPane: {
      title: retreatData?.intro1_title || "A Personal Encounter with Shunyamurti",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: retreatData?.intro1_content || []
    }
  };

  const carouselImages: CarouselImage[] = data?.carousel?.secondaryImages || [];

  // Use retreat data from API - schedule section
  const scheduleData = {
    tagline: retreatData?.schedule_tagline || "A TYPICAL ASHRAM DAY",
    title: retreatData?.schedule_title || "Sample Daily Schedule",
    items: retreatData?.schedule_items || []
  };


  // Use retreat data from API - no fallback, data must come from database
  const shaktiBookingData = retreatData?.product_component_data ? {
    ...retreatData.product_component_data,
    retreatId: retreatData.product_component_data.retreatId || retreatData.id,
    retreatSlug: retreatData.slug,
    memberDiscountPercentage: retreatData.member_discount_percentage || 10,
    images: retreatData.product_component_data.images || data?.productComponent?.content?.images || []
  } : null;

  const testimonials = data?.testimonials?.content || [];

  const heroData = {
    tagline: data?.hero?.tagline || "",
    background: data?.hero?.backgroundImage || "",
    heading: data?.hero?.heading || "",
    subtext: data?.hero?.subheading || ""
  };
  const relatedProgramsData = {
    sectionTitle: data?.relatedPrograms?.heading || "",
    programs: data?.relatedPrograms?.content || []
  };

  
return (
    <>
    <StandardHeroSection data={heroData}/>
    <TwoPaneComponent data={introData}/>
    <IncludedSection data={shaktiIncludedData}/>
    <ImageCarouselSection data={carouselImages}/>
    <QuoteSection data={"A seeker of the Real should not follow a beaten path. The way to completion is to develop originality. Sat Yoga is not a path: we teach you how to use a compass and a machete, and we encourage you to cut a new path of your own."} />
    <TwoPaneComponent data={introData}/>
    <ScheduleSection data={scheduleData}/>
    <TestimonialCarousel
      tagline="TESTIMONIAL CAROUSEL"
      testimonials={testimonials}
    />
    {shaktiBookingData && (
      <ProductComponent data={shaktiBookingData}/>
    )}
    <ContactUsSection/>
    <RelatedProgramsSection data={relatedProgramsData}/>
    </>
)
}