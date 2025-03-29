// app/signup/page.tsx
import { Metadata } from 'next';
import { Signup } from '@/components/auth/AuthComponents';

export const metadata: Metadata = {
  title: 'Sign Up - Sat Yoga',
  description: 'Create an account to join the Sat Yoga community and access exclusive spiritual content and resources.',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12">
      <Signup />
    </div>
  );
}
