// ============================================================================
// RAW DATA TYPES (from your data.json)
// ============================================================================

export interface RawTeaching {
  id: number;
  type: string;
  slug: string;
  link: string;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  title: string;
  excerpt_text: string;
  content_text: string;
  author: {
    id: number;
    name: string | null;
    slug: string | null;
    url: string | null;
  };
  featured_media: {
    id: number;
    url: string;
    alt: string;
    mime_type: string;
  };
  category_ids: number[];
  tag_ids: number[];
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  youtube_ids: string[];
  cloudflare_ids: string[];
  podbean_ids: string[];
  content_type: string;
  accessType: 'free' | 'restricted';
  duration?: string;
}

export interface RawData {
  qa: RawTeaching[];
  video_teaching: RawTeaching[];
  guided_meditation: RawTeaching[];
  Essays: RawTeaching[];
}

// ============================================================================
// COMPONENT DATA TYPES (for TeachingLibrarySection)
// ============================================================================

export interface Teaching {
  id: string;
  thumbnail: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  accessType: 'free' | 'restricted';
  mediaType: 'video' | 'audio' | 'text';
  pageCount?: number;
  slug: string;
  categoryType: 'video_teaching' | 'guided_meditation' | 'qa' | 'essay';
}

export interface TeachingLibraryData {
  isLoggedIn: boolean;
  sectionTitle: string;
  viewAllLink?: {
    text: string;
    url: string;
  };
  featuredTeaching: Teaching;
  categories: Array<{
    label: string;
    key: 'all' | 'video_teaching' | 'guided_meditation' | 'qa' | 'essay';
  }>;
  allTeachings: Teaching[];
  totalCount: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  
  const ordinal = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  return `${month} ${day}${ordinal(day)}, ${year}`;
}

function getMediaType(contentType: string): 'video' | 'audio' | 'text' {
  if (contentType === 'guided_meditation') return 'audio';
  if (contentType === 'other' || contentType.toLowerCase().includes('essay')) return 'text';
  return 'video';
}

function getPageCount(teaching: RawTeaching): number | undefined {
  const mediaType = getMediaType(teaching.content_type);
  if (mediaType === 'text') {
    const wordCount = teaching.content_text.split(/\s+/).length;
    return Math.ceil(wordCount / 250);
  }
  return undefined;
}

function getCategoryType(contentType: string): 'video_teaching' | 'guided_meditation' | 'qa' | 'essay' {
  if (contentType === 'guided_meditation') return 'guided_meditation';
  if (contentType === 'qa') return 'qa';
  if (contentType === 'other' || contentType.toLowerCase().includes('essay')) return 'essay';
  return 'video_teaching';
}

// ============================================================================
// TRANSFORMATION FUNCTIONS
// ============================================================================

export function transformTeaching(raw: RawTeaching): Teaching {
  const mediaType = getMediaType(raw.content_type);
  
  return {
    id: raw.slug,
    thumbnail: raw.featured_media.url,
    title: raw.title,
    description: raw.excerpt_text,
    date: formatDate(raw.date),
    duration: raw.duration || '45 minutes',
    accessType: raw.accessType,
    mediaType: mediaType,
    pageCount: getPageCount(raw),
    slug: raw.slug,
    categoryType: getCategoryType(raw.content_type)
  };
}

export function prepareTeachingLibraryData(
  rawData: RawData,
  isLoggedIn: boolean = false
): TeachingLibraryData {
  // Combine all teaching types into one array
  const allTeachings: RawTeaching[] = [
    ...rawData.video_teaching,
    ...rawData.guided_meditation,
    ...rawData.qa,
    ...rawData.Essays
  ];
  
  // Sort by date (newest first)
  allTeachings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Get featured (most recent)
  const featured = allTeachings[0];
  
  // Get remaining teachings
  const remaining = allTeachings.slice(1);
  
  // Transform all teachings
  const transformedTeachings = remaining.map(transformTeaching);
  
  return {
    isLoggedIn,
    sectionTitle: "Latest Teaching",
    viewAllLink: {
      text: "View all",
      url: "/teachings"
    },
    featuredTeaching: transformTeaching(featured),
    categories: [
      { label: "Teachings", key: "video_teaching" },
      { label: "Guided Meditations", key: "guided_meditation" },
      { label: "Q&A with Shunyamurti", key: "qa" },
      { label: "Essay", key: "essay" }
    ],
    allTeachings: transformedTeachings,
    totalCount: allTeachings.length
  };
}