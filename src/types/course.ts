/**
 * Course-related TypeScript interfaces
 * These match the backend API responses from FastAPI
 */

export enum ComponentCategory {
  VIDEO_LESSON = "video_lesson",
  KEY_CONCEPTS = "key_concepts",
  WRITING_PROMPTS = "writing_prompts",
  ADDITIONAL_MATERIALS = "additional_materials",
  INTRODUCTION = "introduction",
  COMPLETION = "completion",
  ADDENDUM = "addendum",
}

export enum CourseStructure {
  PRINCIPLES_PRACTICE = "principles_practice",
  FUNDAMENTALS_MEDITATION = "fundamentals_meditation",
}

export interface Instructor {
  id: string;
  name: string;
  bio?: string;
  photo_url?: string;
}

export interface ComponentProgress {
  completed: boolean;
  progress_percentage: number;
  last_accessed?: string;
  video_timestamp?: number;
}

export interface SubComponent {
  id: string;
  title: string;
  type?: string;
  component_category?: ComponentCategory;
  content?: string;
  cloudflare_stream_uid?: string;
  duration?: number;
  description?: string;
  audio_url?: string;
  essay_content?: string;
}

export interface CourseComponent {
  id: string;
  class_id: string;
  title: string;
  type?: string;
  component_category?: ComponentCategory;
  content?: string;
  cloudflare_stream_uid?: string;
  duration?: number;
  order_index: number;
  component_index_in_class?: number;
  description?: string;
  transcription?: string;
  essay_content?: string;
  audio_url?: string;
  has_tabs: boolean;
  progress: ComponentProgress;
  sub_components?: SubComponent[];
  class?: {
    id: string;
    title: string;
    order_index: number;
  };
}

export interface CourseClass {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  duration: number;
  components: CourseComponent[];
}

export interface CourseInstructor {
  name: string;
  bio: string;
  photo_url?: string;
}

export interface WhatYouWillLearnItem {
  title: string;
  description: string;
  is_expandable?: boolean;
}

export interface CourseIncludesItem {
  icon?: string;
  title: string;
  description?: string;
}

export interface SyllabusLesson {
  lesson_number: number;
  title: string;
  duration: string;
  lectures_count: number;
  lesson_items: string[];
  additional_materials?: Array<{
    type: 'video' | 'essay' | 'meditation';
    title: string;
  }>;
}

export interface Testimonial {
  name: string;
  role?: string;
  text: string;
  avatar_url?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SellingPageData {
  // Hero section
  hero_image_url?: string;
  hero_cloudflare_image_id?: string;
  short_description?: string;

  // Video introduction
  intro_video_cloudflare_uid?: string;
  intro_video_title?: string;
  intro_video_description?: string;

  // Course statistics
  total_duration?: string;
  total_lectures?: number;

  // What you will learn section
  what_you_will_learn?: WhatYouWillLearnItem[];

  // Course includes/features
  course_includes?: CourseIncludesItem[];

  // Gallery/preview images
  gallery_images?: Array<{
    url?: string;
    cloudflare_image_id?: string;
    alt?: string;
  }>;

  // Featured quote (between gallery and instructors)
  featured_quote?: {
    text: string;
    author?: string;
    author_role?: string;
  };

  // Instructors
  instructors?: CourseInstructor[];

  // Syllabus/FAQ accordion
  syllabus?: SyllabusLesson[];

  // Student testimonials
  testimonials?: Testimonial[];

  // FAQ section
  faq?: FAQItem[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  cloudflare_image_id?: string;
  price: number;
  instructor?: Instructor;
  is_published: boolean;
  difficulty_level?: string;
  structure_template?: CourseStructure;
  selling_page_data?: SellingPageData;
  can_access: boolean;
  is_enrolled: boolean;
  enrolled_at?: string;
  progress_percentage?: number;
  total_duration: number;
  classes?: CourseClass[];
}

export interface ComponentNavigation {
  previous?: {
    id: string;
    title: string;
    component_category?: ComponentCategory;
  };
  next?: {
    id: string;
    title: string;
    component_category?: ComponentCategory;
  };
  current_index: number;
  total_components: number;
}

export interface CourseComment {
  id: string;
  user_id: string;
  user_name: string;
  user_photo?: string;
  component_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentResponse {
  comments: CourseComment[];
  total: number;
}
