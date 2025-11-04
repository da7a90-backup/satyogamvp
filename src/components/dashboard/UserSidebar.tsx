"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "next-auth/react";

const UserSidebar = () => {
  const pathname = usePathname();
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);
  const [showSpotifyWidget, setShowSpotifyWidget] = useState(true);

  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  return (
    <div className="w-[224px] h-screen bg-white flex flex-col overflow-y-auto" style={{ gap: '23px', padding: '20px 16px' }}>
      {/* Logo */}
      <div className="flex items-center justify-center" style={{ height: '53px' }}>
        <Link href="/dashboard">
          <Image src="/logo_black.svg" alt="Sat Yoga" width={224} height={45} />
        </Link>
      </div>

      {/* Dashboard */}
      <div>
        <Link
          href="/dashboard/user"
          className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
            isActive('/dashboard/user') && !pathname.includes('/teachings') && !pathname.includes('/courses')
              ? 'bg-white text-[#374151]'
              : 'bg-white text-[#374151] hover:bg-gray-50'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
            <rect x="12" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="12" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
            <rect x="12" y="12" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Dashboard</span>
        </Link>
      </div>

      {/* Quick Access */}
      <div>
        <h3 className="px-1 text-sm font-semibold text-[#737373] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Quick Access</h3>
        <div className="space-y-0">
          <Link
            href="/dashboard/user/retreats"
            className="flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 15L10 5L17.5 15H2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M10 8L13.33 12H6.67L10 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-medium" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Online Retreats</span>
          </Link>
          <Link
            href="/dashboard/user/courses"
            className="flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="4" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 7H17" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 4V7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13 4V7" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-sm font-medium" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Courses</span>
          </Link>
        </div>
      </div>

      {/* My Space */}
      <div>
        <h3 className="px-1 text-sm font-semibold text-[#737373] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>My Space</h3>
        <div className="space-y-0">
          <Link href="/dashboard/user/purchases" className="flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 6.67L6.67 2.5L17.5 2.5V13.33L13.33 17.5H2.5V6.67Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>My Purchases</span>
          </Link>
          <Link href="/dashboard/user/favourites" className="flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3.33C7.5 1.67 4.17 2.5 2.92 5.42C1.67 8.33 3.75 12.5 10 17.5C16.25 12.5 18.33 8.33 17.08 5.42C15.83 2.5 12.5 1.67 10 3.33Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>My Favourites</span>
          </Link>
          <Link href="/dashboard/user/history" className="flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 5V10L13.33 11.67" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>My History</span>
          </Link>
          <Link href="/dashboard/user/calendar" className="flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="4.17" width="15" height="13.33" rx="1.67" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2.5 8.33H17.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Calendar</span>
          </Link>
        </div>
      </div>

      {/* Pragyani Membership */}
      <div>
        <h3 className="px-1 text-sm font-semibold text-[#737373] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Pragyani Membership</h3>
        <div>
          {/* Library with submenu */}
          <button
            onClick={() => setIsLibraryExpanded(!isLibraryExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2.5" y="3" width="5" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="8.5" y="3" width="5" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="14.5" y="3" width="3" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
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
                href="/dashboard/user/teachings"
                className={`block px-6 py-2 rounded text-sm font-medium capitalize transition-colors ${
                  isActive('/dashboard/user/teachings')
                    ? 'bg-[#7D1A13] text-white'
                    : 'bg-white text-[#374151] hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Teachings
              </Link>
              <Link
                href="/dashboard/user/meditations"
                className="block px-6 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 text-sm font-medium capitalize transition-colors"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Guided Meditations
              </Link>
              <Link
                href="/dashboard/user/qas"
                className="block px-6 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 text-sm font-medium capitalize transition-colors"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Q&A's
              </Link>
              <Link
                href="/dashboard/user/essays"
                className="block px-6 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 text-sm font-medium capitalize transition-colors"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Essays
              </Link>
            </div>
          )}

          {/* Other membership items */}
          <Link href="/dashboard/user/recommendations" className="flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors mt-1">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2.5C6.25 5 4.17 7.5 4.17 10.83C4.17 13.75 6.25 16.67 10 17.5C13.75 16.67 15.83 13.75 15.83 10.83C15.83 7.5 13.75 5 10 2.5Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Shunyamurti Recommends</span>
          </Link>
          <Link href="/dashboard/user/book-group" className="flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="14" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 7L7 12" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 7L13 12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Book Group</span>
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="2.5" width="15" height="15" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-sm font-medium capitalize flex-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Study Group</span>
            <span className="px-2 py-0.5 bg-[#EF4444] text-white text-xs font-medium rounded" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Live</span>
          </div>
          <Link href="/dashboard/user/discussion" className="flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="14" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="6" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Discussion Group</span>
          </Link>
          <Link href="/dashboard/user/forum" className="flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="4" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 8H14M6 11H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Forum</span>
          </Link>
        </div>
      </div>

      {/* Store */}
      <div>
        <h3 className="px-1 text-sm font-semibold text-[#737373] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Store</h3>
        <div className="space-y-0">
          <Link href="/store" className="flex items-center gap-1 px-3 py-2.5 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="6" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2.5 6L4 3H16L17.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 9V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>The Dharma Bandhara</span>
          </Link>
          <Link href="/dashboard/user/saved" className="flex items-center gap-1 px-3 py-2.5 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 2.5H15V17.5L10 14L5 17.5V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Saved For Later</span>
          </Link>
        </div>
      </div>

      {/* Resources */}
      <div>
        <h3 className="px-1 text-sm font-semibold text-[#737373] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Resources</h3>
        <div className="space-y-0">
          <Link href="/blog" className="flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3.33" y="2.5" width="13.33" height="15" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Blog</span>
          </Link>
          <Link href="/dashboard/tour" className="flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 7L13 10L8 13V7Z" fill="currentColor" />
            </svg>
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Dashboard Tour</span>
          </Link>
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
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Help Us Improve</span>
        </button>
        <Link href="/dashboard/user/settings" className="flex items-center gap-3 px-3 py-2 rounded bg-white text-[#374151] hover:bg-gray-50 transition-colors">
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
          <div className="w-full h-full rounded-full bg-gray-200 border-2 border-white overflow-hidden">
            <Image
              src="/user-avatar.jpg"
              alt="User"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] border border-white rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1F2937] truncate capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            Alessandra Franceschinin
          </p>
          <p className="text-xs text-[#737373] truncate" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            alessandra@thefrance...
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
