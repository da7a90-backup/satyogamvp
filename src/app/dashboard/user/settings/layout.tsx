'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const settingsTabs = [
  {
    name: 'Profile',
    href: '/dashboard/user/settings/profile',
    icon: '👤',
  },
  {
    name: 'Billing',
    href: '/dashboard/user/settings/billing',
    icon: '💳',
  },
  {
    name: 'Notifications',
    href: '/dashboard/user/settings/notifications',
    icon: '🔔',
  },
  {
    name: 'Payment Methods',
    href: '/dashboard/user/settings/payment-methods',
    icon: '💰',
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {settingsTabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className={cn(
                      'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-700 hover:bg-white hover:text-gray-900'
                    )}
                  >
                    <span className="mr-3 text-xl">{tab.icon}</span>
                    {tab.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
