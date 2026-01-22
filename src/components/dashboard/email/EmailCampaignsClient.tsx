"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PlusIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  BoltIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
}

const NAV_TABS = [
  { name: 'Campaigns', href: '/dashboard/admin/email', icon: EnvelopeIcon },
  { name: 'Templates', href: '/dashboard/admin/email/templates', icon: DocumentTextIcon },
  { name: 'Automations', href: '/dashboard/admin/email/automations', icon: BoltIcon },
  { name: 'Subscribers', href: '/dashboard/admin/email/subscribers', icon: UserGroupIcon },
  { name: 'Analytics', href: '/dashboard/admin/email/analytics', icon: ChartBarIcon },
  { name: 'Events', href: '/dashboard/admin/email/events', icon: SparklesIcon },
];

export default function EmailCampaignsClient() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const url = filter === 'all'
        ? `${FASTAPI_URL}/api/email/campaigns`
        : `${FASTAPI_URL}/api/email/campaigns?status=${filter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this campaign to all subscribers?')) {
      return;
    }

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/email/campaigns/${campaignId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        alert('Campaign sent successfully!');
        fetchCampaigns();
      } else {
        const error = await response.json();
        alert(`Failed to send campaign: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-[#1F2937]',
      scheduled: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${colors[status as keyof typeof colors] || colors.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#737373]">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Email Marketing</h1>
        <p className="text-[#737373] mt-1">Manage campaigns, templates, and automations</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-[#F3F4F6]">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {NAV_TABS.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition ${
                  isActive
                    ? 'border-[#7D1A13] text-[#7D1A13]'
                    : 'border-transparent text-[#737373] hover:text-[#374151] hover:border-[#E5E7EB]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Campaigns Section Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Email Campaigns</h2>
          <p className="text-[#737373] mt-1 text-sm">Create and manage email campaigns</p>
        </div>
        <Link
          href="/dashboard/admin/email/campaigns/create"
          className="flex items-center px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Campaign
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'draft', 'scheduled', 'sent'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === status
                ? 'bg-[#7D1A13] text-white'
                : 'bg-gray-100 text-[#374151] hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-[#737373]">No campaigns found</p>
          <Link
            href="/dashboard/admin/email/campaigns/create"
            className="inline-block mt-4 text-[#7D1A13] hover:text-[#6B1710]"
          >
            Create your first campaign
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-[#1F2937]">{campaign.name}</div>
                      <div className="text-sm text-[#737373]">{campaign.subject}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#1F2937]">
                    {campaign.status === 'sent' ? (
                      <div>
                        <div>Sent: {campaign.total_sent}</div>
                        <div className="text-[#737373]">
                          Opens: {campaign.total_opened} | Clicks: {campaign.total_clicked}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#737373]">
                    {campaign.sent_at
                      ? new Date(campaign.sent_at).toLocaleDateString()
                      : campaign.scheduled_at
                      ? `Scheduled: ${new Date(campaign.scheduled_at).toLocaleDateString()}`
                      : new Date(campaign.created_at).toLocaleDateString()
                    }
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/admin/email/campaigns/${campaign.id}`}
                        className="text-[#7D1A13] hover:text-blue-900"
                      >
                        View
                      </Link>
                      {campaign.status !== 'sent' && (
                        <>
                          <Link
                            href={`/dashboard/admin/email/campaigns/${campaign.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => sendCampaign(campaign.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Send Now
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
