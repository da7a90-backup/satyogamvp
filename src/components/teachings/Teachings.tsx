'use client'
import React, { useEffect, useState } from "react";
import StandardHeroSection from "@/components/shared/Hero";
import TeachingLibrarySection from "@/components/shared/TeachingLibrary";
import { prepareTeachingLibraryData, RawData } from "@/lib/teachingTransformer";
import {data} from "@/lib/data";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

export default function TeachingsPage() {
  const [heroData, setHeroData] = useState({
    tagline: "FREE TEACHINGS LIBRARY",
    background: "",
    heading: "Unlock Your Inner Genius",
    subtext: "Explore a curated collection of teachings—videos, guided meditations, and essays—from our public offerings, along with a small taste of the exclusive content reserved for our Members Section."
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${FASTAPI_URL}/api/teachings-page/hero`)
      .then(res => res.json())
      .then(data => {
        setHeroData(prev => ({
          ...prev,
          background: data.background
        }));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load teachings hero:', err);
        setLoading(false);
      });
  }, []);

  // Check if user is logged in (implement based on your auth system)
  const isLoggedIn = false; // Replace with actual auth check

  // Transform and prepare the teaching library data
  // Cast the imported JSON to the correct type
  const teachingLibraryData = prepareTeachingLibraryData(data.data as RawData, isLoggedIn);

  if (loading || !heroData.background) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#942017]"></div>
      </div>
    );
  }

  return (
    <>
      <StandardHeroSection data={heroData} />
      <TeachingLibrarySection data={teachingLibraryData} />
    </>
  );
}