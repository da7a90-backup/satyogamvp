'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StandardHeroSection from '@/components/shared/Hero';
import TwoPaneComponent from '@/components/shared/TwoPaneComponent';
import QuoteSection from '@/components/shared/Quote';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

// ============================================================================
// TYPES FOR PAGE DATA
// ============================================================================

interface PageData {
  hero?: {
    heading: string;
    tagline: string;
    description: string;
    backgroundImage: string;
  };
  givingFromHeart?: {
    eyebrow: string;
    heading: string;
    description: string;
    gap: string;
    accordionItems: Array<{
      id: number;
      title: string;
      content: string;
    }>;
  };
  generalFund?: {
    eyebrow: string;
    heading: string;
    description: string;
    content: {
      presetAmounts: number[];
      suggestedText: string;
      orText: string;
      supportingText: string;
      donationTypes: string[];
    };
  };
  quote?: {
    quote: string;
  };
}

// ============================================================================
// TYPES
// ============================================================================

interface DonationProject {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
}

interface HeroData {
  heroBackground: string;
}

// ============================================================================
// COMPONENTS
// ============================================================================

// Tabbed Projects Section
const DonationProjectsSection = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [donationAmount, setDonationAmount] = useState('45.00');
  const [donationProjects, setDonationProjects] = useState<DonationProject[]>([]);
  const [loading, setLoading] = useState(true);

  const nextSlide = () => {
    setActiveTab((prev) => (prev + 1) % donationProjects.length);
  };

  const prevSlide = () => {
    setActiveTab((prev) => (prev - 1 + donationProjects.length) % donationProjects.length);
  };

  useEffect(() => {
    fetch(`${FASTAPI_URL}/api/donations/projects`)
      .then(res => res.json())
      .then(data => {
        setDonationProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load donation projects:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-[#FAF8F1] py-20 px-4 lg:px-16">
        <div className="max-w-[1312px] mx-auto flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#942017]"></div>
        </div>
      </section>
    );
  }

  if (!donationProjects.length) {
    return null;
  }

  const activeProject = donationProjects[activeTab];

  const handleAccept = () => {
    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    // Navigate to checkout page with donation details
    const params = new URLSearchParams({
      amount: amount.toString(),
      category: activeProject.id,
      projectName: activeProject.name
    });
    router.push(`/donate/checkout?${params.toString()}`);
  };

  return (
    <section className="w-full bg-[#FAF8F1] py-20 px-4 lg:px-16">
      <div className="max-w-[1312px] mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <span
            className="uppercase tracking-wider text-[#9C7520] font-semibold text-sm"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            A NEW AGE OF BEAUTY, TRUTH, AND DIVINE LOVE IS BEING BORN
          </span>
          <h2
            className="text-center"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 550,
              lineHeight: '125%',
              letterSpacing: '-0.02em'
            }}
          >
            Many Projects, One Vision
          </h2>
          <p
            className="text-center text-gray-700 max-w-[1292px]"
            style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', lineHeight: '24px' }}
          >
            We are building a sustainable spiritual refuge—here at the ashram and across the world—offering transmissions of wisdom and love to souls ready to awaken their highest potential.
            <br />
            <br />
            Each project below serves this vision: to sustain and expand our sacred work, to nurture this sanctuary, and to radiate light into a world in need. Your generosity makes it possible.
          </p>
        </div>

        {/* Tabs - Desktop */}
        <div className="hidden lg:block border-b border-gray-200 mb-8">
          <div className="flex gap-3">
            {donationProjects.map((project, index) => (
              <button
                key={project.id}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === index
                    ? 'border-[#7D1A13] text-[#7D1A13]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs - Mobile with Carousel */}
        <div className="lg:hidden relative mb-8">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${activeTab * 100}%)`
              }}
            >
              {donationProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="w-full flex-shrink-0 flex justify-center"
                  style={{ minWidth: '100%' }}
                >
                  <span
                    className="px-4 py-3 font-semibold text-sm text-[#7D1A13]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {project.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {donationProjects.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 bg-white bg-opacity-90 rounded-full p-2 shadow-lg hover:bg-opacity-100 transition-all duration-200 z-10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 bg-white bg-opacity-90 rounded-full p-2 shadow-lg hover:bg-opacity-100 transition-all duration-200 z-10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {donationProjects.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {donationProjects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    activeTab === index ? 'w-6' : 'w-2 hover:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: activeTab === index ? '#7D1A13' : '#9CA3AF'
                  }}
                  aria-label={`Go to tab ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Project Content Card */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Image */}
            <div
              className="w-full lg:w-1/2 h-[300px] lg:h-[640px] bg-gray-200"
              style={{
                backgroundImage: `url(${activeProject.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />

            {/* Content */}
            <div className="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center gap-6 lg:gap-8">
              <div className="flex flex-col gap-4 lg:gap-6">
                <h3
                  className="font-bold"
                  style={{
                    fontFamily: 'Optima, Georgia, serif',
                    fontSize: 'clamp(28px, 4vw, 48px)',
                    lineHeight: '125%'
                  }}
                >
                  {activeProject.title}
                </h3>
                <p
                  className="text-gray-700 leading-relaxed"
                  style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', lineHeight: '24px' }}
                >
                  {activeProject.description}
                </p>
              </div>

              {/* Donation Amount Input */}
              <div className="flex flex-col gap-3">
                <label
                  className="font-bold text-base lg:text-lg"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  Insert amount
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Currency + Amount Input */}
                  <div className="flex-1 flex border border-gray-300 rounded-lg overflow-hidden">
                    <select
                      className="px-3 lg:px-4 py-2 lg:py-3 border-r border-gray-300 bg-white focus:outline-none text-sm lg:text-base"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <option value="USD">USD</option>
                    </select>
                    <input
                      type="text"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="$45.00"
                      className="flex-1 px-3 lg:px-4 py-2 lg:py-3 focus:outline-none text-sm lg:text-base"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>

                  {/* Accept Button */}
                  <button
                    onClick={handleAccept}
                    className="px-6 py-2 lg:py-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 shadow-sm text-sm lg:text-base"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// General Fund Donation Section
const GeneralFundSection = ({ data }: { data?: PageData['generalFund'] }) => {
  const router = useRouter();
  const [donationAmount, setDonationAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [donationType, setDonationType] = useState('one-time');

  if (!data) return null;

  const presetAmounts = data.content.presetAmounts || [25, 77, 108, 250, 500, 1000];

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    setDonationAmount(amount.toString());
  };

  const handleAccept = () => {
    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    // Navigate to checkout page with donation details
    const params = new URLSearchParams({
      amount: amount.toString(),
      category: 'general-fund',
      projectName: 'General Fund'
    });
    router.push(`/donate/checkout?${params.toString()}`);
  };

  return (
    <section className="w-full bg-[#FAF8F1] py-12 lg:py-20 px-4 lg:px-16">
      <div className="max-w-[1312px] mx-auto">
        {/* Card */}
        <div className="bg-white border border-gray-300 rounded-lg p-6 lg:p-12 shadow-lg">
          <div className="max-w-[836px] mx-auto flex flex-col items-center gap-6 lg:gap-8">
            {/* Header */}
            <div className="flex flex-col gap-3 text-center">
              <span
                className="text-[#942017] font-bold text-sm lg:text-base"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {data.eyebrow}
              </span>
              <h2
                className="font-medium"
                style={{
                  fontFamily: 'Optima, Georgia, serif',
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  lineHeight: '125%',
                  letterSpacing: '-0.02em'
                }}
              >
                {data.heading}
              </h2>
              <p
                className="text-gray-700 max-w-[836px]"
                style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', lineHeight: '24px' }}
              >
                {data.description}
              </p>
            </div>

            {/* Donation Form */}
            <div className="w-full max-w-[800px] flex flex-col gap-6">
              {/* Suggested Amounts Label */}
              <p
                className="text-center text-gray-700"
                style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px' }}
              >
                {data.content.suggestedText}
              </p>

              {/* Preset Amount Buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handlePresetClick(amount)}
                    className={`px-6 py-2 rounded-lg font-semibold border transition-colors ${
                      selectedPreset === amount
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px' }}
                  >
                    ${amount.toFixed(2)}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-300" />
                <span
                  className="text-gray-700"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
                >
                  {data.content.orText}
                </span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              {/* Supporting Text */}
              <p
                className="text-center text-gray-700"
                style={{ fontFamily: 'Avenir Next, sans-serif', fontSize: '16px', lineHeight: '24px' }}
              >
                {data.content.supportingText}
              </p>

              {/* Custom Amount Input */}
              <div className="flex flex-col lg:flex-row gap-2">
                {/* Currency + Amount Input */}
                <div className="flex-1 flex border border-gray-300 rounded-lg overflow-hidden">
                  <select
                    className="px-3 lg:px-4 py-2 lg:py-3 border-r border-gray-300 bg-white focus:outline-none text-sm lg:text-base"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="USD">USD</option>
                  </select>
                  <input
                    type="text"
                    value={donationAmount}
                    onChange={(e) => {
                      setDonationAmount(e.target.value);
                      setSelectedPreset(null);
                    }}
                    placeholder="Type your amount"
                    className="flex-1 px-3 lg:px-4 py-2 lg:py-3 focus:outline-none text-sm lg:text-base"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {/* Donation Type Selector */}
                <select
                  value={donationType}
                  onChange={(e) => setDonationType(e.target.value)}
                  className="px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg bg-white focus:outline-none text-sm lg:text-base"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {data.content.donationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === 'one-time' ? 'One time' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Accept Button */}
                <button
                  onClick={handleAccept}
                  className="px-6 py-2 lg:py-3 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 shadow-sm text-sm lg:text-base whitespace-nowrap"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Main Donate Page Component
const DonatePage = () => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all page content from the backend
    fetch(`${FASTAPI_URL}/api/pages/donate`)
      .then(res => res.json())
      .then(data => {
        setPageData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load donate page content:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="w-full flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#942017]"></div>
      </main>
    );
  }

  if (!pageData) {
    return (
      <main className="w-full flex justify-center items-center min-h-screen">
        <div className="text-center text-gray-700">Failed to load page content</div>
      </main>
    );
  }

  return (
    <main className="w-full">
      {/* Hero Section */}
      {pageData.hero && (
        <StandardHeroSection
          data={{
            tagline: pageData.hero.tagline,
            heading: pageData.hero.heading,
            subtext: pageData.hero.description,
            background: pageData.hero.backgroundImage
          }}
        />
      )}

      {/* Giving from the Heart Section */}
      {pageData.givingFromHeart && (
        <TwoPaneComponent
          data={{
            backgroundColor: '#FAF8F1',
            leftPane: {
              tagline: pageData.givingFromHeart.eyebrow,
              taglineColor: '#9C7520',
              title: pageData.givingFromHeart.heading,
              description: pageData.givingFromHeart.description
            },
            rightPane: {
              type: 'bulletaccordion',
              content: pageData.givingFromHeart.accordionItems,
              gap: pageData.givingFromHeart.gap
            }
          }}
        />
      )}

      {/* Donation Projects Section */}
      <DonationProjectsSection />

      {/* General Fund Section */}
      {pageData.generalFund && <GeneralFundSection data={pageData.generalFund} />}

      {/* Quote Section */}
      {pageData.quote && <QuoteSection data={pageData.quote.quote} />}
    </main>
  );
};

export default DonatePage;
