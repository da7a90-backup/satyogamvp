// src/data/homepage-data.ts

export interface HomePageData {
    hero: HeroSectionData;
    intro: IntroSectionData;
    whoWeAre: WhoWeAreSectionData;
    shunyamurti: ShunyamurtiSectionData;
    learnOnline: LearnOnlineSectionData;
    ashram: AshramSectionData;
    platform: PlatformSectionData;
    membership: MembershipSectionData;
    donation: DonationSectionData;
  }
  
  export interface HeroSectionData {
    videoUrl: string;
    logoUrl: string;
    logoAlt: string;
    subtitle: string;
  }
  
  export interface IntroSectionData {
    backgroundImage: string;
    heading: string;
  }
  
  export interface WhoWeAreSectionData {
    eyebrow: string;
    heading: string;
    content: string[];
    buttonText: string;
    buttonLink: string;
    image: string;
    imageAlt: string;
    backgroundDecoration: string;
  }
  
  export interface ShunyamurtiSectionData {
    eyebrow: string;
    quote: string;
    content: string[];
    buttonText: string;
    buttonLink: string;
    image: string;
    imageAlt: string;
    backgroundDecoration: string;
  }
  
  export interface LearnOnlineTab {
    id: string;
    label: string;
    tagline: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    image: string;
  }
  
  export interface LearnOnlineSectionData {
    eyebrow: string;
    heading: string;
    description: string[];
    tabs: LearnOnlineTab[];
    backgroundDecorations: {
      innerLab: string;
      halfFlower: string;
      imageTraced: string;
    };
  }
  
  export interface AshramSectionData {
    eyebrow: string;
    heading: string;
    content: string[];
    buttonText: string;
    buttonLink: string;
    images: {
      main: string;
      secondary: string[];
    };
  }
  
  export interface PlatformSectionData {
    eyebrow: string;
    heading: string;
    content: string;
    buttonText: string;
    buttonLink: string;
    image: string;
    imageAlt: string;
    backgroundDecoration: string;
  }
  
  export interface MembershipSectionData {
    eyebrow: string;
    heading: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    backgroundImage: string;
  }
  
  export interface DonationSectionData {
    eyebrow: string;
    heading: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    backgroundDecoration: string;
  }
  
  // Default homepage data
  export const homePageData: HomePageData = {
    hero: {
      videoUrl: '/HOMEPAGELOOP.mp4',
      logoUrl: '/satyogastylized.png',
      logoAlt: 'Sat Yoga',
      subtitle: 'The Summit of Self-Realization'
    },
    
    intro: {
      backgroundImage: '/nataraj.png',
      heading: 'Discover timeless teachings, transformative retreats, and a community devoted to Truth'
    },
    
    whoWeAre: {
      eyebrow: 'WHO WE ARE',
      heading: 'A Pathless Path to Self-Realization and Liberation',
      content: [
        'The way and the goal of Sat Yoga is to live in oneness with the eternally present Absolute Real.',
        'To help seekers understand what that means, Sat Yoga has elaborated a user-friendly map of the hidden treasures of reality, encompassing the entire spectrum of consciousness. We have also developed empowering practices for taking command of the mind. We offer these online and at our ashram, a self-sustaining spiritual community in the pristine rural mountains of southern Costa Rica, where those seeking a shorter or longer retreat (or a permanent refuge) from this dying world can awaken latent powers and live joyously in Total Presence.'
      ],
      buttonText: 'Discover Sat Yoga',
      buttonLink: '/about/satyoga',
      image: '/1. HOME_Who We Are.jpg',
      imageAlt: 'Sat Yoga Community',
      backgroundDecoration: '/Inner Labyrinth.png'
    },
    
    shunyamurti: {
      eyebrow: 'SHUNYAMURTI',
      quote: 'Love is what makes the impossible, inevitable.',
      content: [
        'Shunyamurti is an uncanny, profound and life-transforming teacher whose wisdom is transmitted from the source of the infinite Self.',
        'He has a unique ability to distill the essence of Eastern and Western wisdom, history, psychoanalysis, philosophy, and science to deliver the context needed to understand the human condition and interpret the meaning of the state of the world.',
        'Shunyamurti helps seekers awaken from illusion, anxiety, and suffering of every kind. Through deep meditation, self-inquiry, and the recognition of the unreal nature of the ego seekers experience the fullness of freedom, joy, and divine love.'
      ],
      buttonText: 'Learn more',
      buttonLink: '/about/shunyamurti',
      image: '/shunyamurti-meditation.jpg',
      imageAlt: 'Shunyamurti in meditation',
      backgroundDecoration: '/innerlab.png'
    },
    
    learnOnline: {
      eyebrow: 'LEARN ONLINE',
      heading: 'Begin on Your Journey with Sat Yoga Online',
      description: [
        'We offer a variety of options online to support your spiritual growth and transformation. Wherever you are you can learn at your own pace.',
        'Join livestreamed retreats; membership with access to a vast library of teachings and new content published weekly; live satsangs, classes, and meditations; and a rich collection of resources in the store.'
      ],
      tabs: [
        {
          id: 'free-teachings',
          label: 'Free teachings',
          tagline: 'FREE TEACHINGS',
          title: 'Start Your Journey with Free Wisdom',
          description: 'Our specially curated collection of free teachings, guided meditations, questions and answers with Shunyamurti, and essays offers an introduction and glimpse into the healing and transformative wisdom of meditation and Self-inquiry.',
          buttonText: 'Browse teachings',
          buttonLink: '/teachings',
          image: '/tabimage.png'
        },
        {
          id: 'membership',
          label: 'Membership Section',
          tagline: 'MEMBERSHIP',
          title: 'Access Our Complete Library',
          description: 'Join our membership to access a vast library of teachings, new content published weekly, live satsangs, classes, and meditations. Transform your spiritual practice with unlimited access to Shunyamurti\'s wisdom.',
          buttonText: 'Explore membership',
          buttonLink: '/membership',
          image: '/tabimage2.png'
        },
        {
          id: 'retreats',
          label: 'Online Retreats',
          tagline: 'ONLINE RETREATS',
          title: 'Transform Through Intensive Practice',
          description: 'Experience the power of deep spiritual immersion from anywhere in the world. Our online retreats offer structured programs, live interactions, and transformative practices guided by Shunyamurti.',
          buttonText: 'View retreats',
          buttonLink: '/retreats/online',
          image: '/tabimage3.png'
        },
        {
          id: 'courses',
          label: 'Courses',
          tagline: 'COURSES',
          title: 'Structured Learning Paths',
          description: 'Dive deep into specific aspects of spiritual development through our comprehensive courses. Each course is designed to build understanding and practice systematically.',
          buttonText: 'Browse courses',
          buttonLink: '/courses',
          image: '/tabimage4.png'
        },
        {
          id: 'store',
          label: 'Store',
          tagline: 'STORE',
          title: 'Sacred Resources & Materials',
          description: 'Discover books, audio recordings, meditation tools, and other sacred resources to support your spiritual journey and deepen your practice.',
          buttonText: 'Shop now',
          buttonLink: '/store',
          image: '/tabimage5.png'
        }
      ],
      backgroundDecorations: {
        innerLab: '/innerlab.png',
        halfFlower: '/halfflower.png',
        imageTraced: '/imagetraced.png'
      }
    },
    
    ashram: {
      eyebrow: 'THE ASHRAM',
      heading: 'Rest in the Current of Your Infinite Nature',
      content: [
        'Experience the transformative power of Sat Yoga at our Ashram in the serene mountains of southern Costa Rica.',
        'With the luminous presence of Shunyamurti and the support of the sangha, our Ashram retreats offer an unparalleled opportunity to experience deep meditation, wisdom teachings, and community living, which will accelerate your journey toward Self-realization.',
        'Whether you seek a short-term retreat, a longer stay, or a life as an ashram resident, our programs are designed to catalyze your spiritual growth and dissolve the barriers that keep you from experiencing the fullness of Being.'
      ],
      buttonText: 'Learn more',
      buttonLink: '/about/ashram',
      images: {
        main: '/ashram1.png',
        secondary: ['/ashram2.png', '/ashram3.png', '/ashram4.png']
      }
    },
    
    platform: {
      eyebrow: 'SAT YOGA ONLINE - SEAMLESS ACROSS ALL DEVICES',
      heading: 'Stay Connected to Wisdom Anytime, Anywhere',
      content: "No matter where you are or what device you use, Sat Yoga's online platform seamlessly adapts. Our dashboard allows you to engage effortlessly with online retreats, courses, wisdom teachings, guided meditations, live classes, and enriching community discussions—ensuring your virtual connection to the source of wisdom can continue without interruption.",
      buttonText: 'Start the journey',
      buttonLink: '/signup',
      image: '/platform.png',
      imageAlt: 'Sat Yoga platform',
      backgroundDecoration: '/imagetraced.png'
    },
    
    membership: {
      eyebrow: 'MEMBERSHIP',
      heading: 'A Revolutionary Approach to Living!',
      description: "Join our global community and transform your life with Shunyamurti's teachings. Overcome anxiety, confusion, and limitations. Access weekly teachings, guided meditations, live encounters, and exclusive content, as you deepen your connection to wisdom and growth.",
      buttonText: 'Browse Teachings',
      buttonLink: '/teachings',
      backgroundImage: '/members.png'
    },
    
    donation: {
      eyebrow: 'DONATE',
      heading: 'Support our sacred mission',
      description: 'If you recognize the urgency to create a more spiritual and ecological culture, and if you want to be part of the process of human and planetary rebirth, please support this unique and vital project.',
      buttonText: 'Donate',
      buttonLink: '/donate',
      backgroundDecoration: '/innerlab.png'
    }
  };