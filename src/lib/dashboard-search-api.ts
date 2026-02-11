import { getFastapiUrl } from './api-utils';
/**
 * Dashboard Search API Client
 * Enhanced search that prioritizes and highlights user's enrolled/purchased content
 */

import { searchSite, SearchResponse, SearchResult } from '@/lib/search-api';


export interface DashboardSearchResult extends SearchResult {
  is_enrolled?: boolean;
  is_purchased?: boolean;
  is_registered?: boolean;
  user_relationship?: 'enrolled' | 'purchased' | 'registered' | null;
}

export interface DashboardSearchResponse extends Omit<SearchResponse, 'results'> {
  results: {
    teachings: DashboardSearchResult[];
    courses: DashboardSearchResult[];
    products: DashboardSearchResult[];
    retreats: DashboardSearchResult[];
    blogs: SearchResult[];
    pages: SearchResult[];
  };
  user_content_count?: number;
}

interface UserContent {
  enrolled_courses: string[];
  registered_retreats: string[];
  purchased_products: string[];
}

/**
 * Fetch user's enrolled courses, registered retreats, and purchased products
 */
async function fetchUserContent(token: string): Promise<UserContent> {
  try {
    // Fetch user's courses, retreats, and purchases in parallel
    const [coursesRes, retreatsRes, purchasesRes] = await Promise.allSettled([
      fetch(`${getFastapiUrl()}/api/users/me/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${getFastapiUrl()}/api/retreats/my-registrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${getFastapiUrl()}/api/users/me/purchases`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
    ]);

    // Parse successful responses
    const enrolledCourses =
      coursesRes.status === 'fulfilled' && coursesRes.value.ok
        ? await coursesRes.value.json().then((data) => data.courses?.map((c: any) => c.id) || [])
        : [];

    const registeredRetreats =
      retreatsRes.status === 'fulfilled' && retreatsRes.value.ok
        ? await retreatsRes.value.json().then((data) => data.retreats?.map((r: any) => r.id) || [])
        : [];

    const purchasedProducts =
      purchasesRes.status === 'fulfilled' && purchasesRes.value.ok
        ? await purchasesRes.value.json().then((data) => data.purchases?.map((p: any) => p.product_id) || [])
        : [];

    return {
      enrolled_courses: enrolledCourses,
      registered_retreats: registeredRetreats,
      purchased_products: purchasedProducts,
    };
  } catch (error) {
    console.error('Error fetching user content:', error);
    return {
      enrolled_courses: [],
      registered_retreats: [],
      purchased_products: [],
    };
  }
}

/**
 * Enhance search results with user's relationship to content
 */
function enhanceResults(
  results: SearchResult[],
  userContent: UserContent,
  contentType: 'courses' | 'retreats' | 'products'
): DashboardSearchResult[] {
  const userIds =
    contentType === 'courses'
      ? userContent.enrolled_courses
      : contentType === 'retreats'
      ? userContent.registered_retreats
      : userContent.purchased_products;

  return results.map((result) => {
    const hasRelationship = userIds.includes(result.id);
    const relationship =
      contentType === 'courses' && hasRelationship
        ? 'enrolled'
        : contentType === 'retreats' && hasRelationship
        ? 'registered'
        : contentType === 'products' && hasRelationship
        ? 'purchased'
        : null;

    return {
      ...result,
      is_enrolled: contentType === 'courses' ? hasRelationship : undefined,
      is_registered: contentType === 'retreats' ? hasRelationship : undefined,
      is_purchased: contentType === 'products' ? hasRelationship : undefined,
      user_relationship: relationship,
    } as DashboardSearchResult;
  });
}

/**
 * Sort results to prioritize user's content
 */
function sortByUserRelationship(results: DashboardSearchResult[]): DashboardSearchResult[] {
  return results.sort((a, b) => {
    // User's content comes first
    const aHasRelationship = a.user_relationship !== null;
    const bHasRelationship = b.user_relationship !== null;

    if (aHasRelationship && !bHasRelationship) return -1;
    if (!aHasRelationship && bHasRelationship) return 1;
    return 0; // Maintain original order otherwise
  });
}

/**
 * Dashboard-specific search across all content types
 * Highlights and prioritizes user's enrolled courses, registered retreats, and purchased products
 */
export async function searchDashboard(
  query: string,
  token: string | null,
  limit: number = 5
): Promise<DashboardSearchResponse> {
  // Get base search results
  const baseResults = await searchSite(query, limit);

  // If no token, return base results
  if (!token) {
    return {
      ...baseResults,
      user_content_count: 0,
    };
  }

  // Fetch user's content
  const userContent = await fetchUserContent(token);

  // Enhance results with user relationship data
  const enhancedCourses = sortByUserRelationship(
    enhanceResults(baseResults.results.courses, userContent, 'courses')
  );

  const enhancedRetreats = sortByUserRelationship(
    enhanceResults(baseResults.results.retreats, userContent, 'retreats')
  );

  const enhancedProducts = sortByUserRelationship(
    enhanceResults(baseResults.results.products, userContent, 'products')
  );

  // Count user's content in results
  const userContentCount =
    enhancedCourses.filter((c) => c.user_relationship).length +
    enhancedRetreats.filter((r) => r.user_relationship).length +
    enhancedProducts.filter((p) => p.user_relationship).length;

  return {
    ...baseResults,
    results: {
      teachings: baseResults.results.teachings as DashboardSearchResult[],
      courses: enhancedCourses,
      products: enhancedProducts,
      retreats: enhancedRetreats,
      blogs: baseResults.results.blogs,
      pages: baseResults.results.pages,
    },
    user_content_count: userContentCount,
  };
}

/**
 * Get user's content only (enrolled courses, registered retreats, purchased products)
 */
export async function searchUserContent(
  query: string,
  token: string,
  limit: number = 10
): Promise<DashboardSearchResponse> {
  const userContent = await fetchUserContent(token);

  // Search only within user's content
  const baseResults = await searchSite(query, limit * 3); // Fetch more to filter

  // Filter to only user's content
  const userCourses = baseResults.results.courses.filter((c) =>
    userContent.enrolled_courses.includes(c.id)
  ) as DashboardSearchResult[];

  const userRetreats = baseResults.results.retreats.filter((r) =>
    userContent.registered_retreats.includes(r.id)
  ) as DashboardSearchResult[];

  const userProducts = baseResults.results.products.filter((p) =>
    userContent.purchased_products.includes(p.id)
  ) as DashboardSearchResult[];

  // Mark all as user content
  userCourses.forEach((c) => {
    c.user_relationship = 'enrolled';
    c.is_enrolled = true;
  });

  userRetreats.forEach((r) => {
    r.user_relationship = 'registered';
    r.is_registered = true;
  });

  userProducts.forEach((p) => {
    p.user_relationship = 'purchased';
    p.is_purchased = true;
  });

  const totalResults = userCourses.length + userRetreats.length + userProducts.length;

  return {
    query,
    total_results: totalResults,
    results: {
      teachings: [],
      courses: userCourses.slice(0, limit),
      products: userProducts.slice(0, limit),
      retreats: userRetreats.slice(0, limit),
      blogs: [],
      pages: [],
    },
    user_content_count: totalResults,
  };
}

/**
 * Get user relationship badge text
 */
export function getUserRelationshipBadge(
  relationship: DashboardSearchResult['user_relationship']
): string | null {
  switch (relationship) {
    case 'enrolled':
      return 'Enrolled';
    case 'registered':
      return 'Registered';
    case 'purchased':
      return 'Purchased';
    default:
      return null;
  }
}

/**
 * Get user relationship badge color (Tailwind classes)
 */
export function getUserRelationshipBadgeColor(
  relationship: DashboardSearchResult['user_relationship']
): string {
  switch (relationship) {
    case 'enrolled':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'registered':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'purchased':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return '';
  }
}
