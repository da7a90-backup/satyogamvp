'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  CurrencyDollarIcon,
  EyeIcon,
  AcademicCapIcon,
  UserGroupIcon,
  MapIcon,
  EnvelopeIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import analyticsApi from '@/lib/analytics-api';
import { PivotTable } from '@/components/reports/pivot-table';
import { syncSessionToLocalStorage } from '@/lib/auth-sync';

type TabType = 'sales' | 'teachings' | 'courses' | 'membership' | 'retreats' | 'newsletter' | 'cross';

interface TabConfig {
  id: TabType;
  name: string;
  icon: React.ElementType;
  description: string;
}

const tabs: TabConfig[] = [
  { id: 'sales', name: 'Sales & Revenue', icon: CurrencyDollarIcon, description: 'Sales metrics, popular products, revenue trends' },
  { id: 'teachings', name: 'Teachings', icon: EyeIcon, description: 'Teaching views and engagement' },
  { id: 'courses', name: 'Courses', icon: AcademicCapIcon, description: 'Enrollment, completion, and engagement' },
  { id: 'membership', name: 'Membership', icon: UserGroupIcon, description: 'Tier distribution, conversions, churn' },
  { id: 'retreats', name: 'Retreats', icon: MapIcon, description: 'Registrations, revenue, demographics' },
  { id: 'newsletter', name: 'Newsletter', icon: EnvelopeIcon, description: 'Subscribers, engagement, segmentation' },
  { id: 'cross', name: 'Cross-Analytics', icon: ChartBarIcon, description: 'LTV, funnel, upsells' },
];

