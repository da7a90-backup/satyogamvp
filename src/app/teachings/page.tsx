import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import StandardHeroSection from '@/components/shared/Hero';
import TeachingLibrarySection from '@/components/shared/TeachingLibrary';
import { prepareTeachingLibraryData } from '@/lib/teachingTransformer';
import { data } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teachings Library | Sat Yoga Institute',
  description: 'Explore a curated collection of teachings—videos, guided meditations, and essays—from our public offerings and exclusive member content.',
};

export default async function TeachingsPage() {
  // Get authentication session
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  // Hero data
  const heroData = {
    tagline: "FREE TEACHINGS LIBRARY",
    background: "/bgteachings.png",
    heading: "Unlock Your Inner Genius",
    subtext: "Explore a curated collection of teachings—videos, guided meditations, and essays—from our public offerings, along with a small taste of the exclusive content reserved for our Members Section."
  };

  // Transform and prepare the teaching library data
  const teachingLibraryData = prepareTeachingLibraryData(data.data, isLoggedIn);

  return (
    <>
      <StandardHeroSection data={heroData} />
      <TeachingLibrarySection data={teachingLibraryData} />
    </>
  );
}