'use client';

const AtmanologySection = () => {
  return (
    <section 
      className="relative w-full flex flex-col lg:flex-row items-start py-6 lg:py-28 px-4 lg:px-16"
      style={{
        backgroundColor: '#FAF8F1',
        gap: '24px'
      }}
    >
      {/* Content Container */}
      <div 
        className="w-full flex flex-col lg:flex-row items-start"
        style={{
          maxWidth: '1312px',
          margin: '0 auto',
          gap: '24px'
        }}
      >
        {/* Desktop: Left Column - Title / Mobile: Top */}
        <div 
          className="w-full lg:w-auto lg:flex-shrink-0"
          style={{
            gap: '80px'
          }}
        >
          <h2 
            className="text-black"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontWeight: 550,
              fontSize: 'clamp(28px, 4vw, 48px)',
              lineHeight: '120%',
              letterSpacing: '-0.02em',
              width: 'clamp(300px, 100%, 616px)',
              height: 'auto'
            }}
          >
            Atmanology: Beyond Psychology
          </h2>
        </div>

        {/* Desktop: Right Column - Content / Mobile: Below Title */}
        <div 
          className="w-full lg:flex-1"
          style={{
            marginTop: window.innerWidth >= 1024 ? '0' : '24px'
          }}
        >
          <p 
            className="text-gray-700"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '18px',
              lineHeight: '28px',
              color: '#384250',
              width: '100%',
              maxWidth: '616px'
            }}
          >
            The Atman is the original yogic term for the uncreated Self. The Atman projects a soul, which then constructs an embodied ego. The ego mind, or psyche, is internally fragmented. Whereas psychology functions at the ego level, we work at the level of soul, from which the ego program can be more rapidly upgraded. The soul can then return to the Atman.
            <br /><br />
            Atmanology is offered in private one-to-one sessions. Here you will engage in creative mono-dialogue, in which you will feel the joy and release of being able to speak freely and openly from the heart, in a reverie state, as an act of Self-discovery rather than as a preconceived presentation of a persona to an Other.
            <br /><br />
            The Atmanologist will perceive the blind spots, the points of incoherence, and the contradictions that arise in your stream of consciousness, thus helping you draw out their hidden meanings. At key moments, the adept Atmanologist will intervene with an unexpected question or observation that suddenly breaks apart the ego's discourse, revealing a deeper, unknown intelligence. Superego voices may also appear, as well as the notorious Shadow lurking in the subconscious. Finally, an even more subtle presence will be unveiled: that of the soul. This will catapult your awareness to the Superconscious Atman.
            <br /><br />
            An Atmanologist has learned to interpret the language of dreams using the capacity to creatively unpack the symbols that arise, not only in one's remembered night dreams, but also in the world dream—especially in the physical and emotional symptoms and the daily synchronicities that reveal one's conscious internal narratives to be dream messages from the soul. These insights bring re-connection to the Atman—the Real Self. You can then awaken to the real beauty and poetry of life.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AtmanologySection;