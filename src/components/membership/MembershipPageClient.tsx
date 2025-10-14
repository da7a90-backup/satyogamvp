'use client';

import MembershipHero from "./MembershipHero";
import Pricing from "./Pricing";

// Main Membership Page Client Component
export default function MembershipPageClient() {
  

  return (
    <>
      {/* Hero Section */}
      <MembershipHero
      />
      
      {/* Membership Plans Section */}
      <Pricing/>
 
    </>
  );
}