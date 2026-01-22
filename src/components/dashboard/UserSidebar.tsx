"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";

// Create context for triggering tour
const TourContext = createContext<{ startTour: () => void } | null>(null);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourContext.Provider');
  }
  return context;
};

const UserSidebar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { totalItems, toggleDrawer } = useCart();
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);
  const [showSpotifyWidget, setShowSpotifyWidget] = useState(true);
  const [triggerTour, setTriggerTour] = useState(false);

  const handleStartTour = () => {
    // Trigger tour by dispatching custom event
    window.dispatchEvent(new CustomEvent('start-dashboard-tour'));
  };

  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  // Check if a specific library tab is active
  const isLibraryTabActive = (tab: string) => {
    if (pathname !== '/dashboard/user/teachings') return false;
    const currentTab = searchParams.get('tab') || 'teachings';
    return currentTab === tab;
  };

  // Get membership tier display
  const getMembershipLabel = () => {
    const tier = ((session?.user as any)?.membershipTier || 'free').toUpperCase();
    const tierMap: { [key: string]: string } = {
      'FREE': 'Free Membership',
      'GYANI': 'Gyani Membership',
      'PRAGYANI': 'Pragyani Membership',
      'PRAGYANI_PLUS': 'Pragyani+ Membership',
    };
    return tierMap[tier] || 'Free Membership';
  };

  // Check if user has forum access (not FREE tier)
  const hasForumAccess = () => {
    const tier = ((session?.user as any)?.membershipTier || 'free').toLowerCase();
    return tier !== 'free';
  };

  // Check if user has GYANI+ access (GYANI, PRAGYANI, PRAGYANI_PLUS)
  const hasGyaniPlusAccess = () => {
    const tier = ((session?.user as any)?.membershipTier || 'free').toLowerCase();
    return ['gyani', 'pragyani', 'pragyani_plus'].includes(tier);
  };

  return (
    <div className="w-64 h-screen lg:h-[125vh] bg-white flex flex-col overflow-y-auto" style={{ gap: '23px', padding: '20px 16px' }} data-tour="sidebar">
      {/* Logo */}
      <div className="flex items-center justify-center" style={{ height: '53px' }}>
        <Link href="/dashboard">
          <Image src="/Logo-dash.png" alt="Sat Yoga" width={180} height={45} />
        </Link>
      </div>

      {/* Dashboard */}
      <div>
        <Link
          href="/dashboard/user"
          className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
            pathname === '/dashboard/user'
              ? 'bg-[#7D1A13] text-white'
              : 'bg-white text-[#374151] hover:bg-gray-50'
          }`}
        >
          <Image src="/dash.png" alt="" width={20} height={20} />
          <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Dashboard</span>
        </Link>
      </div>

      {/* Quick Access */}
      <div>
        <h3 className="px-1 text-sm font-semibold text-[#737373] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Quick Access</h3>
        <div className="space-y-0">
          <Link
            href="/dashboard/user/retreats"
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              isActive('/dashboard/user/retreats')
                ? 'bg-[#7D1A13] text-white'
                : 'bg-white text-[#374151] hover:bg-gray-50'
            }`}
          >
            <Image src="/globe.png" alt="" width={20} height={20} />
            <span className="text-sm font-medium" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Online Retreats</span>
          </Link>
          <Link
            href="/dashboard/user/courses"
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              isActive('/dashboard/user/courses')
                ? 'bg-[#7D1A13] text-white'
                : 'bg-white text-[#374151] hover:bg-gray-50'
            }`}
          >
            <Image src="/online-learning.png" alt="" width={20} height={20} />
            <span className="text-sm font-medium" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Courses</span>
          </Link>
        </div>
      </div>

      {/* My Space */}
      <div>
        <h3 className="px-1 text-sm font-semibold text-[#737373] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>My Space</h3>
        <div className="space-y-0">
          {/* Cart */}
          <button
            onClick={toggleDrawer}
            className="w-full flex items-center justify-between px-3 py-2 rounded transition-colors bg-white text-[#374151] hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Image src="/shopping-cart-01 (1).png" alt="" width={20} height={20} />
              <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Cart</span>
            </div>
            {totalItems > 0 && (
              <span className="flex items-center justify-center h-5 w-5 bg-[#7D1A13] text-white text-xs font-bold rounded-full">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* My Purchases */}
          <Link
            href="/dashboard/user/purchases"
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              isActive('/dashboard/user/purchases')
                ? 'bg-[#7D1A13] text-white'
                : 'bg-white text-[#374151] hover:bg-gray-50'
            }`}
          >
            <Image src="/shopping-cart-01 (1).png" alt="" width={20} height={20} />
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>My Purchases</span>
          </Link>

          <Link
            href="/dashboard/user/favourites"
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              isActive('/dashboard/user/favourites')
                ? 'bg-[#7D1A13] text-white'
                : 'bg-white text-[#374151] hover:bg-gray-50'
            }`}
          >
            <Image src="/heart (1).png" alt="" width={20} height={20} />
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>My Favourites</span>
          </Link>
          <Link
            href="/dashboard/user/history"
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              isActive('/dashboard/user/history')
                ? 'bg-[#7D1A13] text-white'
                : 'bg-white text-[#374151] hover:bg-gray-50'
            }`}
          >
            <Image src="/clock-fast-forward (1).png" alt="" width={20} height={20} />
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>My History</span>
          </Link>
          <Link
            href="/dashboard/user/calendar"
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              isActive('/dashboard/user/calendar')
                ? 'bg-[#7D1A13] text-white'
                : 'bg-white text-[#374151] hover:bg-gray-50'
            }`}
          >
            <Image src="/calendar (1).png" alt="" width={20} height={20} />
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Calendar</span>
          </Link>
          <Link
            href="/dashboard/user/applications"
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              isActive('/dashboard/user/applications')
                ? 'bg-[#7D1A13] text-white'
                : 'bg-white text-[#374151] hover:bg-gray-50'
            }`}
          >
            <Image src="/building-02.png" alt="" width={20} height={20} />
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Applications</span>
          </Link>
        </div>
      </div>

      {/* Membership Section */}
      <div>
        <h3 className="px-1 text-sm font-semibold text-[#737373] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
          {getMembershipLabel()}
        </h3>

        {/* Upgrade Button for FREE users */}
        {((session?.user as any)?.membershipTier || 'free').toLowerCase() === 'free' && (
          <Link
            href="/membership"
            className="block mb-3 px-3 py-2 bg-gradient-to-r from-[#7D1A13] to-[#5A1310] text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-200 text-center"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            Upgrade Membership
          </Link>
        )}

        <div>
          {/* Library with submenu */}
          <button
            onClick={() => setIsLibraryExpanded(!isLibraryExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Image src="/building-08 (1).png" alt="" width={20} height={20} />
              <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Library</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform ${isLibraryExpanded ? '' : 'rotate-180'}`}>
              <path d="M4 10L8 6L12 10" stroke="#A4A7AE" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Library submenu */}
          {isLibraryExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              <Link
                href="/dashboard/user/teachings?tab=teachings"
                className={`block px-6 py-2 rounded text-sm font-medium capitalize transition-colors ${
                  isLibraryTabActive('teachings')
                    ? 'bg-[#7D1A13] text-white'
                    : 'bg-white text-[#374151] hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Teachings
              </Link>
              <Link
                href="/dashboard/user/teachings?tab=meditations"
                className={`block px-6 py-2 rounded text-sm font-medium capitalize transition-colors ${
                  isLibraryTabActive('meditations')
                    ? 'bg-[#7D1A13] text-white'
                    : 'bg-white text-[#374151] hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Guided Meditations
              </Link>
              <Link
                href="/dashboard/user/teachings?tab=qas"
                className={`block px-6 py-2 rounded text-sm font-medium capitalize transition-colors ${
                  isLibraryTabActive('qas')
                    ? 'bg-[#7D1A13] text-white'
                    : 'bg-white text-[#374151] hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Q&A's
              </Link>
              <Link
                href="/dashboard/user/teachings?tab=essays"
                className={`block px-6 py-2 rounded text-sm font-medium capitalize transition-colors ${
                  isLibraryTabActive('essays')
                    ? 'bg-[#7D1A13] text-white'
                    : 'bg-white text-[#374151] hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Essays
              </Link>
            </div>
          )}

          {/* Shunyamurti Recommends - GYANI+ only */}
          {hasGyaniPlusAccess() ? (
            <Link
              href="/dashboard/user/shunya-recommends"
              className={`flex items-center gap-3 px-3 py-2 rounded transition-colors mt-1 ${
                isActive('/dashboard/user/shunya-recommends')
                  ? 'bg-[#7D1A13] text-white'
                  : 'bg-white text-[#374151] hover:bg-gray-50'
              }`}
            >
              <Image src="/annotation-heart (1).png" alt="" width={20} height={20} />
              <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Shunyamurti Recommends</span>
            </Link>
          ) : (
            <div className="flex items-center justify-between px-3 py-2 rounded bg-white text-[#9CA3AF] cursor-not-allowed opacity-60 mt-1">
              <div className="flex items-center gap-3">
                <Image src="/annotation-heart (1).png" alt="" width={20} height={20} className="opacity-50" />
                <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Shunyamurti Recommends</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="7" width="6" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M11 7V5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5V7" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>
          )}
          <Link
            href="/dashboard/user/book-groups"
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              isActive('/dashboard/user/book-groups')
                ? 'bg-[#7D1A13] text-white'
                : 'bg-white text-[#374151] hover:bg-gray-50'
            }`}
          >
            <Image src="/feather (1).png" alt="" width={20} height={20} />
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Book Groups</span>
          </Link>
         {/*  <Link
            href="/dashboard/user/study-group"
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              isActive('/dashboard/user/study-group')
                ? 'bg-[#7D1A13] text-white'
                : 'bg-white text-[#374151] hover:bg-gray-50'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="2.5" width="15" height="15" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-sm font-medium capitalize flex-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Study Group</span>
            <span className="px-2 py-0.5 bg-[#EF4444] text-white text-xs font-medium rounded" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Live</span>
          </Link> */}
   {/*        <Link
            href="/dashboard/user/discussion"
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              isActive('/dashboard/user/discussion')
                ? 'bg-[#7D1A13] text-white'
                : 'bg-white text-[#374151] hover:bg-gray-50'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="14" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="6" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Discussion Group</span>
          </Link> */}
          {hasForumAccess() ? (
            <Link
              href="/dashboard/user/forum"
              className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                isActive('/dashboard/user/forum')
                  ? 'bg-[#7D1A13] text-white'
                  : 'bg-white text-[#374151] hover:bg-gray-50'
              }`}
            >
              <Image src="/message-chat-square (1).png" alt="" width={20} height={20} />
              <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Forum</span>
            </Link>
          ) : (
            <div className="flex items-center justify-between px-3 py-2 rounded bg-white text-[#9CA3AF] cursor-not-allowed opacity-60">
              <div className="flex items-center gap-3">
                <Image src="/message-chat-square (1).png" alt="" width={20} height={20} className="opacity-50" />
                <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Forum</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="7" width="6" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M11 7V5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5V7" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Store */}
      <div>
        <h3 className="px-1 text-sm font-semibold text-[#737373] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Store</h3>
        <div className="space-y-0">
          <Link
            href="/dashboard/user/dharma-bandhara"
            className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
              isActive('/dashboard/user/dharma-bandhara')
                ? 'bg-[#7D1A13] text-white'
                : 'bg-white text-[#374151] hover:bg-gray-50'
            }`}
          >
            <Image src="/building-02.png" alt="" width={20} height={20} />
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>The Dharma Bandhara</span>
          </Link>
          <Link
            href="/dashboard/user/saved"
            className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
              isActive('/dashboard/user/saved')
                ? 'bg-[#7D1A13] text-white'
                : 'bg-white text-[#374151] hover:bg-gray-50'
            }`}
          >
            <Image src="/bookmark.png" alt="" width={20} height={20} />
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Saved For Later</span>
          </Link>
        </div>
      </div>

      {/* Resources */}
      <div>
        <h3 className="px-1 text-sm font-semibold text-[#737373] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Resources</h3>
        <div className="space-y-0">
          <Link
            href="/dashboard/user/blog"
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
              isActive('/dashboard/user/blog')
                ? 'bg-[#7D1A13] text-white'
                : 'bg-white text-[#374151] hover:bg-gray-50'
            }`}
          >
            <Image src="/book-closed.png" alt="" width={20} height={20} />
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Blog</span>
          </Link>
          {/* Only show Dashboard Tour button for non-admin users */}
          {(session?.user as any)?.role !== 'admin' && (
            <button
              onClick={handleStartTour}
              className="w-full flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors"
            >
              <Image src="/play-square.png" alt="" width={20} height={20} />
              <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Dashboard Tour</span>
            </button>
          )}
          <Link href="https://t.me/satyoga" target="_blank" className="flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors">
            <div className="w-5 h-5 bg-gradient-to-b from-[#2AABEE] to-[#229ED9] rounded-full flex items-center justify-center">
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 4.5L11 0.5L7 9.5L4.5 6L1 4.5Z" fill="white" />
              </svg>
            </div>
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Telegram Group</span>
          </Link>
        </div>
      </div>

      {/* Spotify Widget */}
      {showSpotifyWidget && (
        <div className="relative bg-white border border-[#E9EAEB] rounded-xl p-4 shadow-sm">
          <button
            onClick={() => setShowSpotifyWidget(false)}
            className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M5 15L15 5" stroke="#A4A7AE" strokeWidth="1.67" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-[#42D745] rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8C5 7 9 7 13 9M4 11C6 10 9 10 12 11.5M5.5 5C7 4.5 10 4.5 12 5.5" stroke="#2A353D" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-[#181D27] mb-1 capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Spotify · Sat Yoga</h3>
          <p className="text-sm text-[#535862] mb-3 capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Tune Into Our Favorite Meditation Music</p>
          <Link href="https://open.spotify.com/user/satyoga" target="_blank" className="text-sm font-semibold text-black capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            Open
          </Link>
        </div>
      )}

      {/* Help & Settings */}
      <div className="space-y-0">
        <div className="w-full flex items-center gap-3 px-3 py-2 rounded bg-white text-[#9CA3AF] cursor-not-allowed opacity-60">
          <Image src="/support-lifebuoy.png" alt="" width={20} height={20} className="opacity-50" />
          <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Help Us Improve</span>
        </div>
        <Link
          href="/dashboard/user/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
            isActive('/dashboard/user/settings')
              ? 'bg-[#7D1A13] text-white'
              : 'bg-white text-[#374151] hover:bg-gray-50'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 2.5V5M10 15V17.5M17.5 10H15M5 10H2.5M15.3 4.7L13.54 6.46M6.46 13.54L4.7 15.3M15.3 15.3L13.54 13.54M6.46 6.46L4.7 4.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Settings</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 14L17 10L13 6M17 10H7M7 2.5H5.5C4.11929 2.5 3 3.61929 3 5V15C3 16.3807 4.11929 17.5 5.5 17.5H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Logout</span>
        </button>
      </div>

      {/* User Profile */}
      <div className="border border-[#F3F4F6] rounded-lg p-2 flex items-center gap-3">
        <div className="relative w-10 h-10 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-gray-200 border-2 border-white overflow-hidden flex items-center justify-center">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-gray-600 text-sm font-medium">
                {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] border border-white rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1F2937] truncate capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            {session?.user?.name || 'Loading...'}
          </p>
          <p className="text-xs text-[#737373] truncate" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            {session?.user?.email || ''}
          </p>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5L8.5 10L3 15" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;
