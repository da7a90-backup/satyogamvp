'use client';

import Link from 'next/link';

const WhoWeAreSection = () => {
  return (
    <section 
      className="relative w-full flex flex-col lg:flex-row items-center justify-between overflow-hidden"
      style={{
        backgroundColor: '#FAF8F1',
        minHeight: '816px',
        padding: '64px 16px',
        gap: '32px',
        zIndex: 10 // Added z-index to prevent overlap
      }}
    >
      {/* Background Decorative Element */}
      <div 
        className="absolute hidden lg:block"
        style={{
          right: '-90px',
          top: '-104px',
          width: '389px',
          height: '389px',
          backgroundImage: 'url(/Inner Labyrinth.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          opacity: 0.6
        }}
      />

      {/* Mobile: Image First, Desktop: Image on Left */}
      <div className="relative px-8 z-10 w-full lg:flex-1 lg:max-w-xl order-1 lg:order-1">
        <img
          src="/1. HOME_Who We Are.jpg"
          alt="Sat Yoga Community"
          className="w-full h-auto object-cover rounded-xl mx-auto"
          style={{
            maxWidth: '636px',
            height: '620px',
            objectFit: 'cover',
            boxShadow: '-33px 73px 32px rgba(0, 0, 0, 0.01), -19px 41px 27px rgba(0, 0, 0, 0.05), -8px 18px 20px rgba(0, 0, 0, 0.09), -2px 5px 11px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px'
          }}
        />
      </div>

      {/* Content Container */}
      <div 
        className="relative z-20 py-12 w-full lg:flex-1 lg:max-w-xl order-2 lg:order-2"
        style={{
          maxWidth: '616px',
          margin: '0 auto',
          gap: '24px'
        }}
      >
        {/* Section Title */}
        <div className="mb-8">
          {/* Tagline */}
          <div className="mb-4">
            <span 
              className="text-yellow-600 uppercase tracking-wide text-sm font-medium"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                color: '#B8860B'
              }}
            >
              WHO WE ARE
            </span>
          </div>

          {/* Main Heading */}
          <h2 
            className="text-black mb-6"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: 'clamp(1.5rem, 4vw, 3rem)',
              fontWeight: 550,
              lineHeight: '120%',
              letterSpacing: '-1%'
            }}
          >
            A Pathless Path to Self-Realization and Liberation
          </h2>

          {/* Description Paragraphs */}
          <div className="space-y-4 mb-8">
            <p 
              className="text-gray-700"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '16px',
                lineHeight: '150%',
                color: '#4A5568'
              }}
            >
              The way and the goal of Sat Yoga is to live in oneness with the eternally present Absolute Real.
            </p>
            
            <p 
              className="text-gray-700"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '16px',
                lineHeight: '150%',
                color: '#4A5568'
              }}
            >
              To help seekers understand what that means, Sat Yoga has elaborated a user-friendly map of the hidden treasures of reality, encompassing the entire spectrum of consciousness. We have also developed empowering practices for taking command of the mind. We offer these online and at our ashram, a self-sustaining spiritual community in the pristine rural mountains of southern Costa Rica, where those seeking a shorter or longer retreat (or a permanent refuge) from this dying world can awaken latent powers and live joyously in Total Presence.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center lg:text-left relative z-30">
          <Link
            href="/about"
            className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:opacity-90"
            style={{
              backgroundColor: '#7D1A13',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            Discover Sat Yoga
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAreSection;