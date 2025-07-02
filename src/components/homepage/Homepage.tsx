import React from 'react';
import Hero from '@/components/sections/Hero';
import ContentSection from '@/components/sections/ContentSection';
import QuoteSection from '@/components/sections/QuoteSection';
import CtaSection from '@/components/sections/CtaSection';
import LearningTabs from '@/components/sections/LearningTabs';
import BlogSection from '@/components/sections/BlogSection';
import DonationSection from '@/components/sections/DonationSection';

interface HomePageProps {
  data: {
    // Toggle flags
    showHeroSection?: boolean;
    showAboutSection?: boolean;
    showShunyamurtiSection?: boolean;
    showLearningSection?: boolean;
    showAshramSection?: boolean;
    showPlatformSection?: boolean;
    showMembershipCta?: boolean;
    showDonationSection?: boolean;
    showBlogSection?: boolean;
    
    // Section data
    hero?: any;
    aboutSection?: any;
    shunyamurtiSection?: any;
    learningOptions?: any;
    ashramSection?: any;
    platformSection?: any;
    membershipCta?: any;
    donationSection?: any;
    blogSection?: any;
    blogPosts?: any[];
  };
}

export default function HomePage({ data }: HomePageProps) {
  const {
    // Toggle flags
    showHeroSection = true,
    showAboutSection = true,
    showShunyamurtiSection = true,
    showLearningSection = true,
    showAshramSection = true,
    showPlatformSection = true,
    showMembershipCta = true,
    showDonationSection = true,
    showBlogSection = true,
    
    // Section data
    hero,
    aboutSection,
    shunyamurtiSection,
    learningOptions,
    ashramSection,
    platformSection,
    membershipCta,
    donationSection,
    blogSection,
    blogPosts = []
  } = data;
  
  return (
    <div className="homepage">
      {/* Hero Section */}
      {showHeroSection && hero && (
        <Hero
          heading={hero.heading}
          subheading={hero.subheading}
          content={hero.content}
          buttonText={hero.buttonText}
          buttonLink={hero.buttonLink}
          backgroundImage={hero.backgroundImage?.url}
          backgroundVideo={hero.backgroundVideo?.url}
          useVideo={hero.useVideo}
          darkMode={hero.textColor === 'light'}
          overlayOpacity={hero.overlayOpacity}
        />
      )}
      
      {/* About Section - "A Pathless Path to Self-Realization and Liberation" */}
      {showAboutSection && aboutSection && (
        <ContentSection
          eyebrow={aboutSection.eyebrow}
          heading={aboutSection.heading}
          content={aboutSection.content}
          primaryButtonText={aboutSection.primaryButtonText}
          primaryButtonLink={aboutSection.primaryButtonLink}
          secondaryButtonText={aboutSection.secondaryButtonText}
          secondaryButtonLink={aboutSection.secondaryButtonLink}
          imagePosition={aboutSection.imagePosition || "left"}
          imageUrl={aboutSection.useGallery ? 
            aboutSection.galleryImages?.[0]?.url : 
            aboutSection.mainImage?.url
          }
          galleryImages={aboutSection.useGallery ? 
            aboutSection.galleryImages?.map((img: any) => img.url) : 
            undefined
          }
          backgroundColor={aboutSection.backgroundColor}
        />
      )}
      
      {/* Shunyamurti Quote Section */}
      {showShunyamurtiSection && shunyamurtiSection && (
        <QuoteSection
          eyebrow={shunyamurtiSection.eyebrow}
          quote={shunyamurtiSection.quote}
          authorName={shunyamurtiSection.authorName}
          authorTitle={shunyamurtiSection.authorTitle}
          authorImage={shunyamurtiSection.authorImage?.url}
          description={shunyamurtiSection.description}
          buttonText={shunyamurtiSection.buttonText}
          buttonLink={shunyamurtiSection.buttonLink}
          backgroundColor={shunyamurtiSection.backgroundColor}
        />
      )}
      
      {/* Learning Options Section */}
      {showLearningSection && learningOptions && (
        <LearningTabs
          title={learningOptions.title}
          description={learningOptions.description}
          tabs={learningOptions.tabs}
        />
      )}
      
      {/* Ashram Section - "Rest in the Current of Your Infinite Nature" */}
      {showAshramSection && ashramSection && (
        <ContentSection
          eyebrow={ashramSection.eyebrow}
          heading={ashramSection.heading}
          content={ashramSection.content}
          primaryButtonText={ashramSection.primaryButtonText}
          primaryButtonLink={ashramSection.primaryButtonLink}
          secondaryButtonText={ashramSection.secondaryButtonText}
          secondaryButtonLink={ashramSection.secondaryButtonLink}
          imagePosition={ashramSection.imagePosition || "left"}
          imageUrl={ashramSection.useGallery ? 
            ashramSection.galleryImages?.[0]?.url : 
            ashramSection.mainImage?.url
          }
          galleryImages={ashramSection.useGallery ? 
            ashramSection.galleryImages?.map((img: any) => img.url) : 
            undefined
          }
          backgroundColor={ashramSection.backgroundColor}
        />
      )}
      
      {/* Platform Section - "Stay Connected to Wisdom Anytime, Anywhere" */}
      {showPlatformSection && platformSection && (
        <ContentSection
          eyebrow={platformSection.eyebrow}
          heading={platformSection.heading}
          content={platformSection.content}
          primaryButtonText={platformSection.primaryButtonText}
          primaryButtonLink={platformSection.primaryButtonLink}
          secondaryButtonText={platformSection.secondaryButtonText}
          secondaryButtonLink={platformSection.secondaryButtonLink}
          imagePosition={platformSection.imagePosition || "right"}
          imageUrl={platformSection.useGallery ? 
            platformSection.galleryImages?.[0]?.url : 
            platformSection.mainImage?.url
          }
          galleryImages={platformSection.useGallery ? 
            platformSection.galleryImages?.map((img: any) => img.url) : 
            undefined
          }
          backgroundColor={platformSection.backgroundColor}
        />
      )}
      
      {/* Membership CTA Section */}
      {showMembershipCta && membershipCta && (
        <CtaSection
          eyebrow={membershipCta.eyebrow}
          heading={membershipCta.heading}
          description={membershipCta.description}
          primaryButtonText={membershipCta.primaryButtonText}
          primaryButtonLink={membershipCta.primaryButtonLink}
          secondaryButtonText={membershipCta.secondaryButtonText}
          secondaryButtonLink={membershipCta.secondaryButtonLink}
          backgroundImage={membershipCta.backgroundImage?.url}
          backgroundVideo={membershipCta.backgroundVideo?.url}
          useVideo={membershipCta.useVideo}
          darkMode={membershipCta.darkMode}
          overlayOpacity={membershipCta.overlayOpacity}
        />
      )}
      
      {/* Blog Section */}
      {showBlogSection && blogSection && blogPosts.length > 0 && (
        <BlogSection 
          posts={blogPosts}
          title={blogSection.title}
          description={blogSection.description}
          viewAllLink={blogSection.viewAllLink}
          viewAllText={blogSection.viewAllText}
          showExcerpts={blogSection.showExcerpts}
          showAuthors={blogSection.showAuthors}
          showDates={blogSection.showDates}
        />
      )}
      
      {/* Donation Section */}
      {showDonationSection && donationSection && (
        <DonationSection
          eyebrow={donationSection.eyebrow}
          heading={donationSection.heading}
          description={donationSection.description}
          buttonText={donationSection.buttonText}
          buttonLink={donationSection.buttonLink}
          backgroundColor={donationSection.backgroundColor}
        />
      )}
    </div>
  );
}