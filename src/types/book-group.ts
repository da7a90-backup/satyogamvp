/**
 * Book Groups TypeScript Type Definitions
 * Matches backend schemas from backend/app/schemas/book_group.py
 */

export enum BookGroupStatus {
  UPCOMING = "upcoming",
  LIVE = "live",
  COMPLETED = "completed",
}

export enum BookGroupAccessType {
  MEMBERSHIP = "membership",
  PURCHASE = "purchase",
}

// Session Types
export interface BookGroupSession {
  id: string;
  book_group_id: string;
  week_number: number;
  title: string;
  description?: string;
  session_date?: string; // ISO datetime

  // Zoom (for live/upcoming)
  zoom_link?: string;
  zoom_enabled: boolean;
  zoom_meeting_id?: string;
  zoom_password?: string;

  // Media (for completed)
  video_url?: string;
  audio_url?: string;
  transcript_url?: string;
  duration_minutes?: number;

  // Downloads
  downloads?: Array<{
    title: string;
    url: string;
    type: string; // "pdf", "doc", etc.
  }>;

  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookGroupSessionCreate {
  week_number: number;
  title: string;
  description?: string;
  session_date?: string;
  zoom_link?: string;
  zoom_enabled?: boolean;
  zoom_meeting_id?: string;
  zoom_password?: string;
  video_url?: string;
  audio_url?: string;
  transcript_url?: string;
  duration_minutes?: number;
  downloads?: Array<{ title: string; url: string; type: string }>;
  order_index?: number;
  is_published?: boolean;
}

export interface BookGroupSessionUpdate extends Partial<BookGroupSessionCreate> {}

// Book Group Types
export interface BookGroup {
  id: string;
  slug: string;
  title: string;
  description?: string;
  short_description?: string;

  // Media
  hero_image?: string;
  book_cover_image?: string;
  thumbnail?: string;
  hero_image_gravity?: string;
  thumbnail_gravity?: string;

  // Status
  status: BookGroupStatus;
  is_featured: boolean;
  is_published: boolean;

  // Scheduling
  start_date?: string;
  end_date?: string;
  meeting_day_of_week?: string;
  meeting_time?: string;
  duration_minutes?: number;

  // Access
  requires_purchase: boolean;
  store_product_id?: string;

  // Content flags
  has_transcription: boolean;
  has_audio: boolean;
  has_downloads: boolean;

  created_at: string;
  updated_at: string;
}

export interface BookGroupCreate {
  slug: string;
  title: string;
  description?: string;
  short_description?: string;
  hero_image?: string;
  book_cover_image?: string;
  thumbnail?: string;
  hero_image_gravity?: string;
  thumbnail_gravity?: string;
  status?: BookGroupStatus;
  is_featured?: boolean;
  is_published?: boolean;
  start_date?: string;
  end_date?: string;
  meeting_day_of_week?: string;
  meeting_time?: string;
  duration_minutes?: number;
  requires_purchase?: boolean;
  store_product_id?: string;
  has_transcription?: boolean;
  has_audio?: boolean;
  has_downloads?: boolean;
}

export interface BookGroupUpdate extends Partial<BookGroupCreate> {}

// List View Types
export interface BookGroupCard {
  id: string;
  slug: string;
  title: string;
  short_description?: string;
  thumbnail?: string;
  thumbnail_gravity?: string;
  status: BookGroupStatus;
  session_count: number;
  has_video: boolean;
  has_audio: boolean;
  start_date?: string;
  is_featured: boolean;
}

export interface BookGroupListResponse {
  total: number;
  items: BookGroupCard[];
  page: number;
  page_size: number;
}

export interface FeaturedBookGroup {
  id: string;
  slug: string;
  title: string;
  description?: string;
  hero_image?: string;
  book_cover_image?: string;
  hero_image_gravity?: string;
  start_date: string;
  meeting_day_of_week?: string;
  meeting_time?: string;
  zoom_enabled: boolean;
  next_session_date?: string;
  days_until_next_session?: number;
}

// Portal View Types
export interface BookGroupPortal extends BookGroup {
  sessions: BookGroupSession[];
  session_count: number;
  has_access: boolean;
  access_type?: BookGroupAccessType;
}

// Access Control Types
export interface BookGroupAccessCheck {
  has_access: boolean;
  access_type?: BookGroupAccessType;
  reason?: string;
}

// Calendar Reminder Types
export interface CalendarReminderCreate {
  custom_title?: string;
}

export interface CalendarReminderResponse {
  success: boolean;
  message: string;
  calendar_id?: string;
}

// Admin Types
export interface BookGroupAdmin extends BookGroup {
  sessions: BookGroupSession[];
  session_count: number;
  access_count: number;
  store_product_title?: string;
}

export interface BookGroupMarkCompleted {
  replace_zoom_with_videos?: boolean;
}

export interface BookGroupConvertToProduct {
  product_title?: string;
  product_description?: string;
  price: number;
  regular_price?: number;
  member_discount?: number;
  categories?: string[];
  tags?: string[];
}