export default function CustomAnalyticsClient() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('sales');
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync session token to localStorage for API calls
  useEffect(() => {
    syncSessionToLocalStorage(session);
  }, [session]);

  useEffect(() => {
    fetchTabData();
  }, [activeTab, timeframe]);

  const fetchTabData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      let fetchedData: any[] = [];

      switch (activeTab) {
        case 'sales':
          const salesData = await analyticsApi.sales.getSummary(timeframe);
          const popularProducts = await analyticsApi.sales.getPopularProducts(timeframe, 50);
          fetchedData = popularProducts.products.map((product: any) => ({
            Product: product.product_name,
            'Total Sales': product.total_sales,
            Revenue: product.revenue,
            'Avg Price': product.avg_price,
            Category: product.category || 'Unknown',
          }));
          break;

        case 'teachings':
          const teachingsData = await analyticsApi.teachings.getViews(timeframe);
          fetchedData = teachingsData.top_teachings?.map((teaching: any) => ({
            Teaching: teaching.teaching_name || teaching.title,
            Views: teaching.view_count || teaching.views,
            'Unique Users': teaching.unique_users || 0,
            'Avg Watch Time': teaching.avg_watch_time || 0,
          })) || [];
          break;

        case 'courses':
          const enrollmentData = await analyticsApi.courses.getEnrollment(timeframe);
          const engagementData = await analyticsApi.courses.getEngagement(timeframe);
          fetchedData = enrollmentData.courses?.map((course: any, index: number) => {
            const engagement = engagementData.courses?.[index] || {};
            return {
              Course: course.course_name || course.title,
              Enrollments: course.enrollments || 0,
              'Active Students': course.active_students || 0,
              'Completion Rate': engagement.completion_rate || 0,
              'Avg Progress': engagement.avg_progress || 0,
            };
          }) || [];
          break;

        case 'membership':
          const tiersData = await analyticsApi.membership.getTiers(timeframe);
          const conversionData = await analyticsApi.membership.getConversion(timeframe);
          fetchedData = tiersData.tiers?.map((tier: any) => ({
            Tier: tier.tier_name,
            'Active Members': tier.active_members,
            'New Members': tier.new_members,
            Revenue: tier.revenue,
            'Churn Rate': tier.churn_rate || 0,
          })) || [];
          break;

        case 'retreats':
          const retreatRegData = await analyticsApi.retreats.getRegistration(timeframe);
          const retreatRevData = await analyticsApi.retreats.getRevenue(timeframe);
          fetchedData = retreatRegData.retreats?.map((retreat: any, index: number) => {
            const revenue = retreatRevData.retreats?.[index] || {};
            return {
              Retreat: retreat.retreat_name || retreat.title,
              Registrations: retreat.registrations || 0,
              'Total Revenue': revenue.total_revenue || 0,
              'Avg Price': revenue.avg_price || 0,
              Status: retreat.status || 'Unknown',
            };
          }) || [];
          break;

        case 'newsletter':
          const subscribersData = await analyticsApi.newsletter.getSubscribers(timeframe);
          const engagementNewsletterData = await analyticsApi.newsletter.getEngagement(timeframe);
          fetchedData = [
            {
              Metric: 'Total Subscribers',
              Value: subscribersData.total_subscribers || 0,
              'Growth Rate': subscribersData.growth_rate || 0,
            },
            {
              Metric: 'New Subscribers',
              Value: subscribersData.new_subscribers || 0,
              'Growth Rate': subscribersData.growth_rate || 0,
            },
            {
              Metric: 'Unsubscribed',
              Value: subscribersData.unsubscribed || 0,
              'Growth Rate': subscribersData.unsubscribe_rate || 0,
            },
            {
              Metric: 'Open Rate',
              Value: engagementNewsletterData.avg_open_rate || 0,
              'Growth Rate': engagementNewsletterData.open_rate_change || 0,
            },
            {
              Metric: 'Click Rate',
              Value: engagementNewsletterData.avg_click_rate || 0,
              'Growth Rate': engagementNewsletterData.click_rate_change || 0,
            },
          ];
          break;

        case 'cross':
          const ltvData = await analyticsApi.cross.getLTV(timeframe);
          const funnelData = await analyticsApi.cross.getFunnel(timeframe);
          const upsellData = await analyticsApi.cross.getUpsells(timeframe);
          fetchedData = [
            {
              Metric: 'Average LTV',
              Value: ltvData.avg_ltv || 0,
              'Customer Segment': 'All Customers',
            },
            ...(funnelData.stages?.map((stage: any) => ({
              Metric: 'Funnel Stage',
              'Stage Name': stage.stage_name,
              Users: stage.users,
              'Conversion Rate': stage.conversion_rate || 0,
            })) || []),
            ...(upsellData.products?.map((product: any) => ({
              Metric: 'Upsell Product',
              Product: product.product_name,
              'Upsell Count': product.upsell_count,
              Revenue: product.revenue,
            })) || []),
          ];
          break;
      }

      setData(fetchedData);
    } catch (err) {
      console.error(`Failed to fetch ${activeTab} data:`, err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      setData([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchTabData(true);
  };

  const activeTabConfig = tabs.find(t => t.id === activeTab);

  return (
    <div className="p-6" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Custom Analytics</h1>
          <p className="text-[#737373] mt-1">Create custom reports with drag-n-drop pivot tables</p>
        </div>
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
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E5E7EB] mb-6">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#7D1A13] text-[#7D1A13]'
                  : 'border-transparent text-[#737373] hover:text-[#1F2937] hover:border-[#E5E7EB]'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Description */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          {activeTabConfig && <activeTabConfig.icon className="h-6 w-6 text-[#7D1A13]" />}
          <div>
            <h3 className="font-semibold text-[#1F2937]">{activeTabConfig?.name}</h3>
            <p className="text-sm text-[#737373]">{activeTabConfig?.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchTabData()}
              className="px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710]"
            >
              Retry
            </button>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-[#F3F4F6]">
          <div className="text-center">
            <ChartBarIcon className="h-12 w-12 text-[#9CA3AF] mx-auto mb-3" />
            <p className="text-[#737373]">No data available for this timeframe</p>
            <p className="text-sm text-[#9CA3AF] mt-1">Try adjusting the timeframe or check back later</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#F3F4F6] p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#1F2937] mb-2">Interactive Pivot Table</h2>
            <p className="text-sm text-[#737373]">
              Drag fields to rows, columns, or values to create custom reports. Select different chart types to visualize the data.
            </p>
          </div>
          <PivotTable data={data.map((item, index) => ({ ...item, id: index }))} />
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#1F2937] mb-3">How to Use</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#374151]">
          <div>
            <p className="font-medium mb-2">📊 Creating Reports:</p>
            <ul className="list-disc list-inside space-y-1 text-[#737373]">
              <li>Drag fields from the left into Rows or Columns</li>
              <li>Drag metrics into Values to aggregate data</li>
              <li>Use filters to narrow down results</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">📈 Visualizations:</p>
            <ul className="list-disc list-inside space-y-1 text-[#737373]">
              <li>Switch between Table, Bar Chart, Line Chart, and more</li>
              <li>Customize aggregation methods (Sum, Average, Count)</li>
              <li>Export data or save configurations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
