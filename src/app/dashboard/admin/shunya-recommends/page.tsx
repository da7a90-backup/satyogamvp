import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ShunyaRecommendsAdminClient from '@/components/dashboard/admin/ShunyaRecommendsAdminClient';
import { getRecommendationsAdmin } from '@/lib/recommendations-api';

export const dynamic = 'force-dynamic';

export default async function ShunyaRecommendsAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  // Check if user is admin
  if ((session.user as any).role !== 'admin') {
    redirect('/dashboard/user');
  }

  const accessToken = session.user.accessToken;

  if (!accessToken) {
    console.error('No access token available in session');
    return (
      <div className="min-h-screen bg-[#FAF8F1] p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-[#000000] mb-4">
            Shunyamurti Recommends Management
          </h1>
          <p className="text-[#717680]">
            Authentication error. Please try logging in again.
          </p>
        </div>
      </div>
    );
  }

  // Fetch all recommendations
  let recommendations = [];
  let errorMessage = '';

  try {
    const data = await getRecommendationsAdmin(accessToken, { limit: 1000 });
    recommendations = data.recommendations;
  } catch (error: any) {
    console.error('Error fetching recommendations:', error);
    errorMessage = 'Failed to load recommendations. Please try again later.';
  }

  return (
    <ShunyaRecommendsAdminClient
      initialRecommendations={recommendations}
      errorMessage={errorMessage}
    />
  );
}
