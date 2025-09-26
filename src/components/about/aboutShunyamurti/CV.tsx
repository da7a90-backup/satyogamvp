'use client';

const CurriculumVitaeSection = () => {
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
        className="w-full flex flex-col lg:flex-row items-start relative"
        style={{
          maxWidth: '1312px',
          margin: '0 auto',
          gap: '80px'
        }}
      >
        {/* Left Column */}
        <div 
          className="w-full lg:w-auto lg:flex-shrink-0 flex flex-col items-start relative"
          style={{
            width: 'clamp(300px, 50vw, 616px)',
            gap: '16px'
          }}
        >
          {/* Tagline */}
          <div 
            className="flex items-center"
            style={{
              width: '56px',
              height: '24px'
            }}
          >
            <span 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#B8860B',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              ABOUT
            </span>
          </div>

          {/* Title */}
          <h2 
            className="text-black"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontWeight: 550,
              fontSize: 'clamp(28px, 4vw, 48px)',
              lineHeight: '125%',
              letterSpacing: '-0.02em',
              width: '100%'
            }}
          >
            Shunyamurti's Curriculum Vitae
          </h2>

          {/* Tree Background - Positioned Absolutely */}
          <div
            className="absolute hidden lg:block"
            style={{
              width: '1024px',
              height: '1536px',
              left: '-420px',
              top: '531.2px',
              background: 'linear-gradient(180deg, rgba(250, 248, 241, 0) 7.91%, #FAF8F1 79.92%), url(/tree.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              zIndex: 0
            }}
          />
        </div>

        {/* Right Column - Content */}
        <div 
          className="w-full flex flex-col items-start relative z-10"
          style={{
            maxWidth: '616px',
            gap: '32px'
          }}
        >
          {/* Early Inspirations */}
          <div 
            className="flex flex-col items-start"
            style={{
              gap: '16px',
              width: '100%'
            }}
          >
            <div 
              className="flex items-center"
              style={{
                gap: '4px',
                width: '178px',
                height: '30px'
              }}
            >
              <h3 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontWeight: 600,
                  fontSize: '20px',
                  lineHeight: '30px',
                  color: '#000000',
                  width: '158px'
                }}
              >
                Early Inspirations
              </h3>
            </div>
            <p 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontWeight: 400,
                fontSize: '18px',
                lineHeight: '28px',
                color: '#384250',
                width: '596px'
              }}
            >
              For Shunyamurti, consciousness awakened early. As a child, he would spend afternoons outdoors contemplating and writing poetry. This led to reading classic poetry and discovering the world of literature. He was active in sports, especially martial arts such as judo and aikido. Political consciousness awakened with the news of the murder of President Kennedy. He became an activist opposing the U.S. war in Vietnam, and that brought him to study Gandhi, the Bhagavad Gita, and the Upanishads—which explained his own inner states. His search culminated in the discovery of the books of Sri Ramana Maharshi, who most clearly exemplified the eternal Truths. By then, no doubt remained.
            </p>
          </div>

          {/* Encountering Baba Hari Dass */}
          <div 
            className="flex flex-col items-start"
            style={{
              gap: '16px',
              width: '100%'
            }}
          >
            <h3 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '30px',
                color: '#000000'
              }}
            >
              Encountering Baba Hari Dass
            </h3>
            <p 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontWeight: 400,
                fontSize: '18px',
                lineHeight: '28px',
                color: '#384250'
              }}
            >
              The fullness of life in that period inevitably included abundant experimentation with psychedelics, hitchhiking adventures to many parts of the country and later the world, meeting leading figures in the avant-garde, and participating in some extraordinary events. The most profound experience was encountering Baba Hari Dass. The presence of that shining being brought to Shunyamurti overwhelming love and a long period of discipleship.
            </p>
          </div>

          {/* Journey from Worldly to Otherworldly */}
          <div 
            className="flex flex-col items-start"
            style={{
              gap: '16px',
              width: '100%'
            }}
          >
            <h3 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '30px',
                color: '#000000'
              }}
            >
              Journey from Worldly to Otherworldly
            </h3>
            <p 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontWeight: 400,
                fontSize: '18px',
                lineHeight: '28px',
                color: '#384250'
              }}
            >
              After graduating from university with a double major in philosophy and drama and a minor in literature, Shunyamurti became the director of an international book club in New York City focused on insightful analyses of current issues in geopolitics. Eventually, he earned a law degree and a psychology doctorate. The practice of law was stultifying, but worthwhile because it satisfied his interest in cosmic law (to structure future human interactions with extraterrestrial visitors), karmic law, and the genuine worldly wisdom hidden at the heart of our degraded legal systems—plus, it taught him first-hand how the system worked.
            </p>
          </div>

          {/* A Passage to India */}
          <div 
            className="flex flex-col items-start"
            style={{
              gap: '16px',
              width: '100%'
            }}
          >
            <h3 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '30px',
                color: '#000000'
              }}
            >
              A Passage to India
            </h3>
            <p 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontWeight: 400,
                fontSize: '18px',
                lineHeight: '28px',
                color: '#384250'
              }}
            >
              He was rescued from a career as an attorney during a fervent solitary meditation retreat. The Great Spirit abducted him. An encounter with a teacher from India led to a pilgrimage in that land. Immersed in the exquisite divine energy field of an ashram, Shunyamurti bathed for ten years in that holy river of Gyana and Shakti, becoming a devoted yogi. Then, he received new marching orders from within: learn Western approaches to soul healing and become adept in offering help.
            </p>
          </div>

          {/* Hypnosis and Beyond */}
          <div 
            className="flex flex-col items-start"
            style={{
              gap: '16px',
              width: '100%'
            }}
          >
            <h3 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '30px',
                color: '#000000'
              }}
            >
              Hypnosis and Beyond
            </h3>
            <div 
              className="flex flex-col"
              style={{
                gap: '16px'
              }}
            >
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontWeight: 400,
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                After studying hypnotherapy, he began a private practice. He also took graduate courses in psychology at night and on weekends.
              </p>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontWeight: 400,
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                A flourishing practice of transformational healing unfolded, evolving from Ericksonian hypnotherapy to past-life regression, to spirit de-possession, to ghost-busting at haunted houses, to working with people who had been captured and released by aliens, to removing curses imposed by practitioners of black magic, and even to being psychically attacked by those dark forces in revenge. He learned a great deal about the world of the occult and the paranormal.
              </p>
            </div>
          </div>

          {/* But then ... */}
          <div 
            className="flex flex-col items-start"
            style={{
              gap: '16px',
              width: '100%'
            }}
          >
            <h3 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '30px',
                color: '#000000'
              }}
            >
              But then ...
            </h3>
            <div 
              className="flex flex-col"
              style={{
                gap: '16px'
              }}
            >
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontWeight: 400,
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                But then, a very different immersion in psychoanalysis training—first Kleinian, then Lacanian—led Shunyamurti to a critical reappraisal of the role of such a focus on the paranormal, transforming his shamanic level of work to a higher spiritual level. He came to see that the subconscious had to be countervailed by the Superconscious, and those pivotal insights concerned the use of Kundalini energy. After correcting the psychoanalytic map of the structure of the ego and learning the language of dreams, the function was to abide in the Absolute.
              </p>
              <p 
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontWeight: 400,
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                The rest is the story of the sangha, the ashram, and the miracles of our Lord. But that is for another page ...
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurriculumVitaeSection;