'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  UsersIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import analyticsApi from '@/lib/analytics-api';
import RevenueChart from '@/components/dashboard/charts/RevenueChart';
import UserGrowthChart from '@/components/dashboard/charts/UserGrowthChart';
import { syncSessionToLocalStorage } from '@/lib/auth-sync';

interface DashboardSummary {
  timeframe: string;
  start_date: string;
  end_date: string;
  users: {
    total: number;
    new: number;
    active: number;
    growth_percentage: number;
  };
  revenue: {
    total: number;
    previous_period: number;
    growth_percentage: number;
  };
  courses: {
    active: number;
    enrollments: number;
    growth_percentage: number;
  };
  products: {
    sold: number;
    growth_percentage: number;
  };
  retreats: {
    registrations: number;
  };
}

interface Activity {
  id: string;
  user: string;
  action: string;
  item: string;
  time_ago: string;
}

interface Event {
  event_name: string;
  count: number;
  percentage: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('30d');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [topEvents, setTopEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<Array<{date: string; revenue: number}>>([]);
  const [userGrowthTrend, setUserGrowthTrend] = useState<Array<{date: string; new_users: number; total_users: number}>>([]);

  // Sync session token to localStorage for API calls
  useEffect(() => {
    syncSessionToLocalStorage(session);
  }, [session]);

  const fetchDashboardData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Fetch dashboard summary
      const summaryData = await analyticsApi.dashboard.getSummary(timeframe);
      setSummary(summaryData);

      // Fetch activity log
      const activityData = await analyticsApi.dashboard.getActivityLog(10);
      setActivities(activityData.activities);

      // Fetch top events
      const eventsData = await analyticsApi.dashboard.getEvents(timeframe, 5);
      setTopEvents(eventsData.top_events);

      // Fetch revenue trend
      const revenueTrendData = await analyticsApi.trends.getRevenueTrend(timeframe);
      setRevenueTrend(revenueTrendData.trend);

      // Fetch user growth trend
      const userTrendData = await analyticsApi.trends.getUserGrowthTrend(timeframe);
      setUserGrowthTrend(userTrendData.trend);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const stats = summary ? [
    {
      name: 'Total Users',
      value: summary.users.total.toLocaleString(),
      icon: UsersIcon,
      change: `${summary.users.growth_percentage >= 0 ? '+' : ''}${summary.users.growth_percentage}%`,
      changeType: summary.users.growth_percentage >= 0 ? 'increase' : 'decrease',
      subtitle: `${summary.users.new} new users`
    },
    {
      name: 'Active Courses',
      value: summary.courses.active.toString(),
      icon: BookOpenIcon,
      change: `${summary.courses.growth_percentage >= 0 ? '+' : ''}${summary.courses.growth_percentage}%`,
      changeType: summary.courses.growth_percentage >= 0 ? 'increase' : 'decrease',
      subtitle: `${summary.courses.enrollments} enrollments`
    },
    {
      name: 'Revenue',
      value: `$${summary.revenue.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CurrencyDollarIcon,
      change: `${summary.revenue.growth_percentage >= 0 ? '+' : ''}${summary.revenue.growth_percentage}%`,
      changeType: summary.revenue.growth_percentage >= 0 ? 'increase' : 'decrease',
      subtitle: 'Total revenue'
    },
    {
      name: 'Products Sold',
      value: summary.products.sold.toString(),
      icon: ShoppingBagIcon,
      change: `${summary.products.growth_percentage >= 0 ? '+' : ''}${summary.products.growth_percentage}%`,
      changeType: summary.products.growth_percentage >= 0 ? 'increase' : 'decrease',
      subtitle: `${summary.retreats.registrations} retreat registrations`
    },
  ] : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Avenir Next, sans-serif' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]">Admin Dashboard</h1>
        <div className="flex items-center space-x-3">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#374151] bg-white hover:bg-gray-50 transition-colors"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="last_year">Last Year</option>
            <option value="lifetime">Lifetime</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#374151] hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <Link href="/dashboard/admin/analytics">
            <button className="px-4 py-2 bg-white border border-[#7D1A13] rounded-lg text-sm font-medium text-[#7D1A13] hover:bg-[#FEF2F2] transition-colors">
              View Analytics
            </button>
          </Link>

          <Link href="/dashboard/admin/analytics/custom">
            <button className="px-4 py-2 bg-[#7D1A13] rounded-lg text-sm font-medium text-white hover:bg-[#6B1710] transition-colors">
              Custom Reports
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-[#737373]">{stat.name}</p>
                <p className="text-2xl font-bold mt-1 text-[#1F2937]">{stat.value}</p>
                <p className="text-xs text-[#9CA3AF] mt-1">{stat.subtitle}</p>
              </div>
              <span className="p-2 rounded-md bg-[#FEF2F2]">
                <stat.icon className="h-6 w-6 text-[#7D1A13]" />
              </span>
            </div>
            <div className="mt-4">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-[#737373] ml-1">from last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mixpanel Events & Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Mixpanel Events Dashboard Widget */}
        <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-[#1F2937]">Top Events</h2>
            <Link href="/dashboard/admin/analytics">
              <span className="text-sm text-[#7D1A13] hover:text-[#6B1710] cursor-pointer">
                View All →
              </span>
            </Link>
          </div>
          {topEvents.length > 0 ? (
            <div className="space-y-3">
              {topEvents.map((event, index) => (
                <div key={event.event_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-[#7D1A13] flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1F2937] text-sm">{event.event_name}</p>
                      <p className="text-xs text-[#737373]">{event.count} events</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#7D1A13] rounded-full"
                        style={{ width: `${event.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-[#7D1A13] w-12 text-right">
                      {event.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#737373]">
              <ChartBarIcon className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p>No events tracked yet</p>
            </div>
          )}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-[#1F2937]">Revenue Overview</h2>
          </div>
          <div className="h-64">
            {revenueTrend.length > 0 ? (
              <RevenueChart data={revenueTrend} />
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed border-[#E5E7EB] rounded-lg">
                <div className="text-center">
                  <ChartBarIcon className="h-10 w-10 text-[#9CA3AF] mx-auto mb-2" />
                  <p className="text-[#737373] text-sm">No revenue data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity & User Growth Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F3F4F6]">
            <h2 className="text-lg font-semibold text-[#1F2937]">Recent Activity</h2>
          </div>
          {activities.length > 0 ? (
            <>
              <div className="divide-y divide-[#F3F4F6] max-h-80 overflow-y-auto">
                {activities.map((activity) => (
                  <div key={activity.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                        <span className="text-[#737373] text-xs font-medium">
                          {activity.user.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">
                          <span className="font-medium text-[#1F2937]">{activity.user}</span>
                          <span className="text-[#737373]"> {activity.action} </span>
                          <span className="font-medium text-[#1F2937]">{activity.item}</span>
                        </p>
                        <p className="text-xs text-[#9CA3AF]">{activity.time_ago}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 bg-[#F9FAFB] border-t border-[#F3F4F6]">
                <Link href="/dashboard/admin/activity" className="text-sm font-medium text-[#7D1A13] hover:text-[#6B1710] transition-colors">
                  View all activity →
                </Link>
              </div>
            </>
          ) : (
            <div className="px-5 py-8 text-center text-[#737373]">
              No recent activity
            </div>
          )}
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-[#1F2937]">User Growth</h2>
          </div>
          <div className="h-80">
            {userGrowthTrend.length > 0 ? (
              <UserGrowthChart data={userGrowthTrend} />
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed border-[#E5E7EB] rounded-lg">
                <div className="text-center">
                  <ChartBarIcon className="h-10 w-10 text-[#9CA3AF] mx-auto mb-2" />
                  <p className="text-[#737373] text-sm">No user growth data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm p-5">
        <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/admin/users">
            <button className="flex items-center p-3 bg-white hover:bg-gray-50 border border-[#E5E7EB] rounded-lg transition-colors w-full">
              <UsersIcon className="h-5 w-5 text-[#737373] mr-2" />
              <span className="text-sm text-[#374151]">Manage Users</span>
            </button>
          </Link>
          <Link href="/dashboard/admin/courses">
            <button className="flex items-center p-3 bg-white hover:bg-gray-50 border border-[#E5E7EB] rounded-lg transition-colors w-full">
              <BookOpenIcon className="h-5 w-5 text-[#737373] mr-2" />
              <span className="text-sm text-[#374151]">Manage Courses</span>
            </button>
          </Link>
          <Link href="/dashboard/admin/products">
            <button className="flex items-center p-3 bg-white hover:bg-gray-50 border border-[#E5E7EB] rounded-lg transition-colors w-full">
              <ShoppingBagIcon className="h-5 w-5 text-[#737373] mr-2" />
              <span className="text-sm text-[#374151]">Manage Products</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
