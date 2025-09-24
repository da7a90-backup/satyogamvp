import React from 'react';

import HeroSection from '@/components/sections/Hero';
import IntroSection from '@/components/sections/Intro';
import WhoWeAreSection from '@/components/sections/WhoAreWe';
import ShunyamurtiSection from '@/components/sections/Shunyamurti';
import LearnOnlineSection from '../sections/LearningTabs';
import AshramSection from '../sections/Ashram';
import PlatformSection from '../sections/Platform';
import MembershipSection from '../sections/Membership';
import DonationSection from '../sections/Donation';
export default function HomePage({ data }: any) {
  // Structure the data from Strapi

  
  return (
    <>
      {/* Hero Section */}
      <HeroSection
      />
      <IntroSection/>
      <WhoWeAreSection/>
      <ShunyamurtiSection/>
      <LearnOnlineSection/>      
      <AshramSection/>
      <PlatformSection/>
      <MembershipSection/>
      <DonationSection/>
    </>
  );
}