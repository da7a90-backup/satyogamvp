"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeftIcon,
  PaperAirplaneIcon,
  CalendarIcon,
  UserGroupIcon,
  EnvelopeOpenIcon,
  CursorArrowRaysIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  from_name: string;
  from_email: string;
  status: string;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  template_id: string;
}

interface CampaignDetailClientProps {
  campaignId: string;
}

export default function CampaignDetailClient({ campaignId }: CampaignDetailClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/email/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCampaign(data);
      } else {
        alert('Failed to load campaign');
        router.push('/dashboard/admin/email');
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      alert('Failed to load campaign');
      router.push('/dashboard/admin/email');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/email/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (response.ok) {
        alert('Campaign deleted successfully');
        router.push('/dashboard/admin/email');
      } else {
        alert('Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign');
    }
  };

  const handleResend = async () => {
    if (!confirm('Resend this campaign to all subscribers?')) {
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
        fetchCampaign();
      } else {
        const error = await response.json();
        alert(`Failed to send campaign: ${error.detail}`);
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#737373]">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#737373]">Campaign not found</div>
      </div>
    );
  }

  const openRate = campaign.total_sent > 0
    ? ((campaign.total_opened / campaign.total_sent) * 100).toFixed(1)
    : '0';

  const clickRate = campaign.total_sent > 0
    ? ((campaign.total_clicked / campaign.total_sent) * 100).toFixed(1)
    : '0';

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-[#1F2937]',
      scheduled: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${colors[status as keyof typeof colors] || colors.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/admin/email')}
          className="flex items-center text-[#737373] hover:text-[#1F2937] mb-4"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          Back to Campaigns
        </button>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-[#1F2937]">{campaign.name}</h1>
              {getStatusBadge(campaign.status)}
            </div>
            <p className="text-[#737373]">{campaign.subject}</p>
          </div>

          <div className="flex gap-2">
            {campaign.status !== 'sent' && (
              <>
                <button
                  onClick={() => router.push(`/dashboard/admin/email/campaigns/${campaignId}/edit`)}
                  className="flex items-center px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition"
                >
                  <PencilIcon className="w-5 h-5 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleResend}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                  Send Now
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <TrashIcon className="w-5 h-5 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {campaign.status === 'sent' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-[#7D1A13]" />
              </div>
              <span className="text-sm font-medium text-[#737373]">Total Sent</span>
            </div>
            <p className="text-3xl font-bold text-[#1F2937]">{campaign.total_sent.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <EnvelopeOpenIcon className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-[#737373]">Opened</span>
            </div>
            <p className="text-3xl font-bold text-[#1F2937]">{campaign.total_opened.toLocaleString()}</p>
            <p className="text-sm text-[#737373] mt-1">{openRate}% open rate</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CursorArrowRaysIcon className="w-6 h-6 text-[#7D1A13]" />
              </div>
              <span className="text-sm font-medium text-[#737373]">Clicked</span>
            </div>
            <p className="text-3xl font-bold text-[#1F2937]">{campaign.total_clicked.toLocaleString()}</p>
            <p className="text-sm text-[#737373] mt-1">{clickRate}% click rate</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ExclamationCircleIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-[#737373]">Bounced</span>
            </div>
            <p className="text-3xl font-bold text-[#1F2937]">0</p>
            <p className="text-sm text-[#737373] mt-1">0% bounce rate</p>
          </div>
        </div>
      )}

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Campaign Information</h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#737373]">From Name:</span>
              <span className="font-medium text-[#1F2937]">{campaign.from_name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#737373]">From Email:</span>
              <span className="font-medium text-[#1F2937]">{campaign.from_email}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#737373]">Created:</span>
              <span className="font-medium text-[#1F2937]">
                {new Date(campaign.created_at).toLocaleString()}
              </span>
            </div>

            {campaign.scheduled_at && (
              <div className="flex justify-between">
                <span className="text-[#737373]">Scheduled For:</span>
                <span className="font-medium text-[#1F2937]">
                  {new Date(campaign.scheduled_at).toLocaleString()}
                </span>
              </div>
            )}

            {campaign.sent_at && (
              <div className="flex justify-between">
                <span className="text-[#737373]">Sent At:</span>
                <span className="font-medium text-[#1F2937]">
                  {new Date(campaign.sent_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Performance Insights</h2>

          {campaign.status === 'sent' ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[#737373]">Open Rate</span>
                  <span className="text-sm font-medium text-[#1F2937]">{openRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min(parseFloat(openRate), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[#737373] mt-1">Industry average: 21.5%</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[#737373]">Click Rate</span>
                  <span className="text-sm font-medium text-[#1F2937]">{clickRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#7D1A13] h-2 rounded-full"
                    style={{ width: `${Math.min(parseFloat(clickRate), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[#737373] mt-1">Industry average: 2.3%</p>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  {parseFloat(openRate) > 21.5 && parseFloat(clickRate) > 2.3 ? (
                    <>🎉 Excellent! This campaign is performing above industry averages.</>
                  ) : parseFloat(openRate) > 21.5 || parseFloat(clickRate) > 2.3 ? (
                    <>👍 Good performance! Some metrics are above average.</>
                  ) : (
                    <>💡 Room for improvement. Consider A/B testing subject lines and content.</>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[#737373]">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Performance metrics will be available after the campaign is sent</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {campaign.status === 'sent' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Campaign Actions</h2>

          <div className="flex gap-3">
            <button
              onClick={handleResend}
              className="flex items-center px-4 py-2 bg-gray-100 text-[#374151] rounded-lg hover:bg-gray-200 transition"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Resend to Unopened
            </button>

            <button
              onClick={() => {
                // TODO: Implement export functionality
                alert('Export feature coming soon!');
              }}
              className="flex items-center px-4 py-2 bg-gray-100 text-[#374151] rounded-lg hover:bg-gray-200 transition"
            >
              Download Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
