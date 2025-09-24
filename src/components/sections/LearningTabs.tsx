'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const LearnOnlineSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Auto-slide functionality for mobile carousel
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) return;

    const interval = setInterval(() => {
      setActiveTab((current) => (current + 1) % tabs.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    {
      id: 'free-teachings',
      label: 'Free teachings',
      tagline: 'FREE TEACHINGS',
      title: 'Start Your Journey with Free Wisdom',
      description: 'Our specially curated collection of free teachings, guided meditations, questions and answers with Shunyamurti, and essays offers an introduction and glimpse into the healing and transformative wisdom of meditation and Self-inquiry.',
      buttonText: 'Browse teachings',
      buttonLink: '/teachings/free',
      image: '/tabimage.png'
    },
    {
      id: 'membership',
      label: 'Membership Section',
      tagline: 'MEMBERSHIP',
      title: 'Access Our Complete Library',
      description: 'Join our membership to access a vast library of teachings, new content published weekly, live satsangs, classes, and meditations. Transform your spiritual practice with unlimited access to Shunyamurti\'s wisdom.',
      buttonText: 'Explore membership',
      buttonLink: '/membership',
      image: '/tabimage2.png'
    },
    {
      id: 'retreats',
      label: 'Online Retreats',
      tagline: 'ONLINE RETREATS',
      title: 'Transform Through Intensive Practice',
      description: 'Experience the power of deep spiritual immersion from anywhere in the world. Our online retreats offer structured programs, live interactions, and transformative practices guided by Shunyamurti.',
      buttonText: 'View retreats',
      buttonLink: '/retreats/online',
      image: '/tabimage3.png'
    },
    {
      id: 'courses',
      label: 'Courses',
      tagline: 'COURSES',
      title: 'Structured Learning Paths',
      description: 'Dive deep into specific aspects of spiritual development through our comprehensive courses. Each course is designed to build understanding and practice systematically.',
      buttonText: 'Browse courses',
      buttonLink: '/courses',
      image: '/tabimage4.png'
    },
    {
      id: 'store',
      label: 'Store',
      tagline: 'STORE',
      title: 'Sacred Resources & Materials',
      description: 'Discover books, audio recordings, meditation tools, and other sacred resources to support your spiritual journey and deepen your practice.',
      buttonText: 'Shop now',
      buttonLink: '/store',
      image: '/tabimage5.png'
    }
  ];

  const currentTab = tabs[activeTab];

  return (
    <section 
      className="relative w-full flex flex-col items-center overflow-hidden"
      style={{
        backgroundColor: '#FAF8F1',
        minHeight: '1362px',
        padding: '64px 16px'
      }}
    >
      {/* Background Decorative Elements */}
      {/* Desktop: Inner Lab Image */}
      <div 
        className="absolute hidden lg:block"
        style={{
          left: '671px',
          top: '-10px',
          width: '97px',
          height: '97px',
          backgroundImage: 'url(/innerlab.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          zIndex: 2
        }}
      />
      
      {/* Mobile: Half Flower Image */}
      <div 
        className="absolute lg:hidden"
        style={{
          left: '50%',
          top: '20px',
          transform: 'translateX(-50%)',
          width: '149.95px',
          height: '72.83px',
          backgroundImage: 'url(/halfflower.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          zIndex: 2,
          opacity: 0.16
        }}
      />

      {/* Header Content */}
      <div 
        className="relative z-10 flex flex-col items-center mb-16"
        style={{
          maxWidth: '648px',
          gap: '16px'
        }}
      >
        {/* Tagline */}
        <div className="py-6 px-6 mb-6">
          <span 
            className="text-yellow-600 uppercase tracking-wide text-sm font-medium"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              color: '#B8860B'
            }}
          >
            LEARN ONLINE
          </span>
        </div>

        {/* Main Heading */}
        <h2 
          className="text-black text-center mb-6"
          style={{
            fontFamily: 'Optima, Georgia, serif',
            fontSize: '48px',
            fontWeight: 550,
            lineHeight: '60px',
            letterSpacing: '-0.02em',
            maxWidth: '648px'
          }}
        >
          Begin on Your Journey with Sat Yoga Online
        </h2>

        {/* Description */}
        <div className="text-center space-y-6">
          <p 
            className="text-gray-700"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '18px',
              fontWeight: 500,
              lineHeight: '28px',
              color: '#384250',
              maxWidth: '648px'
            }}
          >
            We offer a variety of options online to support your spiritual growth and transformation. Wherever you are you can learn at your own pace.
          </p>
          
          <p 
            className="text-gray-700"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '18px',
              fontWeight: 500,
              lineHeight: '28px',
              color: '#384250',
              maxWidth: '648px'
            }}
          >
            Join livestreamed retreats; membership with access to a vast library of teachings and new content published weekly; live satsangs, classes, and meditations; and a rich collection of resources in the store.
          </p>
        </div>
      </div>

      {/* Tab Container - Desktop */}
      <div 
        className="hidden lg:flex relative z-10 flex-col justify-center items-center"
        style={{
          width: '1312px',
          maxWidth: '100%',
          filter: 'drop-shadow(-74px 119px 56px rgba(125, 67, 13, 0.01)) drop-shadow(-42px 67px 47px rgba(125, 67, 13, 0.05)) drop-shadow(-18px 30px 35px rgba(125, 67, 13, 0.09)) drop-shadow(-5px 7px 19px rgba(125, 67, 13, 0.1))'
        }}
      >
        {/* Tab Navigation */}
        <div className="flex w-full">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(index)}
              className={`flex-1 flex flex-col justify-center items-center px-8 py-6 transition-all duration-300 ${
                activeTab === index
                  ? 'bg-white text-gray-900 z-10'
                  : 'bg-[#FAF8F1] text-gray-700 hover:bg-white/50'
              }`}
              style={{
                height: '76px',
                borderRight: index < tabs.length - 1 ? '1px solid #D2D6DB' : 'none',
                borderRadius: index === 0 ? '8px 0px 0px 0px' : index === tabs.length - 1 ? '0px 8px 0px 0px' : '0px',
                borderBottom: activeTab !== index ? '1px solid #D2D6DB' : 'none'
              }}
            >
              <span 
                className={`text-center ${activeTab === index ? 'font-semibold' : 'font-normal'}`}
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  lineHeight: '28px'
                }}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div 
          className="w-full bg-white flex items-center px-12 py-12"
          style={{
            height: '640px',
            border: '1px solid #D2D6DB',
            borderTop: 'none',
            borderRadius: '0px 0px 8px 8px',
            gap: '80px'
          }}
        >
          {/* Content Area */}
          <div 
            className="flex flex-col justify-center items-start flex-1"
            style={{
              maxWidth: '568px',
              gap: '32px'
            }}
          >
            {/* Tagline */}
            <div>
              <span 
                className="text-yellow-600 uppercase tracking-wide text-sm font-medium"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  color: '#B8860B'
                }}
              >
                {currentTab.tagline}
              </span>
            </div>

            {/* Title and Description */}
            <div className="space-y-6">
              <h3 
                className="text-black"
                style={{
                  fontFamily: 'Optima, Georgia, serif',
                  fontSize: '36px',
                  fontWeight: 550,
                  lineHeight: '44px',
                  letterSpacing: '-0.02em'
                }}
              >
                {currentTab.title}
              </h3>
              
              <p 
                className="text-gray-700"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: '#4A5568'
                }}
              >
                {currentTab.description}
              </p>
            </div>

            {/* Action Button */}
            <div>
              <Link
                href={currentTab.buttonLink}
                className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:opacity-90"
                style={{
                  backgroundColor: '#7D1A13',
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                {currentTab.buttonText}
              </Link>
            </div>
          </div>

          {/* Image Area */}
          <div 
            className="relative flex-1 flex items-center justify-center"
            style={{
              maxWidth: '568px',
              height: '544px'
            }}
          >
            {/* Traced Background Image */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: 'url(/imagetraced.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                zIndex: 0
              }}
            />
            
            {/* Tab Content Image */}
            <div 
              className="relative z-10 w-full h-full flex items-center justify-center"
              style={{
                filter: 'drop-shadow(-42.237px 120.5px 50.9329px rgba(0, 0, 0, 0.01)) drop-shadow(-23.603px 67.7035px 43.4793px rgba(0, 0, 0, 0.05)) drop-shadow(-10.5593px 30.4355px 31.6778px rgba(0, 0, 0, 0.09)) drop-shadow(-2.48453px 7.45359px 17.3917px rgba(0, 0, 0, 0.1))'
              }}
            >
              {currentTab.image ? (
                <img
                  src={currentTab.image}
                  alt={currentTab.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src="/tabimage.png"
                  alt={currentTab.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Carousel */}
 {/* Mobile Carousel */}
 <div className="lg:hidden w-full max-w-sm mx-auto">
        <div className="overflow-hidden rounded-xl">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${activeTab * 100}%)`
            }}
          >
            {tabs.map((tab, index) => (
              <div 
                key={tab.id}
                className="w-full flex-shrink-0 bg-white p-8 border border-gray-200"
                style={{ minWidth: '100%' }}
              >
                {/* Mobile Image Area - First */}
                <div 
                  className="relative mb-6 flex items-center justify-center"
                  style={{
                    height: '280px'
                  }}
                >
                  {/* Traced Background Image */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: 'url(/imagetraced.png)',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      zIndex: 0
                    }}
                  />
                  
                  {/* Tab Content Image */}
                  <div 
                    className="relative z-10 w-full h-full flex items-center justify-center"
                    style={{
                      filter: 'drop-shadow(-42.237px 120.5px 50.9329px rgba(0, 0, 0, 0.01)) drop-shadow(-23.603px 67.7035px 43.4793px rgba(0, 0, 0, 0.05)) drop-shadow(-10.5593px 30.4355px 31.6778px rgba(0, 0, 0, 0.09)) drop-shadow(-2.48453px 7.45359px 17.3917px rgba(0, 0, 0, 0.1))'
                    }}
                  >
                    {tab.image ? (
                      <img
                        src={tab.image}
                        alt={tab.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src="/tab1image.png"
                        alt={tab.title}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>

                {/* Tagline */}
                <div className="mb-4">
                  <span 
                    className="text-yellow-600 uppercase tracking-wide text-sm font-medium"
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      color: '#B8860B'
                    }}
                  >
                    {tab.tagline}
                  </span>
                </div>

                {/* Title */}
                <h3 
                  className="text-black mb-4"
                  style={{
                    fontFamily: 'Optima, Georgia, serif',
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    fontWeight: 550,
                    lineHeight: '120%',
                    letterSpacing: '-1%'
                  }}
                >
                  {tab.title}
                </h3>

                {/* Description */}
                <p 
                  className="text-gray-700 mb-6"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    lineHeight: '150%',
                    color: '#4A5568'
                  }}
                >
                  {tab.description}
                </p>

                {/* Action Button */}
                <div className="text-center">
                  <Link
                    href={tab.buttonLink}
                    className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:opacity-90"
                    style={{
                      backgroundColor: '#7D1A13',
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '16px',
                      fontWeight: 600
                    }}
                  >
                    {tab.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Mobile Navigation Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {tabs.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeTab === index ? 'bg-[#7D1A13]' : 'bg-gray-300'
              }`}
              aria-label={`Go to tab ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LearnOnlineSection;