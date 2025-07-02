import { Metadata } from 'next';
import TeachingLibraryPage from '@/components/teachings/Teachings';
import { teachingsApi, Teaching, getStrapiMedia } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Teachings Library - Sat Yoga',
  description: 'Explore our collection of teachings, guided meditations, and wisdom from Shunyamurti to support your spiritual journey.',
};

// Default preview duration in seconds (30 seconds)
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
  type: 'free' | 'extra_preview' | 'membership';  // Updated to include extra_preview
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
 */
function transformTeachingForUI(teaching: Teaching, forceType?: 'free' | 'extra_preview' | 'membership'): UITeaching {
  const { id, attributes } = teaching;
  
  // Extract image URL from Strapi's nested structure
  const imageUrl = attributes.featuredImage?.data?.attributes?.url 
    ? (getStrapiMedia(attributes.featuredImage.data.attributes.url) || '/placeholder-video.jpg')
    : '/placeholder-video.jpg';

  // Determine display type
  let type: 'free' | 'extra_preview' | 'membership';
  if (forceType) {
    type = forceType;
  } else {
    const tags = attributes.hiddenTags?.toLowerCase() || '';
    if (tags.includes('preview')) {
      type = 'free';
    } else if (tags.includes('extra_preview')) {
      type = 'extra_preview';
    } else {
      type = 'membership';
    }
  }

  const publishDateString = attributes.publishDate || attributes.createdAt;
  const publishDate = new Date(publishDateString).toISOString();
  
  const date = new Date(publishDateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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

/**
 * Fetch content for all user types: preview + extra_preview + membership
 */
async function fetchAllContent() {
  try {
    console.log('\n=== FETCHING ALL CONTENT FOR MEMBERSHIP LEVELS ===');
    
    // STEP 1: Try to fetch different types of content specifically
    console.log('\n--- STEP 1: SEARCHING FOR TAGGED ITEMS ---');
    
    let teachingPreviews, meditationPreviews, qnaPreviews, essayPreviews: string | any[];
    let teachingExtraPreviews, meditationExtraPreviews, qnaExtraPreviews, essayExtraPreviews: string | any[];
    
    try {
      // Fetch preview items
      [teachingPreviews, meditationPreviews, qnaPreviews, essayPreviews] = await Promise.all([
        teachingsApi.getTeachingsByHiddenTags('preview_teaching', 10),
        teachingsApi.getTeachingsByHiddenTags('preview_guided_meditation', 10),
        teachingsApi.getTeachingsByHiddenTags('preview_qa', 10),
        teachingsApi.getTeachingsByHiddenTags('preview_essay', 10),
      ]);

      // Fetch extra_preview items
      [teachingExtraPreviews, meditationExtraPreviews, qnaExtraPreviews, essayExtraPreviews] = await Promise.all([
        teachingsApi.getTeachingsByHiddenTags('extra_preview_teaching', 10),
        teachingsApi.getTeachingsByHiddenTags('extra_preview_guided_meditation', 10),
        teachingsApi.getTeachingsByHiddenTags('extra_preview_qa', 10),
        teachingsApi.getTeachingsByHiddenTags('extra_preview_essay', 10),
      ]);
    } catch (error) {
      console.log('⚠️ getTeachingsByHiddenTags method not available, falling back to manual filtering');
      teachingPreviews = meditationPreviews = qnaPreviews = essayPreviews = [];
      teachingExtraPreviews = meditationExtraPreviews = qnaExtraPreviews = essayExtraPreviews = [];
    }

    console.log('Preview items found:');
    console.log('  Teaching:', teachingPreviews?.length || 0);
    console.log('  Meditation:', meditationPreviews?.length || 0);
    console.log('  Q&A:', qnaPreviews?.length || 0);
    console.log('  Essay:', essayPreviews?.length || 0);

    console.log('Extra preview items found:');
    console.log('  Teaching:', teachingExtraPreviews?.length || 0);
    console.log('  Meditation:', meditationExtraPreviews?.length || 0);
    console.log('  Q&A:', qnaExtraPreviews?.length || 0);
    console.log('  Essay:', essayExtraPreviews?.length || 0);

    // STEP 2: Fetch regular content for each category
    console.log('\n--- STEP 2: FETCHING REGULAR CONTENT ---');
    const [teachingAll, meditationAll, qnaAll, essayAll] = await Promise.all([
      teachingsApi.getTeachings(1, 100, { contenttype: 'teaching' }, 'publishDate:desc'),
      teachingsApi.getTeachings(1, 100, { contenttype: 'guided_meditation' }, 'publishDate:desc'),
      teachingsApi.getTeachings(1, 100, { contenttype: 'qa_with_shunyamurti' }, 'publishDate:desc'),
      teachingsApi.getTeachings(1, 100, { contenttype: 'essay' }, 'publishDate:desc'),
    ]);

    console.log('Regular content fetched:');
    console.log('  Teaching:', teachingAll.data?.length || 0);
    console.log('  Meditation:', meditationAll.data?.length || 0);
    console.log('  Q&A:', qnaAll.data?.length || 0);
    console.log('  Essay:', essayAll.data?.length || 0);

    // Process each category
    const categorizeTeachings = (
      regularTeachings: Teaching[], 
      previewTeachings: Teaching[], 
      extraPreviewTeachings: Teaching[],
      categoryName: string, 
      expectedPreviewTag: string,
      expectedExtraPreviewTag: string
    ) => {
      console.log(`\n--- PROCESSING ${categoryName.toUpperCase()} ---`);
      
      let preview = previewTeachings.slice(0, 3);
      let extraPreview = extraPreviewTeachings.slice(0, 3);
      
      // If we don't have preview items from the specific search, try to find them in regular items
      if (preview.length === 0) {
        console.log(`No specific preview items found, searching in regular items for "${expectedPreviewTag}"`);
        preview = regularTeachings.filter(t => {
          const tags = t.attributes.hiddenTags?.toLowerCase() || '';
          return tags.includes(expectedPreviewTag.toLowerCase()) || tags.includes('preview');
        }).slice(0, 3);
      }

      // If we don't have extra_preview items from the specific search, try to find them in regular items
      if (extraPreview.length === 0) {
        console.log(`No specific extra_preview items found, searching in regular items for "${expectedExtraPreviewTag}"`);
        extraPreview = regularTeachings.filter(t => {
          const tags = t.attributes.hiddenTags?.toLowerCase() || '';
          return tags.includes(expectedExtraPreviewTag.toLowerCase()) || tags.includes('extra_preview');
        }).slice(0, 3);
      }
      
      // For regular items, exclude any that are already in preview or extra_preview
      const usedIds = new Set([...preview.map(p => p.id), ...extraPreview.map(ep => ep.id)]);
      const regular = regularTeachings.filter(t => !usedIds.has(t.id)).slice(0, 20); // Get more for logged-in users

      console.log(`${categoryName} RESULTS:`);
      console.log(`  Preview items: ${preview.length}`);
      console.log(`  Extra preview items: ${extraPreview.length}`);
      console.log(`  Regular items: ${regular.length}`);

      return { preview, extraPreview, regular };
    };

    // Process each category
    const teachingCategorized = categorizeTeachings(
      teachingAll.data || [], teachingPreviews || [], teachingExtraPreviews || [],
      'teaching', 'preview_teaching', 'extra_preview_teaching'
    );
    const meditationCategorized = categorizeTeachings(
      meditationAll.data || [], meditationPreviews || [], meditationExtraPreviews || [],
      'meditation', 'preview_guided_meditation', 'extra_preview_guided_meditation'
    );
    const qnaCategorized = categorizeTeachings(
      qnaAll.data || [], qnaPreviews || [], qnaExtraPreviews || [],
      'qna', 'preview_qa', 'extra_preview_qa'
    );
    const essayCategorized = categorizeTeachings(
      essayAll.data || [], essayPreviews || [], essayExtraPreviews || [],
      'essay', 'preview_essay', 'extra_preview_essay'
    );

    // Transform to UI format
    const previewTeachings = [
      ...teachingCategorized.preview.map(t => transformTeachingForUI(t, 'free')),
      ...meditationCategorized.preview.map(t => transformTeachingForUI(t, 'free')),
      ...qnaCategorized.preview.map(t => transformTeachingForUI(t, 'free')),
      ...essayCategorized.preview.map(t => transformTeachingForUI(t, 'free')),
    ];

    const extraPreviewTeachings = [
      ...teachingCategorized.extraPreview.map(t => transformTeachingForUI(t, 'extra_preview')),
      ...meditationCategorized.extraPreview.map(t => transformTeachingForUI(t, 'extra_preview')),
      ...qnaCategorized.extraPreview.map(t => transformTeachingForUI(t, 'extra_preview')),
      ...essayCategorized.extraPreview.map(t => transformTeachingForUI(t, 'extra_preview')),
    ];

    const membershipTeachings = [
      ...teachingCategorized.regular.map(t => transformTeachingForUI(t, 'membership')),
      ...meditationCategorized.regular.map(t => transformTeachingForUI(t, 'membership')),
      ...qnaCategorized.regular.map(t => transformTeachingForUI(t, 'membership')),
      ...essayCategorized.regular.map(t => transformTeachingForUI(t, 'membership')),
    ];

    console.log('\n=== FINAL CONTENT SUMMARY ===');
    console.log('Preview teachings by category:');
    ['Teachings', 'Guided Meditations', 'Q&A with Shunyamurti', 'Essay'].forEach(category => {
      const preview = previewTeachings.filter(t => t.contentType === category);
      const extraPreview = extraPreviewTeachings.filter(t => t.contentType === category);
      const membership = membershipTeachings.filter(t => t.contentType === category);
      console.log(`  ${category}: ${preview.length} preview, ${extraPreview.length} extra_preview, ${membership.length} membership`);
    });

    return {
      preview: previewTeachings,
      extraPreview: extraPreviewTeachings,
      membership: membershipTeachings
    };
  } catch (error) {
    console.error('❌ Error fetching all content:', error);
    return {
      preview: [],
      extraPreview: [],
      membership: []
    };
  }
}

export default async function TeachingsPage() {
  try {
    console.log('\n🚀 STARTING TEACHINGS PAGE FETCH WITH MEMBERSHIP LEVELS');
    
    // Fetch all content types
    const allContent = await fetchAllContent();
    
    // Combine all teachings
    const combinedTeachings = [
      ...allContent.preview,
      ...allContent.extraPreview,
      ...allContent.membership,
    ];
    
    // Remove duplicates based on ID
    const uniqueTeachings = combinedTeachings.filter((teaching, index, self) => 
      index === self.findIndex(t => t.id === teaching.id)
    );

    // Sort by publishDate (newest first) 
    uniqueTeachings.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    
    console.log('\n=== FINAL SUMMARY ===');
    console.log(`Total unique teachings: ${uniqueTeachings.length}`);
    console.log('Breakdown:');
    console.log(`  Preview: ${allContent.preview.length}`);
    console.log(`  Extra Preview: ${allContent.extraPreview.length}`);
    console.log(`  Membership: ${allContent.membership.length}`);
    console.log(`  After deduplication: ${uniqueTeachings.length}`);

    // Show breakdown by category and type
    const categories = ['Teachings', 'Guided Meditations', 'Q&A with Shunyamurti', 'Essay'];
    categories.forEach(category => {
      const categoryTeachings = uniqueTeachings.filter(t => t.contentType === category);
      const free = categoryTeachings.filter(t => t.type === 'free');
      const extraPreview = categoryTeachings.filter(t => t.type === 'extra_preview');
      const membership = categoryTeachings.filter(t => t.type === 'membership');
      console.log(`  ${category}: ${categoryTeachings.length} total (${free.length} free, ${extraPreview.length} extra_preview, ${membership.length} membership)`);
    });
    
    return <TeachingLibraryPage initialTeachings={uniqueTeachings} />;
  } catch (error) {
    console.error('❌ Error in TeachingsPage:', error);
    return <TeachingLibraryPage initialTeachings={[]} />;
  }
}