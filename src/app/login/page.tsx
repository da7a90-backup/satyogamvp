import { Metadata } from 'next';
import { Login } from '@/components/auth/AuthComponents';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const metadata: Metadata = {
  title: 'Login - Sat Yoga',
  description: 'Log in to your Sat Yoga account to access exclusive content, courses, and community resources.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Check if user is already authenticated
  const session = await getServerSession(authOptions);
  
  // If already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }
  
  // Pass any query parameters as props (like redirectTo or registered=true)
  const redirectTo = searchParams?.callbackUrl as string || '/dashboard';
  const registered = searchParams?.registered === 'true';
  
  return (
    <div className="min-h-screen flex flex-col justify-center py-12">
      <Login redirectTo={redirectTo} />
      
      {/* Display success message if user just registered */}
      {registered && (
        <div className="w-full max-w-md mx-auto mt-4 px-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-green-700">
              Account created successfully. Please log in with your credentials.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}