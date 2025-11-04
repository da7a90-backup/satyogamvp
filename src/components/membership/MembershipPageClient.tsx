'use client';

import MembershipHero from "./MembershipHero";
import Pricing from "./Pricing";
import NotReadySection from "./NotReadySection";
import TwoPaneComponent from "@/components/shared/TwoPaneComponent";
import { membershipBenefitsData } from "./membershipBenefitsData";

// Main Membership Page Client Component
export default function MembershipPageClient() {


  return (
    <>
      {/* Hero Section */}
      <MembershipHero
      />

      {/* Membership Plans Section */}
      <Pricing/>

      {/* Not Ready Section */}
      <NotReadySection />

      {/* Membership Benefits Details Section */}
      <TwoPaneComponent data={membershipBenefitsData} />

    </>
  );
}