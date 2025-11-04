'use client';

import React, { useState, useEffect, useRef } from 'react';

// TypeScript interfaces for data structure
interface DiscountItem {
  title: string;
  items: string[];
}

type FeatureItem = string | DiscountItem;

interface PricingTierData {
  name: string;
  monthlyPrice: number | null;
  yearlyPrice: number;
  yearlySavings: string;
  description: string;
  trialBadge?: string;
  recommended?: boolean;
  yearlyOnly?: boolean;
  features: FeatureItem[];
  highlightBox?: string;
}

interface PricingPageData {
  monthlyLabel: string;
  yearlyLabel: string;
  yearlySavingsText: string;
  recommendedText: string;
  includesLabel: string;
  startTrialButton: string;
  signUpButton: string;
  moreDetailsButton: string;
  billedAnnuallyText: string;
  billedMonthlyText: string;
  tiers: {
    gyani: PricingTierData;
    pragyani: PricingTierData;
    pragyaniPlus: PricingTierData;
  };
}

// Externalized data structure - ready for Strapi CMS
const pricingPageData: PricingPageData = {
  monthlyLabel: 'Monthly',
  yearlyLabel: 'Yearly',
  yearlySavingsText: '(save 25%)',
  recommendedText: 'Most recommended',
  includesLabel: 'Includes:',
  startTrialButton: 'Start free trial',
  signUpButton: 'Sign up',
  moreDetailsButton: 'More details',
  billedAnnuallyText: 'Billed Annually',
  billedMonthlyText: 'Billed Monthly',
  tiers: {
    gyani: {
      name: 'Gyani',
      monthlyPrice: 20,
      yearlyPrice: 15,
      yearlySavings: '60$',
      description: 'Open the Gate! Access weekly teachings, guided meditations, and meaningful connection with our global community.',
      trialBadge: '10 days  Gyani free trial',
      features: [
        'Your personal dashboard, seamlessly responsive across all devices',
        'Exclusive Wisdom Library with 1,000+ publications',
        'New Weekly Teachings',
        'Shunyamurti Book Study',
        'Shunyamurti Recommendations to Deepen Your Knowledge',
        'Community Forum',
        'Live Sunday Group Meditation',
        {
          title: 'Exclusive Gyani Discounts',
          items: ['5% off Onsite Retreats', '10% off all Digital Products']
        }
      ]
    },
    pragyani: {
      name: 'Pragyani',
      monthlyPrice: 100,
      yearlyPrice: 83,
      yearlySavings: '200$',
      recommended: true,
      description: 'Virtual Ashram Experience: Join live satsangs with Shunyamurti, participate in study groups, and engage deeply with a living path of wisdom.',
      features: [
        'Your personal dashboard, seamlessly responsive across all devices',
        'Exclusive Wisdom Library with 1,000+ publications',
        'New Weekly Teachings',
        'Shunyamurti Book Study',
        'Shunyamurti Recommendations to Deepen Your Knowledge',
        'Community Forum',
        'Live Sunday Group Meditation',
        'Live Surprise Satsangs with Shunyamurti',
        'Live Sunday Study Group with Radha Ma',
        'Live Monthly Teaching Discussions',
        'Book Groups',
        'Pragyani Exclusive Teachings',
        'Study Group Review',
        'Ask Shunyamurti',
        'Your Questions Prioritized during ALL live events with Shunyamurti',
        {
          title: 'Exclusive Pragyani Discounts',
          items: ['30% off all Digital Products', '10% off Onsite Retreats']
        }
      ]
    },
    pragyaniPlus: {
      name: 'Pragyani+',
      monthlyPrice: null,
      yearlyPrice: 142,
      yearlySavings: '1170$',
      yearlyOnly: true,
      description: 'Activate the Full Transmission: Lifetime access to all online retreats and direct guidance from Shunyamurti on the journey to Self-realization.',
      features: [
        'Custom dashboard available on your phone, tablet and desktop',
        'Exclusive Wisdom Library with 1,000+ publications',
        'New Weekly Teachings',
        'Shunyamurti Book Study',
        'Shunyamurti Recommendations to Deepen Your Knowledge',
        'Community Forum',
        'Live Sunday Group Meditation',
        'Live Surprise Satsangs with Shunyamurti',
        'Live Sunday Study Group with Radha Ma',
        'Live Monthly Teaching Discussions',
        'Book Groups',
        'Pragyani Exclusive Teachings',
        'Study Group Review',
        'Ask Shunyamurti',
        'Your Questions Prioritized during ALL live events with Shunyamurti',
        {
          title: 'Exclusive Pragyani Discounts',
          items: ['30% off all Digital Products', '10% off Onsite Retreats']
        }
      ],
      highlightBox: 'Lifetime VIP Access to All Online Retreats led by Shunyamurti (Valued at $1,970 per year)'
    }
  }
};

interface PricingComparisonProps {
  data?: PricingPageData;
}

