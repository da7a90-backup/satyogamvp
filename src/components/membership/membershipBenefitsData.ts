export const membershipBenefitsData = {
  backgroundColor: '#FAF8F1',
  leftPane: {
    title: 'Details',
    description: 'Have a question before signing up? We\'re here to help—reach out anytime.',
    buttons: [
      {
        text: 'Contact',
        url: '/contact?queryType=membership',
        variant: 'secondary' as const
      },
      {
        text: 'Start Now',
        url: '/membership',
        variant: 'primary' as const
      }
    ]
  },
  rightPane: {
    type: 'accordion' as const,
    content: [
      {
        id: 0,
        title: 'Personal Dashboard',
        content: 'Access the Sat Yoga teachings anytime, anywhere through our seamlessly responsive Dashboard. Pick up exactly where you left off, bookmark favorite teachings, revisit past retreats, or navigate our fully searchable wisdom library. Your live calendar keeps you connected to upcoming classes and events in real time, with all content automatically syncing across devices.'
      },
      {
        id: 1,
        title: 'Wisdom Library with 1,000+ Publications',
        content: 'Gain access to an exclusive collection of full-length teachings not available on YouTube, (guided meditations, profound essays, and Q&A sessions with Shunyamurti—all specially selected and easily searchable to accelerate your spiritual awakening).'
      },
      {
        id: 2,
        title: 'New Publications Added Weekly',
        content: 'Stay engaged with fresh content added to the Wisdom Library every week, including full-length video teachings, audio recordings, transcripts, guided meditations, and insightful Q&A sessions with Shunyamurti.'
      },
      {
        id: 3,
        title: 'Pragyani Exclusive Teachings',
        content: 'As a Pragyani, gain access to rare and advanced teachings designed for the most dedicated seekers. Immerse yourself in profound transmissions and become part of the spiritual renaissance unfolding at the Ashram.'
      },
      {
        id: 4,
        title: 'Shunyamurti\'s Recommended Resources',
        content: 'Take a peek into Shunyamurti\'s personal library, getting recommendations on books to deepen your knowledge across a vast variety of topics. Follow along with the Ashram\'s studies by exploring documentary films screened with the Sangha—each chosen to support your journey to higher knowledge and spiritual realization.'
      },
      {
        id: 5,
        title: 'Shunyamurti Book Study',
        content: 'Study Shunyamurti\'s books alongside the author himself, unraveling the intricate layers of meaning in The Dao of the Final Days. Further your exploration of the psychological dimensions of his teachings with Radha Ma, who leads an in-depth study of Gems of Wisdom Volume One, Coming Full Circle: The Secret of the Singularity, revealing its transformative insights.'
      },
      {
        id: 6,
        title: 'Book Group Review',
        content: 'Join Shunyamurti for fourteen transformative classes (each over 90 minutes long) as he unpacks and expands upon The Flight of the Garuda, a profound series of Dzogchen poems. Or explore the psychological and spiritual dimensions of Overcoming Narcissism in an illuminating 11-class series, led by Radha Ma, offering deep insights and powerful tools for transformation.'
      },
      {
        id: 7,
        title: 'Study Group Review',
        content: 'Embark on a profound journey through some of Shunyamurti\'s most essential yet rarely explored teachings. Radha Ma carefully revisits and unpacks these classical transmissions. With over 22 classes so far, this ongoing series delves into key units such as: "Transforming the Imaginary," "Cultivating the Will," "Potencies," "The Structure of Experience," and "Brain Sludge."'
      },
      {
        id: 8,
        title: 'Community Forum',
        content: 'Engage in deep, meaningful discussions with a global community of truth-seekers. Share insights, ask questions, and express your creative spirit in an uplifting space dedicated to spiritual growth and exploration.'
      },
      {
        id: 9,
        title: 'Live Sunday Group Meditation',
        content: 'Join the Sat Yoga Ashram Sangha every Sunday for our community meditation that amplifies your energy field, deepens your inner stillness, and aligns your consciousness with the divine presence.'
      },
      {
        id: 10,
        title: 'Live Surprise Satsangs with Shunyamurti',
        content: 'Be present for spontaneous, live transmissions from Shunyamurti. You will have the opportunity to join live teachings and Q&A sessions, receiving wisdom directly from the divine source.'
      },
      {
        id: 11,
        title: 'Live Study Group with Radha Ma',
        content: 'Deepen your understanding of Shunyamurti\'s teachings with Radha Ma, who offers advanced explanations and guidance on integrating these profound insights into your spiritual practice.'
      },
      {
        id: 12,
        title: 'Live Teaching Discussion Group',
        content: 'Join the Sat Yoga Teaching Team for an in-depth exploration of Shunyamurti\'s teachings. Each session begins with a selected video teaching or essay, serving as a springboard for profound study and discussion. Engage in meaningful dialogue and expand your understanding in a supportive group setting.'
      },
      {
        id: 13,
        title: 'Ask Shunyamurti',
        content: 'A dedicated space for Pragyani and Pragyani+ members to submit personal questions via email and receive direct, insightful responses from Shunyamurti, offering guidance and clarity on the spiritual path.'
      },
      {
        id: 14,
        title: 'Lifetime Access to All Online Retreats',
        content: 'As a Pragyani+ member, receive unlimited VIP access to Shunyamurti\'s transformative retreats (valued at $1,970/year). These profound gatherings form the pinnacle of our wisdom school curriculum. These retreats are a rare opportunity to ask Shunyamurti the most precious questions from your heart, receive direct guidance on the path to Self-Realization, and raise the vibrational frequency of the morphogenic field.'
      }
    ]
  }
};
