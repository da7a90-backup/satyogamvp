'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import RetreatCard from './RetreatCard';

interface RetreatsClientProps {
  userRetreats: any[];
  availableRetreats: any[];
}

export default function RetreatsClient({ userRetreats, availableRetreats }: RetreatsClientProps) {
  const [activeTab, setActiveTab] = useState<'my-retreats' | 'available'>('my-retreats');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter available retreats to exclude already registered ones
  const getAvailableRetreatsFiltered = () => {
    const registeredIds = userRetreats.map((r: any) => r.id);
    return availableRetreats.filter(
      (retreat: any) => !registeredIds.includes(retreat.id)
    );
  };

  // Get retreat status (upcoming, ongoing, past)
  const getRetreatStatus = (retreat: any) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const startDate = retreat.start_date ? new Date(retreat.start_date) : null;
    const endDate = retreat.end_date ? new Date(retreat.end_date) : null;

    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(0, 0, 0, 0);

    // Past: end date has passed
    if (endDate && endDate < now) return 'past';

    // Ongoing: today is between start and end date (inclusive)
    if (startDate && endDate && startDate <= now && now <= endDate) return 'ongoing';

    // Upcoming: start date is in the future
    if (startDate && startDate > now) return 'upcoming';

    return 'upcoming'; // Default
  };

  // Apply search filter and sorting
  const getFilteredRetreats = () => {
    let retreats = activeTab === 'my-retreats'
      ? userRetreats
      : getAvailableRetreatsFiltered();

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      retreats = retreats.filter((retreat: any) =>
        retreat.title?.toLowerCase().includes(query) ||
        retreat.subtitle?.toLowerCase().includes(query)
      );
    }

    // Sort available retreats: upcoming first, then ongoing, then past
    if (activeTab === 'available') {
      retreats = [...retreats].sort((a: any, b: any) => {
        const statusOrder = { 'upcoming': 0, 'ongoing': 1, 'past': 2 };
        const statusA = getRetreatStatus(a);
        const statusB = getRetreatStatus(b);

        // Sort by status first
        const statusComparison = statusOrder[statusA] - statusOrder[statusB];
        if (statusComparison !== 0) return statusComparison;

        // Within same status, sort by start_date (earliest first for upcoming/ongoing)
        if (statusA === 'upcoming' || statusA === 'ongoing') {
          const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
          const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
          return dateA - dateB;
        }

        // For past retreats, sort by end_date (most recent first)
        const dateA = a.end_date ? new Date(a.end_date).getTime() : 0;
        const dateB = b.end_date ? new Date(b.end_date).getTime() : 0;
        return dateB - dateA;
      });
    }

    return retreats;
  };

  const filteredRetreats = getFilteredRetreats();

  return (
    <div className="min-h-screen lg:min-h-[125vh] bg-[#FAF8F1] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Title and Search */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#000000] mb-2" style={{ fontFamily: 'Optima, serif' }}>
              Online Retreats
            </h1>
            <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Join livestreamed retreats with Shunyamurti and the Sat Yoga community
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#717680]" size={20} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-[#E5E7EB] mb-6">
          <button
            onClick={() => setActiveTab('my-retreats')}
            className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
              activeTab === 'my-retreats'
                ? 'border-[#7D1A13] text-[#7D1A13]'
                : 'border-transparent text-[#717680] hover:text-[#000000]'
            }`}
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            My Online Retreats ({userRetreats.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
              activeTab === 'available'
                ? 'border-[#7D1A13] text-[#7D1A13]'
                : 'border-transparent text-[#717680] hover:text-[#000000]'
            }`}
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            Available to Purchase ({getAvailableRetreatsFiltered().length})
          </button>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            {filteredRetreats.length} {filteredRetreats.length === 1 ? 'retreat' : 'retreats'}
          </p>
        </div>

        {/* Content */}
        <div>
          {/* My Retreats Tab */}
          {activeTab === 'my-retreats' && (
            <div>
              {filteredRetreats.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-[#717680] mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    {userRetreats.length === 0
                      ? "You haven't registered for any online retreats yet."
                      : "No retreats match your search."}
                  </p>
                  {userRetreats.length === 0 && (
                    <button
                      onClick={() => setActiveTab('available')}
                      className="px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    >
                      Browse Available Retreats
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRetreats.map((retreat: any) => (
                    <RetreatCard
                      key={retreat.id}
                      retreat={retreat}
                      isRegistered={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Available Retreats Tab */}
          {activeTab === 'available' && (
            <div>
              {filteredRetreats.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    {getAvailableRetreatsFiltered().length === 0
                      ? "No upcoming retreats available at this time."
                      : "No retreats match your search."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRetreats.map((retreat: any) => (
                    <RetreatCard
                      key={retreat.id}
                      retreat={retreat}
                      isRegistered={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
