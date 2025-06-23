export interface Teaching {
  // keys coming from lib/json_dump.ts
  id: string | null;                // cloudflare uid or null
  slug: string;
  title: string;
  description: string;
  summary?: string;
  additionalInfo?: string;

  contenttype: string;             // original enum
  contentType: 'Teachings' | 'Guided Meditations' | 'Q&A with Shunyamurti' | 'Essay';

  type: 'free' | 'membership';     // anon/free → free   |   others → membership
  duration: string;
  date: string;

  imageUrl: string;
  videoPlatform: 'cloudflare' | 'youtube' | 'rumble' | 'none';
  videoId: string | null;          // uid or youtube id
  videoUrl: string | null;
  audioPlatform: 'podbean' | 'direct' | 'none';
  audioUrl: string | null;

  transcription?: string;          // essays / text
  content?: unknown[];             // rich-text blocks, ignore here
  hiddenTags?: string;
}
