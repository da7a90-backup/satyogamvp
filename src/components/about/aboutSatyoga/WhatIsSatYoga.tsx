'use client';

import { useState } from 'react';

const WhatIsSatYogaSection = () => {
  const [openAccordion, setOpenAccordion] = useState(0); // First item open by default

  const faqItems = [
    {
      id: 0,
      title: "A Treasure Map",
      content: "To help the seeker of Truth fully understand what that means, Sat Yoga has elaborated a user-friendly map of the hidden treasures of reality, encompassing the entire spectrum of consciousness. We have also developed empowering operations for taking command of the mind. We offer these online and at our ashram, a self-sustaining spiritual community in the rural mountains of southern Costa Rica, where those seeking a shorter or longer retreat (or a permanent refuge) from this dying world can awaken latent powers and live joyously in Total Presence."
    },
    {
      id: 1,
      title: "An Agency for Intelligence Amplification",
      content: "The original Sat Yoga was already functioning as a means of increasing intelligence at the beginning of recorded history. It was deployed not only for wisdom but also for developing paranormal powers (siddhis). Yoga has served as the basis and engine of all religions, as well as the mystical, magical, and shamanic orders. In recent times, however, the term Yoga has been appropriated by the ego and has been diluted, commercialized, and too often diverted from its original purpose. Our approach returns to the ancient tradition of offering Darshan (direct transmission from the Source of Power), Diksha (initiation), Gyana (knowledge), and Sadhana (praxis). But we have re-engineered the process to enable you to reinforce your will power and courage to transcend the known. Our focus is on activating the capacity for immediate illumination."
    },
    {
      id: 2,
      title: "A Range of Processes and Non-Practice",
      content: "Because everyone requires an approach appropriate to their level of maturity, educational background, and conceptual intelligence, we employ a range of processes for those not ready for the ultimate non-practice of immediate Self-realization. These include not only direct encounters with our teacher (a master of dharma combat, or zen dialogue), but also individual alchemical counseling sessions with an adept mentor. The latter provide a safe space in which to uproot projections, transform emotions, and release the residue of trauma as well as attachments to obsolete thinking and behavior patterns. We also offer powerful meditation methods. Once you have tasted the ecstasy of inner silence and serenity, you will not stop short of obtaining life's grand prize. Along with that, you will know the joy of altruism, devotion, artistic expression, and embodying the paradoxical wisdom of the Avadhutas (those who live in complete freedom)."
    }
  ];

  const handleAccordionToggle = (id: any) => {
    setOpenAccordion(openAccordion === id ? -1 : id);
  };

  return (
    <section 
      className="relative w-full flex flex-col justify-center items-center overflow-hidden py-16 lg:py-28 px-8 lg:px-16"
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
          gap: '80px'
        }}
      >
        {/* Left Column - Main Content */}
        <div 
          className="flex flex-col items-start gap-4 flex-1"
          style={{
            maxWidth: '616px'
          }}
        >
          {/* Main Heading */}
          <h2 
            className="text-black w-full"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 550,
              lineHeight: '120%',
              letterSpacing: '-0.02em'
            }}
          >
            What is Sat Yoga?
          </h2>

          {/* Main Description */}
          <p 
            className="text-gray-700 w-full"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              lineHeight: '150%',
              color: '#4A5568'
            }}
          >
            The ancient Sanskrit term Sat refers to what is absolutely Real and thus implicitly imperishable. The term Yoga means union, or realization of oneness. To live in oneness with the eternally present Absolute Real is both the way and the goal of Sat Yoga.
          </p>
        </div>

        {/* Right Column - FAQ Accordion */}
        <div 
          className="flex flex-col items-start gap-4 flex-1"
          style={{
            maxWidth: '616px'
          }}
        >
          {faqItems.map((item) => (
            <div 
              key={item.id}
              className="w-full border-b border-gray-200"
            >
              {/* Accordion Header */}
              <button
                onClick={() => handleAccordionToggle(item.id)}
                className="w-full flex items-center justify-between py-6 text-left hover:bg-gray-50 transition-colors"
              >
                <h3 
                  className="text-black font-medium"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '18px',
                    lineHeight: '28px'
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

              {/* Accordion Content */}
              <div 
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: openAccordion === item.id ? '1000px' : '0px'
                }}
              >
                <div className="pb-6">
                  <p 
                    className="text-gray-700"
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
      </div>
    </section>
  );
};

export default WhatIsSatYogaSection;