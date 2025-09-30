'use client';

import { useState } from 'react';

const WhichRetreatSection = () => {
  const [expandedRetreat, setExpandedRetreat] = useState('shakti');

  const retreats = [
    {
      id: 'shakti',
      title: 'Shakti Saturation Immersion (One Month)',
      description: 'For those seeking the most profound immersion in transformational wisdom, the Shakti Saturation month is the perfect choice. This extended retreat includes an advanced seminar led by Shunyamurti, a full schedule of amazing wisdom classes and daily group meditations, to remove all obstacles on the path. You will be joyfully integrated into community living, participate in artistic expression classes, and have the unique opportunity for regular Atmanology healing sessions. This retreat is designed for those ready to surrender fully to the power of Truth and accelerate their attainment of spiritual freedom—in union with the Whole.'
    },
    {
      id: 'darshan',
      title: 'Darshan Retreat (7 Days)',
      description: 'Those with less time can receive direct guidance, deep insight, and spiritual empowerment, at our Darshan Retreats. Shunyamurti will provide a one-to-one initiation and an uncanny conversation that could be life-changing. You will also experience profound small group teachings and spiritual exercises in the luminous and healing energy field of the ashram.'
    },
    {
      id: 'sevadhari',
      title: 'Sevadhari – Study and Serve (3 to 6 Months or longer)',
      description: 'For those who have attended our one-month Shakti Saturation Immersion and are called to change their life more dramatically through a rite of passage involving ego transcendence in selfless service, the Sevadhari Program offers a unique training in Karma Yoga—an opportunity to embody noble virtue through dedicated egoless activity. This program integrates daily meditations and community classes, plus satsangs with Shunyamurti, with service work such as the kitchen, gardens, or housekeeping. Living as a member of the community, you will refine your compassionate nature, gain inner strength, cultivate humility, and taste the exquisite joy of altruistic devotion. Whether you are considering a lifetime commitment to ashram residence or you simply want to experience the transformative power of Karma Yoga, this intensive program will change you forever.'
    }
  ];

  const toggleRetreat = (retreatId:any) => {
    setExpandedRetreat(expandedRetreat === retreatId ? null : retreatId);
  };

  return (
    <section 
      className="w-full flex flex-col items-center px-4 lg:px-16 py-16 lg:py-28"
      style={{ 
        backgroundColor: '#FAF8F1'
      }}
    >
      <div 
        className="flex flex-col items-center w-full max-w-4xl"
        style={{ 
          gap: 'clamp(40px, 8vw, 80px)'
        }}
      >
        {/* Heading */}
        <h2 
          className="text-center w-full"
          style={{
            fontFamily: 'Optima',
            fontStyle: 'normal',
            fontWeight: 550,
            fontSize: 'clamp(28px, 4vw, 48px)',
            lineHeight: '125%',
            textAlign: 'center',
            letterSpacing: '-0.02em',
            color: '#000000'
          }}
        >
          Which Retreat is Right for Me?
        </h2>

        {/* FAQ Items */}
        <div className="w-full">
          {retreats.map((retreat, index) => (
            <div key={retreat.id}>
              {/* Question */}
              <button
                onClick={() => toggleRetreat(retreat.id)}
                className="w-full flex items-center justify-between cursor-pointer hover:bg-gray-50 hover:bg-opacity-50 transition-colors"
                style={{
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 'clamp(16px, 3vw, 20px) 0px',
                  gap: '24px',
                  width: '100%',
                  minHeight: 'clamp(60px, 10vw, 72px)',
                  borderTop: '1px solid #000000'
                }}
              >
                <span 
                  className="text-left flex-1"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: 'clamp(16px, 2.5vw, 20px)',
                    fontWeight: 600,
                    color: '#000000',
                    lineHeight: '140%'
                  }}
                >
                  {retreat.title}
                </span>
                <div 
                  className="transition-transform duration-300 flex-shrink-0"
                  style={{
                    transform: expandedRetreat === retreat.id ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
              
              {/* Answer */}
              {expandedRetreat === retreat.id && (
                <div 
                  className="w-full pb-6"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: '0px 0px 24px',
                    gap: '16px'
                  }}
                >
                  <p 
                    className="w-full"
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: 'clamp(14px, 2vw, 16px)',
                      lineHeight: '150%',
                      color: '#384250',
                      margin: 0,
                      flex: 1
                    }}
                  >
                    {retreat.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhichRetreatSection;