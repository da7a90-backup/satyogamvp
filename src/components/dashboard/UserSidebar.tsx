'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  BookOpenIcon, 
  ShoppingBagIcon, 
  HeartIcon,
  CalendarIcon,
  BookmarkIcon,
  DocumentTextIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const UserSidebar = () => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Library']); // Default expanded
  const [showUpgradeModal, setShowUpgradeModal] = useState(true);

  // Toggle submenu expanded state
  const toggleExpand = (item: string) => {
    setExpandedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item) 
        : [...prev, item]
    );
  };

  // Check if a menu item is active
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  // Navigation sections
  const dashboardItem = {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  };

  const quickAccessItems = [
    {
      name: 'Online retreats',
      href: '/dashboard/retreats',
      icon: HomeIcon,
    },
    {
      name: 'Courses',
      href: '/dashboard/courses',
      icon: BookOpenIcon,
    },
  ];

  const userSpaceItems = [
    {
      name: 'My purchases',
      href: '/dashboard/purchases',
      icon: ShoppingBagIcon,
    },
    {
      name: 'My favourites',
      href: '/dashboard/favourites',
      icon: HeartIcon,
    },
    {
      name: 'Calendar',
      href: '/dashboard/calendar',
      icon: CalendarIcon,
    },
  ];

  const membershipItems = [
    {
      name: 'Library',
      href: '/dashboard/library',
      icon: BookmarkIcon,
      subItems: [
        { name: 'Teachings', href: '/dashboard/library/teachings' },
        { name: 'Guided meditations', href: '/dashboard/library/meditations' },
        { name: "Q&A's", href: '/dashboard/library/qanda' },
        { name: 'Essays', href: '/dashboard/library/essays' },
      ]
    },
  ];

  const storeItems = [
    {
      name: 'The Dharma Bandha',
      href: '/dashboard/store',
      icon: ShoppingBagIcon,
      subItems: [
        { name: 'Store', href: '/dashboard/store/items' },
        { name: 'Saved for later', href: '/dashboard/store/saved' },
      ]
    },
  ];

  const resourceItems = [
    {
      name: 'Blog',
      href: '/dashboard/blog',
      icon: DocumentTextIcon,
    },
    {
      name: 'Telegram group',
      href: '/dashboard/telegram',
      icon: UserGroupIcon,
    },
  ];

  // Render a navigation section with title
  const renderNavSection = (title: string, items: any[], marginTop: boolean = true) => (
    <div className={`${marginTop ? 'mt-6' : ''}`}>
      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
      <div className="mt-2 space-y-1">
        {items.map((item, idx) => renderNavItem(item, idx))}
      </div>
    </div>
  );

  // Render an individual navigation item
  const renderNavItem = (item: any, key: number) => {
    const isItemActive = isActive(item.href);
    const isExpanded = expandedItems.includes(item.name);
    const hasSubItems = item.subItems && item.subItems.length > 0;

    return (
      <div key={key}>
        <div 
          className={`flex items-center justify-between rounded-md px-3 py-2 cursor-pointer ${
            isItemActive ? 'bg-gray-700 text-white' : 'text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => hasSubItems ? toggleExpand(item.name) : null}
        >
          <Link 
            href={item.href}
            className="flex items-center flex-grow"
            onClick={(e) => hasSubItems && e.preventDefault()}
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span className="text-sm font-medium">{item.name}</span>
          </Link>
          {hasSubItems && (
            <button className="p-1">
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Sub items */}
        {hasSubItems && isExpanded && (
          <div className="ml-12 mt-1 space-y-1">
            {item.subItems.map((subItem: any, idx: number) => (
              <Link 
                key={idx}
                href={subItem.href}
                className={`block px-3 py-2 text-sm rounded-md ${
                  pathname === subItem.href 
                    ? 'text-purple-700 font-medium' 
                    : 'text-gray-600 hover:text-purple-700'
                }`}
              >
                {subItem.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Logo section */}
      <div className="p-5">
        <Link href="/dashboard" className="text-2xl font-serif italic">Logo</Link>
      </div>

      {/* Main navigation */}
      <div className="flex-grow overflow-y-auto px-4 py-2">
        {/* Dashboard */}
        <div className="mb-2">
          {renderNavItem(dashboardItem, 0)}
        </div>

        {/* Quick Access */}
        {renderNavSection('Quick access', quickAccessItems, false)}

        {/* Your Space */}
        {renderNavSection('Your space', userSpaceItems)}

        {/* Free Membership */}
        {renderNavSection('Free Membership', membershipItems)}

        {/* Store */}
        {renderNavSection('Store', storeItems)}

        {/* Resources */}
        {renderNavSection('Resources', resourceItems)}

        {/* Settings */}
        <div className="mt-6">
          <Link
            href="/dashboard/settings"
            className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-md"
          >
            <Cog6ToothIcon className="h-5 w-5 mr-3" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>

        {/* Help center */}
        <div className="mt-1">
          <button className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-200 rounded-md w-full text-left">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-3" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <span className="text-sm font-medium">Help us improve</span>
          </button>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-t border-gray-200 flex items-center">
        <div className="w-8 h-8 rounded-full bg-gray-300 mr-3 overflow-hidden">
          <img 
            src="/user-avatar.jpg" 
            alt="User" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image doesn't load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }} 
          />
        </div>
        <div className="flex-grow">
          <p className="text-sm font-medium truncate">Alessandra Franc...</p>
          <p className="text-xs text-gray-500 truncate">alessandra@thefranc...</p>
        </div>
        <button className="ml-2 text-gray-400 hover:text-gray-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Upgrade modal */}
      {showUpgradeModal && (
        <div className="mx-4 mb-4 p-4 bg-white rounded-lg border border-gray-200 relative">
          <button 
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowUpgradeModal(false)}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
          <h3 className="text-sm font-medium mb-1">Upgrade to Gyani</h3>
          <p className="text-xs text-gray-500 mb-3">10-Day Free Trial for Gyani</p>
          <button className="w-full bg-purple-600 text-white py-2 rounded-md text-sm font-medium hover:bg-purple-700">
            Upgrade now
          </button>
        </div>
      )}
    </div>
  );
};

export default UserSidebar;