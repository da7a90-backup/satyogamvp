// app/membership/register/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import MembershipRegisterComponent from '@/components/membership/MembershipRegisterComponent';

// Metadata for the page
export const metadata: Metadata = {
  title: 'Register for Membership - Sat Yoga',
  description: 'Create your account and join our spiritual community at Sat Yoga.'
};

// Server component that checks session and renders the client component
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Check if user is already logged in
  const session = await getServerSession(authOptions);
  
  // If user is logged in, redirect to checkout page with same params
  if (session) {
    const planParam = searchParams.plan ? `plan=${searchParams.plan}` : '';
    const billingParam = searchParams.billing ? `billing=${searchParams.billing}` : '';
    const queryString = [planParam, billingParam].filter(Boolean).join('&');
    
    const redirectUrl = `/membership/checkout${queryString ? `?${queryString}` : ''}`;
    redirect(redirectUrl);
  }
  
  return <MembershipRegisterComponent />;
}