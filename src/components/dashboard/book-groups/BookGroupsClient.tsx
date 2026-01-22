'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import BookGroupCard from './BookGroupCard';
import FeaturedBookGroup from './FeaturedBookGroup';
import {
  BookGroupCard as BookGroupCardType,
  FeaturedBookGroup as FeaturedBookGroupType,
  BookGroupStatus,
} from '@/types/book-group';

interface BookGroupsClientProps {
  featuredBookGroup: FeaturedBookGroupType | null;
  bookGroups: BookGroupCardType[];
  userAccessIds: string[]; // IDs of book groups the user has access to
}

export default function BookGroupsClient({
  featuredBookGroup,
  bookGroups,
  userAccessIds,
}: BookGroupsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<BookGroupStatus | 'all'>('all');
  const [showOnlyMyBookGroups, setShowOnlyMyBookGroups] = useState(false);

  // Filter and sort book groups
  const filteredBookGroups = useMemo(() => {
    let filtered = [...bookGroups];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bg) =>
          bg.title?.toLowerCase().includes(query) ||
          bg.short_description?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((bg) => bg.status === selectedStatus);
    }

    // Filter by access
    if (showOnlyMyBookGroups) {
      filtered = filtered.filter((bg) => userAccessIds.includes(bg.id));
    }

    // Sort: Live first, then Upcoming, then Completed
    const statusOrder = {
      [BookGroupStatus.LIVE]: 0,
      [BookGroupStatus.UPCOMING]: 1,
      [BookGroupStatus.COMPLETED]: 2,
    };

    filtered.sort((a, b) => {
      // First, sort by status
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;

      // Within same status, sort by start date (most recent first for upcoming/live, most recent first for completed)
      const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
      const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;

      if (a.status === BookGroupStatus.COMPLETED) {
        return dateB - dateA; // Most recent completed first
      } else {
        return dateA - dateB; // Earliest upcoming/live first
      }
    });

    return filtered;
  }, [bookGroups, searchQuery, selectedStatus, showOnlyMyBookGroups, userAccessIds]);

  // Count book groups by status
  const statusCounts = useMemo(() => {
    return {
      all: bookGroups.length,
      upcoming: bookGroups.filter((bg) => bg.status === BookGroupStatus.UPCOMING).length,
      live: bookGroups.filter((bg) => bg.status === BookGroupStatus.LIVE).length,
      completed: bookGroups.filter((bg) => bg.status === BookGroupStatus.COMPLETED).length,
    };
  }, [bookGroups]);

  // Count my book groups
  const myBookGroupsCount = bookGroups.filter((bg) => userAccessIds.includes(bg.id)).length;

  return (
    <div className="min-h-full bg-[#FAF8F1] p-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className="text-4xl font-bold text-[#000000] mb-2"
              style={{ fontFamily: 'Optima, serif' }}
            >
              Book Groups
            </h1>
            <p
              className="text-[#717680]"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Join weekly discussions exploring consciousness and transformation through sacred texts
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-80">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#717680]"
              size={20}
            />
            <input
              type="text"
              placeholder="Search book groups"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            />
          </div>
        </div>

        {/* Featured Book Group */}
        {featuredBookGroup && (
          <div className="mb-12">
            <FeaturedBookGroup bookGroup={featuredBookGroup} />
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-6 mb-6">
          {/* Status Filter Tabs */}
          <div className="flex gap-4 border-b border-[#E5E7EB]">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
                selectedStatus === 'all'
                  ? 'border-[#7D1A13] text-[#7D1A13]'
                  : 'border-transparent text-[#717680] hover:text-[#000000]'
              }`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => setSelectedStatus(BookGroupStatus.LIVE)}
              className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
                selectedStatus === BookGroupStatus.LIVE
                  ? 'border-[#7D1A13] text-[#7D1A13]'
                  : 'border-transparent text-[#717680] hover:text-[#000000]'
              }`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Live ({statusCounts.live})
            </button>
            <button
              onClick={() => setSelectedStatus(BookGroupStatus.UPCOMING)}
              className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
                selectedStatus === BookGroupStatus.UPCOMING
                  ? 'border-[#7D1A13] text-[#7D1A13]'
                  : 'border-transparent text-[#717680] hover:text-[#000000]'
              }`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Upcoming ({statusCounts.upcoming})
            </button>
            <button
              onClick={() => setSelectedStatus(BookGroupStatus.COMPLETED)}
              className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
                selectedStatus === BookGroupStatus.COMPLETED
                  ? 'border-[#7D1A13] text-[#7D1A13]'
                  : 'border-transparent text-[#717680] hover:text-[#000000]'
              }`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Past ({statusCounts.completed})
            </button>
          </div>

          {/* My Book Groups Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <label
              className="flex items-center gap-2 cursor-pointer"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              <input
                type="checkbox"
                checked={showOnlyMyBookGroups}
                onChange={(e) => setShowOnlyMyBookGroups(e.target.checked)}
                className="w-4 h-4 text-[#7D1A13] rounded focus:ring-[#7D1A13] border-gray-300"
              />
              <span className="text-sm text-[#384250]">
                My Book Groups ({myBookGroupsCount})
              </span>
            </label>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p
            className="text-sm text-[#717680]"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            {filteredBookGroups.length}{' '}
            {filteredBookGroups.length === 1 ? 'book group' : 'book groups'}
          </p>
        </div>

        {/* Book Groups Grid */}
        {filteredBookGroups.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex flex-col items-center gap-3 opacity-30 mb-4">
              <svg
                className="w-16 h-16 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <p
              className="text-[#717680] mb-2"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              {showOnlyMyBookGroups
                ? "You don't have access to any book groups yet."
                : searchQuery
                ? 'No book groups match your search.'
                : 'No book groups available at this time.'}
            </p>
            {showOnlyMyBookGroups && (
              <button
                onClick={() => setShowOnlyMyBookGroups(false)}
                className="text-sm text-[#7D1A13] hover:underline"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                View all book groups
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookGroups.map((bookGroup) => (
              <BookGroupCard
                key={bookGroup.id}
                bookGroup={bookGroup}
                hasAccess={userAccessIds.includes(bookGroup.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
