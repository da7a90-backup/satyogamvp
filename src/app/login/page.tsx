import { Metadata } from 'next';
import { Login } from '@/components/auth/AuthComponents';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const metadata: Metadata = {
  title: 'Login - Sat Yoga',
  description: 'Log in to your Sat Yoga account to access exclusive content, courses, and community resources.',
};

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Check if user is already authenticated
  const session = await getServerSession(authOptions);

  // If already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }

  // Await searchParams (Next.js 15 pattern)
  const resolvedSearchParams = await searchParams;

  // Pass any query parameters as props (like redirectTo or registered=true)
  const redirectTo = resolvedSearchParams?.callbackUrl as string || '/dashboard';
  const registered = resolvedSearchParams?.registered === 'true';
  
  return (
    <>
      <Login redirectTo={redirectTo} />

      {/* Display success message if user just registered */}
      {registered && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 shadow-lg rounded-lg">
            <p className="text-green-700">
              Account created successfully. Please log in with your credentials.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
