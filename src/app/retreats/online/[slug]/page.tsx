import { notFound } from 'next/navigation';
import { onlineRetreatsData } from '@/lib/data';
import OnlineRetreatPage from '@/components/retreats/online/retreatPage/OnlineRetreatPage';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function Page({ params }: PageProps) {
  const retreatData = onlineRetreatsData.find(
    (retreat: { slug: string; }) => retreat.slug === params.slug
  );

  if (!retreatData) {
    notFound();
  }

  const heroWithBackDataMinimal = {
    backLink: {
      text: "View all Online retreats",
      url: "/retreats/online"
    },
    background: retreatData.heroBackground
  };

  const bookingData = {
    retreatType: 'online' as const,
    tagline: retreatData.bookingTagline,
    title: retreatData.title,
    basePrice: retreatData.basePrice,
    priceOptions: retreatData.priceOptions,
    memberDiscountPercentage: retreatData.memberDiscountPercentage,
    scholarshipAvailable: retreatData.scholarshipAvailable,
    scholarshipDeadline: retreatData.scholarshipDeadline,
    fixedDate: retreatData.fixedDate,
    location: retreatData.location,
    images: retreatData.images,
    memberLabel: retreatData.memberLabel,
    memberOptions: retreatData.memberOptions,
    buttonText: retreatData.buttonText,
    buttonUrl: retreatData.buttonUrl,
    infoButtonText: retreatData.infoButtonText,
    infoButtonUrl: retreatData.infoButtonUrl,
    membershipText: retreatData.membershipText,
    membershipLink: retreatData.membershipLink,
    membershipLinkUrl: retreatData.membershipLinkUrl,
    membershipNote: retreatData.membershipNote
  };

  const introData1 = {
    leftPane: {
      title: retreatData.intro1Title,
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: retreatData.intro1Content
    }
  };

  const introData2 = {
    leftPane: {
      title: retreatData.intro2Title,
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: retreatData.intro2Content
    }
  };

  const introData3 = {
    mediaPosition: "top" as const,
    topMedia: {
      type: 'image' as const,
      src: "/oras.jpg",
    },
    leftPane: {
      title: retreatData.intro3Title,
      titleLineHeight: "120%"
    },
    rightPane: {
      type: 'paragraphs' as const,
      content: retreatData.intro3Content
    }
  };

  const scheduleData = {
    tagline: retreatData.scheduleTagline,
    title: retreatData.scheduleTitle,
    items: retreatData.scheduleItems
  };

  const testimonialData = {
    tagline: retreatData.testimonialTagline,
    heading: retreatData.testimonialHeading,
    testimonials: retreatData.testimonials
  };

  return (
    <OnlineRetreatPage 
      heroData={heroWithBackDataMinimal}
      bookingData={bookingData}
      introData1={introData1}
      introData2={introData2}
      introData3={introData3}
      scheduleData={scheduleData}
      testimonialData={testimonialData}
    />
  );
}

export async function generateStaticParams() {
  return onlineRetreatsData.map((retreat: { slug: any; }) => ({
    slug: retreat.slug,
  }));
}