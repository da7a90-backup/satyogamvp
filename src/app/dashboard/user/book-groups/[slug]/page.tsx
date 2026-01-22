import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import BookGroupPortalClient from '@/components/dashboard/book-groups/BookGroupPortalClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookGroupPortalPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <BookGroupPortalClient
      slug={slug}
      isAuthenticated={!!session}
      userJwt={session.user.accessToken || null}
    />
  );
}
