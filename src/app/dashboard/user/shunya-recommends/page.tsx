import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ShunyaRecommendsClient from '@/components/dashboard/ShunyaRecommendsClient';
import { getRecommendations } from '@/lib/recommendations-api';

export default async function ShunyaRecommendsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const accessToken = session.user.accessToken;

  if (!accessToken) {
    console.error('No access token available in session');
    return (
      <div className="min-h-screen bg-[#FAF8F1] p-8">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-4xl font-bold text-[#000000] mb-4"
            style={{ fontFamily: 'Optima, serif' }}
          >
            Shunyamurti Recommends
          </h1>
          <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            Authentication error. Please try logging in again.
          </p>
        </div>
      </div>
    );
  }

  // Try to fetch recommendations - will fail with 403 if user is not GYANI+
  let recommendations = [];
  let hasAccess = true;
  let errorMessage = '';

  try {
    const data = await getRecommendations(accessToken, { limit: 100 });
    recommendations = data.recommendations;
  } catch (error: any) {
    if (error.message === 'GYANI_PLUS_REQUIRED') {
      hasAccess = false;
      errorMessage = 'This feature requires Gyani membership or higher. Please upgrade your membership to access Shunyamurti Recommends.';
    } else {
      console.error('Error fetching recommendations:', error);
      errorMessage = 'Failed to load recommendations. Please try again later.';
    }
  }

  return (
    <ShunyaRecommendsClient
      initialRecommendations={recommendations}
      hasAccess={hasAccess}
      errorMessage={errorMessage}
      userMembershipTier={session.user.membership_tier || 'FREE'}
    />
  );
}
