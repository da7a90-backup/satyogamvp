import React from "react";

import AshramStayHeroSection from "./Hero";
import QuoteSection from "../about/aboutSatyoga/QuoteSection";
import AshramRetreatsSection from "../about/aboutAshram/StayingAtAshram";
import WhyParticipateSection from "./WhyParticipate";
import RetreatCardsSection from "./RetreatsAvailable";
import WhichRetreatSection from "./WhichRetreatIsRightForMe";
import WhatWillYouEncounterSection from "./WhatWillYouEncounter";
import ContactUsSection from "../about/aboutSatyoga/ContactUsSection";
import TestimonialSection from "./Testimonial";
import OnlineRetreatsSection from "../about/aboutShunyamurti/OnlineRetreats";

export default function AshramStayPage({ data }: any) {

return (
    <>
    <AshramStayHeroSection/>
    <WhyParticipateSection/>
    <RetreatCardsSection/>
    <QuoteSection/>
    <WhichRetreatSection/>
    <WhatWillYouEncounterSection/>
    <TestimonialSection/>
    <ContactUsSection/>
    <OnlineRetreatsSection/>
    </>
)
}