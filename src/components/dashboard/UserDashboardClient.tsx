'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Heart, Play, Bell, Search } from 'lucide-react';
import DashboardHappeningNow from './DashboardHappeningNow';
import DashboardTour from './tour/DashboardTour';
import ForumActivityCard from '../forum/ForumActivityCard';
import { CartIcon } from '@/components/cart/CartIcon';
import SearchModal from '@/components/search/SearchModal';

interface UserDashboardClientProps {
  user: any;
  featuredTeaching: any;
  upcomingEvents: any[];
  recentTeachings: any[];
  featuredProducts: any[];
  upcomingRetreats: any[];
  userRetreats: any[];
}

export default function UserDashboardClient({
  user,
  featuredTeaching,
  upcomingEvents,
  recentTeachings,
  featuredProducts,
  upcomingRetreats,
  userRetreats,
}: UserDashboardClientProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  // Handle keyboard shortcuts (Cmd/Ctrl + K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Get membership tier display
  const getMembershipDisplay = () => {
    const tier = (user?.membershipTier || 'free').toUpperCase();
    const tierMap: { [key: string]: { label: string; color: string } } = {
      'FREE': { label: 'Free', color: 'bg-neutral-300 text-neutral-700' },
      'GYANI': { label: 'Gyani', color: 'bg-blue-100 text-blue-700' },
      'PRAGYANI': { label: 'Pragyani', color: 'bg-purple-100 text-purple-700' },
      'PRAGYANI_PLUS': { label: 'Pragyani+', color: 'bg-indigo-100 text-indigo-700' },
    };
    return tierMap[tier] || tierMap['FREE'];
  };

  const membershipInfo = getMembershipDisplay();

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  // Get event days for current month (including all days for multi-day events)
  const getEventDays = () => {
    const eventDays = new Set<number>();
    upcomingEvents.forEach((event: any) => {
      const startDate = event.startDate;
      const endDate = event.endDate;

      if (startDate) {
        const eventStartDate = new Date(startDate);
        let durationDays = 1;

        // Calculate duration from endDate if available
        if (endDate) {
          const eventEndDate = new Date(endDate);
          const diffTime = eventEndDate.getTime() - eventStartDate.getTime();
          durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
        } else if (event.duration) {
          // Fallback to parsing duration string
          const match = event.duration.match(/(\d+)\s*day/i);
          if (match) {
            durationDays = parseInt(match[1]);
          }
        }

        // Add all days of the event to the set
        for (let i = 0; i < durationDays; i++) {
          const currentDay = new Date(eventStartDate);
          currentDay.setDate(eventStartDate.getDate() + i);

          if (
            currentDay.getMonth() === currentMonth.getMonth() &&
            currentDay.getFullYear() === currentMonth.getFullYear()
          ) {
            eventDays.add(currentDay.getDate());
          }
        }
      }
    });
    return eventDays;
  };

  const eventDays = getEventDays();

  // Get upcoming retreats sorted by date
  const getUpcomingRetreats = () => {
    if (!upcomingRetreats || upcomingRetreats.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter upcoming retreats (end date hasn't passed)
    const upcoming = upcomingRetreats.filter((retreat: any) => {
      const fixedDate = retreat.fixed_date || retreat.fixedDate || '';
      const dateMatch = fixedDate.match(/-\s*(\w+ \d+, \d{4})/);
      if (dateMatch) {
        const endDate = new Date(dateMatch[1]);
        return endDate >= today;
      }
      return true;
    });

    // Sort by start date
    return upcoming.sort((a: any, b: any) => {
      const aDate = a.fixed_date || a.fixedDate || '';
      const bDate = b.fixed_date || b.fixedDate || '';
      const aMatch = aDate.match(/(\w+ \d+, \d{4})/);
      const bMatch = bDate.match(/(\w+ \d+, \d{4})/);
      if (aMatch && bMatch) {
        return new Date(aMatch[1]).getTime() - new Date(bMatch[1]).getTime();
      }
      return 0;
    });
  };

  const sortedUpcomingRetreats = getUpcomingRetreats();
  const closestRetreat = sortedUpcomingRetreats[0] || null;
  const nextThreeRetreats = sortedUpcomingRetreats.slice(1, 4);

  return (
    <div className="relative flex flex-col items-start px-0 py-4 lg:py-8 pb-12 gap-6 lg:gap-8 bg-[#FAF8F1] min-h-screen">
      {/* Dashboard Tour */}
      <DashboardTour />

      <div className="w-full px-4 lg:pl-8 lg:pr-8">
        {/* Header Section */}
        <header className="flex flex-row items-start gap-3 lg:gap-6 w-full mb-6 lg:mb-8">
          <div className="flex flex-row items-start gap-3 lg:gap-5 flex-grow">
            {/* Avatar */}
            <div className="relative w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {user?.image ? (
                <Image src={user.image} alt={user.name || 'User'} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="absolute inset-0 border-[0.75px] border-black/8 rounded-full" />
            </div>

            {/* Page Header */}
            <div className="flex flex-col items-start gap-1 flex-grow min-w-0">
              <div className="flex flex-row items-center gap-2 flex-wrap">
                <h1 className="text-xl lg:text-2xl font-semibold text-[#181D27] font-[Optima]">
                  Namaste, {user?.name?.split(' ')[0] || 'Friend'}
                </h1>
                <span className={`px-2 lg:px-3 py-0.5 lg:py-1 text-xs lg:text-sm font-medium border border-neutral-300 bg-white rounded-2xl ${membershipInfo.color}`}>
                  {membershipInfo.label}
                </span>
              </div>
              <p className="text-sm lg:text-base text-[#535862] hidden lg:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-xs text-[#535862] lg:hidden">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Actions - Desktop Only */}
          <div className="hidden lg:flex flex-row items-center gap-3">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/50 transition"
              aria-label="Search"
              title="Search (Cmd+K)"
            >
              <Search className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={() => setNotificationModalOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/50 transition"
              data-tour="notifications"
            >
              <Bell className="w-6 h-6 text-gray-700" />
            </button>
            <CartIcon variant="ghost" className="w-10 h-10 p-0" />
            <Link
              href="/donate"
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
            >
              Donate
            </Link>
            <Link
              href="/"
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
              data-tour="website-link"
            >
              Go to website
            </Link>
          </div>
        </header>

        {/* Happening Now Section */}
        <DashboardHappeningNow />

        {/* Quote Section */}
        <section className="w-full mb-6 lg:mb-8">
          <h2 className="text-xs lg:text-sm font-semibold text-[#535862] mb-2 lg:mb-3">Quote of the Week</h2>
          <div className="relative w-full min-h-[100px] lg:h-[122px] p-4 lg:p-8 bg-gradient-to-b from-[rgba(218,165,14,0.1)] to-[rgba(156,117,32,0.1)] border border-[#E4DED9] rounded-2xl overflow-hidden">
            {/* Decorative Left Labyrinth - Desktop Only */}
            <div
              className="absolute hidden lg:block"
              style={{
                width: '399px',
                height: '399px',
                left: '-200px',
                top: '-259px',
                backgroundImage: 'url(https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/44f9856a-562e-4a8c-12db-2406b65c4400/public)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                transform: 'matrix(1, 0, 0, -1, 0, 0)',
                opacity: 0.3,
                zIndex: 2
              }}
            />

            {/* Quote Content */}
            <div className="relative z-10 flex items-center justify-center h-full">
              <p
                className="text-sm lg:text-lg italic font-[Optima] text-center leading-[160%] max-w-4xl"
                style={{ color: '#9C7520' }}
              >
                "Once a soul awakens to the Supreme Self—which is always a function of grace—it gladly bows before the Lord in adoring surrender. The job of the character is only to empty itself of ego and become refashioned as a pure instrument of God."
              </p>
            </div>

            {/* Decorative Right Labyrinth - Desktop Only */}
            <div
              className="absolute hidden lg:block"
              style={{
                width: '399px',
                height: '399px',
                right: '0px',
                top: '0px',
                backgroundImage: 'url(https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/44f9856a-562e-4a8c-12db-2406b65c4400/public)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                transform: 'matrix(1, 0, 0, -1, 0, 0)',
                opacity: 0.3,
                zIndex: 1
              }}
            />
          </div>
        </section>

        {/* Main Content - Responsive Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-6 w-full justify-between">
          {/* Left Column - Wider */}
          <div className="flex flex-col items-start gap-6 flex-grow">
            {/* Featured Teaching */}
            {featuredTeaching && (
              <section className="w-full">
                <div className="flex flex-row items-start justify-between mb-4">
                  <h2 className="text-base lg:text-lg font-semibold text-[#181D27]">Featured teaching</h2>
                  <Link href="/dashboard/user/teachings" className="text-sm font-semibold text-[#535862] hover:text-[#7D1A13]">
                    View all
                  </Link>
                </div>

                <div className="relative w-full min-h-[200px] lg:h-[240px] bg-white border border-[#D1D1D1] rounded-lg overflow-hidden">
                  <div className="flex flex-col lg:flex-row h-full">
                    {/* Thumbnail */}
                    <div className="relative w-full lg:w-[426px] h-[200px] lg:h-full bg-gray-900 flex-shrink-0">
                      {featuredTeaching.thumbnail_url && (
                        <Image
                          src={featuredTeaching.thumbnail_url}
                          alt={featuredTeaching.title}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/20" />

                      {/* Play button */}
                      <button className="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center bg-white rounded-full hover:scale-105 transition">
                        <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
                      </button>

                      {/* Duration badge */}
                      <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded text-white text-xs font-medium">
                        Video
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col p-4 gap-4 flex-grow">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-[#7D1A13]">Video Teaching</span>
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#384250]">
                            <Clock className="w-4 h-4 text-[#535862]" />
                            {Math.floor((featuredTeaching.duration || 2700) / 60)} minutes
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-[#181D27] line-clamp-2">
                          {featuredTeaching.title}
                        </h3>
                        <p className="text-base text-[#535862] line-clamp-3">
                          {featuredTeaching.description}
                        </p>
                      </div>
                    </div>

                    {/* Favorite button */}
                    <button className="absolute top-4 right-4 w-13 h-13 flex items-center justify-center bg-white/40 rounded-full hover:bg-white/60 transition">
                      <div className="w-12 h-12 flex items-center justify-center bg-white/40 rounded-full">
                        <Heart className="w-5 h-5" />
                      </div>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Recent Teachings */}
            <section className="w-full">
              <div className="flex flex-row items-start justify-between mb-4">
                <h2 className="text-base lg:text-lg font-semibold text-[#181D27]">Recent teachings</h2>
                <Link href="/dashboard/user/teachings" className="text-sm font-semibold text-[#535862] hover:text-[#7D1A13]">
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                {recentTeachings.slice(0, 3).map((teaching: any) => (
                  <div key={teaching.id} className="flex flex-col">
                    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3">
                      {teaching.thumbnail_url && (
                        <Image
                          src={teaching.thumbnail_url}
                          alt={teaching.title}
                          fill
                          className="object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/15" />

                      <button className="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center bg-white rounded-full hover:scale-105 transition">
                        <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
                      </button>

                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-white text-[10px] font-medium">
                        Video
                      </div>

                      <button className="absolute top-4 right-4 w-13 h-13 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition">
                        <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-[#7D1A13]">Video Teaching</span>
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#384250]">
                          <Clock className="w-4 h-4 text-[#535862]" />
                          {Math.floor((teaching.duration || 2700) / 60)} min
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-black line-clamp-2">
                        {teaching.title}
                      </h3>
                      <p className="text-base text-[#384250] line-clamp-3">
                        {teaching.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Online Retreat */}
            {closestRetreat && (
              <section className="w-full">
                <div className="flex flex-row items-start justify-between mb-4">
                  <h2 className="text-base lg:text-lg font-semibold text-[#181D27]">Featured Online Retreat</h2>
                  <Link href="/retreats/online" className="text-sm font-semibold text-[#535862] hover:text-[#7D1A13]">
                    View all
                  </Link>
                </div>

                <div className="relative flex flex-col gap-4 w-full bg-white border border-[#D2D6DB] rounded-lg overflow-hidden shadow-sm">
                  {/* Retreat Image */}
                  {closestRetreat.hero_background && (
                    <div className="relative w-full h-[200px] bg-gray-200">
                      <Image
                        src={closestRetreat.hero_background}
                        alt={closestRetreat.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Content Container */}
                  <div className="flex flex-col items-start p-4 lg:p-6 gap-4">
                    {/* Event details */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-4 w-full">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#535862] flex-shrink-0">
                          <path d="M14 2.66667H2C1.26667 2.66667 0.666667 3.26667 0.666667 4V14C0.666667 14.7333 1.26667 15.3333 2 15.3333H14C14.7333 15.3333 15.3333 14.7333 15.3333 14V4C15.3333 3.26667 14.7333 2.66667 14 2.66667ZM14 14H2V6.66667H14V14ZM14 5.33333H2V4H14V5.33333Z" fill="currentColor"/>
                        </svg>
                        <span className="text-sm font-semibold text-[#384250]">{closestRetreat.fixed_date || ''}</span>
                      </div>
                      <div className="hidden lg:block w-px h-6 bg-[#D0D0D0]" />
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#535862] flex-shrink-0">
                          <path d="M8 14.6667C4.32 14.6667 1.33333 11.68 1.33333 8C1.33333 4.32 4.32 1.33333 8 1.33333C11.68 1.33333 14.6667 4.32 14.6667 8C14.6667 11.68 11.68 14.6667 8 14.6667ZM8 2.66667C5.06 2.66667 2.66667 5.06 2.66667 8C2.66667 10.94 5.06 13.3333 8 13.3333C10.94 13.3333 13.3333 10.94 13.3333 8C13.3333 5.06 10.94 2.66667 8 2.66667Z" fill="currentColor"/>
                          <path d="M10.3933 10.6667L7.33333 8.78V4.66667H8.66667V8.22L11.3333 9.77333L10.3933 10.6667Z" fill="currentColor"/>
                        </svg>
                        <span className="text-sm font-semibold text-[#384250]">{closestRetreat.location || 'Online'}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-4 w-full">
                      <h3 className="text-lg lg:text-xl font-semibold text-black leading-[30px]">
                        {closestRetreat.title}
                      </h3>
                      {(closestRetreat.subtitle || (closestRetreat.intro1_content && closestRetreat.intro1_content[0])) && (
                        <p className="text-sm lg:text-base text-[#384250] leading-6 line-clamp-2">
                          {closestRetreat.subtitle || closestRetreat.intro1_content[0]}
                        </p>
                      )}
                    </div>

                    {/* Button */}
                    <Link
                      href={`/dashboard/user/online-retreats/${closestRetreat.slug}`}
                      className="flex items-center justify-center px-[14px] py-[10px] gap-1 w-full h-10 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] hover:bg-gray-50 transition"
                    >
                      <span className="text-sm font-semibold text-[#414651]">
                        Buy ${closestRetreat.price || 195}
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Upcoming Retreats Grid */}
                {nextThreeRetreats.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mt-6">
                    {nextThreeRetreats.map((retreat: any) => (
                      <Link
                        key={retreat.id}
                        href={`/retreats/online/${retreat.slug}`}
                        className="flex flex-col gap-3 bg-white border border-[#D2D6DB] rounded-lg overflow-hidden hover:shadow-md transition"
                      >
                        {/* Retreat Image */}
                        {retreat.hero_background && (
                          <div className="relative w-full h-[160px] bg-gray-200">
                            <Image
                              src={retreat.hero_background}
                              alt={retreat.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-col gap-2 p-4">
                          <div className="flex items-center gap-2 text-xs text-[#535862]">
                            <span>{retreat.fixed_date || ''}</span>
                          </div>
                          <h4 className="text-base font-semibold text-black line-clamp-2">
                            {retreat.title}
                          </h4>
                          <div className="text-sm font-semibold text-[#7D1A13]">
                            ${retreat.price || 195}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* My Online Retreats */}
            {userRetreats && userRetreats.length > 0 && (
              <section className="w-full">
                <div className="flex flex-row items-start justify-between mb-4">
                  <h2 className="text-base lg:text-lg font-semibold text-[#181D27]">My Online Retreats</h2>
                  <Link href="/dashboard/user/retreats" className="text-sm font-semibold text-[#535862] hover:text-[#7D1A13]">
                    View all
                  </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  {userRetreats.slice(0, 3).map((retreat: any) => (
                    <Link
                      key={retreat.id}
                      href={`/dashboard/user/retreats/${retreat.slug}`}
                      className="flex flex-col gap-3 bg-white border border-[#D2D6DB] rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        {retreat.hero_background && (
                          <Image
                            src={retreat.hero_background}
                            alt={retreat.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-[#535862]">
                          <span>{retreat.fixed_date || ''}</span>
                        </div>
                        <h3 className="text-base font-semibold text-black line-clamp-2">
                          {retreat.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Narrower Calendar */}
          <div className="flex flex-col items-start gap-6 w-full lg:w-[372px]">
            {/* Calendar */}
            <section className="w-full" data-tour="calendar">
              <div className="flex flex-row items-start justify-between mb-4">
                <h2 className="text-base lg:text-lg font-semibold text-[#181D27]">Calendar</h2>
                <Link href="/events" className="text-sm font-semibold text-[#535862] hover:text-[#7D1A13]">
                  View all
                </Link>
              </div>

              <div className="w-full lg:w-[372px] h-auto lg:h-[388px] max-w-full lg:max-w-[400px] p-4 lg:p-6 bg-white border border-[#D2D6DB] rounded-xl shadow-sm">
                {/* Month Header */}
                <div className="flex justify-center items-center mb-4 pb-1">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-1.5 rounded hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 className="mx-auto text-base font-semibold text-[#414651]">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-1.5 rounded hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="flex flex-wrap justify-center items-start content-center gap-y-1 w-full lg:w-[308px] h-auto lg:h-[304px]">
                  {/* Day headers */}
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="w-[14.28%] lg:w-10 h-8 lg:h-10 flex items-center justify-center">
                      <span className="text-xs lg:text-sm font-semibold text-[#414651]">{day}</span>
                    </div>
                  ))}

                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-[14.28%] lg:w-10 h-8 lg:h-10" />
                  ))}

                  {/* Days of month */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === new Date().getDate() &&
                                   currentMonth.getMonth() === new Date().getMonth() &&
                                   currentMonth.getFullYear() === new Date().getFullYear();
                    const hasEvent = eventDays.has(day);

                    return (
                      <button
                        key={day}
                        className={`w-[14.28%] lg:w-10 h-8 lg:h-10 flex items-center justify-center rounded-full text-xs lg:text-sm font-normal relative ${
                          isToday
                            ? 'bg-[#942017] text-white font-medium'
                            : hasEvent
                            ? 'bg-[#DAA50E]/20 text-[#414651] font-semibold hover:bg-[#DAA50E]/30'
                            : 'text-[#414651] hover:bg-gray-100'
                        }`}
                      >
                        {day}
                        {hasEvent && !isToday && (
                          <span className="absolute bottom-0.5 lg:bottom-1 w-1 h-1 bg-[#942017] rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Upcoming Events */}
            <div className="w-full max-h-none lg:max-h-[536px] lg:overflow-y-scroll">
              {upcomingEvents.slice(0, 5).map((event: any, index: number) => {
                const startDate = event.startDate;
                if (!startDate) return null;

                const eventDate = new Date(startDate);
                const day = eventDate.getDate();
                const month = eventDate.toLocaleDateString('en-US', { month: 'short' });

                return (
                  <div key={event.id} className="flex items-start gap-2 mb-6">
                    <div className="flex-shrink-0 mt-2">
                      <span className="inline-block w-2 h-2 bg-black rounded-full" />
                    </div>
                    <div className="flex flex-col gap-4 flex-grow">
                      <div className="text-lg font-bold text-[#181D27]">
                        {month} {day}
                      </div>
                      <div className="flex items-start bg-white border border-[#D2D6DB] rounded-lg p-4 gap-3">
                        <div className="w-[62px] h-[62px] bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                          <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex flex-col gap-2 flex-grow">
                          <h3 className="text-lg font-semibold text-black">
                            {event.title || 'Event title'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#384250]">
                            <span>{event.locationType || event.type || 'Online'}</span>
                            <span className="w-px h-4 bg-[#D0D0D0]" />
                            <span>{event.duration || 'TBD'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Forum Activity Card - Show for all users, blur for FREE */}
            <div className="w-full mt-6">
              {user?.membershipTier && user.membershipTier.toLowerCase() !== 'free' ? (
                /* Full Access for GYANI+ users */
                <ForumActivityCard />
              ) : (
                /* Blurred Preview + Upgrade CTA for FREE users */
                <div className="relative">
                  {/* Blurred Content */}
                  <div className="blur-sm pointer-events-none select-none">
                    <ForumActivityCard />
                  </div>

                  {/* Upgrade CTA Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm rounded-lg">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-sm mx-4 text-center">
                      {/* Lock Icon */}
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-[#7D1A13] to-[#5A1310] rounded-full flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <rect x="7" y="10" width="10" height="11" rx="1.5" stroke="white" strokeWidth="1.5" />
                          <path d="M16 10V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>

                      {/* Heading */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Unlock Forum Access
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4">
                        Upgrade to <span className="font-semibold text-[#7D1A13]">GYANI</span> to join discussions and connect with members.
                      </p>

                      {/* CTA Button */}
                      <Link
                        href="/membership"
                        className="inline-block w-full bg-gradient-to-r from-[#7D1A13] to-[#5A1310] text-white font-semibold px-5 py-2.5 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
                      >
                        Upgrade Now
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Membership Benefits Section - Mobile Friendly */}
        <section className="w-full mt-8 lg:mt-12 p-4 lg:p-6 bg-white border border-[#D2D6DB] rounded-lg">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8">
            <div className="flex flex-col justify-center gap-6 lg:gap-8 flex-1 lg:max-w-[560px]">
              <div className="flex flex-col gap-4 lg:gap-5">
                <h2 className="text-2xl lg:text-[36px] font-semibold text-[#181D27] font-[Optima] leading-tight lg:leading-[44px] tracking-[-0.02em]">
                  Begin Your 10-Day Free Trial of Gyani Membership
                </h2>

                <div className="flex flex-col gap-3 lg:gap-4 py-2">
                  {[
                    'New Full-Length Teachings Weekly',
                    'Shunyamurti Recommendations',
                    'Community Forum',
                    'Live Sunday Group Meditation',
                    'Exclusive Gyani Discounts',
                    'and so much more…'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3 lg:gap-4">
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      <span className="text-sm lg:text-base font-medium text-[#414651]">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
                <Link
                  href="/membership"
                  className="px-[18px] py-3 bg-[#7D1A13] text-white text-sm lg:text-base font-semibold rounded-lg hover:bg-[#942017] transition shadow-sm text-center"
                >
                  Start free trial
                </Link>
                <Link
                  href="/membership"
                  className="px-[18px] py-3 bg-white border border-[#D5D7DA] text-sm lg:text-base font-semibold text-[#414651] rounded-lg hover:bg-gray-50 transition shadow-sm text-center"
                >
                  View more details
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex w-full lg:w-[480px] h-[300px] lg:h-[468px] flex-shrink-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden items-center justify-center">
              <div className="flex flex-col items-center gap-6 opacity-30">
                <svg className="w-24 lg:w-32 h-24 lg:h-32 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div className="flex gap-4">
                  <svg className="w-12 lg:w-16 h-12 lg:h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <svg className="w-12 lg:w-16 h-12 lg:h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Store Product & Recent Products */}
        {featuredProducts.length > 0 && (
          <>
            {/* Featured Store Product */}
            <section className="w-full mt-8 lg:mt-12">
              <div className="flex flex-row items-start justify-between mb-4">
                <h2 className="text-base lg:text-lg font-semibold text-[#181D27]">Featured from store</h2>
                <Link href="/store" className="text-sm font-semibold text-[#535862] hover:text-[#7D1A13]">
                  View all
                </Link>
              </div>

              <div className="flex flex-col gap-2">
                <div className="relative w-full h-[300px] lg:h-[356px] bg-[#E4DBCD] rounded-lg overflow-hidden">
                  {featuredProducts[0]?.image_url && (
                    <Image
                      src={featuredProducts[0].image_url}
                      alt={featuredProducts[0].name}
                      fill
                      className="object-contain p-8 lg:p-12"
                    />
                  )}

                  <button className="absolute top-4 right-4 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-black/10 rounded-full hover:bg-black/20 transition">
                    <Heart className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-white text-[10px] font-medium">
                    {featuredProducts[0]?.views || 203}
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-bold text-[#942017]">Books</span>
                      <h3 className="text-lg lg:text-xl font-semibold text-black">{featuredProducts[0]?.name}</h3>
                    </div>
                    <span className="text-lg lg:text-xl font-semibold text-black">${featuredProducts[0]?.price}</span>
                  </div>
                  <p className="text-sm lg:text-base text-[#384250] line-clamp-4">
                    {featuredProducts[0]?.description}
                  </p>
                  <Link
                    href={`/store/${featuredProducts[0]?.slug}`}
                    className="px-4 py-2.5 bg-white border border-gray-300 text-sm font-semibold text-[#414651] text-center rounded-lg hover:bg-gray-50 transition shadow-sm"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </section>

            {/* Most Recent Store Products */}
            {featuredProducts.length > 1 && (
              <section className="w-full mt-8">
                <div className="flex flex-row items-start justify-between mb-4">
                  <h2 className="text-base lg:text-lg font-semibold text-[#181D27]">Recent from store</h2>
                  <Link href="/store" className="text-sm font-semibold text-[#535862] hover:text-[#7D1A13]">
                    View all
                  </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  {featuredProducts.slice(1, 4).map((product: any) => (
                    <div key={product.id} className="flex flex-col gap-2">
                      <div className="relative w-full h-[280px] lg:h-[300px] bg-[#E4DBCD] rounded-lg overflow-hidden">
                        {product.image_url && (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain p-8"
                          />
                        )}

                        <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/10 rounded-full hover:bg-black/20 transition">
                          <Heart className="w-4 h-4" />
                        </button>

                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-white text-[10px] font-medium">
                          {product.views || 203}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs lg:text-sm font-bold text-[#942017]">Books</span>
                            <h3 className="text-base lg:text-lg font-semibold text-black line-clamp-2">{product.name}</h3>
                          </div>
                          <span className="text-base lg:text-lg font-semibold text-black">${product.price}</span>
                        </div>
                        <p className="text-sm text-[#384250] line-clamp-2">
                          {product.description}
                        </p>
                        <Link
                          href={`/store/${product.slug}`}
                          className="px-4 py-2 bg-white border border-gray-300 text-sm font-semibold text-[#414651] text-center rounded-lg hover:bg-gray-50 transition shadow-sm"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Search Modal - Dashboard Mode with User Content Badges */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        dashboardMode={true}
      />

      {/* Notification Modal */}
      {notificationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setNotificationModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 lg:p-8 max-w-md mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bell Icon */}
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#DAA50E] to-[#9C7520] rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-white" />
            </div>

            {/* Heading */}
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
              Notifications Module
            </h3>

            {/* Description */}
            <p className="text-sm lg:text-base text-gray-600 mb-6">
              The notifications module is still under active development. Stay tuned for updates!
            </p>

            {/* Close Button */}
            <button
              onClick={() => setNotificationModalOpen(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#7D1A13] to-[#5A1310] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
