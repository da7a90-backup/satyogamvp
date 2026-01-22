/**
 * Retreat-related TypeScript interfaces
 * These match the backend API responses from FastAPI
 */

export interface Retreat {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  type: 'online' | 'onsite_darshan' | 'onsite_shakti' | 'onsite_sevadhari';
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  price_lifetime: number | null;
  price_limited: number | null;
  price_onsite: number | null;
  price: number | null; // Computed price for card display
  thumbnail_url: string | null;
  hero_background: string | null; // Hero image for cards
  fixed_date?: string | null; // Formatted date string (e.g., "December 27-29, 2025")
  duration_days: number | null;
  has_audio: boolean;
  has_video: boolean;
  is_published: boolean;
  max_participants?: number | null;
  booking_tagline?: string | null;
  intro1_content?: string[] | null;
  images?: any[] | null;

  // Registration status
  is_registered: boolean;
  registration_status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  access_type?: 'lifetime' | 'limited_12day' | null;

  // Portal page data
  invitation_video_url?: string | null;
  announcement?: string | null;
  about_content?: string | null;
  about_image_url?: string | null;
  overview_sections?: OverviewSection[];
  preparation_instructions?: PrepInstruction[];
  faq_data?: FAQ[];
  live_schedule?: LiveScheduleDay[];

  // Forum control
  forum_enabled: boolean;

  // Portal content (only if registered and has access)
  portals?: RetreatPortalDay[];
  can_access?: boolean;
  registered_at?: string;
  access_expires_at?: string | null;

  // Past retreat portal media (for store-published retreats)
  is_past_retreat?: boolean;
  portal_media?: PortalMediaItem[] | null;
  is_published_to_store?: boolean;
  store_product_id?: string | null;
  store_product_image_url?: string | null; // Product image for fallback
}

/**
 * Portal Media Item for past retreats
 * Used when retreats are published to Dharma Bandhara store
 */
export interface PortalMediaItem {
  title: string;
  subtitle?: string;
  description?: string;
  video_url?: string;
  audio_url?: string;
  order: number;
}

export interface PrepInstruction {
  title: string;
  content: string | string[]; // Single string or array of paragraphs
  contentPreview?: string; // Short preview for collapsed state
  bullets?: string[]; // Bullet points/list items
  image?: string | string[]; // Single image or array of images
  imageCaption?: string | string[]; // Caption(s) for image(s)
  videoUrl?: string; // YouTube, Cloudflare Stream, or direct video URL
  videoType?: 'youtube' | 'cloudflare' | 'teaching' | 'direct'; // Type of video
  teachingId?: string; // For internal teaching videos
  expandable?: boolean; // Whether to show "View more" button (default: false)
  icon?: string; // Optional icon
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface OverviewSection {
  image_url?: string | null;
  content: string;
}

export interface LiveScheduleDay {
  date: string; // "November 15th"
  day_label: string; // "Friday"
  is_live: boolean;
  sessions: LiveSession[];
}

export interface LiveSession {
  time: string; // "5:30 pm"
  title: string;
  description?: string; // Description for the session
  zoom_link?: string;
  youtube_live_url?: string; // For YouTube Live embeds (full URL)
  youtube_live_id?: string; // For YouTube Live embeds (just ID)
  thumbnail_url?: string;
  is_happening_now?: boolean; // Flag to indicate if this is currently live
}

export interface RetreatPortalDay {
  id: string;
  retreat_id: string;
  title: string;
  description?: string;
  content?: {
    days: DaySchedule[];
  };
  order_index: number;
}

export interface DaySchedule {
  day_number: number; // 1, 2, 3, etc.
  title: string; // "Day 1", "Day 2"
  sessions: PortalSession[];
}

export interface PortalSession {
  time: string; // "5:30 pm"
  session_title: string;
  type: 'teaching' | 'livestream' | 'essay' | 'video' | 'meditation';

  // Content links
  teaching_id?: string; // Link to existing teaching
  zoom_link?: string; // Zoom livestream link
  youtube_live_id?: string; // YouTube Live ID
  video_url?: string; // Uploaded video (post-retreat)

  // Metadata
  thumbnail_url?: string;
  duration?: number; // in minutes
  page_count?: number; // for essays
  has_video: boolean;
  has_audio: boolean;
  is_text: boolean;
  description?: string;
  date?: string; // "Nov 26th, 2024"
}

export interface RetreatRegistration {
  id: string;
  user_id: string;
  retreat_id: string;
  retreat: {
    id: string;
    slug: string;
    title: string;
    description?: string;
    type: string;
    thumbnail_url?: string;
    start_date?: string | null;
    end_date?: string | null;
  };
  registered_at: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  access_type: 'lifetime' | 'limited_12day' | null;
  access_expires_at: string | null;
  can_access: boolean;
}

export interface ForumPost {
  id: string;
  retreat_id: string;
  user_id: string;
  parent_id: string | null;
  title?: string | null;
  category?: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_photo: string | null;
  like_count: number;
  is_liked_by_user: boolean;
  replies: ForumPost[];
}

export interface CreateForumPostData {
  content: string;
  parent_id?: string;
}

export interface RetreatCardData {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail_url: string;
  duration_days: number;
  has_audio: boolean;
  has_video: boolean;
  type: string;
  price_lifetime: number | null;
  price_limited: number | null;
  start_date: string | null;
  end_date: string | null;
  is_registered: boolean;
  access_type?: string | null;
  access_expires_at?: string | null;
}

// Helper type for filtering retreats
export type RetreatFilterType = 'all' | 'my-retreats' | 'upcoming' | 'past';

// Access status helpers
export interface AccessStatus {
  can_access: boolean;
  reason: string;
  is_registered: boolean;
  access_type?: 'lifetime' | 'limited_12day' | null;
  days_remaining?: number;
}