export default function PricingComparison({ data = pricingPageData }: PricingComparisonProps) {
  const [isYearly, setIsYearly] = useState<boolean>(true);
  const [currentSlide, setCurrentSlide] = useState<number>(1); // Start at pragyani (most recommended)
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const tiers = [
    { key: 'gyani', data: data.tiers.gyani },
    { key: 'pragyani', data: data.tiers.pragyani },
    { key: 'pragyaniPlus', data: data.tiers.pragyaniPlus }
  ];

  // Auto-slide effect for mobile
  useEffect(() => {
    const autoSlide = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % tiers.length);
    }, 5000); // 5 seconds

    return () => clearInterval(autoSlide);
  }, [tiers.length]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swipe left
      setCurrentSlide((prev) => (prev + 1) % tiers.length);
    }

    if (touchStart - touchEnd < -75) {
      // Swipe right
      setCurrentSlide((prev) => (prev - 1 + tiers.length) % tiers.length);
    }
  };

  const renderFeatures = (features: FeatureItem[]): JSX.Element[] => {
    return features.map((feature, index) => {
      if (typeof feature === 'string') {
        return (
          <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '8px 0' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path
                d="M9 11l3 3L22 4"
                stroke="#000000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '20px',
                fontWeight: 400,
                lineHeight: '30px',
                color: '#414651',
                flex: 1
              }}
            >
              {feature}
            </span>
          </div>
        );
      } else {
        return (
          <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '8px 0' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path
                d="M9 11l3 3L22 4"
                stroke="#000000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '20px',
                  fontWeight: 400,
                  lineHeight: '30px',
                  color: '#414651',
                  margin: 0
                }}
              >
                {feature.title}
              </p>
              {feature.items.map((item, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '20px',
                    fontWeight: 400,
                    lineHeight: '30px',
                    color: '#414651',
                    margin: 0
                  }}
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
        );
      }
    });
  };

  const PricingCard = ({ tier, tierData }: { tier: string; tierData: PricingTierData }) => {
    const isDisabled = !isYearly && tierData.yearlyOnly;
    const displayPrice = isYearly ? tierData.yearlyPrice : tierData.monthlyPrice;

    // Split description to bold only the title part
    const descriptionParts = tierData.description.split(':');
    const hasTitle = descriptionParts.length > 1;

    return (
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #D2D6DB',
          borderRadius: '8px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          opacity: isDisabled ? 0.4 : 1,
          pointerEvents: isDisabled ? 'none' : 'auto'
        }}
      >
        {/* Trial Badge - positioned outside card */}
        {tierData.trialBadge && (
          <div
            style={{
              position: 'absolute',
              top: '-14px',
              left: '18px',
              background: '#FFFFFF',
              border: '1px solid #D5D7DA',
              boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05)',
              borderRadius: '8px',
              padding: '4px 10px'
            }}
          >
            <span
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '20px',
                color: '#414651'
              }}
            >
              {tierData.trialBadge}
            </span>
          </div>
        )}

        <div style={{ padding: '42px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Price Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '20px',
                fontWeight: 600,
                lineHeight: '30px',
                color: '#942017',
                marginBottom: '8px',
                margin: 0
              }}
            >
              {tierData.name}
            </h3>
            <div
              style={{
                fontFamily: 'Optima, serif',
                fontSize: '60px',
                fontWeight: 700,
                lineHeight: '72px',
                letterSpacing: '-0.02em',
                color: '#000000',
                marginTop: '8px',
                marginBottom: '8px'
              }}
            >
              ${displayPrice}/mo
            </div>
            <p
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '20px',
                color: '#414651',
                margin: 0
              }}
            >
              {isYearly
                ? `${data.billedAnnuallyText} (Save ${tierData.yearlySavings})`
                : data.billedMonthlyText}
            </p>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #CBCBCB', marginBottom: '32px' }} />

          {/* Description */}
          <div
            style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: '#000000',
              marginBottom: '32px'
            }}
          >
            {hasTitle ? (
              <>
                <span style={{ fontWeight: 700 }}>{descriptionParts[0]}:</span>
                <span style={{ fontWeight: 400 }}>{descriptionParts.slice(1).join(':')}</span>
              </>
            ) : (
              <span style={{ fontWeight: 700 }}>{tierData.description}</span>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #CBCBCB', marginBottom: '32px' }} />

          {/* Features Section - this will grow to push buttons down */}
          <div style={{ marginBottom: '32px', flexGrow: 1 }}>
            <h4
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '20px',
                fontWeight: 600,
                lineHeight: '30px',
                color: '#000000',
                marginBottom: '16px',
                margin: 0
              }}
            >
              {data.includesLabel}
            </h4>
            <div style={{ marginTop: '16px' }}>{renderFeatures(tierData.features)}</div>
          </div>

          {/* Highlight Box for Pragyani+ */}
          {tierData.highlightBox && (
            <div
              style={{
                background: '#F9F4E6',
                border: '1px solid #D4C599',
                borderRadius: '4px',
                padding: '8px 16px',
                marginBottom: '32px'
              }}
            >
              <p
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '20px',
                  fontWeight: 500,
                  lineHeight: '30px',
                  color: '#9C7E27',
                  margin: 0
                }}
              >
                {tierData.highlightBox}
              </p>
            </div>
          )}

          {/* Buttons - anchored at bottom */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto' }}>
            <button
              disabled
              style={{
                background: '#9CA3AF',
                color: '#D1D5DB',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 16px',
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '24px',
                height: '44px',
                boxShadow:
                  '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
                cursor: 'not-allowed',
                opacity: 0.6
              }}
            >
              {tier === 'gyani' ? data.startTrialButton : data.signUpButton}
            </button>
            <a
              href="/contact?queryType=membership"
              style={{
                background: '#FFFFFF',
                color: '#414651',
                border: '1px solid #D5D7DA',
                borderRadius: '8px',
                padding: '10px 16px',
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '24px',
                height: '44px',
                boxShadow:
                  '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {data.moreDetailsButton}
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#FAF8F1', padding: '80px 16px' }}>
      <div style={{ maxWidth: '1312px', margin: '0 auto' }}>
        {/* Toggle Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '80px' }}>
          <div
            style={{
              display: 'inline-flex',
              border: '1px solid #D5D7DA',
              borderRadius: '8px',
              boxShadow:
                'inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05), 0px 1px 2px rgba(16, 24, 40, 0.05)',
              overflow: 'hidden'
            }}
          >
            <button
              onClick={() => setIsYearly(false)}
              style={{
                padding: '8px 16px',
                height: '40px',
                minHeight: '40px',
                background: !isYearly ? '#7D1A13' : '#FFFFFF',
                color: !isYearly ? '#FFFFFF' : '#414651',
                border: 'none',
                borderRight: '1px solid #D5D7DA',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: '20px',
                cursor: 'pointer'
              }}
            >
              {data.monthlyLabel}
            </button>
            <button
              onClick={() => setIsYearly(true)}
              style={{
                padding: '8px 16px',
                height: '40px',
                minHeight: '40px',
                background: isYearly ? '#7D1A13' : '#FFFFFF',
                color: isYearly ? '#FFFFFF' : '#414651',
                border: 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: '20px',
                cursor: 'pointer'
              }}
            >
              {data.yearlyLabel}{' '}
              <span style={{ fontSize: '12px' }}>{data.yearlySavingsText}</span>
            </button>
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden lg:grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', alignItems: 'stretch' }}>
          <PricingCard tier="gyani" tierData={data.tiers.gyani} />

          <div style={{ position: 'relative' }}>
            {/* Most Recommended Label with Curved Arrow */}
            <div
              style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '4px',
                zIndex: 100
              }}
            >
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <path
                  d="M52 8 Q45 5, 38 8 T25 25 Q20 35, 18 50"
                  stroke="#7D1A13"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M18 50 L14 44 M18 50 L23 46"
                  stroke="#7D1A13"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#7D1A13',
                  whiteSpace: 'nowrap',
                  marginTop: '0px'
                }}
              >
                {data.recommendedText}
              </span>
            </div>
            <PricingCard tier="pragyani" tierData={data.tiers.pragyani} />
          </div>

          <PricingCard tier="pragyaniPlus" tierData={data.tiers.pragyaniPlus} />
        </div>

        {/* Mobile: Carousel */}
        <div className="lg:hidden" style={{ position: 'relative' }}>
          {/* Most Recommended Arrow - shown only on pragyani slide */}
          {currentSlide === 1 && (
            <div
              style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '4px',
                zIndex: 100
              }}
            >
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <path
                  d="M52 8 Q45 5, 38 8 T25 25 Q20 35, 18 50"
                  stroke="#7D1A13"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M18 50 L14 44 M18 50 L23 46"
                  stroke="#7D1A13"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#7D1A13',
                  whiteSpace: 'nowrap',
                  marginTop: '0px'
                }}
              >
                {data.recommendedText}
              </span>
            </div>
          )}

          {/* Carousel Container */}
          <div
            ref={carouselRef}
            style={{
              overflow: 'hidden',
              width: '100%'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              style={{
                display: 'flex',
                transform: `translateX(-${currentSlide * 100}%)`,
                transition: 'transform 0.5s ease-in-out'
              }}
            >
              {tiers.map((tier, index) => (
                <div
                  key={tier.key}
                  style={{
                    minWidth: '100%',
                    width: '100%',
                    flexShrink: 0,
                    boxSizing: 'border-box'
                  }}
                >
                  <PricingCard tier={tier.key} tierData={tier.data} />
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '24px'
            }}
          >
            {tiers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  background: currentSlide === index ? '#7D1A13' : '#D5D7DA',
                  cursor: 'pointer',
                  padding: 0
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}