'use client';

import Link from 'next/link';

const ShunyamurtiSection = () => {
  return (
    <section 
      className="relative w-full flex flex-col lg:flex-row items-center justify-between overflow-hidden"
      style={{
        backgroundColor: '#FAF8F1',
        minHeight: '816px',
        padding: '64px 16px',
        gap: '32px'
      }}
    >
      {/* Mobile: Image First, Desktop: Image on Right */}
      <div className="relative w-full px-8 lg:flex-1 lg:max-w-xl order-1 lg:order-2">
        {/* Background Decorative Element */}
        <div 
          className="absolute hidden lg:block"
          style={{
            right: '-120px',
            top: '-150px',
            width: '389px',
            height: '389px',
            backgroundImage: 'url(/innerlab.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
            opacity: 0.3
          }}
        />
        
        <img
          src="/shunyamurti-meditation.jpg"
          alt="Shunyamurti in meditation"
          className="relative z-10 w-full h-auto object-cover rounded-xl mx-auto"
          style={{
            maxWidth: '636px',
            height: '620px',
            objectFit: 'cover',
            boxShadow: '33px 73px 32px rgba(0, 0, 0, 0.01), 19px 41px 27px rgba(0, 0, 0, 0.05), 8px 18px 20px rgba(0, 0, 0, 0.09), 2px 5px 11px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px'
          }}
        />
      </div>

      {/* Content Container */}
      <div 
        className="w-full lg:flex-1 lg:max-w-2xl order-2 lg:order-1"
        style={{
          maxWidth: '616px',
          margin: '0 auto'
        }}
      >
        {/* Section Tag */}
        <div className="mb-6">
          <span 
            className="text-yellow-600 uppercase tracking-wide text-sm font-medium"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              color: '#B8860B'
            }}
          >
            SHUNYAMURTI
          </span>
        </div>

        {/* Quote */}
        <blockquote 
          className="text-black mb-8"
          style={{
            fontFamily: 'Optima, Georgia, serif',
            fontSize: 'clamp(1.5rem, 4vw, 3rem)',
            fontWeight: 550,
            lineHeight: '120%',
            letterSpacing: '-1%'
          }}
        >
          "Love is what makes the impossible, inevitable."
        </blockquote>

        {/* Description Paragraphs */}
        <div className="space-y-6 mb-8">
          <p 
            className="text-gray-700"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              lineHeight: '150%',
              color: '#4A5568'
            }}
          >
            Shunyamurti is an uncanny, profound and life-transforming teacher whose wisdom is transmitted from the source of the infinite Self.
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
            He has a unique ability to distill the essence of Eastern and Western wisdom, history, psychoanalysis, philosophy, and science to deliver the context needed to understand the human condition and interpret the meaning of the state of the world.
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
            Shunyamurti helps seekers awaken from illusion, anxiety, and suffering of every kind. Through deep meditation, self-inquiry, and the recognition of the unreal nature of the ego seekers experience the fullness of freedom, joy, and divine love.
          </p>
        </div>

        {/* Action Button */}
        <div className="text-center lg:text-left">
          <Link
            href="/about/shunyamurti"
            className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:opacity-90"
            style={{
              backgroundColor: '#7D1A13',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ShunyamurtiSection;