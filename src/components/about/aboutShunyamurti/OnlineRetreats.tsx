'use client';

const OnlineRetreatsSection = () => {
  return (
    <section 
      className="relative w-full flex flex-col items-start py-16 lg:py-28 px-4 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1'
      }}
    >
      {/* Content Container */}
      <div 
        className="w-full flex flex-col items-start"
        style={{
          maxWidth: '1312px',
          margin: '0 auto',
          gap: '32px'
        }}
      >
        {/* Section Header */}
        <div 
          className="w-full flex flex-col justify-center items-center mx-auto"
          style={{
            maxWidth: '768px',
            gap: '16px'
          }}
        >
          {/* Tagline */}
          <div className="flex items-center">
            <span 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: '24px',
                color: '#B8860B',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              UPCOMING EVENTS
            </span>
          </div>

          {/* Main Title */}
          <h2 
            className="text-black text-center w-full"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontWeight: 550,
              fontSize: 'clamp(28px, 4vw, 48px)',
              lineHeight: '125%',
              letterSpacing: '-0.02em'
            }}
          >
            Online Retreats
          </h2>

          {/* Description */}
          <p 
            className="text-center w-full"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: '24px',
              color: '#384250'
            }}
          >
            Shunyamurti offers a number of yearly livestreamed retreats. Each one is a stunning and unique event—always more powerful than the last, always relevant and geopolitically informed, and always paradigm-shifting, ego-busting, and shakti-filled. Priceless direct guidance in real time—including the opportunity to pose urgent questions to Shunyamurti live—makes these events imperative for serious seekers.
          </p>
        </div>

        {/* Event Card */}
        <div 
          className="w-full flex flex-row items-center bg-white border rounded-lg overflow-hidden relative"
          style={{
            width: '1312px',
            height: '420px',
            gap: '48px',
            borderColor: '#D2D6DB',
            borderRadius: '8px'
          }}
        >
          {/* Left Side - Image */}
          <div 
            className="relative flex flex-col items-start"
            style={{
              width: '632px',
              height: '420px',
              isolation: 'isolate'
            }}
          >
            {/* Background Image */}
            <div 
              className="w-full h-full"
              style={{
                width: '632px',
                height: '420px',
                background: 'linear-gradient(149.44deg, rgba(0, 0, 0, 0.1) 56.92%, rgba(0, 0, 0, 0.3) 74.56%, rgba(0, 0, 0, 0.3) 91.04%), url(/ssi.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />

            {/* Date Badge */}
            <div 
              className="absolute flex flex-col justify-center items-center bg-white rounded-lg"
              style={{
                width: '112px',
                height: '108px',
                left: '16px',
                top: '16px',
                padding: '12px 4px',
                borderRadius: '8px'
              }}
            >
              <span 
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '150%',
                  color: '#384250',
                  textAlign: 'center',
                  width: '104px'
                }}
              >
                Sat
              </span>
              <span 
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '32px',
                  fontWeight: 700,
                  lineHeight: '130%',
                  color: '#000000',
                  textAlign: 'center',
                  width: '104px'
                }}
              >
                17
              </span>
              <span 
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '150%',
                  color: '#384250',
                  textAlign: 'center',
                  width: '104px'
                }}
              >
                Fri Dec 2024
              </span>
            </div>

            {/* Illustration Icon */}
            <div 
              className="absolute"
              style={{
                width: '107.09px',
                height: '107.92px',
                left: '495px',
                top: '284px'
              }}
            >
              <div 
                className="relative"
                style={{
                  width: '105px',
                  height: '105px',
                  left: '1px',
                  top: '2px'
                }}
              >
                {/* Blur circle background */}
                <div 
                  style={{
                    position: 'absolute',
                    width: '105px',
                    height: '105px',
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.28) 100%)',
                    backdropFilter: 'blur(26.25px)',
                    borderRadius: '50%'
                  }}
                />
                {/* Icon */}
                <div 
                  style={{
                    position: 'absolute',
                    width: '92px',
                    height: '92px',
                    left: '8px',
                    top: '8px',
                    backgroundImage: 'url(/illustrations.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div 
            className="flex flex-col justify-center items-start"
            style={{
              width: '632px',
              height: '420px',
              gap: '24px',
              isolation: 'isolate'
            }}
          >
            {/* Event Details Row */}
            <div 
              className="flex flex-row items-center"
              style={{
                width: '302px',
                height: '24px',
                gap: '8px'
              }}
            >
              {/* Duration */}
              <div 
                className="flex items-center"
                style={{
                  gap: '8px',
                  width: '180px',
                  height: '20px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="11" rx="2" stroke="#535862" strokeWidth="1.5"/>
                  <path d="M11 1v4M5 1v4M2 7h12" stroke="#535862" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span 
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: '20px',
                    color: '#384250'
                  }}
                >
                  Duration: 1 month
                </span>
              </div>

              {/* Divider */}
              <div 
                style={{
                  width: '24px',
                  height: '0px',
                  border: '1px solid #D0D0D0',
                  transform: 'rotate(90deg)'
                }}
              />

              {/* Location */}
              <div 
                className="flex items-center"
                style={{
                  gap: '8px',
                  width: '143px',
                  height: '20px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 6.67c0 4.67-6 8.67-6 8.67s-6-4-6-8.67a6 6 0 1112 0z" stroke="#535862" strokeWidth="1.5"/>
                  <circle cx="8" cy="6.67" r="1.67" stroke="#535862" strokeWidth="1.5"/>
                </svg>
                <span 
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: '20px',
                    color: '#384250'
                  }}
                >
                  Onsite Retreat
                </span>
              </div>
            </div>

            {/* Content */}
            <div 
              className="flex flex-col items-start"
              style={{
                width: '552px',
                height: '118px',
                gap: '16px'
              }}
            >
              <div 
                className="flex flex-col items-start"
                style={{
                  width: '552px',
                  height: '118px',
                  gap: '8px'
                }}
              >
                {/* Price */}
                <span 
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '140%',
                    color: '#942017',
                    width: '552px'
                  }}
                >
                  Ashram Immersion program
                </span>

                {/* Title */}
                <div 
                  className="flex items-center"
                  style={{
                    width: '552px',
                    height: '32px',
                    gap: '8px'
                  }}
                >
                  <h3 
                    style={{
                      fontFamily: 'Optima, Georgia, serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      lineHeight: '32px',
                      color: '#000000',
                      width: '179px'
                    }}
                  >
                    Shakti Saturation
                  </h3>
                </div>

                {/* Description */}
                <p 
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    fontWeight: 500,
                    lineHeight: '24px',
                    color: '#384250',
                    width: '552px',
                    height: '48px'
                  }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div 
              className="flex flex-col items-start"
              style={{
                width: '135px',
                height: '44px',
                gap: '24px'
              }}
            >
              <button
                style={{
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '10px 16px',
                  gap: '6px',
                  width: '135px',
                  height: '44px',
                  background: '#7D1A13',
                  boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <span
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '24px',
                    color: '#FFFFFF'
                  }}
                >
                  Save my spot
                </span>
              </button>
            </div>
          </div>

          {/* "In 3 days" Badge */}
          <div 
            className="absolute bg-white border rounded-lg flex items-center justify-center"
            style={{
              width: '80px',
              height: '36px',
              right: '16px',
              top: '16px',
              borderColor: '#D5D7DA',
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
                color: '#414651',
                textAlign: 'center'
              }}
            >
              In 3 days
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnlineRetreatsSection;