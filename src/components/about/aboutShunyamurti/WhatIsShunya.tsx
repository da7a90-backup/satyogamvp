'use client';

const WhatIsShunyamurtiSection = () => {
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
              lineHeight: '120%',
              letterSpacing: '-0.02em',
              width: 'clamp(300px, 50vw, 616px)'
            }}
          >
            What is Shunyamurti?
          </h2>
        </div>

        {/* Right Column - Content */}
        <div 
          className="w-full flex flex-col"
          style={{
            maxWidth: '616px'
          }}
        >
          <p 
            className="text-gray-700"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '18px',
              lineHeight: '28px',
              color: '#384250'
            }}
          >
            To answer that, we must begin by understanding his chosen yogic name. Shunya means "empty," while murti means "form." In fact, all of us are empty forms, but most stay in denial of that. He wants to express and live in Truth.
            <br /><br />
            Emptiness is a central term, not only in Buddhism but in all the Asian wisdom schools. It signifies that the bodily character is unreal, a mere appearance in a holographic light show disguised as a world. Because one's persona is fictional, its suffering is empty of reality. This light show, or dream field, is made of the Light of Infinite Consciousness. Once there has been recognition of the emptiness of all forms, then the Real Self underlying, pervading, and dreaming this whole cosmic play can be realized. At that point, the other side of emptiness is revealed as the unmanifest, formless Fullness of eternal and unlimited freedom and joy.
            <br /><br />
            The One Intelligence is dreaming all of us and is the inmost Self of each apparent entity. In Shunyamurti's case, recognition of the fictional nature of the world and of people came early in life. That freed him from conventional constraints, enabling him to resist temptations to settle for anything less than the full unfoldment of the potency of Consciousness. Life became a quest for the Real.
            <br /><br />
            Grace comes as the power to silence the mind. In the stillness of Total Presence, energy and information from the Infinite Self can be channelled through the bodily icon. The teachings of Sat Yoga have come from that Source.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhatIsShunyamurtiSection;