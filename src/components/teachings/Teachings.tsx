'use client'
import React from "react";
import StandardHeroSection from "@/components/shared/Hero";
import TeachingLibrarySection from "@/components/shared/TeachingLibrary";
import { prepareTeachingLibraryData, RawData } from "@/lib/teachingTransformer";
import {data} from "@/lib/data";

export default function TeachingsPage() {
  // Hero data
  const heroData = {
    tagline: "FREE TEACHINGS LIBRARY",
    background: "/bgteachings.png",
    heading: "Unlock Your Inner Genius",
    subtext: "Explore a curated collection of teachings—videos, guided meditations, and essays—from our public offerings, along with a small taste of the exclusive content reserved for our Members Section."
  };

  // Check if user is logged in (implement based on your auth system)
  const isLoggedIn = false; // Replace with actual auth check

  // Transform and prepare the teaching library data
  // Cast the imported JSON to the correct type
  const teachingLibraryData = prepareTeachingLibraryData(data.data as RawData, isLoggedIn);

  return (
    <>
      <StandardHeroSection data={heroData} />
      <TeachingLibrarySection data={teachingLibraryData} />
    </>
  );
}