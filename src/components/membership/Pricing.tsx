'use client';

import React, { useState, useEffect, useRef } from 'react';

// TypeScript interfaces for backend API response
interface BackendFeature {
  type: string;
  title: string | null;
  content: string;
  discountItems?: { itemText: string }[];
}

interface BackendTier {
  name: string;
  slug: string;
  monthlyPrice: number | null;
  yearlyPrice: number;
  yearlySavings: string;
  description: string;
  trialBadge?: string;
  recommended?: boolean;
  yearlyOnly?: boolean;
  highlightBox?: string;
  features: BackendFeature[];
}

// Frontend interfaces for component usage
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

// Default UI labels (static, unlikely to change)
const defaultLabels = {
  monthlyLabel: 'Monthly',
  yearlyLabel: 'Yearly',
  yearlySavingsText: '(save 25%)',
  recommendedText: 'Most recommended',
  includesLabel: 'Includes:',
  startTrialButton: 'Start free trial',
  signUpButton: 'Sign up',
  moreDetailsButton: 'More details',
  billedAnnuallyText: 'Billed Annually',
  billedMonthlyText: 'Billed Monthly'
};

// Helper function to transform backend data to frontend format
function transformBackendTier(backendTier: BackendTier): PricingTierData {
  const features: FeatureItem[] = [];

  for (const feature of backendTier.features) {
    if (feature.type === 'discount' && feature.discountItems && feature.discountItems.length > 0) {
      features.push({
        title: feature.title || 'Discounts',
        items: feature.discountItems.map(item => item.itemText)
      });
    } else if ((feature.type === 'standard' || !feature.type) && feature.content) {
      // Include features with type 'standard' OR null/empty type
      features.push(feature.content);
    }
  }

  return {
    name: backendTier.name,
    monthlyPrice: backendTier.monthlyPrice,
    yearlyPrice: backendTier.yearlyPrice,
    yearlySavings: backendTier.yearlySavings,
    description: backendTier.description,
    trialBadge: backendTier.trialBadge,
    recommended: backendTier.recommended,
    yearlyOnly: backendTier.yearlyOnly,
    features,
    highlightBox: backendTier.highlightBox
  };
}

interface PricingComparisonProps {}

