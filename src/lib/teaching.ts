import type { TeachingData } from '@/types/Teachings';
import { transformAllTeachings, type RawData } from '@/lib/teachingTransformer';
import { data } from '@/lib/data';

// Transform raw data to TeachingData format for detail pages
export const teachings: TeachingData[] = transformAllTeachings(data.data as RawData);

// Helper function to get teaching by slug
export function getTeachingBySlug(slug: string): TeachingData | undefined {
  return teachings.find(t => t.slug === slug);
}