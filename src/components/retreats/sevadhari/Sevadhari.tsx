'use client'
import React from "react";
import QuoteSection from "@/components/shared/Quote";
import ContactUsSection from "@/components/shared/ContactUsSection";
import StandardHeroSection from "@/components/shared/Hero";
import IncludedSection from "@/components/shared/Included";
import TwoPaneComponent from "@/components/shared/TwoPaneComponent";
import ImageCarouselSection, { CarouselImage } from "@/components/shared/ImageCarousel";
import ScheduleSection from "@/components/shared/TypicalDay";
import ProductComponent from "@/components/shared/ProductComponent";
import RelatedProgramsSection from "@/components/shared/RelatedOnsite";
import TestimonialCarousel from "@/components/shared/Testimonial";
import VideoHeroSection from "@/components/shared/VideoHero";
import StandardSection, { StandardSectionData } from "@/components/shared/StandardSection";



export default function SevadhariPage({ data }: any) {
// Data structure for Shakti Saturation Included Section



  const introData = {
    leftPane: {
      title: "A Personal Encounter with Shunyamurti",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: [
"This retreat is a precious opportunity to receive initiation from Shunyamurti directly—an encounter that can shift your vibrational frequency immediately to the Presence of divine light and love. This in turn can bring full realization of your God-Self.",
" Designed to open your heart and mind to be filled with the Light of the Supreme Real,",
"these compact events also feature wisdom classes, meditation training, and optional meetings with an individual counselor.",
]
    }
  };

  const carouselImages : CarouselImage[] = [
    { src: '/SD GALLERY 1.jpg', alt: 'Teaching session' },
    { src: '/SD GALLERY 2.jpg', alt: 'Shunyamurti with student' },
    { src: '/SD GALLERY 3.jpg', alt: 'Community gathering' },
    { src: '/SD GALLERY 4.jpg', alt: 'Ashram activities' },
    { src: '/SD GALLERY 5.jpg', alt: 'Group learning' },
    { src: '/SD GALLERY 6.jpg', alt: 'Meditation practice' }
  ];

  const scheduleData = {
    tagline: "A TYPICAL ASHRAM DAY",
    title: "Sample Daily Schedule",
    items: [
      {
        time: "4:00 - 4:45am",
        activity: "Morning meditation"
      },
      {
        time: "5:00 - 8:00am",
        activity: "Personal Time, Asanas, or Optional Outdoor Service"
      },
      {
        time: "8:45 - 11:45 am",
        activity: "Class, Optional Service, or Atmanology Session"
      },
      {
        time: "12:15 - 12:50 pm",
        activity: "Midday Meditation"
      },
      {
        time: "1:00 - 1:45 pm",
        activity: "Lunch"
      },
      {
        time: "2:30 - 5:30 pm",
        activity: "Personal Time"
      },
      {
        time: "5:30 - 7:00 pm",
        activity: "Evening Class / Meditation"
      },
      {
        time: "7:00 - 7:30 pm",
        activity: "Evening Meal"
      }
    ]
  };


  const shaktiBookingData = {
    tagline: "RETREAT CONTRIBUTION AND DATES",
    title: "Darshan Retreat",
    price: "$1750",
    priceNote: "(inc. all taxes)",
    description: "The Darshan Retreat with Shunyamurti is a sacred seven-day retreat designed to elevate your spiritual journey through direct transmission. This retreat offers a unique opportunity for a personal encounter with Shunyamurti, including a transformative one-on-one session. ",
    accommodation: "Stay in a charming cabin, with a private room that includes its own bathroom and balcony.",
    meals: "Nourishing vegetarian meals. We offer vegan and gluten-free options to those on specialized diets.",
    dateLabel: "Select a date",
    dateOptions: [
      "Jan. 21th - Jan. 27th, 2025"
    ],
    memberLabel: "Are you a member?",
    memberOptions: [
      "Select an option"
    ],
    buttonText: "Begin application",
    buttonUrl: "/apply",
    membershipText: "Discover our",
    membershipLink: "memberships",
    membershipLinkUrl: "/memberships",
    membershipNote: "to receive discounts",
    images: [
      { src: '/darshanproduct1.jpg', alt: 'Woman meditating by water' },
      { src: '/darshanproduct2.jpg', alt: 'Interior cabin view' },
      { src: '/darshanproduct3.jpg', alt: 'Bathroom interior' },
      { src: '/darshanproduct4.jpg', alt: 'Evening meditation' },
      { src: '/darshanproduct5.jpg', alt: 'Meditation by nature' }
    ]
  };

  const testimonialCarouselData = {
    tagline: "TESTIMONIAL CARROUSEL",
    testimonials: [
      {
        id: 1,
        quote: "I've received so much in my month here; my cup overfloweth. It was like the nectar that I needed to heal. This is priceless, and I am so overjoyed that I've been here.",
        author: 'Mandy',
        location: 'UK',
        video: '/testimonial.png'
      },
      {
        id: 2,
        quote: "I've so much in my month here; my cup overfloweth. It was like the nectar that I needed to heal. This is priceless, and I am so overjoyed that I've been here.",
        author: 'Mandy',
        location: 'UK',
        video: '/testimonial.png'
      }
    ]
  };
  const heroData = {tagline:"Ashram Onsite Retreats", background: "/sevadhari.jpg", heading: "Staying at the Ashram", subtext: "Visit, Study, and Serve at the Sat Yoga Ashram, Costa Rica"}
  const relatedProgramsData = {
    sectionTitle: "Related onsite programs",
    programs: [
      {
        image: '/ssi.jpg',
        icon: '/progicon.png',
        duration: "1 month",
        location: "Onsite Retreat",
        tagline: "Ashram Immersion Program",
        title: "Shakti Saturation Intensive",
        link: "/retreats/shakti"
      },
      {
        image: '/darshan.jpg',
        icon: '/progicon.png',
        duration: "7 days",
        location: "Onsite Retreat",
        tagline: "Darshan Retreat!",
        title: "Darshan retreat",
        link: "/retreats/darshan"
      }
    ]
  };

  const applicationProcessData = {
    leftPane: {
      tagline: "AFTER ADMISSION",
      title: "What's the Process of Application and Admission?"
    },
    rightPane: {
      type: 'timeline' as const,
      content: [
        {
          number: 1,
          tagline: "Start Your Journey to Join the Community",
          title: "Submit Your Application",
          description: "Fill out the application form..."
        },
        {
            number: 2,
            tagline: "Start Your Journey to Join the Community",
            title: "Submit Your Application",
            description: "Fill out the application form..."
          },
          {
            number: 3,
            tagline: "Start Your Journey to Join the Community",
            title: "Submit Your Application",
            description: "Fill out the application form..."
          },
          {
            number: 4,
            tagline: "Start Your Journey to Join the Community",
            title: "Submit Your Application",
            description: "Fill out the application form..."
          },
        
        // ... more timeline items
      ]
    }
  };

  const whatSeva = {
    leftPane: {
        tagline:"GENERAL REQUIREMENTS FOR PROSPECTIVE APPLICANTS",
      title: "What will qualify me to be a sevadhari?",
      titleLineHeight: "120%",
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
  const videoHeroData = {mediaType: "image" as 'image', mediaSrc:'/sevavideo.png', tagline: 'Q&A WITH SHUNYAMURTI', title: "Karma Yoga is the Highest Practice", description : "The highest and most important practice is karma yoga, meaning that we lead an active life of service to God, community, and world while in full realization that all is consciousness, nothing is outside consciousness, and thus no one is working and nothing is happening—only the manifestation of the free Self-expression of the Supreme Intelligence."}

  const standardSectionData: StandardSectionData = {tagline:"OPENINGS", title:"We’re looking for highly skilled applicants!", description:"The majority of our service opportunities are in our gardens, greenhouses, and kitchen helping to maintain the daily cycle of abundance from farm to table. Most of our sevadharis will be doing hands-on physical work that may require, in some instances, endurance and strong physical fitness. We also offer a very few select opportunities for highly skilled and professionally trained applicants in the areas of media/outreach, healthcare and animal husbandry.", ctabuttontext:"contact", ctabuttonurl:"/application?program=sevadhari"}
return (
    <>
    <StandardHeroSection data={heroData}/>
    <TwoPaneComponent data={introData}/>
    <ImageCarouselSection data={carouselImages}/>
    <QuoteSection data={"A seeker of the Real should not follow a beaten path. The way to completion is to develop originality. Sat Yoga is not a path: we teach you how to use a compass and a machete, and we encourage you to cut a new path of your own."} />
    <TwoPaneComponent data={whatSeva}/>
    <VideoHeroSection data={videoHeroData}/>
    <TwoPaneComponent data={applicationProcessData}/>
    <ScheduleSection data={scheduleData}/>
    <StandardSection data={standardSectionData}/>
    <ProductComponent data={shaktiBookingData}/>
    <ContactUsSection/>
    <RelatedProgramsSection data={relatedProgramsData}/>
    </>
)
}