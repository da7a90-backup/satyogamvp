// app/(main)/teachings/[id]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import TeachingDetail from '@/components/teachings/TeachingDetail';
import { teachings } from '@/lib/json_dump';           // ← local data

/* ---------------------------------------------------
 *  Dynamic metadata
 * --------------------------------------------------*/
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const post = teachings.find(t => t.slug === params.id);
  return {
    title: post ? `${post.title} | Sat Yoga` : 'Teaching – Sat Yoga',
    description:
      post?.summary ||
      post?.description ||
      'Explore wisdom teachings from Shunyamurti and the Sat Yoga Institute.',
  };
}

/* ---------------------------------------------------
 *  The page itself
 * --------------------------------------------------*/
export default function TeachingDetailPage(
  { params }: { params: { id: string } }
) {
  // use slug (“id” in the route) to find the record
  const teaching = teachings.find(t => t.slug === params.id);

  if (!teaching) {
    /* will render the built-in /404 page */
    notFound();
  }

  /* pass the full object to the client component */
  return <TeachingDetail teaching={teaching} />;
}
