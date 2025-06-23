// services/cloudflareStreamService.ts

/**
 * Service for Cloudflare Stream API integration
 */

const CLOUDFLARE_STREAM_TOKEN = '6PZUBMGApjO-FTZGt9yFMENyQ_fTSMG1mk2eIeA-';
const CLOUDFLARE_ACCOUNT_ID = '6ff5acb9f54ba5e1132b12c7a7732ab8'; // Your Cloudflare account ID

// Cache for video data
let videoCache: any[] = [];

export interface Teaching {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'free' | 'membership';
  imageUrl: string;
  videoId: string;
  contentType: string;
  date?: string;
  summary?: string;
  additionalInfo?: string;
}

/**
 * Fetch videos from Cloudflare Stream API
 */
export async function fetchStreamVideos(): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`,
      {
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching videos: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the video data
    if (data.result && Array.isArray(data.result)) {
      videoCache = data.result;
    }
    
    return data.result;
  } catch (error) {
    console.error('Failed to fetch videos from Cloudflare Stream:', error);
    return [];
  }
}

/**
 * Get details for a specific video
 */
export async function fetchVideoDetails(videoId: string): Promise<any | null> {
  if (!videoId) {
    console.error('Missing video ID in fetchVideoDetails');
    return null;
  }
  
  // First check if we have this video in the cache
  const cachedVideo = videoCache.find(video => video.uid === videoId);
  if (cachedVideo) {
    return cachedVideo;
  }
  
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        console.error(`Video not found: ${videoId}`);
        return null;
      }
      throw new Error(`Error fetching video details: ${response.status}`);
    }
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error(`Failed to fetch details for video ${videoId}:`, error);
    return null;
  }
}

/**
 * Get a Cloudflare Stream video URL
 */
export function getStreamVideoUrl(videoId: string): string {
  if (!videoId) {
    console.error('Missing video ID in getStreamVideoUrl');
    return '';
  }
  
  // Using standard Cloudflare Stream URL format
  return `https://${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
}

/**
 * Get a thumbnail URL for a video
 */
export function getStreamThumbnailUrl(videoId: string): string {
  if (!videoId) {
    console.error('Missing video ID in getStreamThumbnailUrl');
    return '/placeholder-video.jpg';
  }
  
  // Using the correct thumbnail URL format based on Cloudflare docs
  return `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg`;
}

/**
 * Fetch real videos from API and convert to our format
 */
export async function fetchAndProcessVideos(): Promise<Teaching[]> {
  try {
    const videos = await fetchStreamVideos();
    
    if (!videos || videos.length === 0) {
      console.warn('No videos found or error fetching videos');
      return [];
    }
    
    return videos.map((video: any, index: number) => {
      // First 3 videos are free, the rest require membership
      const isFree = index < 3;
      
      // Extract creation date if available
      const createdDate = video.created ? new Date(video.created) : new Date();
      const formattedDate = createdDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return {
        id: video.uid,
        title: video.meta?.name || `Teaching ${index + 1}`,
        description: video.meta?.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        duration: formatDuration(video.duration),
        type: isFree ? 'free' : 'membership',
        imageUrl: getStreamThumbnailUrl(video.uid),
        videoId: video.uid,
        contentType: 'Teachings',
        date: formattedDate
      };
    });
  } catch (error) {
    console.error('Error processing videos:', error);
    return [];
  }
}

/**
 * Get video IDs from the API or cache
 */
export async function getVideoIds(): Promise<string[]> {
  // If we have cached videos, use those
  if (videoCache.length > 0) {
    return videoCache.map(video => video.uid);
  }
  
  try {
    // Otherwise fetch videos from API
    const videos = await fetchStreamVideos();
    return videos.map(video => video.uid);
  } catch (error) {
    console.error('Error getting video IDs:', error);
    return [];
  }
}

/**
 * Format duration from seconds to "MM:SS" or "HH:MM:SS"
 */
export function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }
  
  return `${minutes} minutes`;
}