export default function PricingComparison({}: PricingComparisonProps) {
  const [pricingData, setPricingData] = useState<PricingPageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState<boolean>(true);
  const [currentSlide, setCurrentSlide] = useState<number>(1); // Start at pragyani (most recommended)
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Add keyframe animation styles
  useEffect(() => {
    const styleId = 'gold-glimmer-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes goldGlimmer {
          0%, 100% {
            box-shadow:
              0 0 20px rgba(255, 215, 0, 0.6),
              0 0 40px rgba(212, 175, 55, 0.4),
              0 0 60px rgba(255, 215, 0, 0.3),
              inset 0 0 20px rgba(255, 215, 0, 0.2);
          }
          50% {
            box-shadow:
              0 0 30px rgba(255, 215, 0, 0.8),
              0 0 60px rgba(212, 175, 55, 0.6),
              0 0 90px rgba(255, 215, 0, 0.4),
              inset 0 0 30px rgba(255, 215, 0, 0.3);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          20% {
            opacity: 1;
            transform: scale(1.2);
          }
          40% {
            opacity: 0.6;
            transform: scale(0.8);
          }
          60% {
            opacity: 1;
            transform: scale(1);
          }
          80% {
            opacity: 0.4;
            transform: scale(0.9);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Fetch pricing data from backend API
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/api/membership/pricing`, {
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch pricing: ${response.statusText}`);
        }

        const backendTiers: BackendTier[] = await response.json();

        // Transform backend data to frontend format
        const transformedData: PricingPageData = {
          ...defaultLabels,
          tiers: {
            gyani: transformBackendTier(backendTiers.find(t => t.slug === 'gyani')!),
            pragyani: transformBackendTier(backendTiers.find(t => t.slug === 'pragyani')!),
            pragyaniPlus: transformBackendTier(backendTiers.find(t => t.slug === 'pragyani-plus')!)
          }
        };

        setPricingData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching pricing data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pricing data');
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  const tiers = pricingData ? [
    { key: 'gyani', data: pricingData.tiers.gyani },
    { key: 'pragyani', data: pricingData.tiers.pragyani },
    { key: 'pragyaniPlus', data: pricingData.tiers.pragyaniPlus }
  ] : [];

  // Auto-slide removed - user controls navigation

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % tiers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + tiers.length) % tiers.length);
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
              className="text-base lg:text-xl"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontWeight: 400,
                lineHeight: '150%',
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
                className="text-base lg:text-xl"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontWeight: 400,
                  lineHeight: '150%',
                  color: '#414651',
                  margin: 0
                }}
              >
                {feature.title}
              </p>
              {feature.items.map((item, i) => (
                <p
                  key={i}
                  className="text-base lg:text-xl"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontWeight: 400,
                    lineHeight: '150%',
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
              className="text-lg lg:text-xl"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontWeight: 600,
                lineHeight: '150%',
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
                background: 'linear-gradient(135deg, #FFE9A0 0%, #F4D76F 25%, #FFE9A0 50%, #F4D76F 75%, #FFE9A0 100%)',
                border: '2px solid #D4AF37',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden',
                animation: 'goldGlimmer 2s ease-in-out infinite'
              }}
            >
              {/* Shimmer overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '50%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
                  animation: 'shimmer 2.5s linear infinite',
                  pointerEvents: 'none',
                  zIndex: 2
                }}
              />

              {/* Star sparkles */}
              {/* Star 1 - Large */}
              <div
                style={{
                  position: 'absolute',
                  top: '15%',
                  left: '8%',
                  animation: 'sparkle 2s ease-in-out infinite',
                  pointerEvents: 'none',
                  zIndex: 2
                }}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 0L17.5 14.5L32 16L17.5 17.5L16 32L14.5 17.5L0 16L14.5 14.5L16 0Z" fill="white" opacity="0.95" filter="drop-shadow(0 0 6px rgba(255, 255, 255, 0.9))" />
                </svg>
              </div>

              {/* Star 2 - Medium */}
              <div
                style={{
                  position: 'absolute',
                  top: '22%',
                  left: '72%',
                  animation: 'twinkle 1.8s ease-in-out infinite 0.3s',
                  pointerEvents: 'none',
                  zIndex: 2
                }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 0L15.2 12.8L28 14L15.2 15.2L14 28L12.8 15.2L0 14L12.8 12.8L14 0Z" fill="white" opacity="0.9" filter="drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))" />
                </svg>
              </div>

              {/* Star 3 - Medium */}
              <div
                style={{
                  position: 'absolute',
                  top: '62%',
                  left: '18%',
                  animation: 'sparkle 2.2s ease-in-out infinite 0.6s',
                  pointerEvents: 'none',
                  zIndex: 2
                }}
              >
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <path d="M13 0L14.1 11.9L26 13L14.1 14.1L13 26L11.9 14.1L0 13L11.9 11.9L13 0Z" fill="white" opacity="0.85" filter="drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))" />
                </svg>
              </div>

              {/* Star 4 - Large */}
              <div
                style={{
                  position: 'absolute',
                  top: '68%',
                  left: '68%',
                  animation: 'twinkle 2.5s ease-in-out infinite 1s',
                  pointerEvents: 'none',
                  zIndex: 2
                }}
              >
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                  <path d="M15 0L16.3 13.7L30 15L16.3 16.3L15 30L13.7 16.3L0 15L13.7 13.7L15 0Z" fill="white" opacity="0.9" filter="drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))" />
                </svg>
              </div>

              {/* Star 5 - Small accent */}
              <div
                style={{
                  position: 'absolute',
                  top: '38%',
                  left: '86%',
                  animation: 'sparkle 1.6s ease-in-out infinite 0.8s',
                  pointerEvents: 'none',
                  zIndex: 2
                }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 0L11.8 10.2L22 11L11.8 11.8L11 22L10.2 11.8L0 11L10.2 10.2L11 0Z" fill="white" opacity="0.8" filter="drop-shadow(0 0 4px rgba(255, 255, 255, 0.6))" />
                </svg>
              </div>

              {/* Star 6 - Medium accent */}
              <div
                style={{
                  position: 'absolute',
                  top: '42%',
                  left: '42%',
                  animation: 'twinkle 2.3s ease-in-out infinite 0.4s',
                  pointerEvents: 'none',
                  zIndex: 2
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 0L12.9 11.1L24 12L12.9 12.9L12 24L11.1 12.9L0 12L11.1 11.1L12 0Z" fill="white" opacity="0.85" filter="drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))" />
                </svg>
              </div>

              <p
                className="text-base lg:text-xl"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontWeight: 600,
                  lineHeight: '150%',
                  color: '#8B6914',
                  margin: 0,
                  position: 'relative',
                  zIndex: 3,
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)'
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

  // Show loading state
  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '20px', color: '#414651' }}>
          Loading pricing information...
        </p>
      </div>
    );
  }

  // Show error state
  if (error || !pricingData) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '20px', color: '#ef4444', marginBottom: '16px' }}>
          Error loading pricing data
        </p>
        <p style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', color: '#414651' }}>
          {error || 'Please try again later or contact support.'}
        </p>
      </div>
    );
  }

  // At this point, pricingData is guaranteed to be non-null
  const data = pricingData;

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

          {/* Navigation Arrows */}
          {tiers.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 bg-white bg-opacity-90 rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all duration-200 z-10"
                style={{ zIndex: 50 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 bg-white bg-opacity-90 rounded-full p-3 shadow-lg hover:bg-opacity-100 transition-all duration-200 z-10"
                style={{ zIndex: 50 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}

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