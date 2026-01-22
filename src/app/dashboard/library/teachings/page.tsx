import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import TeachingLibrarySection from '@/components/shared/TeachingLibrary';
import { getTeachingsData } from '@/lib/teachings-api';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teachings Portal | Dashboard',
  description: 'Access your teachings library and continue your learning journey.',
};

export const dynamic = 'force-dynamic';

export default async function UserTeachingsPage() {
  // Check authentication
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?redirect=/dashboard/user/teachings');
  }

  // Fetch teachings data from backend API
  const teachingLibraryData = await getTeachingsData(true); // User is logged in

  return (
    <div className="min-h-screen bg-[#FAF8F1]">
      <div className="max-w-[1312px] mx-auto px-4 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: '32px',
              fontWeight: 700,
              lineHeight: '40px',
              color: '#000000',
              marginBottom: '8px'
            }}
          >
            Teachings Library
          </h1>
          <p
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: '#535862'
            }}
          >
            Explore our full collection of teachings, meditations, and essays.
          </p>
        </div>

        {/* Teachings Library */}
        <TeachingLibrarySection
          data={teachingLibraryData}
          showAllTeachings={true}
          listFormat="pagination"
          userTier={session.user.membershipTier}
          isDashboard={true}
        />
      </div>
    </div>
  );
}
