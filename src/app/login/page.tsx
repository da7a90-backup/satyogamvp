import { Metadata } from 'next';
import { Login } from '@/components/auth/AuthComponents';

export const metadata: Metadata = {
  title: 'Login - Sat Yoga',
  description: 'Log in to your Sat Yoga account to access exclusive content, courses, and community resources.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12">
      <Login />
    </div>
  );
}