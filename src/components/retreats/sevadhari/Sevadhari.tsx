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



export default function SevadhariPage({ data, retreatData }: any) {
  // Use retreat data from API - intro section
  const introData = {
    leftPane: {
      title: retreatData?.intro1_title || "A Personal Encounter with Shunyamurti",
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: retreatData?.intro1_content || []
    }
  };

  const carouselImages: CarouselImage[] = data?.carousel?.secondaryImages || [];

  // Use retreat data from API - schedule section
  const scheduleData = {
    tagline: retreatData?.schedule_tagline || "A TYPICAL ASHRAM DAY",
    title: retreatData?.schedule_title || "Sample Daily Schedule",
    items: retreatData?.schedule_items || []
  };


  // Use retreat data from API - no fallback, data must come from database
  const shaktiBookingData = retreatData?.product_component_data ? {
    ...retreatData.product_component_data,
    retreatId: retreatData.product_component_data.retreatId || retreatData.id,
    retreatSlug: retreatData.slug,
    memberDiscountPercentage: retreatData.member_discount_percentage || 10,
    images: retreatData.product_component_data.images || data?.productComponent?.content?.images || []
  } : null;

  const heroData = {
    tagline: data?.hero?.tagline || "",
    background: data?.hero?.backgroundImage || "",
    heading: data?.hero?.heading || "",
    subtext: data?.hero?.subheading || ""
  };

  const relatedProgramsData = {
    sectionTitle: data?.relatedPrograms?.heading || "",
    programs: data?.relatedPrograms?.content || []
  };

  // Use application process data from API
  const applicationProcessData = data?.applicationProcess ? {
    leftPane: {
      tagline: data.applicationProcess.tagline || "AFTER ADMISSION",
      title: data.applicationProcess.heading || "What's the Process of Application and Admission?",
      titleLineHeight: data.applicationProcess.titleLineHeight || "120%"
    },
    rightPane: {
      type: 'timeline' as const,
      content: data.applicationProcess.content || []
    }
  } : null;

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
  const videoHeroData = {
    mediaType: "youtube" as 'youtube',
    mediaSrc: 'https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/sevadhari-karma-yoga-thumbnail/public',
    youtubeId: 'pDjThYJtM4c',
    tagline: 'Q&A WITH SHUNYAMURTI',
    title: "Karma Yoga is the Highest Practice",
    description: "The highest and most important practice is karma yoga, meaning that we lead an active life of service to God, community, and world while in full realization that all is consciousness, nothing is outside consciousness, and thus no one is working and nothing is happening—only the manifestation of the free Self-expression of the Supreme Intelligence."
  }

  const standardSectionData: StandardSectionData = {tagline:"OPENINGS", title:"We’re looking for highly skilled applicants!", description:"The majority of our service opportunities are in our gardens, greenhouses, and kitchen helping to maintain the daily cycle of abundance from farm to table. Most of our sevadharis will be doing hands-on physical work that may require, in some instances, endurance and strong physical fitness. We also offer a very few select opportunities for highly skilled and professionally trained applicants in the areas of media/outreach, healthcare and animal husbandry.", ctabuttontext:"contact", ctabuttonurl:"/application?program=sevadhari"}
return (
    <>
    <StandardHeroSection data={heroData}/>
    <TwoPaneComponent data={introData}/>
    <ImageCarouselSection data={carouselImages}/>
    <QuoteSection data={"A seeker of the Real should not follow a beaten path. The way to completion is to develop originality. Sat Yoga is not a path: we teach you how to use a compass and a machete, and we encourage you to cut a new path of your own."} />
    <TwoPaneComponent data={whatSeva}/>
    <VideoHeroSection data={videoHeroData}/>
    {applicationProcessData && <TwoPaneComponent data={applicationProcessData}/>}
    <ScheduleSection data={scheduleData}/>
    <StandardSection data={standardSectionData}/>
    {shaktiBookingData && <ProductComponent data={shaktiBookingData}/>}
    <ContactUsSection/>
    <RelatedProgramsSection data={relatedProgramsData}/>
    </>
)
}