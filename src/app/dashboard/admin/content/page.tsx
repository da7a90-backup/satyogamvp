import Link from 'next/link';
import { Card } from '@/components/ui/card';
import {
  NewspaperIcon,
  UserGroupIcon,
  HomeIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const contentPages = [
  {
    name: 'Homepage',
    href: '/dashboard/admin/content/homepage',
    description: 'Edit hero, featured sections, and homepage content',
    icon: HomeIcon,
  },
  {
    name: 'About Shunyamurti',
    href: '/dashboard/admin/content/about-shunyamurti',
    description: 'Edit Shunyamurti biography and information',
    icon: UserGroupIcon,
  },
  {
    name: 'About Ashram',
    href: '/dashboard/admin/content/about-ashram',
    description: 'Edit ashram details and facilities',
    icon: HomeIcon,
  },
  {
    name: 'About Satyoga',
    href: '/dashboard/admin/content/about-satyoga',
    description: 'Edit Satyoga philosophy and teachings',
    icon: BookOpenIcon,
  },
  {
    name: 'Teachings Page',
    href: '/dashboard/admin/content/teachings',
    description: 'Edit teachings landing page content',
    icon: BookOpenIcon,
  },
  {
    name: 'Courses Page',
    href: '/dashboard/admin/content/courses',
    description: 'Edit courses landing page content',
    icon: BookOpenIcon,
  },
  {
    name: 'Donate Page',
    href: '/dashboard/admin/content/donate',
    description: 'Edit donation page and projects',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Contact Page',
    href: '/dashboard/admin/content/contact',
    description: 'Edit contact information and form',
    icon: EnvelopeIcon,
  },
  {
    name: 'Membership',
    href: '/dashboard/admin/content/membership',
    description: 'Edit membership tiers and pricing',
    icon: UserGroupIcon,
  },
  {
    name: 'FAQs',
    href: '/dashboard/admin/content/faqs',
    description: 'Edit frequently asked questions',
    icon: QuestionMarkCircleIcon,
  },
];

export const dynamic = 'force-dynamic';

export default function ContentManagementPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Management</h1>
        <p className="text-gray-600">
          Manage static content across all pages of the website
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentPages.map((page) => (
          <Link key={page.href} href={page.href}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <page.icon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-2">{page.name}</h3>
                  <p className="text-sm text-gray-600">{page.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold mb-2 text-blue-900">How to use</h3>
        <ul className="list-disc list-inside space-y-1 text-blue-800">
          <li>Click on any page card to edit its content</li>
          <li>Edit text fields directly in the form</li>
          <li>Upload images using the "Upload" button next to image fields</li>
          <li>Click "Save Section" to save changes for each section</li>
          <li>Images are uploaded to Cloudflare and automatically optimized</li>
        </ul>
      </div>
    </div>
  );
}
