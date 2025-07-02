import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TeachingDetailPage from '@/components/teachings/TeachingDetail';
import { teachingsApi, getStrapiMedia, Teaching as StrapiTeaching } from '@/lib/api';

// Default preview duration in seconds (5 minutes)
const DEFAULT_PREVIEW_DURATION = 30;

// Content type mapping to match UI expectations
const contentTypeMap = {
  teaching: 'Teachings',
  guided_meditation: 'Guided Meditations',
  qa_with_shunyamurti: 'Q&A with Shunyamurti',
  essay: 'Essay',
  book_group: 'Book Group',
} as const;

// Interface to match what the UI component expects
interface UITeaching {
  id: string | number;
  slug: string;
  title: string;
  description?: string;
  summary?: string;
  content?: any;
  duration?: string;
  type: 'free' | 'membership';
  access: string;
  contentType: string;
  date: string;
  publishDate: string;
  imageUrl: string;
  videoUrl?: string;
  videoPlatform: string;
  videoId?: string;
  audioUrl?: string;
  audioPlatform: string;
  hiddenTags?: string;
  previewDuration?: number;
  transcription?: string;
}

/**
 * Transform Strapi Teaching response to UI-compatible format
 * @param teaching - The Strapi teaching object
 * @param forceAsPreview - If true, mark as 'free' for preview functionality
 */
function transformTeachingForUI(teaching: StrapiTeaching, forceAsPreview = false): UITeaching {
  const { id, attributes } = teaching;
  
  // Extract image URL from Strapi's nested structure
  const imageUrl = attributes.featuredImage?.data?.attributes?.url 
    ? (getStrapiMedia(attributes.featuredImage.data.attributes.url) || '/placeholder-video.jpg')
    : '/placeholder-video.jpg';

  // Map access level to type for UI
  let type: 'free' | 'membership';
  if (forceAsPreview) {
    // Preview teachings are shown as "free" to users but with preview functionality
    type = 'free';
  } else {
    // Keep original access level mapping
    type = (attributes.access === 'anon' || attributes.access === 'free') 
      ? 'free' 
      : 'membership';
  }

  // Prioritize publishDate, then publishedAt, then createdAt for both display and sorting
  const publishDateString = attributes.publishDate || attributes.createdAt;
  const publishDate = new Date(publishDateString).toISOString();
  
  const date = new Date(publishDateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Map content type to display name
  const contentType = contentTypeMap[attributes.contenttype] || attributes.contenttype;

  return {
    id: id,
    slug: attributes.slug,
    title: attributes.title,
    description: attributes.description,
    summary: attributes.summary,
    content: attributes.content,
    duration: attributes.duration || '',
    type,
    access: attributes.access,
    contentType,
    date,
    publishDate,
    imageUrl,
    videoUrl: attributes.videoUrl,
    videoPlatform: attributes.videoPlatform,
    videoId: attributes.videoId,
    audioUrl: attributes.audioUrl,
    audioPlatform: attributes.audioPlatform,
    hiddenTags: attributes.hiddenTags,
    previewDuration: attributes.previewDuration || DEFAULT_PREVIEW_DURATION,
    transcription: attributes.transcription,
  };
}

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const teaching = await teachingsApi.getTeachingBySlug(params.id);
    
    if (!teaching) {
      return {
        title: 'Teaching Not Found - Sat Yoga',
        description: 'The requested teaching could not be found.',
      };
    }

    return {
      title: `${teaching.attributes.title} - Sat Yoga`,
      description: teaching.attributes.description || teaching.attributes.summary || 'A teaching from Shunyamurti',
    };
  } catch (error) {
    return {
      title: 'Teaching - Sat Yoga',
      description: 'A teaching from Shunyamurti',
    };
  }
}

export default async function TeachingPage({ params }: PageProps) {
  try {
    // Fetch the teaching by slug
    const teachingData = await teachingsApi.getTeachingBySlug(params.id);
    
    if (!teachingData) {
      notFound();
    }

    // Transform the data to UI format
    const teaching = transformTeachingForUI(teachingData, false);

    // Fetch related teachings from the same content type
    let relatedTeachings: UITeaching[] = [];
    try {
      // Map UI content type back to Strapi content type
      const contentTypeToStrapiMap: Record<string, string> = {
        'Teachings': 'teaching',
        'Guided Meditations': 'guided_meditation',
        'Q&A with Shunyamurti': 'qa_with_shunyamurti',
        'Essay': 'essay',
        'Book Group': 'book_group',
      };

      const strapiContentType = contentTypeToStrapiMap[teaching.contentType];
      
      if (strapiContentType) {
        const relatedResponse = await teachingsApi.getTeachings(
          1, // page
          6, // pageSize - get 6 related teachings
          { 
            contenttype: strapiContentType as any,
            // We can't easily exclude current teaching at this level without making the API more complex
          },
          'publishDate:desc'
        );

        if (relatedResponse.data) {
          relatedTeachings = relatedResponse.data
            .filter(t => t.id !== teaching.id) // Exclude current teaching
            .slice(0, 6) // Limit to 6
            .map(t => transformTeachingForUI(t, false));
        }
      }
    } catch (error) {
      console.error('Error fetching related teachings:', error);
      // Continue with empty related teachings if there's an error
    }

    return (
      <TeachingDetailPage 
        teaching={teaching} 
        relatedTeachings={relatedTeachings}
      />
    );
  } catch (error) {
    console.error('Error fetching teaching:', error);
    notFound();
  }
}