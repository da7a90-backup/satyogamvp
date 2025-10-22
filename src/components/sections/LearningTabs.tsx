'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tab {
  id: string;
  label: string;
  tagline: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

interface BackgroundDecorations {
  innerLab: string;
  halfFlower: string;
  imageTraced: string;
}

interface LearnOnlineSectionProps {
  eyebrow: string;
  heading: string;
  description: string[];
  tabs: Tab[];
  backgroundDecorations: BackgroundDecorations;
}

const LearnOnlineSection = ({
  eyebrow,
  heading,
  description,
  tabs,
  backgroundDecorations
}: LearnOnlineSectionProps) => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) return;

    const interval = setInterval(() => {
      setActiveTab((current) => (current + 1) % tabs.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [tabs.length]);

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
      <div 
        className="absolute hidden lg:block"
        style={{
          left: '671px',
          top: '-10px',
          width: '97px',
          height: '97px',
          backgroundImage: `url(${backgroundDecorations.innerLab})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          zIndex: 2
        }}
      />
      
      <div 
        className="absolute lg:hidden"
        style={{
          left: '50%',
          top: '20px',
          transform: 'translateX(-50%)',
          width: '149.95px',
          height: '72.83px',
          backgroundImage: `url(${backgroundDecorations.halfFlower})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          zIndex: 2,
          opacity: 0.16
        }}
      />

      <div 
        className="relative z-10 flex flex-col items-center mb-16"
        style={{
          maxWidth: '648px',
          gap: '16px'
        }}
      >
        <div className="py-6 px-6 mb-6">
          <span 
            className="text-yellow-600 uppercase tracking-wide text-sm font-medium"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              color: '#B8860B'
            }}
          >
            {eyebrow}
          </span>
        </div>

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
          {heading}
        </h2>

        <div className="text-center space-y-6">
          {description.map((paragraph, index) => (
            <p 
              key={index}
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
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Desktop Tabs */}
      <div 
        className="hidden lg:flex relative z-10 flex-col justify-center items-center"
        style={{
          width: '1312px',
          maxWidth: '100%',
          filter: 'drop-shadow(-74px 119px 56px rgba(125, 67, 13, 0.01)) drop-shadow(-42px 67px 47px rgba(125, 67, 13, 0.05)) drop-shadow(-18px 30px 35px rgba(125, 67, 13, 0.09)) drop-shadow(-5px 7px 19px rgba(125, 67, 13, 0.1))'
        }}
      >
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
          <div 
            className="flex flex-col justify-center items-start flex-1"
            style={{
              maxWidth: '568px',
              gap: '32px'
            }}
          >
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

          <div 
            className="relative flex-1 flex items-center justify-center"
            style={{
              maxWidth: '568px',
              height: '544px'
            }}
          >
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${backgroundDecorations.imageTraced})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                zIndex: 0
              }}
            />
            
            <div 
              className="relative z-10 w-full h-full flex items-center justify-center"
              style={{
                filter: 'drop-shadow(-42.237px 120.5px 50.9329px rgba(0, 0, 0, 0.01)) drop-shadow(-23.603px 67.7035px 43.4793px rgba(0, 0, 0, 0.05)) drop-shadow(-10.5593px 30.4355px 31.6778px rgba(0, 0, 0, 0.09)) drop-shadow(-2.48453px 7.45359px 17.3917px rgba(0, 0, 0, 0.1))'
              }}
            >
              <img
                src={currentTab.image}
                alt={currentTab.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Carousel */}
      <div className="lg:hidden w-full max-w-sm mx-auto">
        <div className="overflow-hidden rounded-xl">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${activeTab * 100}%)`
            }}
          >
            {tabs.map((tab) => (
              <div 
                key={tab.id}
                className="w-full flex-shrink-0 bg-white p-8 border border-gray-200"
                style={{ minWidth: '100%' }}
              >
                <div 
                  className="relative mb-6 flex items-center justify-center"
                  style={{ height: '280px' }}
                >
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${backgroundDecorations.imageTraced})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      zIndex: 0
                    }}
                  />
                  
                  <div 
                    className="relative z-10 w-full h-full flex items-center justify-center"
                    style={{
                      filter: 'drop-shadow(-42.237px 120.5px 50.9329px rgba(0, 0, 0, 0.01)) drop-shadow(-23.603px 67.7035px 43.4793px rgba(0, 0, 0, 0.05)) drop-shadow(-10.5593px 30.4355px 31.6778px rgba(0, 0, 0, 0.09)) drop-shadow(-2.48453px 7.45359px 17.3917px rgba(0, 0, 0, 0.1))'
                    }}
                  >
                    <img
                      src={tab.image}
                      alt={tab.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

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