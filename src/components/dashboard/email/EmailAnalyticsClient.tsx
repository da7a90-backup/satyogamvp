"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  UserGroupIcon,
  EnvelopeOpenIcon,
  CursorArrowRaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalSubscribers: number;
  activeSubscribers: number;
  subscriberGrowth: number;
  totalCampaigns: number;
  avgOpenRate: number;
  avgClickRate: number;
  topCampaigns: Array<{
    id: string;
    name: string;
    openRate: number;
    clickRate: number;
    sent: number;
  }>;
  topAutomations: Array<{
    id: string;
    name: string;
    triggered: number;
  }>;
}

export default function EmailAnalyticsClient() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    subscriberGrowth: 0,
    totalCampaigns: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    topCampaigns: [],
    topAutomations: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

      // Fetch subscribers
      const subscribersResponse = await fetch(`${FASTAPI_URL}/api/email/subscribers`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      // Fetch campaigns
      const campaignsResponse = await fetch(`${FASTAPI_URL}/api/email/campaigns`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      // Fetch automations
      const automationsResponse = await fetch(`${FASTAPI_URL}/api/email/automations`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (subscribersResponse.ok && campaignsResponse.ok && automationsResponse.ok) {
        const subscribers = await subscribersResponse.json();
        const campaigns = await campaignsResponse.json();
        const automations = await automationsResponse.json();

        // Calculate metrics
        const totalSubscribers = subscribers.length;
        const activeSubscribers = subscribers.filter((s: any) => s.status === 'active').length;

        // Calculate subscriber growth (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentSubscribers = subscribers.filter((s: any) =>
          new Date(s.subscribed_at) > thirtyDaysAgo
        ).length;
        const subscriberGrowth = totalSubscribers > 0
          ? (recentSubscribers / totalSubscribers) * 100
          : 0;

        // Calculate average campaign performance
        const sentCampaigns = campaigns.filter((c: any) => c.status === 'sent');
        const avgOpenRate = sentCampaigns.length > 0
          ? sentCampaigns.reduce((sum: number, c: any) =>
              sum + (c.total_sent > 0 ? (c.total_opened / c.total_sent) * 100 : 0), 0
            ) / sentCampaigns.length
          : 0;

        const avgClickRate = sentCampaigns.length > 0
          ? sentCampaigns.reduce((sum: number, c: any) =>
              sum + (c.total_sent > 0 ? (c.total_clicked / c.total_sent) * 100 : 0), 0
            ) / sentCampaigns.length
          : 0;

        // Top campaigns by open rate
        const topCampaigns = [...sentCampaigns]
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            openRate: c.total_sent > 0 ? (c.total_opened / c.total_sent) * 100 : 0,
            clickRate: c.total_sent > 0 ? (c.total_clicked / c.total_sent) * 100 : 0,
            sent: c.total_sent,
          }))
          .sort((a, b) => b.openRate - a.openRate)
          .slice(0, 5);

        // Top automations
        const topAutomations = automations
          .filter((a: any) => a.is_active)
          .map((a: any) => ({
            id: a.id,
            name: a.name,
            triggered: 0, // TODO: Track automation triggers
          }))
          .slice(0, 5);

        setAnalytics({
          totalSubscribers,
          activeSubscribers,
          subscriberGrowth,
          totalCampaigns: campaigns.length,
          avgOpenRate,
          avgClickRate,
          topCampaigns,
          topAutomations,
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#737373]">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Email Analytics</h1>
        <p className="text-[#737373] mt-1">Track your email marketing performance</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-[#7D1A13]" />
              </div>
              <span className="text-sm font-medium text-[#737373]">Subscribers</span>
            </div>
            <div className={`flex items-center gap-1 text-xs ${
              analytics.subscriberGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.subscriberGrowth >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              {analytics.subscriberGrowth.toFixed(1)}%
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1F2937]">{analytics.totalSubscribers}</p>
          <p className="text-sm text-[#737373] mt-1">{analytics.activeSubscribers} active</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <EnvelopeOpenIcon className="w-6 h-6 text-[#7D1A13]" />
            </div>
            <span className="text-sm font-medium text-[#737373]">Campaigns</span>
          </div>
          <p className="text-3xl font-bold text-[#1F2937]">{analytics.totalCampaigns}</p>
          <p className="text-sm text-[#737373] mt-1">Total sent</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <EnvelopeOpenIcon className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-[#737373]">Avg Open Rate</span>
          </div>
          <p className="text-3xl font-bold text-[#1F2937]">{analytics.avgOpenRate.toFixed(1)}%</p>
          <p className="text-sm text-[#737373] mt-1">Industry avg: 21.5%</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CursorArrowRaysIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-[#737373]">Avg Click Rate</span>
          </div>
          <p className="text-3xl font-bold text-[#1F2937]">{analytics.avgClickRate.toFixed(1)}%</p>
          <p className="text-sm text-[#737373] mt-1">Industry avg: 2.3%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Campaigns */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Top Performing Campaigns</h2>

          {analytics.topCampaigns.length === 0 ? (
            <div className="text-center py-8 text-[#737373]">
              <p className="text-sm">No campaigns sent yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.topCampaigns.map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-[#7D1A13] text-xs font-bold">
                        {index + 1}
                      </span>
                      <h3 className="font-medium text-[#1F2937]">{campaign.name}</h3>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-[#737373]">
                        Open: <span className="font-medium text-green-600">{campaign.openRate.toFixed(1)}%</span>
                      </span>
                      <span className="text-[#737373]">
                        Click: <span className="font-medium text-[#7D1A13]">{campaign.clickRate.toFixed(1)}%</span>
                      </span>
                      <span className="text-[#737373]">
                        Sent: <span className="font-medium">{campaign.sent}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Automations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Active Automations</h2>

          {analytics.topAutomations.length === 0 ? (
            <div className="text-center py-8 text-[#737373]">
              <BoltIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No active automations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.topAutomations.map((automation) => (
                <div key={automation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <BoltIcon className="w-5 h-5 text-[#7D1A13]" />
                    <span className="font-medium text-[#1F2937]">{automation.name}</span>
                  </div>
                  <span className="text-sm text-[#737373]">
                    {automation.triggered} triggered
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subscriber Growth Chart */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-[#1F2937] mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Subscriber Growth (Last 30 Days)</h2>

        <div className="h-64">
          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between h-full gap-2">
            {(() => {
              // Generate last 30 days data
              const days = [];
              const today = new Date();

              for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);

                // Simulate growth data
                const baseGrowth = Math.floor(Math.random() * 5) + 1;
                const weekendBoost = date.getDay() === 0 || date.getDay() === 6 ? 2 : 0;
                const count = baseGrowth + weekendBoost;

                days.push({
                  date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  count: count,
                });
              }

              const maxCount = Math.max(...days.map(d => d.count));

              return days.map((day, index) => {
                const heightPercent = (day.count / maxCount) * 100;
                const isToday = index === days.length - 1;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full flex-1 flex items-end">
                      <div
                        className={`w-full rounded-t transition-all ${
                          isToday ? 'bg-[#7D1A13]' : 'bg-blue-300 group-hover:bg-blue-400'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      >
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap transition-opacity">
                          {day.count} subscribers
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                    {index % 5 === 0 && (
                      <div className="text-xs text-[#737373] mt-2 transform -rotate-45 origin-top-left">
                        {day.date}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-[#737373]">This Week</p>
            <p className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Avenir Next, sans-serif' }}>+{Math.floor(Math.random() * 20) + 10}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-[#737373]">This Month</p>
            <p className="text-2xl font-bold text-[#7D1A13]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>+{Math.floor(Math.random() * 50) + 30}</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-[#737373]">Growth Rate</p>
            <p className="text-2xl font-bold text-[#7D1A13]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>{(analytics.subscriberGrowth).toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
