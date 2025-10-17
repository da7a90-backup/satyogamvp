import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { data } from '@/lib/data';
import type { Metadata } from 'next';
import TeachingDetailPageClient from './TeachingDetailPageClient';
import { RawData, transformAllTeachings } from '@/lib/teachingTransformer';
import { TeachingData } from '@/types/Teachings';

// Transform raw data to TeachingData format for detail pages
export const teachings: TeachingData[] = transformAllTeachings(data.data as RawData);

export async function generateStaticParams() {
  return teachings.map((teaching: { slug: any; }) => ({
    slug: teaching.slug,
  }));
}

export async function generateMetadata({ 
    params 
  }: { 
    params: Promise<{ slug: string }> 
  }): Promise<Metadata> {
    const { slug } = await params;
    const teaching = teachings.find((t) => t.slug === slug);
  
    if (!teaching) {
      return { title: 'Teaching Not Found' };
    }
  
    // Get image URL safely
    const imageUrl = teaching.featured_media?.url || teaching.imageUrl || '';
  
    return {
      title: `${teaching.title} | Sat Yoga Institute`,
      description: teaching.excerpt_text || teaching.summary || teaching.description,
      openGraph: {
        title: teaching.title,
        description: teaching.excerpt_text || teaching.summary || teaching.description,
        images: imageUrl ? [imageUrl] : [],
        type: 'video.other',
      },
    };
  }

  export default async function TeachingPage({ 
    params 
  }: { 
    params: Promise<{ slug: string }> 
  }) {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session?.user;
    const teaching = teachings.find((t: { slug: string; }) => t.slug === slug);
  
    if (!teaching) {
      notFound();
    }
  
    // Get related teachings
    const relatedTeachings = teachings
      .filter(t => t.content_type === teaching.content_type && t.id !== teaching.id)
      .slice(0, 10);
  
    return (
      <TeachingDetailPageClient
        data={teaching}
        relatedTeachings={relatedTeachings}
        isAuthenticated={isAuthenticated}
      />
    );
  }