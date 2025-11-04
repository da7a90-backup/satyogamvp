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



export default function ShaktiPage({ data }: any) {
// Data structure for Shakti Saturation Included Section

const shaktiIncludedData = {
    sectionTitle: "Included",
    items: [
      {
        title: "Advanced Seminar with Shunyamurti",
        description: "Every seminar led by Shunyamurti brings new advances in understanding the ultimate mysteries of the Real. Such an event forms the core of this accelerated course, offering direct transmission of divine energy and insight that brings resonance with the Source. Through these teachings, previous misunderstandings of reality can drop away—and a new blossoming of your soul's potential will bring wonderment and joy."
      },
      {
        title: "Sacred Satsang with Shunyamurti",
        description: "One of the greatest joys of ashram life is coming together for sacred satsangs with Shunyamurti. These intimate gatherings offer a space to ask questions, perceive new mind-boggling paradoxes operating in consciousness, and to internalize a higher vibrational frequency."
      },
      {
        title: "Seva & Community Service",
        description: "One way to open your heart is through seva (selfless service), uniting your will with the needs of the whole community. You may be asked to offer assistance in the ashram kitchen, or to give loving attention to the plants in our gardens, or to help keep the meditation hall in proper order, or other activities augmenting our hospitality for everyone. A deep sense of satisfaction will ensue."
      },
      {
        title: "Charming Cabin Accommodations",
        description: "Nestled in pristine nature, our peaceful lodgings provide the perfect refuge for rest and renewal. Encompassed by wild forests and the celestial stillness of starry nights, your accommodations offer comfort, beauty, and tranquillity. Each room includes a private bath and a balcony for solitary contemplation"
      },
      {
        title: "Meditation Gatherings",
        description: "The power of regular group meditation sittings, several times per day, will reinvigorate your enthusiasm for ultimate Liberation. The power of Presence brings ecstatic intoxication, stillness free of thought, and the ending of anxiety."
      },
      {
        title: "Artistic Expression & Satsangs",
        description: "Express your creativity through art and participate in Satsangs, where Shunyamurti will guide open dialogues exploring life's deeper questions. These sessions invite personal insight and community connection."
      },
      {
        title: "Core Curriculum Module Classes",
        description: "Small group classes delve into the core modules of our wisdom school curriculum. Designed to help you become free of a false and obsolete identity, our complete re-engineering of the ancient knowledge of nonduality can activate higher levels of consciousness—and even bring instant enlightenment."
      },
      {
        title: "Optional Atmanology Sessions",
        description: "The really serious seekers of inner transformation may choose to explore and alter the subconscious foundations of the ego complex, by engaging in private sessions of Atmanology—a therapeutic modality that opens up the higher reaches of Kundalini. These dialogues can quickly demolish obstacles to Self-realization."
      },
      {
        title: "Nourishing Vegetarian Cuisine",
        description: "Hearty vegetarian meals, prepared with fresh ingredients—mostly sourced from our own gardens and farms—even a picky palate. We offer vegan and gluten-free options to those on special diets."
      },
      {
        title: "Evening Community Classes",
        description: "The evenings furnish a variety of cultural events, including devotional singing, participation in psychodramas, screening and discussion of cutting-edge videos on science and psychology, feature films, further study of recent teachings, plus guided meditations."
      },
      {
        title: "Morning & Evening Meditations",
        description: "Each day begins and ends with group meditation sessions, held in the tranquil setting of the ashram. These practices are guided by Shunyamurti and designed to cultivate deep presence, stillness, and connection with the community."
      },
      {
        title: "Creative Expression & Sacred Arts",
        description: "Open yourself to the flow of inspiration through our practices of artistic expression. During your month-long stay, you may have the opportunity to engage in devotional singing, improvisational theater games, creative writing, and painting. These sacred arts serve as pathways to Self-discovery and healing."
      },
      {
        title: "Ashram Tour",
        description: "You will learn a great deal about the principles of living sustainably in our popular Prema-culture tour, our unique approach to permaculture infused with prema, or divine love. Visit our thriving greenhouses and food gardens and learn how we cultivate organic produce in harmony with Nature and Spirit."
      },
      {
        title: "Walks in Nature",
        description: "Wander along our well-tended paths where every tree, stream, butterfly, and bird bring renewed connection to the Beyond. You may hear the roar of monkeys or catch a glimpse of an adorable sloth. Each breeze will utter whispers from the Beyond. The energy of the Earth is charged with vital power that your body will gladly receive."
      }
    ]
  };

  const introData = {
    leftPane: {
      title: "A Life-Changing Discovery of Your True Nature",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: [
"The Shakti Saturation process is an adventure in Self-discovery! The curriculum has been specially designed to serve our growing global community of seekers of healing and inner peace, and lovers of Truth.",
"This onsite program is open to all who delight in the Sat Yoga teachings, and who are ready to engage in the inner work of attaining Total Presence.",
"Whether you are joining us for a month or considering extending your stay, this intensive reconfiguration of identity will serve as an exhilarating introduction to life at the Ashram—and your personal divinization.",
"Your days will be filled with mind-clearing wisdom, sweet inner silence, and heart-healing self-acceptance. The understanding of our supportive spiritual community will assist in enabling you to drop all your old projections, defensiveness, and self-doubt.",
"Through this profound peeling away of the past, your life will feel renewed. You may experience a paradigm shift into a more beautiful reality. And you will be able to rebuild your life on the bedrock of the Real Self—and live in freedom, in a state of grace."
]
    }
  };

  const carouselImages: CarouselImage[] = data?.carousel?.secondaryImages || [];

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
    tagline: "PROGRAM CONTRIBUTION",
    title: "Shakti Saturation Immersion",
    basePrice: 3950,
    description: "The Shakti Saturation Immersion is a life-changing rite of passage. Over four weeks, you can restore and redirect your existence, guided by profound teachings and the support of an ascending tribal community.",
    accommodation: "Accommodation: Stay in a charming cabin with a balcony and private bath.",
    meals: "Meals: Delectable vegetarian cuisine, with vegan and gluten-free options.",
    dateLabel: "Select a date",
    dateOptions: [
      "Dec. 17th - Jan. 13th, 2025"
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
    images: data?.productComponent?.content?.images || []
  };

  const testimonials = data?.testimonials?.content || [];

  const heroData = {
    tagline: data?.hero?.tagline || "",
    background: data?.hero?.backgroundImage || "",
    heading: data?.hero?.heading || "",
    subtext: data?.hero?.subheading || ""
  };
// Data structure for Related Programs Section

 const relatedProgramsData = {
    sectionTitle: data?.relatedPrograms?.heading || "",
    programs: data?.relatedPrograms?.content || []
  };
return (
    <>
    <StandardHeroSection data={heroData}/>
    <TwoPaneComponent data={introData}/>
    <IncludedSection data={shaktiIncludedData}/>
    <ImageCarouselSection data={carouselImages}/>
    <QuoteSection data={"A seeker of the Real should not follow a beaten path. The way to completion is to develop originality. Sat Yoga is not a path: we teach you how to use a compass and a machete, and we encourage you to cut a new path of your own."} />
    <ScheduleSection data={scheduleData}/>
    {shaktiBookingData.images && shaktiBookingData.images.length > 0 && (
      <ProductComponent data={shaktiBookingData}/>
    )}
    <TestimonialCarousel
      tagline="TESTIMONIAL CAROUSEL"
      testimonials={testimonials}
    />
    <ContactUsSection/>
    <RelatedProgramsSection data={relatedProgramsData}/>
    </>
)
}