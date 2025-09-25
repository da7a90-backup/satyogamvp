'use client'
// Methodology Section Component
const MethodologySection = () => {
    const methodologies = [
      {
        title: "The Integration of Raja Yoga and Gyana Yoga",
        description: "Meditation is the gradual path to Self-sovereignty (in Sanskrit, Raja Yoga). Gaining mastery over the chattering mind and scattered attention may require the use of centering techniques, of which we have many. Understanding how the ego functions may help you change its tendency to self-sabotage. That is one aspect of Gyana Yoga. For those ready to activate their crown chakra, the higher Gyana (knowledge) will do the job."
      },
      {
        title: "Kundalini Yoga: Re-Tuning the Radio",
        description: "Let's face it: Nearly all of us suffer from stunted intellectual development. This is not our fault. We are products of a narcissistic and nihilistic social system that never taught us our true potential for genius. Here we offer a step-by-step process to repair the damage to our attention span, intellectual curiosity, and capacity to descend into our innermost Being in order to attune to the infinite intelligence."
      },
      {
        title: "Bhakti Yoga: Devotion and Surrender",
        description: "Open your Heart! That's the simplest way to reach God-consciousness. It is a cliché to say that God is love, but it is still the Truth. The more you resonate with the all-pervading Presence—which is felt as blissful love without an object or a subject—the easier it is to let go of all contractions, delusions, and karmic symptoms."
      },
      {
        title: "Karma Yoga: Serving the Real",
        description: "True service of the Real requires attunement to the Real. Karma Yoga brings poise; lightness; accurate intention and timing of action; and glitch-free relations with people, the realm of Nature, and the social order."
      }
    ];
  
    return (
      <section 
        className="relative w-full flex flex-col lg:flex-row items-start py-16 lg:py-28 px-4 lg:px-16"
        style={{
          backgroundColor: '#FAF8F1',
          gap: '80px'
        }}
      >
        {/* Content Container */}
        <div 
          className="w-full flex flex-col lg:flex-row items-start"
          style={{
            maxWidth: '1312px',
            margin: '0 auto',
            gap: '80px'
          }}
        >
          {/* Left Column - Title (Desktop) / Top (Mobile) */}
          <div className="w-full lg:w-auto lg:flex-shrink-0">
            <h2 
              className="text-black"
              style={{
                fontFamily: 'Optima, Georgia, serif',
                fontWeight: 550,
                fontSize: 'clamp(28px, 4vw, 48px)',
                lineHeight: '125%',
                letterSpacing: '-0.02em',
                width: 'clamp(300px, 50vw, 616px)'
              }}
            >
              Methodology
            </h2>
          </div>
  
          {/* Right Column - Content List */}
          <div 
            className="w-full flex flex-col"
            style={{
              gap: '32px'
            }}
          >
            {methodologies.map((method, index) => (
              <div 
                key={index}
                className="flex flex-col lg:flex-row items-start"
                style={{
                  gap: '16px'
                }}
              >
                {/* Method Content */}
                <div className="w-full flex flex-col gap-6">
                  {/* Title */}
                  <h3 
                    className="text-black font-medium"
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '18px',
                      lineHeight: '28px',
                      fontWeight: 600
                    }}
                  >
                    {method.title}
                  </h3>
  
                  {/* Description */}
                  <p 
                    className="text-gray-700"
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '18px',
                      lineHeight: '28px',
                      color: '#384250'
                    }}
                  >
                    {method.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  

  
  export default MethodologySection;