// app/about/page.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Define types for our content
type Sage = {
  name: string;
  title: string;
  image: string;
};

type BlogPost = {
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
};

const AboutPage = () => {
  // Sample data for sages
  const sages: Sage[] = [
    { name: 'Name Last name', title: 'Teacher', image: '/placeholder.jpg' },
    { name: 'Name Last name', title: 'Teacher', image: '/placeholder.jpg' },
    { name: 'Name Last name', title: 'Teacher', image: '/placeholder.jpg' },
    { name: 'Name Last name', title: 'Teacher', image: '/placeholder.jpg' },
  ];

  // Sample data for blog posts
  const blogPosts: BlogPost[] = [
    { 
      title: 'Wisdom School...', 
      category: 'Category', 
      author: 'Donna', 
      date: 'March 21, 2024', 
      readTime: '5 min read',
      image: '/placeholder.jpg' 
    },
    { 
      title: 'Patron Sages...', 
      category: 'Category', 
      author: 'Donna', 
      date: 'March 21, 2024', 
      readTime: '5 min read',
      image: '/placeholder.jpg' 
    },
    { 
      title: 'East & West Shakti Saturation', 
      category: 'Category', 
      author: 'Donna', 
      date: 'March 21, 2024', 
      readTime: '5 min read',
      image: '/placeholder.jpg' 
    },
    { 
      title: 'Workers\' Christm...', 
      category: 'Category', 
      author: 'Donna', 
      date: 'March 21, 2024', 
      readTime: '5 min read',
      image: '/placeholder.jpg' 
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4">
      {/* Header Section */}
      <div className="text-center py-12">
        <div className="text-purple-600 mb-2">About</div>
        <h1 className="text-5xl font-bold mb-2">Sat Yoga</h1>
        <div className="text-xl mb-8">Wisdom School</div>
        
        <div className="w-full h-96 bg-gray-200 relative mb-16">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-48 h-48 bg-gray-400 rounded-md flex items-center justify-center">
              <div className="text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="md:col-span-1">
          <div className="text-blue-600 mb-2">Sat Yoga</div>
          <h2 className="text-4xl font-bold mb-6">A Treasure Map, an Intelligence Agency, a Non-Practice, and a Shelter from the Storm</h2>
        </div>
        
        <div className="md:col-span-2 space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              An Agency for Intelligence Amplification
            </h3>
            <p className="mb-4">
              The ancient Sanskrit term Sat refers to what is absolutely Real—which implies being imperishable. The term Yoga means union, or realization of oneness. To live in oneness with the eternally present Absolute Real is both the way and the goal of Sat Yoga.
            </p>
            <p>
              To help the seeker of Truth fully understand what that means, Sat Yoga has elaborated a user-friendly map of the hidden treasures of reality, encompassing the entire spectrum of consciousness. We have also developed empowering operations for taking command of the mind. We offer these online and at our ashram, a self-sustaining metamorphic community in the rural mountains of southern Costa Rica—for those seeking either a short or longer retreat or a permanent refuge from a dying world, where you can awaken your latent powers and live joyously in Total Presence.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              An Agency for Intelligence Amplification
            </h3>
            <p>
              The original Sat Yoga was already functioning as a means of increasing intelligence at the beginning of recorded history. It was deployed not only for wisdom, but also for developing paranormal powers (siddhis). Thus, Yoga has served as the basis and engine of all religions, as well as the mystical, magical, and shamanic orders. But in recent times, the term Yoga has been appropriated by the ego and has been diluted, commercialized, and too often diverted from its original purpose. Our approach returns to the ancient tradition of offering Darshan, Diksha, Gyana, and Sadhana (direct transmission from the Source of Power, initiation, knowledge, and praxis). But we have re-engineered the process to enable you to reinforce your will power and courage to transcend the known. Our focus is on activating the capacity for immediate illumination.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              A Range of Processes and Non-Practice
            </h3>
            <p>
              Because everyone requires an approach appropriate for their level of maturity and intelligence, we employ a range of processes for those not ready for the ultimate non-practice. These include not only direct encounters with our teacher, a master of dharma combat (or zen dialogue), as well as individual sessions with an adept mentor, providing a safe space to uproot projections, transform emotions, and release attachments to obsolete thinking and behavior patterns. Astute meditation methods are also offered. Once you have tasted the ecstasy of inner silence and serenity, you will not stop short of the grand prize. Along with that, you will know the joy of altruism, devotion, artistic expression, and embodying the outrageous wisdom of the Avadhutas (those who live in complete freedom).
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              A Refuge for Body and Soul
            </h3>
            <p>
              Thanks to the foresight of our founders, who many years ago perceived the ongoing environmental disasters, the degradation of the global geopolitical order, the growing chaos, crime, and general disruption of life, and the loss of freedom in every society—and who had the courage to take action—we have been able to create a sustainable yogic community. We are open to accepting new members who share our values and want to serve the world through raising consciousness.
            </p>
          </div>
        </div>
      </div>

      {/* Patron Sages */}
      <div className="mb-16">
        <h2 className="text-4xl font-bold mb-8">Our Patron (and Matron) Sages</h2>
        
        <p className="mb-4">
          The star exemplar of liberation in life in modern times is Sri Ramana Maharishi, who transcended the ego illusion in one afternoon at the age of sixteen, and who without intention became a world teacher.
        </p>
        
        <p className="mb-4">
          We admire all the recent spiritual geniuses of India, including Ananda Mayi Ma, Yogananda, Swami Lakshmanjoo, Sri Aurobindo, and Sri Nisargadatta.
        </p>
        
        <p className="mb-4">
          The Buddha Dharma is also appreciated. As are the paradoxes of the Christian mystics. We revel in the fiery drunkenness of the wild Sufis, and laugh at the antics of trickster sages from the Daoist and Zen lineages, not to mention the fascinating formulations of the old Alchemists.
        </p>
        
        <p className="mb-8">
          Some of the ancient Greeks have also left us jewels of practical wisdom, and important insights have been delivered by a number of recent paradigm-shifters, all of which we drink in and assimilate.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {sages.map((sage, index) => (
            <div key={index} className="bg-gray-200 p-4 relative">
              <div className="h-64 flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gray-300 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>{sage.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div className="text-center italic text-xl mb-16 px-8 md:px-24">
        <p>
          "A seeker of the Real should not follow a path. The only true path is originality. Sat Yoga is not a path: we teach you how to use a compass and a machete, and encourage you to cut a new path of your own."
        </p>
        <div className="flex justify-center mt-6 mb-2">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        <div className="text-sm">Shunyamurti</div>
      </div>

      {/* Methodology */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="md:col-span-1">
          <h2 className="text-4xl font-bold mb-6">Methodology</h2>
        </div>
        
        <div className="md:col-span-2 space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              The Integration of Raja Yoga and Gyana Yoga
            </h3>
            <p>
              Meditation is the gradual path to Self-sovereignty (in Sanskrit: Raja Yoga). Gaining mastery over the chattering mind and scattered attention may require the use of centering techniques, of which we have many. Understanding how the ego functions may help you change its tendency to self-sabotage. That is one aspect of Gyana Yoga. For those ready to activate their crown chakra, the higher Gyana (knowledge) will do the job.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Kundalini Yoga: Re-Tuning the Radio
            </h3>
            <p>
              Let's face it: we all suffer from stunted intellectual development. This is not our fault. We are products of a narcissistic and nihilistic social system. We were never taught our true potential for genius. Here we offer a step-by-step process to repair the damage and attune to our infinite intelligence.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Bhakti Yoga: Devotion and Surrender
            </h3>
            <p>
              Open your Heart! That's the simplest way to reach God-consciousness. It is a cliché to say that God is love—but it is still the Truth. The more you resonate with the all-pervading Presence, the easier it is to let go of all contractions and karmic symptoms.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Karma Yoga: Serving the Real
            </h3>
            <p>
              True service of the Real (Karma Yoga) requires attunement to the Real. This brings poise, lightness, accurate intention and timing of action, and glitch-free relations with people, the realm of Nature, and the social order.
            </p>
          </div>
        </div>
      </div>

      {/* Atmanology */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="md:col-span-1">
          <h2 className="text-4xl font-bold mb-6">Atmanology</h2>
          <p className="mb-6">Beyond Psychology</p>
        </div>
        
        <div className="md:col-span-2 space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Lorem ipsum dolor
            </h3>
            <p className="mb-4">
              The Atman is the original yogic term for the uncreated Self. The Atman projects a soul, a Jivatman, which constructs an embodied ego, a Jiva. The ego mind, or psyche, is internally fragmented. Psychology functions at the ego level. Here we work at the level of soul, from which the ego program can be more rapidly upgraded. The soul can then return to the Atman.
            </p>
            <p className="mb-4">
              Atmanology is staged as a one-to-one mono-dialogue, in which the sadhak (the seeker of Truth) speaks as freely and openly as possible from the heart, in a reverie state, as an act of Self-discovery, rather than as a preconceived presentation of a persona to an Other.
            </p>
            <p className="mb-4">
              But the presence of this uncanny Other, who can perceive the blind spots, the aporias, and the contradictions that arise in the sadhak's monologue, draws out the hidden metaphors. At key moments, the adept Atmanologist will intervene with an unexpected question or observation that suddenly breaks apart the ego's discourse—and reveals a deeper, unspeakable entelechy. This may be a superego voice, or the notorious Shadow hidden in the subconscious, or it may be the deep-state censor within the ego—but its activity, once brought to the surface, reveals an even more subtle presence: that of the soul. This shifts the sadhak's awareness to the Superconscious Atman.
            </p>
            <p>
              An Atmanologist has learned the language of dreams, with the capacity to creatively unpack the symbols that arise, not only in the sadhak's remembered night dreams, but in the physical and emotional symptoms and the daily synchronicities, that reveal one's conscious internal narratives to be dream messages from and for the soul, for the purpose of enabling reconnection with the Atman. Through this process of psycho-excavation, the subconscious residues of infantile fantasies and other incoherences of a fragmented mind can be easily removed. One can then awaken to the real beauty and poetry of life.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Section */}
      <div className="mb-16">
        <div className="text-purple-600 mb-2">An Extra Treasure</div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold">A Blog to Set You Ablaze</h2>
          <Link href="/blog" className="bg-black text-white px-4 py-2 rounded-md">View all</Link>
        </div>
        <p className="mb-8">
          Check out these short blasts of Truth by Shunyamurti. Inhale a few lines and your spirit will be set on fire.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {blogPosts.map((post, index) => (
            <div key={index} className="bg-gray-200 relative">
              <div className="h-48 relative">
                <div className="absolute top-4 right-4 bg-gray-300 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </div>
                <div className="w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-1">{post.category}</div>
                <h3 className="font-bold mb-2">{post.title}</h3>
                <div className="text-sm">
                  By {post.author} | As Shunyamurti recently stated, the undesirableness of the loca...
                </div>
                <div className="flex items-center mt-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <div>{post.author}</div>
                    <div>{post.date} • {post.readTime}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {[0, 1, 2, 3, 4, 5].map((dot, index) => (
              <div 
                key={index} 
                className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-black' : 'bg-gray-300'}`}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end mb-16">
          <button className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Portal Section */}
      <div className="text-center mb-16">
        <div className="text-purple-600 mb-2">Your Free Dojo and Gym for Genius Training!</div>
        <h2 className="text-4xl font-bold mb-6">The Portal is Open to You...</h2>
        <p className="max-w-2xl mx-auto mb-8">
          Build those mental muscles! Don't sprain your Achilles heel or ankle! This shrewd selection of some of Shunyamurti's most empowering ideas will be both healing and liberating. These videos include some from our public channels and others that are only available to members.
        </p>
        <button className="bg-black text-white px-6 py-3 rounded-md">Learn more</button>
      </div>


    </div>
  );
};

export default AboutPage;