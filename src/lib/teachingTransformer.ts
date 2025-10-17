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
    key: 'video_teaching' | 'guided_meditation' | 'qa' | 'essay';
  }>;
  allTeachings: Teaching[];
  totalCount: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================


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

import type { TeachingData } from '@/types/Teachings';

// Raw teaching interface from your JSON (matching document structure)
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

// Format date helper
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

// Parse content_text for rich text blocks (if it's an essay)
function parseContentText(contentText: string, contentType: string): any[] | undefined {
  if (contentType !== 'other' && !contentType.toLowerCase().includes('essay')) {
    return undefined;
  }

  // Split by double newlines to get paragraphs
  const paragraphs = contentText.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map(para => ({
    type: 'paragraph',
    children: [{ type: 'text', text: para.trim() }]
  }));
}

// Transform raw teaching to TeachingData format
export function transformRawTeaching(raw: RawTeaching): TeachingData {
  // Determine video platform and ID
  let videoPlatform: TeachingData['videoPlatform'] = 'none';
  let videoId: string | undefined;
  
  if (raw.youtube_ids && raw.youtube_ids.length > 0) {
    videoPlatform = 'youtube';
    videoId = raw.youtube_ids[0];
  } else if (raw.cloudflare_ids && raw.cloudflare_ids.length > 0) {
    videoPlatform = 'cloudflare';
    videoId = raw.cloudflare_ids[0];
  }
  
  // Determine audio platform and URL
  let audioPlatform: TeachingData['audioPlatform'] = 'none';
  let audioUrl: string | undefined;
  
  if (raw.podbean_ids && raw.podbean_ids.length > 0) {
    audioPlatform = 'podbean';
    audioUrl = `https://www.podbean.com/eu/pb-${raw.podbean_ids[0]}`;
  }
  
  // Parse content for essays
  const content = parseContentText(raw.content_text, raw.content_type);
  
  return {
    // Required fields from raw data
    id: raw.id,
    type: raw.type as 'free' | 'post',
    accessType: raw.accessType,
    slug: raw.slug,
    link: raw.link,
    date: raw.date,
    date_gmt: raw.date_gmt,
    modified: raw.modified,
    modified_gmt: raw.modified_gmt,
    title: raw.title,
    excerpt_text: raw.excerpt_text,
    content_text: raw.content_text,
    
    // Media
    featured_media: raw.featured_media,
    
    // IDs
    youtube_ids: raw.youtube_ids,
    cloudflare_ids: raw.cloudflare_ids,
    podbean_ids: raw.podbean_ids,
    
    // Content type
    content_type: raw.content_type as any,
    
    // Categories and tags
    category_ids: raw.category_ids,
    tag_ids: raw.tag_ids,
    categories: raw.categories,
    tags: raw.tags,
    
    // Author
    author: raw.author,
    
    // Legacy/backward compatibility fields
    description: raw.excerpt_text,
    summary: raw.excerpt_text,
    content: content,
    transcription: undefined,
    duration: raw.duration,
    imageUrl: raw.featured_media.url,
    
    videoPlatform,
    videoId,
    videoUrl: undefined,
    
    audioPlatform,
    audioUrl,
    
    // Preview settings
    preview_duration: raw.accessType === 'free' ? 1800 : undefined,
    hiddenTags: raw.tags.map(t => t.slug).join(',')
  };
}

// Transform all teachings from raw data
export function transformAllTeachings(rawData: RawData): TeachingData[] {
  const allRaw = [
    ...rawData.qa,
    ...rawData.video_teaching,
    ...rawData.guided_meditation,
    ...rawData.Essays
  ];
  
  // Sort by date (newest first)
  allRaw.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return allRaw.map(transformRawTeaching);
}

// Get teaching by slug
export function getTeachingBySlug(
  teachings: TeachingData[],
  slug: string
): TeachingData | undefined {
  return teachings.find(t => t.slug === slug);
}

