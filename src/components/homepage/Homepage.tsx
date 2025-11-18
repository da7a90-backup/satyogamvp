'use client';

import React, { useState, useEffect, useRef } from 'react';

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

  const [introRevealed, setIntroRevealed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let lastScrollTop = 0;

    const handleWheel = (e: WheelEvent) => {
      // If we're at the top with intro revealed and scrolling up, reveal hero
      if (introRevealed && window.scrollY <= 10 && e.deltaY < 0 && !isAnimatingRef.current) {
        e.preventDefault();
        isAnimatingRef.current = true;
        animateHeroReveal();
        return;
      }

      // If hero is showing and scrolling down, reveal intro
      if (!introRevealed && !isAnimatingRef.current) {
        e.preventDefault();
        if (e.deltaY > 0) {
          isAnimatingRef.current = true;
          animateIntroReveal();
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      lastScrollTop = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = lastScrollTop - currentY;

      // If at top with intro revealed and scrolling up, reveal hero
      if (introRevealed && window.scrollY <= 10 && deltaY < 0 && !isAnimatingRef.current) {
        e.preventDefault();
        isAnimatingRef.current = true;
        animateHeroReveal();
        lastScrollTop = currentY;
        return;
      }

      // If hero is showing and scrolling down, reveal intro
      if (!introRevealed && !isAnimatingRef.current && deltaY > 0) {
        e.preventDefault();
        isAnimatingRef.current = true;
        animateIntroReveal();
      }

      lastScrollTop = currentY;
    };

    const animateIntroReveal = () => {
      const duration = 1000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);

        setScrollProgress(easeOutCubic);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIntroRevealed(true);
          setIsAtTop(false);
          isAnimatingRef.current = false;
          document.body.style.overflow = 'auto';
          setTimeout(() => {
            window.scrollTo({ top: 10, behavior: 'auto' });
          }, 50);
        }
      };

      requestAnimationFrame(animate);
    };

    const animateHeroReveal = () => {
      const duration = 1000;
      const startTime = Date.now();
      document.body.style.overflow = 'hidden';

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);

        // Reverse: go from 1 (fully revealed) back to 0 (hidden)
        setScrollProgress(1 - easeOutCubic);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIntroRevealed(false);
          setIsAtTop(true);
          setScrollProgress(0);
          isAnimatingRef.current = false;
          window.scrollTo({ top: 0, behavior: 'auto' });
        }
      };

      requestAnimationFrame(animate);
    };

    // Add event listeners based on state
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Control body overflow
    if (!introRevealed) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [introRevealed]);

  const handleScrollToIntro = () => {
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      const duration = 1000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);

        setScrollProgress(easeOutCubic);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIntroRevealed(true);
          isAnimatingRef.current = false;
          document.body.style.overflow = 'auto';
        }
      };

      requestAnimationFrame(animate);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Hero Section - in normal flow */}
      <div
        style={{
          height: '90vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <HeroSection
          videoUrl={pageData.hero.videoUrl}
          logoUrl={pageData.hero.logoUrl}
          logoAlt={pageData.hero.logoAlt}
          subtitle={pageData.hero.subtitle}
          onScrollClick={handleScrollToIntro}
        />
      </div>

      {/* Intro Section and rest of content - slides up over hero */}
      <div
        style={{
          marginTop: `${-scrollProgress * 90}vh`,
          transition: 'none',
          position: 'relative',
          zIndex: 20,
        }}
      >
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
      </div>
    </div>
  );
}