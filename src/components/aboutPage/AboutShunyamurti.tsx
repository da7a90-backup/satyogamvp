import React from "react";
import AboutShunyamurtiPage from "../about/aboutShunyamurti/Hero";
import AboutHeroSection from "../about/aboutShunyamurti/Hero";
import WhatIsShunyamurtiSection from "../about/aboutShunyamurti/WhatIsShunya";
import QuestionsAnswersSection from "../about/aboutShunyamurti/QnA";
import CurriculumVitaeSection from "../about/aboutShunyamurti/CV";
import SriRamanaConnectionSection from "../about/aboutShunyamurti/SriRamana";
import BooksSection from "../about/aboutShunyamurti/Books";
import OnlineRetreatsSection from "../about/aboutShunyamurti/OnlineRetreats";
import FreeTeachingsSection from "../about/aboutSatyoga/Teachings";
import QuoteSection from "../about/aboutSatyoga/QuoteSection";
import EncountersSection from "../about/aboutShunyamurti/Testimonial";
import TwoPaneComponent from "../shared/TwoPaneComponent";
import { curriculumVitaeData, whatIsShunyamurtiData } from "@/lib/data";

export default function AboutShunyaPage({ data }: any) {

return (
    <>
      <AboutHeroSection />
      <TwoPaneComponent data={whatIsShunyamurtiData} />
      <QuestionsAnswersSection />
      <QuoteSection/>
      <BooksSection />
      <TwoPaneComponent data={curriculumVitaeData} />
      <EncountersSection />
      <SriRamanaConnectionSection />
      <OnlineRetreatsSection />
          </>
)
}