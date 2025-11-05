import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import StandardHeroSection from '@/components/shared/Hero';
import TeachingLibrarySection from '@/components/shared/TeachingLibrary';
import { getTeachingsData } from '@/lib/teachings-api';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teachings Library | Sat Yoga Institute',
  description: 'Explore a curated collection of teachings—videos, guided meditations, and essays—from our public offerings and exclusive member content.',
};

export default async function TeachingsPage() {
  // Get authentication session
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  // Fetch hero data from backend API
  const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
  let heroData = {
    tagline: "FREE TEACHINGS LIBRARY",
    background: "",
    heading: "Unlock Your Inner Genius",
    subtext: "Explore a curated collection of teachings—videos, guided meditations, and essays—from our public offerings, along with a small taste of the exclusive content reserved for our Members Section."
  };

  try {
    const heroResponse = await fetch(`${FASTAPI_URL}/api/teachings-page/hero`, {
      cache: 'no-store'
    });
    if (heroResponse.ok) {
      const apiHeroData = await heroResponse.json();
      heroData = {
        ...heroData,
        background: apiHeroData.background
      };
    }
  } catch (error) {
    console.error('Failed to fetch teachings hero:', error);
  }

  // Fetch teachings data from backend API
  const teachingLibraryData = await getTeachingsData(isLoggedIn);

  return (
    <>
      <StandardHeroSection data={heroData} />
      <TeachingLibrarySection data={teachingLibraryData} />
    </>
  );
}