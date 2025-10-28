// Rich Text Block Types (Strapi format)
export interface TextNode {
    type: 'text';
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  }
  
  export interface ParagraphBlock {
    type: 'paragraph';
    children: TextNode[];
  }
  
  export interface HeadingBlock {
    type: 'heading';
    level: 1 | 2 | 3 | 4 | 5 | 6;
    children: TextNode[];
  }
  
  export interface ListItemBlock {
    type: 'list-item';
    children: TextNode[];
  }
  
  export interface ListBlock {
    type: 'list';
    format: 'ordered' | 'unordered';
    children: ListItemBlock[];
  }
  
  export interface QuoteBlock {
    type: 'quote';
    children: TextNode[];
  }
  
  export interface CodeBlock {
    type: 'code';
    language?: string;
    children: TextNode[];
  }
  
  export interface ImageBlock {
    type: 'image';
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  }
  
  export interface LinkBlock {
    type: 'link';
    url: string;
    children: TextNode[];
  }
  
  export type RichTextBlock = 
    | ParagraphBlock 
    | HeadingBlock 
    | ListBlock 
    | QuoteBlock 
    | CodeBlock 
    | ImageBlock 
    | LinkBlock;
  
  // Main Teaching Data Interface
  export interface TeachingData {
    id: string | number;
    type: 'free' | 'post';
    accessType: 'free' | 'restricted';
    slug: string;
    link: string;
    date: string;
    date_gmt: string;
    modified: string;
    modified_gmt: string;
    title: string;
    excerpt_text?: string;
    content_text?: string;
    
    // Media
    featured_media?: {
      id: number;
      url: string;
      alt: string;
      mime_type: string;
    };
    
    // Video/Audio IDs
    youtube_ids?: string[];
    cloudflare_ids?: string[];
    podbean_ids?: string[];
    
    // Content type
    content_type: 'video_teaching' | 'guided_meditation' | 'essay' | 'qa';
    
    // Categories and Tags
    category_ids?: number[];
    tag_ids?: number[];
    categories?: Array<{ id: number; name: string; slug: string }>;
    tags?: Array<{ id: number; name: string; slug: string }>;
    
    // Author
    author?: {
      id: number;
      name: string | null;
      slug: string | null;
      url: string | null;
    };
    
    // Legacy fields for backwards compatibility
    description?: string;
    summary?: string;
    content?: RichTextBlock[];
    transcription?: string;
    duration?: string;
    imageUrl?: string;
    
    // Video configuration (legacy)
    videoPlatform?: 'youtube' | 'rumble' | 'cloudflare' | 'none';
    videoId?: string;
    videoUrl?: string;
    
    // Audio configuration (legacy)
    audioPlatform?: 'podbean' | 'direct' | 'none';
    audioUrl?: string;
    
    // Preview settings
    preview_duration?: number; // in minutes (public preview)
    dash_preview_duration?: number; // in minutes (logged-in dashboard preview)
    hiddenTags?: string;
  }
  
  // Component Props Interface
  export interface TeachingDetailPageProps {
    data: TeachingData;
    isAuthenticated: boolean;
    onLoginClick: () => void;
    onSignupClick: () => void;
  }
  
  // Additional helper types
  export type MediaType = 'video' | 'audio' | 'text' | 'none';
  export type AccessLevel = 'free' | 'restricted';
  export type TabType = 'description' | 'transcription' | 'audio' | 'comments';