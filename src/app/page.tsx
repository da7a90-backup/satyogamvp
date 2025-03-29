// app/page.tsx

import { Metadata } from 'next';
import Hero from '@/components/sections/Hero';
import ContentSection from '@/components/sections/ContentSection';
import CtaSection from '@/components/sections/CtaSection';
import LearningTabs from '@/components/sections/LearningTabs';
import BlogSection from '@/components/sections/BlogSection';
import { fetchAPI } from '@/lib/api';

// Override metadata for the home page
export const metadata: Metadata = {
  title: 'Sat Yoga - Discover Your True Self',
  description: 'Join our spiritual community dedicated to inner transformation and awakening. Through meditation, retreats, and teachings, we guide you to discover your true nature.',
};

// Types for our data
interface Author {
  name: string;
  imageUrl?: string;
}

interface BlogPost {
  title: string;
  excerpt: string;
  category: string;
  author: Author;
  date: string;
  slug: string;
  imageUrl?: string;
  readTime: number;
}

interface HomePageData {
  hero: {
    heading: string;
    content: string;
    buttonText: string;
    buttonLink: string;
  };
  // Add other section types as needed
}

// Async data fetching function (replaces getStaticProps)
async function getHomePageData(): Promise<HomePageData> {
  try {
    // In a real implementation, uncomment this to fetch from Strapi
    // const data = await fetchAPI('/api/home-page?populate=deep');
    // return data;
    
    // For now, return hardcoded data
    return {
      hero: {
        heading: "Discover the path to peace and self-realization",
        content: "Join our spiritual community dedicated to inner transformation and awakening. Through meditation, retreats, and teachings, we guide you to discover your true nature.",
        buttonText: "Start Your Journey",
        buttonLink: "/about"
      },
      // Add other section data here
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    throw new Error("Failed to fetch home page data");
  }
}

// Mock blog data for example
const mockBlogPosts: BlogPost[] = [
  {
    title: "One Month in A Most Desirable Location",
    excerpt: "As Shunyamurti recently stated, the undesirableness of the location is actually its greatest virtue...",
    category: "Category",
    author: { name: "Donna", imageUrl: "" },
    date: "March 21, 2024",
    slug: "one-month-undesirable-location",
    readTime: 5
  },
  {
    title: "One Month in A Most Desirable Location",
    excerpt: "As Shunyamurti recently stated, the undesirableness of the location is actually its greatest virtue...",
    category: "Category",
    author: { name: "Donna", imageUrl: "" },
    date: "March 21, 2024",
    slug: "one-month-undesirable-location-2",
    readTime: 5
  },
  {
    title: "One Month in A Most Desirable Location",
    excerpt: "As Shunyamurti recently stated, the undesirableness of the location is actually its greatest virtue...",
    category: "Category",
    author: { name: "Donna", imageUrl: "" },
    date: "March 21, 2024",
    slug: "one-month-undesirable-location-3",
    readTime: 5
  },
  {
    title: "One Month in A Most Desirable Location",
    excerpt: "As Shunyamurti recently stated, the undesirableness of the location is actually its greatest virtue...",
    category: "Category",
    author: { name: "Donna", imageUrl: "" },
    date: "March 21, 2024",
    slug: "one-month-undesirable-location-4",
    readTime: 5
  },
  {
    title: "One Month in A Most Desirable Location",
    excerpt: "As Shunyamurti recently stated, the undesirableness of the location is actually its greatest virtue...",
    category: "Category",
    author: { name: "Donna", imageUrl: "" },
    date: "March 21, 2024",
    slug: "one-month-undesirable-location-5",
    readTime: 5
  }
];

// Home page component with async data
export default async function Home() {
  // Fetch data server-side (Next.js App Router supports async components)
  const homeData = await getHomePageData();
  
  return (
    <>
      {/* Hero Section */}
      <Hero
        heading={homeData.hero.heading}
        content={homeData.hero.content}
        buttonText={homeData.hero.buttonText}
        buttonLink={homeData.hero.buttonLink}
        darkMode={true}
      />
      
      {/* About Section */}
      <ContentSection
        eyebrow="Shunyamurti"
        heading="Guidance for your spiritual journey"
        content="Experience transformative teachings from Shunyamurti, our resident teacher and guide. His insights bridge ancient wisdom with modern psychology to help you navigate life's challenges with clarity and purpose."
        bulletPoints={[
          "Regular meditation guidance and practice",
          "Integration of spiritual wisdom in daily life",
          "Community support for your personal growth"
        ]}
        buttons={[
          { label: "Learn More", url: "/about/shunyamurti", primary: true },
          { label: "Watch Teachings", url: "/teachings", primary: false }
        ]}
        imagePosition="right"
      />
      
      {/* Retreats Section */}
      <ContentSection
        eyebrow="Who we are"
        heading="Experience transformation in our retreats"
        content="Our retreats offer a sacred space for deep inner work and spiritual awakening. In the peaceful environment of our ashram, you'll find the ideal conditions for meditation, self-inquiry, and healing."
        bulletPoints={[
          "Immersive retreat experiences onsite and online",
          "Expert guidance from experienced teachers",
          "Supportive community of fellow seekers"
        ]}
        buttons={[
          { label: "Explore Retreats", url: "/retreats", primary: true }
        ]}
        imagePosition="left"
      />
      
      {/* Learning Options Section */}
      <LearningTabs />
      
      {/* Membership CTA */}
      <CtaSection
        eyebrow="Become a member"
        heading="Join our spiritual community"
        description="Get access to exclusive teachings, guided meditations, and be part of a supportive community on the path of awakening."
        primaryButtonText="Join Now"
        primaryButtonLink="/membership"
        secondaryButtonText="Learn More"
        secondaryButtonLink="/membership/benefits"
      />
      
      {/* Blog Section */}
      <BlogSection posts={mockBlogPosts} />
    </>
  );
}