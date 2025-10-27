import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import TeachingLibrarySection from '@/components/shared/TeachingLibrary';
import { getTeachingsData } from '@/lib/teachings-api';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Teachings Library | Dashboard | Sat Yoga',
  description: 'Access your personal teachings library with exclusive member content.',
};

export default async function DashboardTeachingsPage() {
  // Get authentication session
  const session = await getServerSession(authOptions);

  // Redirect if not logged in
  if (!session?.user) {
    redirect('/login?callbackUrl=/dashboard/user/teachings');
  }

  // Fetch teachings data (will show full library for logged-in users)
  const teachingLibraryData = await getTeachingsData(true);

  return (
    <div className="min-h-screen bg-[#FAF8F1]">
      <div className="max-w-[1312px] mx-auto px-4 lg:px-8 py-8">
        <h1
          className="mb-8"
          style={{
            fontFamily: 'Optima, Georgia, serif',
            fontSize: '32px',
            fontWeight: 700,
            lineHeight: '40px',
            color: '#000000',
          }}
        >
          Teachings Library
        </h1>

        <TeachingLibrarySection
          data={teachingLibraryData}
          showAllTeachings={true}
          listFormat="pagination"
          isDashboard={true}
        />
      </div>
    </div>
  );
}
