import React from "react";
import AboutHeroSection from "../about/aboutSatyoga/Hero";
import WhatIsSatYogaSection from "../about/aboutSatyoga/WhatIsSatYoga";
import XatronSagesGallery from "../about/aboutSatyoga/XatronSages";
import QuoteSection from "../about/aboutSatyoga/QuoteSection";
import MethodologySection from "../about/aboutSatyoga/Methodology";
import AtmanologySection from "../about/aboutSatyoga/Atmanology";
import ContactUsSection from "../about/aboutSatyoga/ContactUsSection";
import BlogSection from "../about/aboutSatyoga/Blog";
import FreeTeachingsSection from "../about/aboutSatyoga/Teachings";
import TwoPaneComponent from "../shared/TwoPaneComponent";
import { atmanologyData, methodologyData, whatIsSatYogaData } from "@/lib/data";

export default function AboutPage({ data }: any) {

return (
    <>
    <AboutHeroSection/>
    <TwoPaneComponent data={whatIsSatYogaData}/>
    <XatronSagesGallery/>
    <QuoteSection/>
    <TwoPaneComponent data={methodologyData}/>
    <TwoPaneComponent data={atmanologyData}/>
    <ContactUsSection/>
    <BlogSection/>
    <FreeTeachingsSection/>
    </>
)
}