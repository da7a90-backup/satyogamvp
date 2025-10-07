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



export default function DarshanPage({ data }: any) {
// Data structure for Shakti Saturation Included Section

const shaktiIncludedData = {
    sectionTitle: "Included in this 7-day retreat",
    items: [
      {
        title: "Private Darshan with Shunyamurti",
        description: "In your profound meeting with Shunyamurti, you can ask your most personal and urgent questions and receive direct guidance and affirmation of your Being. If you want to sustain inner peace and luminous clarity, this session can prove a turning point."
      },
      {
        title: "Core Curriculum Module Classes",
        description: "Small group classes delve into the core modules of our wisdom school curriculum. Designed to help you deconstruct the false self and be free of the suffering it causes, these tutorials will open your third eye and give you x-ray vision of your subconscious attachments and empower you to drop the ego illusion and return to your true nature of illumined Consciousness."
      },
      {
        title: "Nourishing, Vegetarian Cuisine",
        description: "Reinvigorate your organism with nourishing vegetarian meals, prepared with organic, high-vibrational ingredients—many sourced from our own gardens. We always offer vegan and gluten-free options. "
      },
      {
        title: "Meditation Gatherings",
        description: "Your soul will bask in the Light of God as you let go of constrictions and enter the deep silence of Pure Awareness during our group meditation sittings. We assemble several times daily to cultivate stillness, serene joy, and an ever-deepening connection to our Supreme Source."
      },
      {
        title: "Ashram Tours",
        description: "Explore the ashram’s food-growing infrastructure and processes on our popular Prema-culture tour, and learn our unique approach to permaculture infused with divine love (prema). Visit our thriving greenhouses and magical food gardens and learn how we cultivate organic produce in harmony with Nature and Spirit."
      },
      {
        title: "Personal Time for Gaia Gazing and Walking Meditation.",
        description: "Wander through our sacred landscape mindfully, and discover how every tree, stream, and breeze carries the whisper of the Absolute. You may meet fascinating birds, butterflies, sloths, or monkeys during such contemplative walks! As you attune to the rhythms of Nature, let the power of the energy field saturate your soul with healing grace."
      },
      {
        title: "Evening Community Classes",
        description: "The evenings bring a variety of events, which may include a documentary or feature film, a deep dive into recent teachings, or a tranquil guided meditation."
      },
      {
        title: "Charming Cabin Accommodations",
        description: "Nestled in colourful and fragrant gardens by a placid forest, our peaceful lodgings provide the perfect refuge for deep relaxation and renewal. Your personal space will bring comfort, beauty, and calm. Each room the option of a  private bath and a balcony to immerse yourself in the tranquil energy of the holy mountain."
      }
    ]
  };

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
    { src: '/darshangallery1.jpg', alt: 'Teaching session' },
    { src: '/darshangallery2.jpg', alt: 'Shunyamurti with student' },
    { src: '/darshangallery3.jpg', alt: 'Community gathering' },
    { src: '/darshangallery4.jpg', alt: 'Ashram activities' },
    { src: '/darshangallery5.jpg', alt: 'Group learning' },
    { src: '/darshangallery6.jpg', alt: 'Meditation practice' }
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
    retreatType: "onsite" as const,
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
  const heroData = {tagline:"Ashram Retreats", background: "/darshan.jpg", heading: "Staying at the Ashram", subtext: "Visit, Study, and Serve at the Sat Yoga Ashram, Costa Rica"}
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
        image: '/sevadhari.jpg',
        icon: '/progicon.png',
        duration: "6 months",
        location: "Onsite Retreat",
        tagline: "Live and Study at the Ashram!",
        title: "Become a Sevadhari",
        link: "/retreats/sevadhari"
      }
    ]
  };

  
return (
    <>
    <StandardHeroSection data={heroData}/>
    <TwoPaneComponent data={introData}/>
    <IncludedSection data={shaktiIncludedData}/>
    <ImageCarouselSection data={carouselImages}/>
    <QuoteSection data={"A seeker of the Real should not follow a beaten path. The way to completion is to develop originality. Sat Yoga is not a path: we teach you how to use a compass and a machete, and we encourage you to cut a new path of your own."} />
    <TwoPaneComponent data={introData}/>
    <ScheduleSection data={scheduleData}/>
    <TestimonialCarousel data={testimonialCarouselData}/>
    <ProductComponent data={shaktiBookingData}/>
    <ContactUsSection/>
    <RelatedProgramsSection data={relatedProgramsData}/>
    </>
)
}