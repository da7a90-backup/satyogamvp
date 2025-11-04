import { Metadata } from 'next';
import { ForgotPassword } from '@/components/auth/ForgotPassword';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const metadata: Metadata = {
  title: 'Forgot Password - Sat Yoga',
  description: 'Reset your Sat Yoga account password.',
};

export default async function ForgotPasswordPage() {
  // Check if user is already authenticated
  const session = await getServerSession(authOptions);

  // If already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }

  return <ForgotPassword />;
}
