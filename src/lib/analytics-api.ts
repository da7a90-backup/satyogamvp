import { getFastapiUrl } from './api-utils';
/**
 * Analytics API client for admin analytics and reporting
 */

const FASTAPI_URL = getFastapiUrl();

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
  user_id: string | null;
  action: string;
  item: string;
  item_type: string;
  timestamp: string;
  time_ago: string;
}

interface ActivityLogResponse {
  activities: Activity[];
  limit: number;
  offset: number;
  total: number;
}

interface DashboardEventsResponse {
  timeframe: string;
  top_events: {
    event_name: string;
    count: number;
    percentage: number;
  }[];
  total_events: number;
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

/**
 * Make authenticated request to FastAPI backend
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${FASTAPI_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `Request failed with status ${response.status}`);
  }

  return response;
}

/**
 * Dashboard Analytics
 */
export const dashboardAnalytics = {
  /**
   * Get dashboard summary with key metrics
   */
  async getSummary(
    timeframe: string = '30d',
    customStart?: string,
    customEnd?: string
  ): Promise<DashboardSummary> {
    let url = `/api/analytics/dashboard/summary?timeframe=${timeframe}`;

    if (customStart && customEnd) {
      url += `&custom_start=${customStart}&custom_end=${customEnd}`;
    }

    const response = await fetchWithAuth(url);
    return response.json();
  },

  /**
   * Get activity log
   */
  async getActivityLog(limit: number = 20, offset: number = 0): Promise<ActivityLogResponse> {
    const response = await fetchWithAuth(
      `/api/analytics/dashboard/activity-log?limit=${limit}&offset=${offset}`
    );
    return response.json();
  },

  /**
   * Get top events for dashboard
   */
  async getEvents(timeframe: string = '7d', limit: number = 10): Promise<DashboardEventsResponse> {
    const response = await fetchWithAuth(
      `/api/analytics/dashboard/events?timeframe=${timeframe}&limit=${limit}`
    );
    return response.json();
  },
};

/**
 * Sales & Revenue Analytics
 */
export const salesAnalytics = {
  /**
   * Get sales summary
   */
  async getSummary(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/sales/summary?timeframe=${timeframe}`
    );
    return response.json();
  },

  /**
   * Get popular products
   */
  async getPopularProducts(timeframe: string = '30d', limit: number = 10) {
    const response = await fetchWithAuth(
      `/api/analytics/sales/products/popular?timeframe=${timeframe}&limit=${limit}`
    );
    return response.json();
  },

  /**
   * Get sales trends
   */
  async getTrends(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/sales/trends?timeframe=${timeframe}`
    );
    return response.json();
  },
};

/**
 * Customer Analytics
 */
export const customerAnalytics = {
  /**
   * Get customer summary
   */
  async getSummary(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/customers/summary?timeframe=${timeframe}`
    );
    return response.json();
  },

  /**
   * Get customer segmentation
   */
  async getSegmentation(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/customers/segmentation?timeframe=${timeframe}`
    );
    return response.json();
  },
};

/**
 * Course Analytics
 */
export const courseAnalytics = {
  /**
   * Get enrollment metrics
   */
  async getEnrollment(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/courses/enrollment?timeframe=${timeframe}`
    );
    return response.json();
  },

  /**
   * Get engagement metrics
   */
  async getEngagement(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/courses/engagement?timeframe=${timeframe}`
    );
    return response.json();
  },

  /**
   * Get revenue metrics
   */
  async getRevenue(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/courses/revenue?timeframe=${timeframe}`
    );
    return response.json();
  },
};

/**
 * Teaching Analytics
 */
export const teachingAnalytics = {
  /**
   * Get teaching views
   */
  async getViews(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/teachings/views?timeframe=${timeframe}`
    );
    return response.json();
  },

  /**
   * Get engagement metrics
   */
  async getEngagement(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/teachings/engagement?timeframe=${timeframe}`
    );
    return response.json();
  },
};

/**
 * Membership Analytics
 */
export const membershipAnalytics = {
  /**
   * Get membership tier breakdown
   */
  async getTiers(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/membership/tiers?timeframe=${timeframe}`
    );
    return response.json();
  },

  /**
   * Get conversion metrics
   */
  async getConversion(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/membership/conversion?timeframe=${timeframe}`
    );
    return response.json();
  },

  /**
   * Get churn metrics
   */
  async getChurn(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/membership/churn?timeframe=${timeframe}`
    );
    return response.json();
  },
};

/**
 * Retreat Analytics
 */
export const retreatAnalytics = {
  /**
   * Get registration metrics
   */
  async getRegistration(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/retreats/registration?timeframe=${timeframe}`
    );
    return response.json();
  },

  /**
   * Get revenue metrics
   */
  async getRevenue(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/retreats/revenue?timeframe=${timeframe}`
    );
    return response.json();
  },

  /**
   * Get demographics
   */
  async getDemographics(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/retreats/demographics?timeframe=${timeframe}`
    );
    return response.json();
  },
};

/**
 * Newsletter Analytics
 */
export const newsletterAnalytics = {
  /**
   * Get subscriber metrics
   */
  async getSubscribers(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/newsletter/subscribers?timeframe=${timeframe}`
    );
    return response.json();
  },

  /**
   * Get engagement metrics (SendGrid)
   */
  async getEngagement(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/newsletter/engagement?timeframe=${timeframe}`
    );
    return response.json();
  },

  /**
   * Get segmentation metrics
   */
  async getSegmentation(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/newsletter/segmentation?timeframe=${timeframe}`
    );
    return response.json();
  },
};

/**
 * Cross Analytics
 */
export const crossAnalytics = {
  /**
   * Get funnel metrics
   */
  async getFunnel(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/cross/funnel?timeframe=${timeframe}`
    );
    return response.json();
  },

  /**
   * Get LTV metrics
   */
  async getLTV(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/cross/ltv?timeframe=${timeframe}`
    );
    return response.json();
  },

  /**
   * Get upsell metrics
   */
  async getUpsells(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/cross/upsells?timeframe=${timeframe}`
    );
    return response.json();
  },
};

/**
 * Export data for custom reports
 */
export const exportAnalytics = {
  /**
   * Export data for a specific category
   */
  async export(category: string, timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/export/${category}?timeframe=${timeframe}`
    );
    return response.json();
  },
};

/**
 * Trend data for charts
 */
export const trendsAnalytics = {
  /**
   * Get revenue trend data
   */
  async getRevenueTrend(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/trends/revenue?timeframe=${timeframe}`
    );
    return response.json();
  },

  /**
   * Get user growth trend data
   */
  async getUserGrowthTrend(timeframe: string = '30d') {
    const response = await fetchWithAuth(
      `/api/analytics/trends/users?timeframe=${timeframe}`
    );
    return response.json();
  },
};

/**
 * Main analytics export
 */
export const analyticsApi = {
  dashboard: dashboardAnalytics,
  sales: salesAnalytics,
  customers: customerAnalytics,
  courses: courseAnalytics,
  teachings: teachingAnalytics,
  membership: membershipAnalytics,
  retreats: retreatAnalytics,
  newsletter: newsletterAnalytics,
  cross: crossAnalytics,
  export: exportAnalytics,
  trends: trendsAnalytics,
};

export default analyticsApi;
