'use client';

import { useState } from 'react';
import DashboardTeachingLibrary from '@/components/dashboard/DashboardTeachingLibrary';
import ContinueWatchingSection from '@/components/dashboard/ContinueWatchingSection';

interface Teaching {
  id: string;
  thumbnail: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  accessType: 'free' | 'restricted';
  mediaType: 'video' | 'audio' | 'text';
  pageCount?: number;
  slug: string;
  categoryType: 'video_teaching' | 'guided_meditation' | 'qa' | 'essay';
  progress?: number; // Progress percentage (0-100)
  requiredTier?: string; // For locked teachings
}

interface TeachingLibraryData {
  isLoggedIn: boolean;
  sectionTitle: string;
  viewAllLink?: {
    text: string;
    url: string;
  };
  featuredTeaching: Teaching;
  categories: Array<{
    label: string;
    key: 'video_teaching' | 'guided_meditation' | 'qa' | 'essay';
  }>;
  allTeachings: Teaching[];
  totalCount: number;
}

interface DashboardTeachingsClientProps {
  data: TeachingLibraryData;
  continueWatching: Teaching[];
  userTier: string;
  userId: string;
  listFormat?: 'pagination' | 'infinite';
}

export default function DashboardTeachingsClient({
  data,
  continueWatching,
  userTier,
  userId,
  listFormat = 'pagination',
}: DashboardTeachingsClientProps) {
  return (
    <div className="bg-[#FAF8F1] min-h-screen px-4 sm:px-6 md:px-8 lg:px-16 py-6 lg:py-8">

      {/* Continue Watching Section */}
      {continueWatching.length > 0 && (
        <ContinueWatchingSection teachings={continueWatching} />
      )}

      {/* Main Teachings Library Grid - Dashboard Style */}
      <DashboardTeachingLibrary
        data={{
          featuredTeaching: data.featuredTeaching,
          categories: data.categories,
          allTeachings: data.allTeachings,
        }}
        userTier={userTier}
        userId={userId}
      />
    </div>
  );
}
