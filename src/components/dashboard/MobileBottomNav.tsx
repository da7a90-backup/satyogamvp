'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface MobileBottomNavProps {
  onMoreClick: () => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onMoreClick }) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard/user') {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '/dash.png',
      href: '/dashboard/user',
      hasNotification: false,
    },
    {
      id: 'library',
      label: 'Library',
      icon: '/building-08 (1).png',
      href: '/dashboard/user/teachings',
      hasNotification: false,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: '/calendar (1).png',
      href: '/dashboard/user/calendar',
      hasNotification: false,
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: '/heart (1).png',
      href: '/dashboard/user/favourites',
      hasNotification: false,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E9EAEB] z-50 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2 h-[72px]">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 min-w-[60px] px-2 py-1.5 rounded-lg transition-colors ${
              isActive(item.href)
                ? 'text-[#7D1A13]'
                : 'text-[#737373] hover:text-[#7D1A13]'
            }`}
          >
            <div className="relative">
              <div className={`w-6 h-6 relative ${
                isActive(item.href) ? 'opacity-100' : 'opacity-60'
              }`}>
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              {item.hasNotification && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#F42862] rounded-full" />
              )}
              {item.id === 'dashboard' && isActive(item.href) && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#7D1A13] rounded-full" />
              )}
            </div>
            <span className={`text-xs font-medium ${
              isActive(item.href) ? 'text-[#181D27]' : 'text-[#737373]'
            }`}>
              {item.label}
            </span>
          </Link>
        ))}

        {/* More Button */}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center gap-1 min-w-[60px] px-2 py-1.5 rounded-lg transition-colors text-[#737373] hover:text-[#7D1A13]"
        >
          <div className="w-6 h-6 flex items-center justify-center opacity-60">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="6" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="18" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className="text-xs font-medium text-[#737373]">
            More
          </span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
