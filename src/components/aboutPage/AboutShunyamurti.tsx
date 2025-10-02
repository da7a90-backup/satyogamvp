import React from "react";
import QuestionsAnswersSection from "../about/aboutShunyamurti/QnA";
import SriRamanaConnectionSection from "../about/aboutShunyamurti/SriRamana";
import BooksSection from "../about/aboutShunyamurti/Books";
import OnlineRetreatsSection from "../about/aboutShunyamurti/OnlineRetreats";
import FreeTeachingsSection from "../about/aboutSatyoga/Teachings";
import EncountersSection from "../about/aboutShunyamurti/Testimonial";
import TwoPaneComponent from "../shared/TwoPaneComponent";
import { curriculumVitaeData, whatIsShunyamurtiData } from "@/lib/data";
import QuoteSection from "../shared/Quote";
import StandardHeroSection from "../shared/Hero";

export default function AboutShunyaPage({ data }: any) {
    const heroData = {tagline:"", background: "/aboutshunyabanner.jpg", heading: "", subtext: ""}

return (
    <>
      <StandardHeroSection data={heroData} />
      <TwoPaneComponent data={whatIsShunyamurtiData} />
      <QuestionsAnswersSection />
      <QuoteSection data={"A seeker of the Real should not follow a beaten path. The way to completion is to develop originality. Sat Yoga is not a path: we teach you how to use a compass and a machete, and we encourage you to cut a new path of your own."} />
      <BooksSection />
      <TwoPaneComponent data={curriculumVitaeData} />
      <EncountersSection />
      <SriRamanaConnectionSection />
      <OnlineRetreatsSection />
          </>
)
}