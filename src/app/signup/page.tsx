import { Metadata } from 'next';
import { Signup } from '@/components/auth/AuthComponents';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const metadata: Metadata = {
  title: 'Sign Up - Sat Yoga',
  description: 'Create an account to access exclusive content, courses, and community resources at Sat Yoga.',
};

export default async function SignupPage() {
  // Check if user is already authenticated
  const session = await getServerSession(authOptions);
  
  // If already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard');
  }
  
  return <Signup />;
}