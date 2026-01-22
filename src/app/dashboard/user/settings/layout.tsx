'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';

const settingsTabs = [
  {
    name: 'Billing',
    href: '/dashboard/user/settings/billing',
  },
  {
    name: 'Profile',
    href: '/dashboard/user/settings/profile',
  },
  {
    name: 'Newsletter preferences',
    href: '/dashboard/user/settings/notifications',
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FAF8F1]">
      <div className="w-full max-w-[1184px] mx-auto px-4 sm:px-8 py-8">
        {/* Header with title and search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="font-optima text-[30px] font-semibold leading-[38px] text-[#181D27]">
            Settings
          </h1>
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A4A7AE]" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E9EAEB] rounded-lg font-avenir text-sm text-[#181D27] placeholder:text-[#A4A7AE] focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent transition-all shadow-[0px_1px_2px_rgba(10,13,18,0.05)]"
            />
          </div>
        </div>

        {/* Horizontal Tabs Navigation */}
        <div className="border-b border-[#E9EAEB] mb-8">
          <nav className="flex gap-8 overflow-x-auto">
            {settingsTabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`relative pb-4 font-inter text-sm font-semibold leading-5 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-[#7D1A13]'
                      : 'text-[#535862] hover:text-[#181D27]'
                  }`}
                >
                  {tab.name}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7D1A13]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
