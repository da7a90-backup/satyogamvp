import React from "react";


import OnlineRetreatsSection from "../about/aboutShunyamurti/OnlineRetreats";
import TwoPaneComponent from "../shared/TwoPaneComponent";
import QuoteSection from "../shared/Quote";
import ContactUsSection from "../shared/ContactUsSection";
import TestimonialCarousel from "../shared/Testimonial";
import StandardHeroSection from "../shared/Hero";
import UpcomingRetreatsSection from "../shared/RelatedOnline";
import TestimonialCarouselTertiary from "../shared/TestimonialTertiary";

export default function CoursesPage({ data }: any) {
// Data structure for Testimonial Carousel Section

const introData = {
    leftPane: {
      title: "Prepare to Ascend to the Next Level of Your Spiritual Attainment",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: [
"Welcome to Sat Yoga’s Online Courses portal. The once-hidden, initiatory teachings of our Wisdom School—long reserved for those at the Ashram—are now accessible to seekers around the world. Through these online trainings, our global sangha can receive the liberating knowledge that lights the path to Self-realization.",
"Wherever you are, you can now receive the full dose of supreme understanding, distilled by Shunyamurti from his own illumination and comprehensive study of the world’s wisdom teachings and then integrated with advanced science and psychology. This unrivaled curriculum will help you build a foundation of clarity and power, based on proven principles, and establish your consciousness in its true nature.",
]
    }
  };
 const testimonialCarouselData = {
   tagline: "TESTIMONIAL CARROUSEL",
   heading: "testimonials",
   testimonials: [
    {
      quote: "Like so much of the wisdom that Shunyamurti abundantly shares with so much love, this meditation ‘course’ is profoundly simple, yet simply profound… Pure gold for the soul… Thank you from the depth of my Be-ing!",
      name: 'Timothy',
      location: 'Canada',
      avatar: '/illustrations.png'
    },
    {
      quote: "Gratitude in overload, I appreciate the guidance and feel much clearer on the path, more in tune with the ‘Self’ and being in ‘The now.’",
      name: 'Marié',
      location: 'South Africa',
      avatar: '/illustrations.png'
    },
    {
      quote: "Having been meditating for over 50 years now and not having a teacher I never felt I was really understanding meditation but since listening to Shunyamurti I have found real meaning. It’s changed my perception towards reality.",
      name: 'Gordon',
      location: 'UK',
      avatar: '/illustrations.png'
    },
    {
      quote: "Sat Yoga is truth to me. Thank you for gracing my soul with your presence post Guru purnima. Love and peace from India.",
      name: 'Hussain',
      location: 'India',
      avatar: '/illustrations.png'
    }
  ]
 };
 

  const heroData = {tagline:"Courses", background: "/courseslanding.jpg", heading: "Online Training for Self-mastery", subtext: "Structured Online Courses for Spiritual Liberation and Self-realization."}
  const sampleData = {
    heading: "3 upcoming retreats",
    viewAllLink: {
      text: "View all",
      url: "/retreats"
    },
    cards: [
      {
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        iconOverlay: "/progicon.png",
        duration: "3 days",
        type: "Online Retreat",
        date: "Sept 29th - Oct 1st, 2025",
        category: "Weekend retreat",
        title: "Why Our Situation is Hopeless, Yet Hilarious",
        description: "Every ego eventually gets mired in a swamp of hopelessness. There is only one way out...",
        button: {
          text: "Learn more",
          url: "/retreat/hopeless-yet-hilarious"
        }
      },
      {
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        iconOverlay: "/progicon.png",
        duration: "3 days",
        type: "Online Retreat",
        date: "Sept 29th - Oct 1st, 2025",
        title: "Why Our Situation is Hopeless, Yet Hilarious",
        description: "Every ego eventually gets mired in a swamp of hopelessness. There is only one way out...",
        button: {
          text: "Learn more",
          url: "/retreat/hopeless-yet-hilarious"
        }
      },
      {
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        iconOverlay: "/progicon.png",
        duration: "3 days",
        type: "Online Retreat",
        date: "Sept 29th - Oct 1st, 2025",
        title: "Why Our Situation is Hopeless, Yet Hilarious",
        description: "Every ego eventually gets mired in a swamp of hopelessness. There is only one way out...",
        button: {
          text: "Learn more",
          url: "/retreat/hopeless-yet-hilarious"
        }
      }
    ]
  };

return (
    <>
    <StandardHeroSection data={heroData}/>
    <TwoPaneComponent data={introData}/>
    {/* <UpcomingRetreatsSection data={sampleData}/> */}
    <TestimonialCarouselTertiary data={testimonialCarouselData}/>

    </>
)
}