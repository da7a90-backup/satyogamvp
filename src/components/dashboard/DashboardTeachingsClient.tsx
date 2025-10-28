'use client';

import { useState } from 'react';
import TeachingLibrarySection from '@/components/shared/TeachingLibrary';
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
  // State for list format toggle
  const [currentFormat, setCurrentFormat] = useState(listFormat);

  return (
    <div className="bg-[#FAF8F1] min-h-screen">
      {/* Page Header */}
      <div className="w-full py-8 px-4 lg:px-16 bg-white border-b border-gray-200">
        <div className="max-w-[1312px] mx-auto flex justify-between items-center">
          <div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                fontFamily: 'Optima, Georgia, serif',
                color: '#000000',
              }}
            >
              Your Teachings Library
            </h1>
            <p
              className="text-base"
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                color: '#717680',
              }}
            >
              Access your personal teachings library with progress tracking
            </p>
          </div>

          {/* Format Toggle (optional feature) */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentFormat('pagination')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentFormat === 'pagination'
                  ? 'bg-[#7D1A13] text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Pagination
            </button>
            <button
              onClick={() => setCurrentFormat('infinite')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentFormat === 'infinite'
                  ? 'bg-[#7D1A13] text-white'
                  : 'bg-white border border-gray-300 text-gray-700'
              }`}
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Infinite Scroll
            </button>
          </div>
        </div>
      </div>

      {/* Continue Watching Section */}
      {continueWatching.length > 0 && (
        <ContinueWatchingSection teachings={continueWatching} />
      )}

      {/* Main Teachings Library Grid */}
      {/* Reuse existing TeachingLibrary component with dashboard-specific props */}
      <TeachingLibrarySection
        data={{
          ...data,
          isLoggedIn: true, // No login overlay in dashboard
          sectionTitle: '', // Already have header above
          viewAllLink: undefined, // Remove "View all" button
        }}
        showAllTeachings={true} // Show all teachings, not just 9
        listFormat={currentFormat} // Pass selected format
        userTier={userTier} // For tier-based access control
        isDashboard={true} // Flag to enable dashboard-specific features
      />
    </div>
  );
}
