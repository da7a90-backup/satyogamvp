'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  UsersIcon, 
  BookOpenIcon, 
  HomeIcon, 
  DocumentTextIcon, 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  EnvelopeIcon, 
  ChartBarIcon,
  Cog6ToothIcon, 
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = () => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
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

  // Main navigation items
  const mainNavItems = [
    {
      name: 'Dashboard',
      href: '/dashboard/admin',
      icon: HomeIcon,
    },
    {
      name: 'Users',
      href: '/dashboard/admin/users',
      icon: UsersIcon,
      subItems: [
        { name: 'All Users', href: '/dashboard/admin/users' },
        { name: 'Memberships', href: '/dashboard/admin/users/memberships' },
        { name: 'Permissions', href: '/dashboard/admin/users/permissions' },
      ]
    },
    {
      name: 'Courses',
      href: '/dashboard/admin/courses',
      icon: BookOpenIcon,
      subItems: [
        { name: 'All Courses', href: '/dashboard/admin/courses' },
        { name: 'Categories', href: '/dashboard/admin/courses/categories' },
        { name: 'Lessons', href: '/dashboard/admin/courses/lessons' },
      ]
    },
    {
      name: 'Retreats',
      href: '/dashboard/admin/retreats',
      icon: HomeIcon,
      subItems: [
        { name: 'Upcoming Retreats', href: '/dashboard/admin/retreats' },
        { name: 'Past Retreats', href: '/dashboard/admin/retreats/past' },
        { name: 'Applications', href: '/dashboard/admin/retreats/applications' },
      ]
    },
    {
      name: 'Blog',
      href: '/dashboard/admin/blog',
      icon: DocumentTextIcon,
      subItems: [
        { name: 'All Posts', href: '/dashboard/admin/blog' },
        { name: 'Categories', href: '/dashboard/admin/blog/categories' },
        { name: 'Comments', href: '/dashboard/admin/blog/comments' },
      ]
    },
    {
      name: 'Products',
      href: '/dashboard/admin/products',
      icon: ShoppingBagIcon,
      subItems: [
        { name: 'All Products', href: '/dashboard/admin/products' },
        { name: 'Categories', href: '/dashboard/admin/products/categories' },
        { name: 'Inventory', href: '/dashboard/admin/products/inventory' },
      ]
    },
    {
      name: 'Sales',
      href: '/dashboard/admin/sales',
      icon: CurrencyDollarIcon,
      subItems: [
        { name: 'Orders', href: '/dashboard/admin/sales' },
        { name: 'Transactions', href: '/dashboard/admin/sales/transactions' },
        { name: 'Discounts', href: '/dashboard/admin/sales/discounts' },
      ]
    },
    {
      name: 'Email',
      href: '/dashboard/admin/email',
      icon: EnvelopeIcon,
      subItems: [
        { name: 'Campaigns', href: '/dashboard/admin/email' },
        { name: 'Templates', href: '/dashboard/admin/email/templates' },
        { name: 'Subscribers', href: '/dashboard/admin/email/subscribers' },
      ]
    },
    {
      name: 'Analytics',
      href: '/dashboard/admin/analytics',
      icon: ChartBarIcon,
      subItems: [
        { name: 'Overview', href: '/dashboard/admin/analytics' },
        { name: 'User Engagement', href: '/dashboard/admin/analytics/engagement' },
        { name: 'Revenue', href: '/dashboard/admin/analytics/revenue' },
      ]
    },
  ];

  // Support and settings
  const bottomNavItems = [
    {
      name: 'Help Center',
      href: '/dashboard/admin/help',
      icon: QuestionMarkCircleIcon,
    },
    {
      name: 'Settings',
      href: '/dashboard/admin/settings',
      icon: Cog6ToothIcon,
    },
  ];

  // Render an individual navigation item
  const renderNavItem = (item: any, key: number) => {
    const isItemActive = isActive(item.href);
    const isExpanded = expandedItems.includes(item.name);
    const hasSubItems = item.subItems && item.subItems.length > 0;

    return (
      <div key={key} className="mb-1">
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
          <div className="ml-5 pl-4 border-l border-gray-200 mt-1 space-y-1">
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
        {/* Main items */}
        {mainNavItems.map((item, idx) => renderNavItem(item, idx))}
        
        {/* Bottom items (Support and Settings) */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          {bottomNavItems.map((item, idx) => renderNavItem(item, idx))}
        </div>
      </div>

      {/* Admin info */}
      <div className="p-4 border-t border-gray-200 flex items-center">
        <div className="w-8 h-8 rounded-full bg-gray-300 mr-3 overflow-hidden">
          <img 
            src="/admin-avatar.jpg" 
            alt="Admin" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image doesn't load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }} 
          />
        </div>
        <div className="flex-grow">
          <p className="text-sm font-medium truncate">Admin User</p>
          <p className="text-xs text-gray-500 truncate">admin@example.com</p>
        </div>
        <button className="ml-2 text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
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
          <h3 className="text-sm font-medium mb-1">Admin Pro Upgrade</h3>
          <p className="text-xs text-gray-500 mb-3">Get advanced analytics and batch operations</p>
          <button className="w-full bg-purple-600 text-white py-2 rounded-md text-sm font-medium hover:bg-purple-700">
            Upgrade now
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;