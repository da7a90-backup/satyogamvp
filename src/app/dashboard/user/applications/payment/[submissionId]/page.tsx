import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ApplicationPaymentClient from '@/components/forms/ApplicationPaymentClient';
import Script from 'next/script';

interface PageProps {
  params: Promise<{ submissionId: string }>;
}

export default async function ApplicationPaymentPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const { submissionId } = await params;

  if (!session) {
    redirect('/login?callbackUrl=/dashboard/user/applications');
  }

  return (
    <>
      {/* Load jQuery (required by Tilopay SDK) */}
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="beforeInteractive"
      />

      {/* Load Tilopay SDK */}
      <Script
        src="https://cdn.tilopay.com/resources/integration/scripts/tilopay-v2.min.js"
        strategy="afterInteractive"
      />

      <ApplicationPaymentClient submissionId={submissionId} session={session} />
    </>
  );
}
