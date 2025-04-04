import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Hero from '@/components/sections/Hero';
import ContentSection from '@/components/sections/ContentSection';
import CtaSection from '@/components/sections/CtaSection';
import LearningTabs from '@/components/sections/LearningTabs';
import BlogSection from '@/components/sections/BlogSection';

export default function HomePage({ data }: any) {
  // Structure the data from Strapi
  const {
    hero,
    shunyamurtiSection,
    aboutSection,
    learningOptions,
    membershipCta,
    blogPosts
  } = data;
  
  return (
    <>
      {/* Hero Section */}
      <Hero
        heading={hero.heading}
        content={hero.content}
        buttonText={hero.buttonText}
        buttonLink={hero.buttonLink}
        darkMode={true}
        backgroundImage={hero.backgroundImage?.url || "/placeholder.png"}
      />
      
      {/* Path to Freedom Section */}
      <ContentSection
        eyebrow={aboutSection.eyebrow}
        heading={aboutSection.heading}
        content={aboutSection.content}
        buttons={[
          { label: "Discover Sat Yoga", url: "/about", primary: true }
        ]}
        imagePosition="left"
        imageUrl={aboutSection.image?.url || "/placeholder.png"}
      />
      
      {/* Shunyamurti Section */}
      <ContentSection
        eyebrow={shunyamurtiSection.eyebrow}
        heading={shunyamurtiSection.heading}
        content={shunyamurtiSection.content}
        buttons={[
          { label: "Learn more", url: "/about/shunyamurti", primary: true }
        ]}
        imagePosition="right"
        imageUrl={shunyamurtiSection.image?.url || "/placeholder.png"}
      />
      
      {/* Learning Tabs Section */}
      <LearningTabs
        title={learningOptions.title}
        description={learningOptions.description}
        tabs={learningOptions.tabs}
      />
      
      {/* Stay Connected Section */}
      <ContentSection
        eyebrow="A Seamless Experience Across Devices"
        heading="Stay Connected to Wisdom Anytime, Anywhere"
        content="Whether on your phone, tablet, or desktop, our platform adapts to your lifestyle. Enjoy a fully responsive experience that lets you engage with courses, live sessions, and community discussions without interruption."
        buttons={[
          { label: "Start the journey", url: "/signup", primary: true }
        ]}
        imagePosition="left"
        imageUrl="/placeholder.png"
      />
      
      {/* Membership CTA */}
      <CtaSection
        eyebrow={membershipCta.eyebrow}
        heading={membershipCta.heading}
        description={membershipCta.description}
        primaryButtonText={membershipCta.primaryButtonText}
        primaryButtonLink={membershipCta.primaryButtonLink}
        secondaryButtonText={membershipCta.secondaryButtonText}
        secondaryButtonLink={membershipCta.secondaryButtonLink}
      />
      
      {/* Blog Section */}
      <BlogSection 
        posts={blogPosts}
        title="Welcome to our blog"
        description="Explore transformative insights from Sat Yoga, including deep reflections, spiritual guidance, and practical wisdom to support your journey of self-discovery and liberation."
        viewAllLink="/blog"
      />
    </>
  );
}