// ============================================================================
// DATA STRUCTURES FOR ALL SECTIONS
// All use default padding (py-16 lg:py-28) and gap (80px) from component
// ============================================================================

// 1. WHAT IS SAT YOGA SECTION
export const whatIsSatYogaData = {
    leftPane: {
      title: "What is Sat Yoga?",
      titleLineHeight: "120%",
      description: "The ancient Sanskrit term Sat refers to what is absolutely Real and thus implicitly imperishable. The term Yoga means union, or realization of oneness. To live in oneness with the eternally present Absolute Real is both the way and the goal of Sat Yoga.",
    /*  buttons: [
        {
          text: "Primary Action",
          url: "/link-here",
          variant: 'primary' // Red button
        },
        {
          text: "Secondary Action", 
          url: "/another-link",
          variant: 'secondary' // White button with red border
        }
      ]*/
    },
    rightPane: {
      type: 'bulletaccordion' as const,
      content: [
        {
          id: 0,
          title: "A Treasure Map",
          content: "To help the seeker of Truth fully understand what that means, Sat Yoga has elaborated a user-friendly map of the hidden treasures of reality, encompassing the entire spectrum of consciousness. We have also developed empowering operations for taking command of the mind. We offer these online and at our ashram, a self-sustaining spiritual community in the rural mountains of southern Costa Rica, where those seeking a shorter or longer retreat (or a permanent refuge) from this dying world can awaken latent powers and live joyously in Total Presence."
        },
        {
          id: 1,
          title: "An Agency for Intelligence Amplification",
          content: "The original Sat Yoga was already functioning as a means of increasing intelligence at the beginning of recorded history. It was deployed not only for wisdom but also for developing paranormal powers (siddhis). Yoga has served as the basis and engine of all religions, as well as the mystical, magical, and shamanic orders. In recent times, however, the term Yoga has been appropriated by the ego and has been diluted, commercialized, and too often diverted from its original purpose. Our approach returns to the ancient tradition of offering Darshan (direct transmission from the Source of Power), Diksha (initiation), Gyana (knowledge), and Sadhana (praxis). But we have re-engineered the process to enable you to reinforce your will power and courage to transcend the known. Our focus is on activating the capacity for immediate illumination."
        },
        {
          id: 2,
          title: "A Range of Processes and Non-Practice",
          content: "Because everyone requires an approach appropriate to their level of maturity, educational background, and conceptual intelligence, we employ a range of processes for those not ready for the ultimate non-practice of immediate Self-realization. These include not only direct encounters with our teacher (a master of dharma combat, or zen dialogue), but also individual alchemical counseling sessions with an adept mentor. The latter provide a safe space in which to uproot projections, transform emotions, and release the residue of trauma as well as attachments to obsolete thinking and behavior patterns. We also offer powerful meditation methods. Once you have tasted the ecstasy of inner silence and serenity, you will not stop short of obtaining life's grand prize. Along with that, you will know the joy of altruism, devotion, artistic expression, and embodying the paradoxical wisdom of the Avadhutas (those who live in complete freedom)."
        }
      ]
    }
  };
  
  // 2. METHODOLOGY SECTION
  export const methodologyData = {
    leftPane: {
      title: "Methodology"
    },
    rightPane: {
      type: 'accordion' as const,
      content: [
        {
          id: 0,
          title: "The Integration of Raja Yoga and Gyana Yoga",
          content: "Meditation is the gradual path to Self-sovereignty (in Sanskrit, Raja Yoga). Gaining mastery over the chattering mind and scattered attention may require the use of centering techniques, of which we have many. Understanding how the ego functions may help you change its tendency to self-sabotage. That is one aspect of Gyana Yoga. For those ready to activate their crown chakra, the higher Gyana (knowledge) will do the job."
        },
        {
          id: 1,
          title: "Kundalini Yoga: Re-Tuning the Radio",
          content: "Let's face it: Nearly all of us suffer from stunted intellectual development. This is not our fault. We are products of a narcissistic and nihilistic social system that never taught us our true potential for genius. Here we offer a step-by-step process to repair the damage to our attention span, intellectual curiosity, and capacity to descend into our innermost Being in order to attune to the infinite intelligence."
        },
        {
          id: 2,
          title: "Bhakti Yoga: Devotion and Surrender",
          content: "Open your Heart! That's the simplest way to reach God-consciousness. It is a cliché to say that God is love, but it is still the Truth. The more you resonate with the all-pervading Presence—which is felt as blissful love without an object or a subject—the easier it is to let go of all contractions, delusions, and karmic symptoms."
        },
        {
          id: 3,
          title: "Karma Yoga: Serving the Real",
          content: "True service of the Real requires attunement to the Real. Karma Yoga brings poise; lightness; accurate intention and timing of action; and glitch-free relations with people, the realm of Nature, and the social order."
        }
      ]
    }
  };
  
  // 3. CURRICULUM VITAE SECTION
  export const curriculumVitaeData = {
    leftPane: {
      tagline: "ABOUT",
      title: "Shunyamurti's Curriculum Vitae"
    },
    rightPane: {
      type: 'sections' as const,
      content: [
        {
          heading: "Early Inspirations",
          paragraphs: [
            "For Shunyamurti, consciousness awakened early. As a child, he would spend afternoons outdoors contemplating and writing poetry. This led to reading classic poetry and discovering the world of literature. He was active in sports, especially martial arts such as judo and aikido. Political consciousness awakened with the news of the murder of President Kennedy. He became an activist opposing the U.S. war in Vietnam, and that brought him to study Gandhi, the Bhagavad Gita, and the Upanishads—which explained his own inner states. His search culminated in the discovery of the books of Sri Ramana Maharshi, who most clearly exemplified the eternal Truths. By then, no doubt remained."
          ]
        },
        {
          heading: "Encountering Baba Hari Dass",
          paragraphs: [
            "The fullness of life in that period inevitably included abundant experimentation with psychedelics, hitchhiking adventures to many parts of the country and later the world, meeting leading figures in the avant-garde, and participating in some extraordinary events. The most profound experience was encountering Baba Hari Dass. The presence of that shining being brought to Shunyamurti overwhelming love and a long period of discipleship."
          ]
        },
        {
          heading: "Journey from Worldly to Otherworldly",
          paragraphs: [
            "After graduating from university with a double major in philosophy and drama and a minor in literature, Shunyamurti became the director of an international book club in New York City focused on insightful analyses of current issues in geopolitics. Eventually, he earned a law degree and a psychology doctorate. The practice of law was stultifying, but worthwhile because it satisfied his interest in cosmic law (to structure future human interactions with extraterrestrial visitors), karmic law, and the genuine worldly wisdom hidden at the heart of our degraded legal systems—plus, it taught him first-hand how the system worked."
          ]
        },
        {
          heading: "A Passage to India",
          paragraphs: [
            "He was rescued from a career as an attorney during a fervent solitary meditation retreat. The Great Spirit abducted him. An encounter with a teacher from India led to a pilgrimage in that land. Immersed in the exquisite divine energy field of an ashram, Shunyamurti bathed for ten years in that holy river of Gyana and Shakti, becoming a devoted yogi. Then, he received new marching orders from within: learn Western approaches to soul healing and become adept in offering help."
          ]
        },
        {
          heading: "Hypnosis and Beyond",
          paragraphs: [
            "After studying hypnotherapy, he began a private practice. He also took graduate courses in psychology at night and on weekends.",
            "A flourishing practice of transformational healing unfolded, evolving from Ericksonian hypnotherapy to past-life regression, to spirit de-possession, to ghost-busting at haunted houses, to working with people who had been captured and released by aliens, to removing curses imposed by practitioners of black magic, and even to being psychically attacked by those dark forces in revenge. He learned a great deal about the world of the occult and the paranormal."
          ]
        },
        {
          heading: "But then ...",
          paragraphs: [
            "But then, a very different immersion in psychoanalysis training—first Kleinian, then Lacanian—led Shunyamurti to a critical reappraisal of the role of such a focus on the paranormal, transforming his shamanic level of work to a higher spiritual level. He came to see that the subconscious had to be countervailed by the Superconscious, and those pivotal insights concerned the use of Kundalini energy. After correcting the psychoanalytic map of the structure of the ego and learning the language of dreams, the function was to abide in the Absolute.",
            "The rest is the story of the sangha, the ashram, and the miracles of our Lord. But that is for another page ..."
          ]
        }
      ]
    },
    backgroundElements: [
      {
        image: '/tree.png',
        desktop: {
          width: '1024px',
          height: '1536px',
          left: '-420px',
          top: '531.2px',
          background: 'linear-gradient(180deg, rgba(250, 248, 241, 0) 7.91%, #FAF8F1 79.92%)',
          zIndex: 0
        }
      }
    ]
  };
  
  // 4. ASHRAM END TIME SECTION
  export const ashramEndTimeData = {
    leftPane: {
      title: "An Ashram at the End of Time"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: [
        "What is different about an ashram established in the understanding that we are near the end of this age and of the whole cycle of history? We are not traditionalists or believers in a creed. We are not perfectionists, not necessarily ascetics, and mostly rebels and runaways; but the responsibilities of sustaining a farming community and serving in a wisdom school have refined our characters and given us at least a taste of divine ecstasy. We are not here to pass on any dogma, enlist anyone as a monk, or give out certificates. We are playing for higher stakes: Liberation.",
        "We understand that the chief responsibility of our residential sangha is to maintain an energy field filled with wisdom, love, and compassion—expressed as cheerfulness, friendship, cooperation, and forgiveness. And we are engaged in the constant practice of recognizing that all of reality is a single Consciousness.",
        "The ashram was founded in 2009 and has been sustained miraculously, thanks to the dedication, generosity, and faith of the founding members and the hard work and innovative ideas of those who came after them. The magnanimity of donors has been life-saving. We have also flourished thanks to the endless flow of new teachings—always more profound and powerful—transmitted through our yogic research director, Shunyamurti.",
        "We are not ordinary preppers or mere survivalists; but we do foresee the imminent collapse of civilization, and we intend to endure peacefully through the time of tribulations for so long as our service on this plane is required."
      ]
    },
    backgroundElements: [
      {
        image: '/nataraj.png',
        desktop: {
          width: '670px',
          height: '670px',
          left: '-200px',
          top: '250px',
          opacity: 0.1,
          zIndex: 0
        },
        mobile: {
          width: '560px',
          height: '700px',
          left: '-150px',
          top: '265px',
          opacity: 0.06,
          zIndex: 0
        }
      }
    ]
  };
  
  // 5. WHY PARTICIPATE SECTION
  export const whyParticipateData = {
    topMedia: {
      type: 'image' as const,
      src: '/whyparticipate.png',
      aspectRatio: '16/10',
      hasPlayButton: true
    },
    leftPane: {
      title: "Why Participate in an Ashram Retreat?"
    },
    rightPane: {
      type: 'paragraphs' as const,
      gap: '16px',
      content: [
        "A Sat Yoga Ashram retreat is unlike any other, offering not only a sacred spiritual refuge where nature's beauty mirrors the vastness of our whole Self—but also a living channel of new teachings, designed to open the hearts and minds of people with our current types of identity structures, and dealing with unprecedented situations.",
        "Located in the mountains of rural Costa Rica, far from city life, our community offers you a supernatural intensity of divine energy, bringing a profound serenity to the heart. The rhythms of the natural world in heightened presence guide you inward, dissolving the noise of the anxious mind and opening one to eternal life.",
        "Coming to the Ashram in person provides an extraordinary opportunity to attain the highest resonance, and thus more easily to cut identification with the ego. The direct support of Shunyamurti and the sangha, in dialogue and in deep meditation, in service and artistic creativity, will greatly accelerate and complete your journey to realization of the Supreme Self."
      ]
    }
  };
  
  // 6. SPIRITUAL TRIBE SECTION
  export const spiritualTribeData = {
    leftPane: {
      title: "A Spiritual Tribe Like No Other"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: [
        "Most of us had never even visited an ashram before arriving here. We grew up in the urban, materialist, consumerist, dumbed-down, puerile, and cynical culture that produced nearly everyone's ego—with a tenacious resistance to responsible adulthood and with few higher role models. We were saddled with a nihilistic attitude, seeking whatever crumbs of pleasure could be found. Fortunately, our karma got us to this refuge where we could start to heal our wounded souls.",
        "In short, we were not prepared for a life devoted to transcendence of the ego, nor even for managing a farm, a retreat center, and a complex website. We are learning on the go. That has added an edge of aliveness and willingness to accept beginner's mind, along with the thrill of solving enigmas and gasping in wonder at the impossible synchronicities that have kept us afloat.",
        "Even more miraculously, we have learned how to get along, how to accommodate the other, how to resolve conflicts, and (most importantly) how to stop projecting—instead, to eliminate attitudes that produce glitches in the field. We have learned how to disidentify from our own self-presentations, and we have learned the hard way—through our experience of karma and dharma and the sting of intense inner work—the vital importance of these teachings."
      ]
    }
  };
  
  // 7. WHAT IS SHUNYAMURTI SECTION
  export const whatIsShunyamurtiData = {
    leftPane: {
      title: "What is Shunyamurti?",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: [
        "To answer that, we must begin by understanding his chosen yogic name. Shunya means \"empty,\" while murti means \"form.\" In fact, all of us are empty forms, but most stay in denial of that. He wants to express and live in Truth.<br /><br />Emptiness is a central term, not only in Buddhism but in all the Asian wisdom schools. It signifies that the bodily character is unreal, a mere appearance in a holographic light show disguised as a world. Because one's persona is fictional, its suffering is empty of reality. This light show, or dream field, is made of the Light of Infinite Consciousness. Once there has been recognition of the emptiness of all forms, then the Real Self underlying, pervading, and dreaming this whole cosmic play can be realized. At that point, the other side of emptiness is revealed as the unmanifest, formless Fullness of eternal and unlimited freedom and joy.<br /><br />The One Intelligence is dreaming all of us and is the inmost Self of each apparent entity. In Shunyamurti's case, recognition of the fictional nature of the world and of people came early in life. That freed him from conventional constraints, enabling him to resist temptations to settle for anything less than the full unfoldment of the potency of Consciousness. Life became a quest for the Real.<br /><br />Grace comes as the power to silence the mind. In the stillness of Total Presence, energy and information from the Infinite Self can be channelled through the bodily icon. The teachings of Sat Yoga have come from that Source."
      ]
    }
  };
  
  // 8. ATMANOLOGY SECTION
  export const atmanologyData = {
    leftPane: {
      title: "Atmanology: Beyond Psychology",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: [
        "The Atman is the original yogic term for the uncreated Self. The Atman projects a soul, which then constructs an embodied ego. The ego mind, or psyche, is internally fragmented. Whereas psychology functions at the ego level, we work at the level of soul, from which the ego program can be more rapidly upgraded. The soul can then return to the Atman.<br /><br />Atmanology is offered in private one-to-one sessions. Here you will engage in creative mono-dialogue, in which you will feel the joy and release of being able to speak freely and openly from the heart, in a reverie state, as an act of Self-discovery rather than as a preconceived presentation of a persona to an Other.<br /><br />The Atmanologist will perceive the blind spots, the points of incoherence, and the contradictions that arise in your stream of consciousness, thus helping you draw out their hidden meanings. At key moments, the adept Atmanologist will intervene with an unexpected question or observation that suddenly breaks apart the ego's discourse, revealing a deeper, unknown intelligence. Superego voices may also appear, as well as the notorious Shadow lurking in the subconscious. Finally, an even more subtle presence will be unveiled: that of the soul. This will catapult your awareness to the Superconscious Atman.<br /><br />An Atmanologist has learned to interpret the language of dreams using the capacity to creatively unpack the symbols that arise, not only in one's remembered night dreams, but also in the world dream—especially in the physical and emotional symptoms and the daily synchronicities that reveal one's conscious internal narratives to be dream messages from the soul. These insights bring re-connection to the Atman—the Real Self. You can then awaken to the real beauty and poetry of life."
      ]
    }
  };

