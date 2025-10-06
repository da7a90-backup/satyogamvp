'use client';

import { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface AccordionItem {
  id: number;
  title: string;
  content: string;
}

interface ListItem {
  title: string;
  description: string;
}

interface ContentSection {
  heading?: string;
  paragraphs: string[];
}

interface TimelineItem {
  number: number;
  tagline: string;
  title: string;
  description: string;
}

interface BulletAccordionItem {
  id: number;
  title: string;
  content: string;
}

interface BackgroundElement {
  image: string;
  desktop?: React.CSSProperties;
  mobile?: React.CSSProperties;
}

interface TopMediaSection {
  type: 'image' | 'video';
  src: string;
  aspectRatio?: string;
  hasPlayButton?: boolean;
}

interface ButtonConfig {
  text: string;
  url: string;
  variant: 'primary' | 'secondary'; // primary = red, secondary = white
}

interface TwoPaneData {
  backgroundColor?: string;
  topMedia?: TopMediaSection;
  leftPane: {
    tagline?: string;
    taglineColor?: string;
    title: string;
    titleLineHeight?: string;
    description?: string;
    buttons?: ButtonConfig[]; // Up to 2 buttons
  };
  rightPane: {
    type: 'accordion' | 'list' | 'sections' | 'paragraphs' | 'timeline' | 'bulletaccordion';
    gap?: string;
    content: AccordionItem[] | ListItem[] | ContentSection[] | string[] | TimelineItem[] | BulletAccordionItem[];
  };
  backgroundElements?: BackgroundElement[];
}

// ============================================================================
// COMPONENT
// ============================================================================

const TwoPaneComponent = ({ data }: { data: TwoPaneData }) => {
  const [openAccordion, setOpenAccordion] = useState(0);

  const handleAccordionToggle = (id: number) => {
    setOpenAccordion(openAccordion === id ? -1 : id);
  };

  return (
    <section 
      className="relative w-full flex flex-col items-center overflow-hidden py-16 lg:py-28 px-4 lg:px-16"
      style={{
        backgroundColor: data.backgroundColor || '#FAF8F1'
      }}
    >
      {/* Background Elements */}
      {data.backgroundElements?.map((element, index) => (
        <div key={index}>
          {element.desktop && (
            <div
              className="absolute hidden lg:block pointer-events-none"
              style={{
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: element.desktop.background 
                  ? `${element.desktop.background}, url(${element.image})`
                  : `url(${element.image})`,
                ...element.desktop,
                background: undefined
              }}
            />
          )}
          {element.mobile && (
            <div
              className="absolute lg:hidden pointer-events-none overflow-hidden"
              style={{
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: element.mobile.background
                  ? `${element.mobile.background}, url(${element.image})`
                  : `url(${element.image})`,
                ...element.mobile,
                background: undefined
              }}
            />
          )}
        </div>
      ))}

      {/* Main Container */}
      <div 
        className="w-full flex flex-col items-center relative z-10"
        style={{ maxWidth: '1312px', gap: '80px' }}
      >
        {/* Top Media */}
        {data.topMedia && (
          <div 
            className="relative w-full overflow-hidden cursor-pointer"
            style={{
              aspectRatio: data.topMedia.aspectRatio || '16/10',
              borderRadius: '16px',
              backgroundImage: `url(${data.topMedia.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {data.topMedia.hasPlayButton && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center justify-center w-20 h-20 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-300">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5v14l11-7L8 5z" fill="#7D1A13"/>
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Two Column Layout */}
        <div 
          className="w-full flex flex-col lg:flex-row items-start"
          style={{ gap: '80px' }}
        >
          {/* Left Pane */}
          <div 
            className={`flex flex-col gap-4 ${data.leftPane.description ? 'flex-1 w-full' : 'w-full lg:w-auto lg:flex-shrink-0'}`}
            style={{
              maxWidth: '616px'
            }}
          >
            {data.leftPane.tagline && (
              <span 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: data.leftPane.taglineColor || '#B8860B',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}
              >
                {data.leftPane.tagline}
              </span>
            )}

            <h2 
              className="text-black"
              style={{
                fontFamily: 'Optima, Georgia, serif',
                fontWeight: 550,
                fontSize: 'clamp(28px, 4vw, 48px)',
                lineHeight: data.leftPane.titleLineHeight || '125%',
                letterSpacing: '-0.02em',
                ...(!data.leftPane.description && { width: 'clamp(300px, 50vw, 616px)' })
              }}
            >
              {data.leftPane.title}
            </h2>

            {data.leftPane.description && (
              <p 
                className="text-gray-700"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  lineHeight: '150%',
                  color: '#4A5568'
                }}
              >
                {data.leftPane.description}
              </p>
            )}

            {/* Buttons */}
            {data.leftPane.buttons && data.leftPane.buttons.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                {data.leftPane.buttons.slice(0, 2).map((button, index) => (
                  <a
                    key={index}
                    href={button.url}
                    className="px-6 py-3 rounded-lg font-medium text-center transition-opacity hover:opacity-90"
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '16px',
                      backgroundColor: button.variant === 'primary' ? '#7D1A13' : '#FFFFFF',
                      color: button.variant === 'primary' ? '#FFFFFF' : '#7D1A13',
                      border: button.variant === 'secondary' ? '2px solid #7D1A13' : 'none'
                    }}
                  >
                    {button.text}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right Pane */}
          <div 
            className="w-full flex flex-col"
            style={{
              maxWidth: '616px',
              gap: data.rightPane.gap || '32px'
            }}
          >
            {/* Accordion */}
            {data.rightPane.type === 'accordion' && (
              <div className="flex flex-col gap-4">
                {(data.rightPane.content as AccordionItem[]).map((item) => (
                  <div key={item.id} className="w-full border-b border-gray-200">
                    <button
                      onClick={() => handleAccordionToggle(item.id)}
                      className="w-full flex items-center justify-between py-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 
                        style={{
                          fontFamily: 'Avenir Next, sans-serif',
                          fontSize: '18px',
                          lineHeight: '28px',
                          fontWeight: 500,
                          color: '#000000'
                        }}
                      >
                        {item.title}
                      </h3>
                      <div 
                        className="ml-4 transition-transform duration-300"
                        style={{
                          transform: openAccordion === item.id ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </button>
                    <div 
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{
                        maxHeight: openAccordion === item.id ? '1000px' : '0px'
                      }}
                    >
                      <div className="pb-6">
                        <p 
                          style={{
                            fontFamily: 'Avenir Next, sans-serif',
                            fontSize: '16px',
                            lineHeight: '150%',
                            color: '#4A5568'
                          }}
                        >
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List */}
            {data.rightPane.type === 'list' && (
              <>
                {(data.rightPane.content as ListItem[]).map((item, index) => (
                  <div key={index} className="flex flex-col gap-6">
                    <h3 
                      style={{
                        fontFamily: 'Avenir Next, sans-serif',
                        fontSize: '18px',
                        lineHeight: '28px',
                        fontWeight: 600,
                        color: '#000000'
                      }}
                    >
                      {item.title}
                    </h3>
                    <p 
                      style={{
                        fontFamily: 'Avenir Next, sans-serif',
                        fontSize: '18px',
                        lineHeight: '28px',
                        color: '#384250'
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                ))}
              </>
            )}

            {/* Sections */}
            {data.rightPane.type === 'sections' && (
              <div className="flex flex-col space-y-8">
                {(data.rightPane.content as ContentSection[]).map((section, index) => (
                  <div key={index} className="flex flex-col space-y-4">
                    {section.heading && (
                      <h3 
                        style={{
                          fontFamily: 'Avenir Next, sans-serif',
                          fontWeight: 600,
                          fontSize: '20px',
                          lineHeight: '30px',
                          color: '#000000'
                        }}
                      >
                        {section.heading}
                      </h3>
                    )}
                    <div className="flex flex-col space-y-4">
                      {section.paragraphs.map((paragraph, pIndex) => (
                        <p 
                          key={pIndex}
                          style={{
                            fontFamily: 'Avenir Next, sans-serif',
                            fontWeight: 400,
                            fontSize: 'clamp(16px, 2.5vw, 18px)',
                            lineHeight: '28px',
                            color: '#384250'
                          }}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paragraphs */}
            {data.rightPane.type === 'paragraphs' && (
              <>
                {(data.rightPane.content as string[]).map((paragraph, index) => (
                  <p 
                    key={index}
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: 'clamp(16px, 2.5vw, 18px)',
                      lineHeight: '28px',
                      color: '#384250',
                      fontWeight: 400
                    }}
                    dangerouslySetInnerHTML={{ __html: paragraph }}
                  />
                ))}
              </>
            )}

            {/* Timeline */}
            {data.rightPane.type === 'timeline' && (
              <div className="flex flex-col">
                {(data.rightPane.content as TimelineItem[]).map((item, index) => (
                  <div key={index} className="flex items-start" style={{ gap: '24px' }}>
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div 
                        className="w-5 h-5 rounded-full border-2 bg-white"
                        style={{ 
                          borderColor: '#D1D5DB',
                          marginTop: '4px'
                        }}
                      />
                      {index < (data.rightPane.content as TimelineItem[]).length - 1 && (
                        <div 
                          className="w-0.5 flex-1"
                          style={{ 
                            backgroundColor: '#D1D5DB',
                            minHeight: '80px'
                          }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col pb-12" style={{ gap: '8px' }}>
                      {/* Tagline */}
                      <span
                        style={{
                          fontFamily: 'Avenir Next, sans-serif',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#942017',
                          textTransform: 'capitalize'
                        }}
                      >
                        {item.tagline}
                      </span>

                      {/* Title */}
                      <h3
                        style={{
                          fontFamily: 'Avenir Next, sans-serif',
                          fontSize: '18px',
                          fontWeight: 600,
                          lineHeight: '28px',
                          color: '#000000'
                        }}
                      >
                        {item.number}. {item.title}
                      </h3>

                      {/* Description */}
                      <p
                        style={{
                          fontFamily: 'Avenir Next, sans-serif',
                          fontSize: '16px',
                          fontWeight: 400,
                          lineHeight: '24px',
                          color: '#384250'
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bullet Accordion - Desktop: Simple list, Mobile: Accordion */}
            {data.rightPane.type === 'bulletaccordion' && (
              <>
                {/* Desktop View - Simple Bullet List */}
                <div className="hidden lg:flex flex-col" style={{ gap: '32px' }}>
                  {(data.rightPane.content as BulletAccordionItem[]).map((item) => (
                    <div key={item.id} className="flex flex-col" style={{ gap: '8px' }}>
                      <h3
                        style={{
                          fontFamily: 'Avenir Next, sans-serif',
                          fontSize: '18px',
                          fontWeight: 600,
                          lineHeight: '28px',
                          color: '#000000'
                        }}
                      >
                        {item.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: 'Avenir Next, sans-serif',
                          fontSize: '16px',
                          fontWeight: 400,
                          lineHeight: '24px',
                          color: '#384250'
                        }}
                      >
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Mobile View - Accordion */}
                <div className="lg:hidden flex flex-col gap-4">
                  {(data.rightPane.content as BulletAccordionItem[]).map((item) => (
                    <div key={item.id} className="w-full border-b border-gray-200">
                      <button
                        onClick={() => handleAccordionToggle(item.id)}
                        className="w-full flex items-center justify-between py-6 text-left hover:bg-gray-50 transition-colors"
                      >
                        <h3 
                          style={{
                            fontFamily: 'Avenir Next, sans-serif',
                            fontSize: '18px',
                            lineHeight: '28px',
                            fontWeight: 600,
                            color: '#000000'
                          }}
                        >
                          {item.title}
                        </h3>
                        <div 
                          className="ml-4 transition-transform duration-300"
                          style={{
                            transform: openAccordion === item.id ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </button>
                      <div 
                        className="overflow-hidden transition-all duration-300 ease-in-out"
                        style={{
                          maxHeight: openAccordion === item.id ? '1000px' : '0px'
                        }}
                      >
                        <div className="pb-6">
                          <p 
                            style={{
                              fontFamily: 'Avenir Next, sans-serif',
                              fontSize: '16px',
                              lineHeight: '150%',
                              color: '#4A5568'
                            }}
                          >
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TwoPaneComponent;