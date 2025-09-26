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

export default function AboutPage({ data }: any) {

return (
    <>
    <AboutHeroSection/>
    <WhatIsSatYogaSection/>
    <XatronSagesGallery/>
    <QuoteSection/>
    <MethodologySection/>
    <AtmanologySection/>
    <ContactUsSection/>
    <BlogSection/>
    <FreeTeachingsSection/>
    </>
)
}