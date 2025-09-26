'use client';

const SpiritualTribeSection = () => {
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
        {/* Left Column - Title */}
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
            A Spiritual Tribe Like No Other
          </h2>
        </div>

        {/* Right Column - Content */}
        <div 
          className="w-full flex flex-col"
          style={{
            maxWidth: '616px',
            gap: '32px'
          }}
        >
          <p 
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '18px',
              lineHeight: '28px',
              color: '#384250',
              fontWeight: 400
            }}
          >
            Most of us had never even visited an ashram before arriving here. We grew up in the urban, materialist, consumerist, dumbed-down, puerile, and cynical culture that produced nearly everyone's ego—with a tenacious resistance to responsible adulthood and with few higher role models. We were saddled with a nihilistic attitude, seeking whatever crumbs of pleasure could be found. Fortunately, our karma got us to this refuge where we could start to heal our wounded souls.
          </p>

          <p 
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '18px',
              lineHeight: '28px',
              color: '#384250',
              fontWeight: 400
            }}
          >
            In short, we were not prepared for a life devoted to transcendence of the ego, nor even for managing a farm, a retreat center, and a complex website. We are learning on the go. That has added an edge of aliveness and willingness to accept beginner's mind, along with the thrill of solving enigmas and gasping in wonder at the impossible synchronicities that have kept us afloat.
          </p>

          <p 
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '18px',
              lineHeight: '28px',
              color: '#384250',
              fontWeight: 400
            }}
          >
            Even more miraculously, we have learned how to get along, how to accommodate the other, how to resolve conflicts, and (most importantly) how to stop projecting—instead, to eliminate attitudes that produce glitches in the field. We have learned how to disidentify from our own self-presentations, and we have learned the hard way—through our experience of karma and dharma and the sting of intense inner work—the vital importance of these teachings.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SpiritualTribeSection;