const ShaktiEventHeader = () => {
    return (
      <section 
        className="w-full flex flex-col items-start px-4 lg:px-16 py-16 lg:py-28"
        style={{ backgroundColor: '#FAF8F1', gap: '80px' }}
      >
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start" style={{ gap: '80px' }}>
          {/* Left Column - Heading */}
          <div className="flex-1 flex flex-col items-start" style={{ gap: '16px' }}>
            <h1 
              style={{
                fontFamily: 'Optima, Georgia, serif',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 550,
                lineHeight: '125%',
                letterSpacing: '-0.02em',
                color: '#000000'
              }}
            >
              A Life-Changing Discovery of Your True Nature
            </h1>
          </div>
  
          {/* Right Column - Body Text */}
          <div className="flex-1 flex flex-col items-start" style={{ gap: '32px' }}>
            <p 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: 'clamp(16px, 2.5vw, 18px)',
                fontWeight: 400,
                lineHeight: '28px',
                color: '#384250'
              }}
            >
              The Shakti Saturation process is an adventure in Self-discovery! The curriculum has been specially designed to serve our growing global community of seekers of healing and inner peace, and lovers of Truth.
              <br /><br />
              This onsite program is open to all who delight in the Sat Yoga teachings, and who are ready to engage in the inner work of attaining Total Presence.
              <br /><br />
              Whether you are joining us for a month or considering extending your stay, this intensive reconfiguration of identity will serve as an exhilarating introduction to life at the Ashram—and your personal divinization.
              <br /><br />
              Your days will be filled with mind-clearing wisdom, sweet inner silence, and heart-healing self-acceptance. The understanding of our supportive spiritual community will assist in enabling you to drop all your old projections, defensiveness, and self-doubt.
              <br /><br />
              Through this profound peeling away of the past, your life will feel renewed. You may experience a paradigm shift into a more beautiful reality. And you will be able to rebuild your life on the bedrock of the Real Self—and live in freedom, in a state of grace.
            </p>
          </div>
        </div>
      </section>
    );
  };
  
  export default ShaktiEventHeader;