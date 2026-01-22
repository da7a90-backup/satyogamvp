"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
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
  XMarkIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CalendarIcon,
  BookmarkIcon,
  UserGroupIcon,
  BookmarkSquareIcon,
  ChatBubbleLeftRightIcon,
  InboxArrowDownIcon,
  PaperAirplaneIcon,
  TicketIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Toggle submenu expanded state
  const toggleExpand = (item: string) => {
    setExpandedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // Check if a menu item is active
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  // Main navigation items
  const mainNavItems = [
    {
      name: "Dashboard",
      href: "/dashboard/admin",
      icon: HomeIcon,
    },
    {
      name: "Users",
      href: "/dashboard/admin/users",
      icon: UsersIcon,
    },
    {
      name: 'Activity Log',
      href: '/dashboard/admin/activity-log',
      icon: ClockIcon,
    },
    {
      name: 'Content',
      href: '/dashboard/admin/content',
      icon: NewspaperIcon,
      subItems: [
        { name: 'Homepage', href: '/dashboard/admin/content/homepage' },
        { name: 'About / Shunyamurti', href: '/dashboard/admin/content/about-shunyamurti' },
        { name: 'About / Ashram', href: '/dashboard/admin/content/about-ashram' },
        { name: 'About / Satyoga', href: '/dashboard/admin/content/about-satyoga' },
        { name: 'Teachings Page', href: '/dashboard/admin/content/teachings' },
        { name: 'Courses Page', href: '/dashboard/admin/content/courses' },
        { name: 'Donate Page', href: '/dashboard/admin/content/donate' },
        { name: 'Contact Page', href: '/dashboard/admin/content/contact' },
        { name: 'Membership', href: '/dashboard/admin/content/membership' },
        { name: 'FAQs', href: '/dashboard/admin/content/faqs' },
        { name: 'Hidden Tags', href: '/dashboard/admin/content/hidden-tags' },
      ]
    },
    {
      name: 'Forms',
      href: '/dashboard/admin/forms',
      icon: ClipboardDocumentListIcon,
      subItems: [
        { name: 'Retreat Applications', href: '/dashboard/admin/forms/retreat-applications' },
        { name: 'Contact', href: '/dashboard/admin/forms/contact' },
        { name: 'Support Tickets', href: '/dashboard/admin/forms/support-tickets' },
      ]
    },
    {
      name: 'Events',
      href: '/dashboard/admin/events',
      icon: CalendarIcon,
      subItems: [
        { name: 'Calendar', href: '/dashboard/admin/events/calendar' },
        { name: 'Event Types', href: '/dashboard/admin/events/event-types' },
        { name: 'Registrations', href: '/dashboard/admin/events/registrations' },
      ]
    },
    {
      name: 'Library',
      href: '/dashboard/admin/library/teachings',
      icon: BookmarkIcon,
    },
    {
      name: 'Book Groups',
      href: '/dashboard/admin/book-groups',
      icon: BookmarkSquareIcon,
    },
    {
      name: 'Shunyamurti Recommends',
      href: '/dashboard/admin/shunya-recommends',
      icon: BookOpenIcon,
    },
    {
      name: 'Courses',
      href: '/dashboard/admin/courses',
      icon: BookOpenIcon,
      subItems: [
        { name: "All Courses", href: "/dashboard/admin/course" },
        { name: "Categories", href: "/dashboard/admin/course/categories" },
        { name: "Lessons", href: "/dashboard/admin/course/lessons" },
      ],
    },
    {
      name: "Retreats",
      href: "/dashboard/admin/retreats",
      icon: HomeIcon,
      subItems: [
        { name: "Upcoming Retreats", href: "/dashboard/admin/retreats" },
        { name: "Past Retreats", href: "/dashboard/admin/retreats/past" },
        {
          name: "Applications",
          href: "/dashboard/admin/retreats/applications",
        },
      ],
    },
    {
      name: "Blog",
      href: "/dashboard/admin/blog",
      icon: DocumentTextIcon,
      subItems: [
        { name: "All Posts", href: "/dashboard/admin/blog" },
        { name: "Categories", href: "/dashboard/admin/blog/categories" },
        { name: "Comments", href: "/dashboard/admin/blog/comments" },
      ],
    },
    {
      name: "Products",
      href: "/dashboard/admin/products",
      icon: ShoppingBagIcon,
    },
    {
      name: "Sales",
      href: "/dashboard/admin/sales",
      icon: CurrencyDollarIcon,
      subItems: [
        { name: "Orders", href: "/dashboard/admin/sales" },
        { name: "Donations", href: "/dashboard/admin/sales/donations" },
      ],
    },
    {
      name: "Analytics",
      href: "/dashboard/admin/analytics",
      icon: ChartBarIcon,
      subItems: [
        { name: "Overview", href: "/dashboard/admin/analytics" },
        { name: "Custom Reports", href: "/dashboard/admin/analytics/custom" },
      ],
    },
    {
      name: "Email",
      href: "/dashboard/admin/email",
      icon: EnvelopeIcon,
      subItems: [
        { name: "Campaigns", href: "/dashboard/admin/email" },
        { name: "Templates", href: "/dashboard/admin/email/templates" },
        { name: "Subscribers", href: "/dashboard/admin/email/subscribers" },
      ],
    },
  ];

  // Support and settings
  const bottomNavItems: any[] = [];

  // Render an individual navigation item
  const renderNavItem = (item: any, key: number) => {
    const isItemActive = isActive(item.href);
    const isExpanded = expandedItems.includes(item.name);
    const hasSubItems = item.subItems && item.subItems.length > 0;

    return (
      <div key={key} className="mb-0">
        <div
          className={`flex items-center justify-between rounded px-3 py-2 cursor-pointer transition-colors ${
            isItemActive
              ? "bg-[#7D1A13] text-white"
              : "bg-white text-[#374151] hover:bg-gray-50"
          }`}
          onClick={() => (hasSubItems ? toggleExpand(item.name) : null)}
        >
          <Link
            href={item.href}
            className="flex items-center flex-grow"
            onClick={(e) => hasSubItems && e.preventDefault()}
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span className="text-sm font-medium capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>{item.name}</span>
          </Link>
          {hasSubItems && (
            <button className="p-1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform ${isExpanded ? '' : 'rotate-180'}`}>
                <path d="M4 10L8 6L12 10" stroke={isItemActive ? "#FFFFFF" : "#A4A7AE"} strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Sub items */}
        {hasSubItems && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.subItems.map((subItem: any, idx: number) => (
              <Link
                key={idx}
                href={subItem.href}
                className={`block px-6 py-2 text-sm rounded font-medium capitalize transition-colors ${
                  pathname === subItem.href
                    ? "bg-[#7D1A13] text-white"
                    : "bg-white text-[#374151] hover:bg-gray-50"
                }`}
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
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
    <div className="w-64 h-screen lg:h-[125vh] bg-white flex flex-col overflow-y-auto" style={{ gap: '23px', padding: '20px 16px' }}>
      {/* Logo section */}
      <div className="flex items-center justify-center" style={{ height: '53px' }}>
        <Link href="/dashboard/admin">
          <Image src="/Logo-dash.png" alt="Sat Yoga" width={180} height={45} />
        </Link>
      </div>

      {/* Main navigation */}
      <div className="flex-grow space-y-0">
        {/* Main items */}
        {mainNavItems.map((item, idx) => renderNavItem(item, idx))}
      </div>

      {/* Help & Settings */}
      <div className="space-y-0">
        {bottomNavItems.map((item, idx) => renderNavItem(item, idx))}
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

      {/* Admin info */}
      <div className="border border-[#F3F4F6] rounded-lg p-2 flex items-center gap-3">
        <div className="relative w-10 h-10 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-gray-200 border-2 border-white overflow-hidden flex items-center justify-center">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "Admin"}
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
                {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
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

export default AdminSidebar;
