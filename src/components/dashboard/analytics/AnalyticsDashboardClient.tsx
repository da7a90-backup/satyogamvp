"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  ChartBarIcon,
  UserGroupIcon,
  CursorArrowRaysIcon,
  CurrencyDollarIcon,
  EyeIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import analyticsApi from '@/lib/analytics-api';
import { syncSessionToLocalStorage } from '@/lib/auth-sync';

interface AnalyticsSummary {
  total_users: number;
  new_users: number;
  active_users: number;
  user_growth_percentage: number;
  total_events: number;
  total_sessions: number;
  total_revenue: number;
  revenue_growth_percentage: number;
  courses_enrollments: number;
  teachings_views: number;
  top_events: { event_name: string; count: number; percentage: number }[];
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change?: string;
}

function StatCard({ title, value, icon: Icon, color, change }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#737373] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">
              ↑ {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsDashboardClient() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  // Sync session token to localStorage for API calls
  useEffect(() => {
    syncSessionToLocalStorage(session);
  }, [session]);

  useEffect(() => {
    fetchAnalyticsSummary();
  }, [timeRange]);

  const fetchAnalyticsSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch dashboard summary
      const dashboardSummary = await analyticsApi.dashboard.getSummary(timeRange);

      // Fetch top events
      const eventsData = await analyticsApi.dashboard.getEvents(timeRange, 10);

      // Fetch teaching views
      const teachingData = await analyticsApi.teachings.getViews(timeRange);

      // Fetch course enrollments
      const courseData = await analyticsApi.courses.getEnrollment(timeRange);

      // Fetch customer summary for sessions
      const customerData = await analyticsApi.customers.getSummary(timeRange);

      setSummary({
        total_users: dashboardSummary.users.total,
        new_users: dashboardSummary.users.new,
        active_users: dashboardSummary.users.active,
        user_growth_percentage: dashboardSummary.users.growth_percentage,
        total_events: eventsData.total_events,
        total_sessions: customerData.total_sessions || 0,
        total_revenue: dashboardSummary.revenue.total,
        revenue_growth_percentage: dashboardSummary.revenue.growth_percentage,
        courses_enrollments: dashboardSummary.courses.enrollments,
        teachings_views: teachingData.total_views || 0,
        top_events: eventsData.top_events,
      });
    } catch (err) {
      console.error('Failed to fetch analytics summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchAnalyticsSummary()}
            className="px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Analytics Dashboard</h1>
          <p className="text-[#737373] mt-1">Track user engagement and platform metrics</p>
        </div>
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition ${
                timeRange === range
                  ? 'bg-[#7D1A13] text-white'
                  : 'bg-gray-100 text-[#374151] hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={summary?.total_users.toLocaleString() || '0'}
          icon={UserGroupIcon}
          color="bg-[#7D1A13]"
          change={`${summary?.user_growth_percentage >= 0 ? '+' : ''}${summary?.user_growth_percentage.toFixed(1)}%`}
        />
        <StatCard
          title="Total Events"
          value={summary?.total_events.toLocaleString() || '0'}
          icon={ChartBarIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Active Sessions"
          value={summary?.total_sessions.toLocaleString() || '0'}
          icon={CursorArrowRaysIcon}
          color="bg-[#7D1A13]"
        />
        <StatCard
          title="Revenue"
          value={`$${summary?.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0'}`}
          icon={CurrencyDollarIcon}
          color="bg-amber-500"
          change={`${summary?.revenue_growth_percentage >= 0 ? '+' : ''}${summary?.revenue_growth_percentage.toFixed(1)}%`}
        />
      </div>

      {/* Top Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-[#F3F4F6]">
            <h2 className="text-lg font-semibold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Top Events</h2>
            <p className="text-sm text-[#737373]">Most tracked events in the last {timeRange}</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {summary?.top_events.map((event, index) => (
                <div key={event.event_name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-[#7D1A13] font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-[#1F2937]">{event.event_name}</p>
                      <p className="text-sm text-[#737373]">{event.count.toLocaleString()} events</p>
                    </div>
                  </div>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7D1A13] rounded-full"
                      style={{
                        width: `${(event.count / (summary?.top_events[0]?.count || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Breakdown by Type */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-[#F3F4F6]">
            <h2 className="text-lg font-semibold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Activity Metrics</h2>
            <p className="text-sm text-[#737373]">Platform engagement breakdown</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <EyeIcon className="w-6 h-6 text-[#7D1A13]" />
                  <div>
                    <p className="font-medium text-[#1F2937]">Teaching Views</p>
                    <p className="text-sm text-[#737373]">{summary?.teachings_views.toLocaleString() || '0'} views</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AcademicCapIcon className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-[#1F2937]">Course Enrollments</p>
                    <p className="text-sm text-[#737373]">{summary?.courses_enrollments.toLocaleString() || '0'} enrollments</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="w-6 h-6 text-[#7D1A13]" />
                  <div>
                    <p className="font-medium text-[#1F2937]">Active Users</p>
                    <p className="text-sm text-[#737373]">{summary?.active_users.toLocaleString() || '0'} active</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CurrencyDollarIcon className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="font-medium text-[#1F2937]">New Users</p>
                    <p className="text-sm text-[#737373]">{summary?.new_users.toLocaleString() || '0'} new</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Event Feed */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-[#F3F4F6]">
          <h2 className="text-lg font-semibold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Live Event Stream</h2>
          <p className="text-sm text-[#737373]">Recent user events across the platform</p>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-[#737373]">
            <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>Connect to real-time event stream</p>
            <p className="text-sm mt-1">Events will appear here as they occur</p>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>🎯 Analytics Integration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-[#374151]">Mixpanel: Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-[#374151]">Google Analytics 4: Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-[#374151]">Database Tracking: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
