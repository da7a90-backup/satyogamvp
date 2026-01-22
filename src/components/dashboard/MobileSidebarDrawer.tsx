'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { totalItems, toggleDrawer } = useCart();
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);
  const [showSpotifyWidget, setShowSpotifyWidget] = useState(true);

  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  const isLibraryTabActive = (tab: string) => {
    if (pathname !== '/dashboard/user/teachings') return false;
    const currentTab = searchParams.get('tab') || 'teachings';
    return currentTab === tab;
  };

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

  const hasForumAccess = () => {
    const tier = ((session?.user as any)?.membershipTier || 'free').toLowerCase();
    return tier !== 'free';
  };

  const handleStartTour = () => {
    window.dispatchEvent(new CustomEvent('start-dashboard-tour'));
    onClose();
  };

  const handleCartClick = () => {
    toggleDrawer();
    onClose();
  };

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[60] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-full max-w-[375px] bg-[#FAF8F1] z-[70] transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-6 p-4">
          {/* Header with Logo and Close Button */}
          <div className="flex items-center justify-between mb-2">
            <Link href="/dashboard" onClick={onClose}>
              <Image src="/Logo-dash.png" alt="Sat Yoga" width={160} height={40} />
            </Link>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="#A4A7AE" strokeWidth="1.5" />
                <path d="M14 14L17 17" stroke="#A4A7AE" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E9EAEB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7D1A13]/20"
            />
          </div>

          {/* Dashboard */}
          <div>
            <Link
              href="/dashboard/user"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                pathname === '/dashboard/user'
                  ? 'bg-[#7D1A13] text-white'
                  : 'bg-white text-[#374151] hover:bg-gray-50'
              }`}
            >
              <Image src="/dash.png" alt="" width={20} height={20} />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
          </div>

          {/* Quick Access */}
          <div>
            <h3 className="px-1 text-sm font-semibold text-[#737373] mb-2">Quick Access</h3>
            <div className="space-y-1">
              <Link
                href="/dashboard/user/retreats"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive('/dashboard/user/retreats')
                    ? 'bg-[#7D1A13] text-white'
                    : 'bg-white text-[#374151] hover:bg-gray-50'
                }`}
              >
                <Image src="/globe.png" alt="" width={20} height={20} />
                <span className="text-sm font-medium">Online Retreats</span>
              </Link>
              <Link
                href="/dashboard/user/courses"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive('/dashboard/user/courses')
                    ? 'bg-[#7D1A13] text-white'
                    : 'bg-white text-[#374151] hover:bg-gray-50'
                }`}
              >
                <Image src="/online-learning.png" alt="" width={20} height={20} />
                <span className="text-sm font-medium">Courses</span>
              </Link>
            </div>
          </div>

          {/* My Space */}
          <div>
            <h3 className="px-1 text-sm font-semibold text-[#737373] mb-2">My Space</h3>
            <div className="space-y-1">
              <button
                onClick={handleCartClick}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors bg-white text-[#374151] hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Image src="/shopping-cart-01 (1).png" alt="" width={20} height={20} />
                  <span className="text-sm font-medium">Cart</span>
                </div>
                {totalItems > 0 && (
                  <span className="flex items-center justify-center h-5 w-5 bg-[#7D1A13] text-white text-xs font-bold rounded-full">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>

              <Link
                href="/dashboard/user/purchases"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive('/dashboard/user/purchases')
                    ? 'bg-[#7D1A13] text-white'
                    : 'bg-white text-[#374151] hover:bg-gray-50'
                }`}
              >
                <Image src="/shopping-cart-01 (1).png" alt="" width={20} height={20} />
                <span className="text-sm font-medium">My Purchases</span>
              </Link>

              <Link
                href="/dashboard/user/favourites"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive('/dashboard/user/favourites')
                    ? 'bg-[#7D1A13] text-white'
                    : 'bg-white text-[#374151] hover:bg-gray-50'
                }`}
              >
                <Image src="/heart (1).png" alt="" width={20} height={20} />
                <span className="text-sm font-medium">My Favourites</span>
              </Link>

              <Link
                href="/dashboard/user/history"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive('/dashboard/user/history')
                    ? 'bg-[#7D1A13] text-white'
                    : 'bg-white text-[#374151] hover:bg-gray-50'
                }`}
              >
                <Image src="/clock-fast-forward (1).png" alt="" width={20} height={20} />
                <span className="text-sm font-medium">My History</span>
              </Link>

              <Link
                href="/dashboard/user/calendar"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive('/dashboard/user/calendar')
                    ? 'bg-[#7D1A13] text-white'
                    : 'bg-white text-[#374151] hover:bg-gray-50'
                }`}
              >
                <Image src="/calendar (1).png" alt="" width={20} height={20} />
                <span className="text-sm font-medium">Calendar</span>
              </Link>
            </div>
          </div>

          {/* Membership Section */}
          <div>
            <h3 className="px-1 text-sm font-semibold text-[#737373] mb-2">
              {getMembershipLabel()}
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setIsLibraryExpanded(!isLibraryExpanded)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white text-[#374151] hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Image src="/building-08 (1).png" alt="" width={20} height={20} />
                  <span className="text-sm font-medium">Library</span>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`transition-transform ${isLibraryExpanded ? '' : 'rotate-180'}`}
                >
                  <path
                    d="M4 10L8 6L12 10"
                    stroke="#A4A7AE"
                    strokeWidth="1.67"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {isLibraryExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    href="/dashboard/user/teachings?tab=teachings"
                    onClick={onClose}
                    className={`block px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isLibraryTabActive('teachings')
                        ? 'bg-[#7D1A13] text-white'
                        : 'bg-white text-[#374151] hover:bg-gray-50'
                    }`}
                  >
                    Teachings
                  </Link>
                  <Link
                    href="/dashboard/user/teachings?tab=meditations"
                    onClick={onClose}
                    className={`block px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isLibraryTabActive('meditations')
                        ? 'bg-[#7D1A13] text-white'
                        : 'bg-white text-[#374151] hover:bg-gray-50'
                    }`}
                  >
                    Guided Meditations
                  </Link>
                  <Link
                    href="/dashboard/user/teachings?tab=qas"
                    onClick={onClose}
                    className={`block px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isLibraryTabActive('qas')
                        ? 'bg-[#7D1A13] text-white'
                        : 'bg-white text-[#374151] hover:bg-gray-50'
                    }`}
                  >
                    Q&A's
                  </Link>
                  <Link
                    href="/dashboard/user/teachings?tab=essays"
                    onClick={onClose}
                    className={`block px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isLibraryTabActive('essays')
                        ? 'bg-[#7D1A13] text-white'
                        : 'bg-white text-[#374151] hover:bg-gray-50'
                    }`}
                  >
                    Essays
                  </Link>
                </div>
              )}

              {hasForumAccess() ? (
                <Link
                  href="/dashboard/user/forum"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive('/dashboard/user/forum')
                      ? 'bg-[#7D1A13] text-white'
                      : 'bg-white text-[#374151] hover:bg-gray-50'
                  }`}
                >
                  <Image src="/message-chat-square (1).png" alt="" width={20} height={20} />
                  <span className="text-sm font-medium">Forum</span>
                </Link>
              ) : (
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white text-[#9CA3AF] cursor-not-allowed opacity-60">
                  <div className="flex items-center gap-3">
                    <Image src="/message-chat-square (1).png" alt="" width={20} height={20} className="opacity-50" />
                    <span className="text-sm font-medium">Forum</span>
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
            <h3 className="px-1 text-sm font-semibold text-[#737373] mb-2">Store</h3>
            <div className="space-y-1">
              <Link
                href="/dashboard/user/dharma-bandhara"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive('/dashboard/user/dharma-bandhara')
                    ? 'bg-[#7D1A13] text-white'
                    : 'bg-white text-[#374151] hover:bg-gray-50'
                }`}
              >
                <Image src="/building-02.png" alt="" width={20} height={20} />
                <span className="text-sm font-medium">The Dharma Bandhara</span>
              </Link>
              <Link
                href="/dashboard/user/saved"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive('/dashboard/user/saved')
                    ? 'bg-[#7D1A13] text-white'
                    : 'bg-white text-[#374151] hover:bg-gray-50'
                }`}
              >
                <Image src="/bookmark.png" alt="" width={20} height={20} />
                <span className="text-sm font-medium">Saved For Later</span>
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="px-1 text-sm font-semibold text-[#737373] mb-2">Resources</h3>
            <div className="space-y-1">
              <Link
                href="/dashboard/user/blog"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive('/dashboard/user/blog')
                    ? 'bg-[#7D1A13] text-white'
                    : 'bg-white text-[#374151] hover:bg-gray-50'
                }`}
              >
                <Image src="/book-closed.png" alt="" width={20} height={20} />
                <span className="text-sm font-medium">Blog</span>
              </Link>
              {(session?.user as any)?.role !== 'admin' && (
                <button
                  onClick={handleStartTour}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white text-[#374151] hover:bg-gray-50 transition-colors"
                >
                  <Image src="/play-square.png" alt="" width={20} height={20} />
                  <span className="text-sm font-medium">Dashboard Tour</span>
                </button>
              )}
              <Link
                href="https://t.me/satyoga"
                target="_blank"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white text-[#374151] hover:bg-gray-50 transition-colors"
              >
                <div className="w-5 h-5 bg-gradient-to-b from-[#2AABEE] to-[#229ED9] rounded-full flex items-center justify-center">
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 4.5L11 0.5L7 9.5L4.5 6L1 4.5Z" fill="white" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Telegram Group</span>
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
                    <path
                      d="M3 8C5 7 9 7 13 9M4 11C6 10 9 10 12 11.5M5.5 5C7 4.5 10 4.5 12 5.5"
                      stroke="#2A353D"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-[#181D27] mb-1">Spotify · Sat Yoga</h3>
              <p className="text-sm text-[#535862] mb-3">Tune Into Our Favorite Meditation Music</p>
              <Link
                href="https://open.spotify.com/user/satyoga"
                target="_blank"
                onClick={onClose}
                className="text-sm font-semibold text-black"
              >
                Open
              </Link>
            </div>
          )}

          {/* Settings and Logout */}
          <div className="space-y-1 pb-4">
            <Link
              href="/dashboard/user/settings"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive('/dashboard/user/settings')
                  ? 'bg-[#7D1A13] text-white'
                  : 'bg-white text-[#374151] hover:bg-gray-50'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M10 2.5V5M10 15V17.5M17.5 10H15M5 10H2.5M15.3 4.7L13.54 6.46M6.46 13.54L4.7 15.3M15.3 15.3L13.54 13.54M6.46 6.46L4.7 4.7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-sm font-medium">Settings</span>
            </Link>
            <Link
              href="/"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white text-[#374151] hover:bg-gray-50 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3 3h14M3 7h14M3 11h14M3 15h14M3 19h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-sm font-medium">Go to website</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white text-[#374151] hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M13 14L17 10L13 6M17 10H7M7 2.5H5.5C4.11929 2.5 3 3.61929 3 5V15C3 16.3807 4.11929 17.5 5.5 17.5H7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>

          {/* User Profile at bottom */}
          <div className="border border-[#F3F4F6] rounded-lg p-3 flex items-center gap-3 bg-white">
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-gray-200 border-2 border-white overflow-hidden flex items-center justify-center">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
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
              <p className="text-sm font-semibold text-[#1F2937] truncate">
                {session?.user?.name || 'Loading...'}
              </p>
              <p className="text-xs text-[#737373] truncate">{session?.user?.email || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebarDrawer;
