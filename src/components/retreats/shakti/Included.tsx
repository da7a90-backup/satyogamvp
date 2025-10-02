import { Check } from 'lucide-react';

const ShaktiIncludedSection = () => {
  return (
    <section 
      className="w-full flex flex-col justify-center items-center px-4 lg:px-16 py-16 lg:py-16"
      style={{ backgroundColor: '#FAF8F1', gap: '80px' }}
    >
      <div className="w-full max-w-7xl mx-auto flex flex-col items-start" style={{ gap: '64px' }}>
        {/* Section Title */}
        <h2 
          style={{
            fontFamily: 'Optima, Georgia, serif',
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 550,
            lineHeight: '125%',
            letterSpacing: '-0.02em',
            color: '#000000'
          }}
        >
          Included
        </h2>

        {/* Three Column Grid - All items aligned in rows */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Item 1 */}
          <div className="flex items-start" style={{ gap: '16px' }}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <Check size={20} style={{ color: '#000000' }} />
            </div>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              <h3 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '28px',
                  color: '#000000'
                }}
              >
                Advanced Seminar with Shunyamurti
              </h3>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                Every seminar led by Shunyamurti brings new advances in understanding the ultimate mysteries of the Real. Such an event forms the core of this accelerated course, offering direct transmission of divine energy and insight that brings resonance with the Source. Through these teachings, previous misunderstandings of reality can drop away—and a new blossoming of your soul's potential will bring wonderment and joy.
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-start" style={{ gap: '16px' }}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <Check size={20} style={{ color: '#000000' }} />
            </div>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              <h3 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '28px',
                  color: '#000000'
                }}
              >
                Sacred Satsang with Shunyamurti
              </h3>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                One of the greatest joys of ashram life is coming together for sacred satsangs with Shunyamurti. These intimate gatherings offer a space to ask questions, perceive new mind-boggling paradoxes operating in consciousness, and to internalize a higher vibrational frequency.
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-start" style={{ gap: '16px' }}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <Check size={20} style={{ color: '#000000' }} />
            </div>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              <h3 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '28px',
                  color: '#000000'
                }}
              >
                Seva & Community Service
              </h3>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                One way to open your heart is through seva (selfless service), uniting your will with the needs of the whole community. You may be asked to offer assistance in the ashram kitchen, or to give loving attention to the plants in our gardens, or to help keep the meditation hall in proper order, or other activities augmenting our hospitality for everyone. A deep sense of satisfaction will ensue.
              </p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex items-start" style={{ gap: '16px' }}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <Check size={20} style={{ color: '#000000' }} />
            </div>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              <h3 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '28px',
                  color: '#000000'
                }}
              >
                Charming Cabin Accommodations
              </h3>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                Nestled in pristine nature, our peaceful lodgings provide the perfect refuge for rest and renewal. Encompassed by wild forests and the celestial stillness of starry nights, your accommodations offer comfort, beauty, and tranquillity. Each room includes a private bath and a balcony for solitary contemplation
              </p>
            </div>
          </div>

          {/* Item 5 */}
          <div className="flex items-start" style={{ gap: '16px' }}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <Check size={20} style={{ color: '#000000' }} />
            </div>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              <h3 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '28px',
                  color: '#000000'
                }}
              >
                Meditation Gatherings
              </h3>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                The power of regular group meditation sittings, several times per day, will reinvigorate your enthusiasm for ultimate Liberation. The power of Presence brings ecstatic intoxication, stillness free of thought, and the ending of anxiety.
              </p>
            </div>
          </div>

          {/* Item 6 */}
          <div className="flex items-start" style={{ gap: '16px' }}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <Check size={20} style={{ color: '#000000' }} />
            </div>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              <h3 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '28px',
                  color: '#000000'
                }}
              >
                Artistic Expression & Satsangs
              </h3>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                Express your creativity through art and participate in Satsangs, where Shunyamurti will guide open dialogues exploring life's deeper questions. These sessions invite personal insight and community connection.
              </p>
            </div>
          </div>

          {/* Item 7 */}
          <div className="flex items-start" style={{ gap: '16px' }}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <Check size={20} style={{ color: '#000000' }} />
            </div>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              <h3 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '28px',
                  color: '#000000'
                }}
              >
                Core Curriculum Module Classes
              </h3>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                Small group classes delve into the core modules of our wisdom school curriculum. Designed to help you become free of a false and obsolete identity, our complete re-engineering of the ancient knowledge of nonduality can activate higher levels of consciousness—and even bring instant enlightenment.
              </p>
            </div>
          </div>

          {/* Item 8 */}
          <div className="flex items-start" style={{ gap: '16px' }}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <Check size={20} style={{ color: '#000000' }} />
            </div>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              <h3 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '28px',
                  color: '#000000'
                }}
              >
                Optional Atmanology Sessions
              </h3>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                The really serious seekers of inner transformation may choose to explore and alter the subconscious foundations of the ego complex, by engaging in private sessions of Atmanology—a therapeutic modality that opens up the higher reaches of Kundalini. These dialogues can quickly demolish obstacles to Self-realization.
              </p>
            </div>
          </div>

          {/* Item 9 */}
          <div className="flex items-start" style={{ gap: '16px' }}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <Check size={20} style={{ color: '#000000' }} />
            </div>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              <h3 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '28px',
                  color: '#000000'
                }}
              >
                Nourishing Vegetarian Cuisine
              </h3>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                Hearty vegetarian meals, prepared with fresh ingredients—mostly sourced from our own gardens and farms—even a picky palate. We offer vegan and gluten-free options to those on special diets.
              </p>
            </div>
          </div>

          {/* Item 10 */}
          <div className="flex items-start" style={{ gap: '16px' }}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <Check size={20} style={{ color: '#000000' }} />
            </div>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              <h3 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '28px',
                  color: '#000000'
                }}
              >
                Evening Community Classes
              </h3>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                The evenings furnish a variety of cultural events, including devotional singing, participation in psychodramas, screening and discussion of cutting-edge videos on science and psychology, feature films, further study of recent teachings, plus guided meditations.
              </p>
            </div>
          </div>

          {/* Item 11 */}
          <div className="flex items-start" style={{ gap: '16px' }}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <Check size={20} style={{ color: '#000000' }} />
            </div>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              <h3 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '28px',
                  color: '#000000'
                }}
              >
                Morning & Evening Meditations
              </h3>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                Each day begins and ends with group meditation sessions, held in the tranquil setting of the ashram. These practices are guided by Shunyamurti and designed to cultivate deep presence, stillness, and connection with the community.
              </p>
            </div>
          </div>

          {/* Item 12 */}
          <div className="flex items-start" style={{ gap: '16px' }}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <Check size={20} style={{ color: '#000000' }} />
            </div>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              <h3 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '28px',
                  color: '#000000'
                }}
              >
                Creative Expression & Sacred Arts
              </h3>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                Open yourself to the flow of inspiration through our practices of artistic expression. During your month-long stay, you may have the opportunity to engage in devotional singing, improvisational theater games, creative writing, and painting. These sacred arts serve as pathways to Self-discovery and healing.
              </p>
            </div>
          </div>

          {/* Item 13 */}
          <div className="flex items-start" style={{ gap: '16px' }}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <Check size={20} style={{ color: '#000000' }} />
            </div>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              <h3 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '28px',
                  color: '#000000'
                }}
              >
                Ashram Tour
              </h3>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                You will learn a great deal about the principles of living sustainably in our popular Prema-culture tour, our unique approach to permaculture infused with prema, or divine love. Visit our thriving greenhouses and food gardens and learn how we cultivate organic produce in harmony with Nature and Spirit.
              </p>
            </div>
          </div>

          {/* Item 14 */}
          <div className="flex items-start" style={{ gap: '16px' }}>
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <Check size={20} style={{ color: '#000000' }} />
            </div>
            <div className="flex flex-col" style={{ gap: '16px' }}>
              <h3 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  lineHeight: '28px',
                  color: '#000000'
                }}
              >
                Walks in Nature
              </h3>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                Wander along our well-tended paths where every tree, stream, butterfly, and bird bring renewed connection to the Beyond. You may hear the roar of monkeys or catch a glimpse of an adorable sloth. Each breeze will utter whispers from the Beyond. The energy of the Earth is charged with vital power that your body will gladly receive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShaktiIncludedSection;