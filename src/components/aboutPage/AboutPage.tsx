import React from "react";
import XatronSagesGallery from "../about/aboutSatyoga/XatronSages";
import BlogSection from "../about/aboutSatyoga/Blog";
import FreeTeachingsSection from "../about/aboutSatyoga/Teachings";
import TwoPaneComponent from "../shared/TwoPaneComponent";
import { atmanologyData, methodologyData, whatIsSatYogaData } from "@/lib/data";
import QuoteSection from "../shared/Quote";
import ContactUsSection from "../shared/ContactUsSection";
import StandardHeroSection from "../shared/Hero";

export default function AboutPage({ data }: any) {
    const heroData = {tagline:"About", background: "/aboutbanner.jpg", heading: "Sat Yoga", subtext: "Wisdom School"}

return (
    <>
    <StandardHeroSection data={heroData}/>
    <TwoPaneComponent data={whatIsSatYogaData}/>
    <XatronSagesGallery/>
    <QuoteSection data={"A seeker of the Real should not follow a beaten path. The way to completion is to develop originality. Sat Yoga is not a path: we teach you how to use a compass and a machete, and we encourage you to cut a new path of your own."} />
    <TwoPaneComponent data={methodologyData}/>
    <TwoPaneComponent data={atmanologyData}/>
    <ContactUsSection/>
    <BlogSection/>
    <FreeTeachingsSection/>
    </>
)
}