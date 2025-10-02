'use client'
import React from "react";
import ShaktiHeroSection from "./ShaktiHero";
import ShaktiEventHeader from "./ShaktiIntro";
import ShaktiIncludedSection from "./Included";
import ShaktiCarouselSection from "./Carousel";
import QuoteSection from "@/components/about/aboutSatyoga/QuoteSection";
import TestimonialSection from "../Testimonial";
import ContactUsSection from "@/components/about/aboutSatyoga/ContactUsSection";
import ShaktiScheduleSection from "./Schedule";
import ShaktiBookingSection from "./ProductComponent";
import RelatedProgramsSection from "./Programs";



export default function ShaktiPage({ data }: any) {

return (
    <>
    <ShaktiHeroSection/>
    <ShaktiEventHeader/>
    <ShaktiIncludedSection/>
    <ShaktiCarouselSection/>
    <QuoteSection/>
    <ShaktiScheduleSection/>
    <ShaktiBookingSection/>
    <TestimonialSection/>
    <ContactUsSection/>
    <RelatedProgramsSection/>
    </>
)
}