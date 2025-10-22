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

import { homePageData, type HomePageData } from '@/lib/hpdata';

interface HomePageProps {
  data?: HomePageData; // Optional - will use default if not provided
}

export default function HomePage({ data }: HomePageProps) {
  // Use provided data or fall back to default
  const pageData = data || homePageData;
  
  return (
    <>
      {/* Hero Section */}
      <HeroSection
        videoUrl={pageData.hero.videoUrl}
        logoUrl={pageData.hero.logoUrl}
        logoAlt={pageData.hero.logoAlt}
        subtitle={pageData.hero.subtitle}
      />

      {/* Intro Section */}
      <IntroSection
        backgroundImage={pageData.intro.backgroundImage}
        heading={pageData.intro.heading}
      />

      {/* Who We Are Section */}
      <WhoWeAreSection
        eyebrow={pageData.whoWeAre.eyebrow}
        heading={pageData.whoWeAre.heading}
        content={pageData.whoWeAre.content}
        buttonText={pageData.whoWeAre.buttonText}
        buttonLink={pageData.whoWeAre.buttonLink}
        image={pageData.whoWeAre.image}
        imageAlt={pageData.whoWeAre.imageAlt}
        backgroundDecoration={pageData.whoWeAre.backgroundDecoration}
      />

      {/* Shunyamurti Section */}
      <ShunyamurtiSection
        eyebrow={pageData.shunyamurti.eyebrow}
        quote={pageData.shunyamurti.quote}
        content={pageData.shunyamurti.content}
        buttonText={pageData.shunyamurti.buttonText}
        buttonLink={pageData.shunyamurti.buttonLink}
        image={pageData.shunyamurti.image}
        imageAlt={pageData.shunyamurti.imageAlt}
        backgroundDecoration={pageData.shunyamurti.backgroundDecoration}
      />

      {/* Learn Online Section */}
      <LearnOnlineSection
        eyebrow={pageData.learnOnline.eyebrow}
        heading={pageData.learnOnline.heading}
        description={pageData.learnOnline.description}
        tabs={pageData.learnOnline.tabs}
        backgroundDecorations={pageData.learnOnline.backgroundDecorations}
      />

      {/* Ashram Section */}
      <AshramSection
        eyebrow={pageData.ashram.eyebrow}
        heading={pageData.ashram.heading}
        content={pageData.ashram.content}
        buttonText={pageData.ashram.buttonText}
        buttonLink={pageData.ashram.buttonLink}
        images={pageData.ashram.images}
      />

      {/* Platform Section */}
      <PlatformSection
        eyebrow={pageData.platform.eyebrow}
        heading={pageData.platform.heading}
        content={pageData.platform.content}
        buttonText={pageData.platform.buttonText}
        buttonLink={pageData.platform.buttonLink}
        image={pageData.platform.image}
        imageAlt={pageData.platform.imageAlt}
        backgroundDecoration={pageData.platform.backgroundDecoration}
      />

      {/* Membership Section */}
      <MembershipSection
        eyebrow={pageData.membership.eyebrow}
        heading={pageData.membership.heading}
        description={pageData.membership.description}
        buttonText={pageData.membership.buttonText}
        buttonLink={pageData.membership.buttonLink}
        backgroundImage={pageData.membership.backgroundImage}
      />

      {/* Donation Section */}
      <DonationSection
        eyebrow={pageData.donation.eyebrow}
        heading={pageData.donation.heading}
        description={pageData.donation.description}
        buttonText={pageData.donation.buttonText}
        buttonLink={pageData.donation.buttonLink}
        backgroundDecoration={pageData.donation.backgroundDecoration}
      />
    </>
  );
}