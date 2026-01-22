'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email for the correct link.');
        return;
      }

      try {
        const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
        const response = await fetch(`${FASTAPI_URL}/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Verification failed');
        }

        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        setEmail(data.email || '');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token, router]);

  const handleResendVerification = async () => {
    if (!email) {
      setResendMessage('Please enter your email address');
      return;
    }

    setResendLoading(true);
    setResendMessage('');

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resend verification email');
      }

      setResendMessage(data.message || 'Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setResendMessage(err.message || 'An error occurred');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FAF8F1] to-white px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          {status === 'loading' && (
            <div className="w-16 h-16 border-4 border-[#942017] border-t-transparent rounded-full animate-spin" />
          )}
          {status === 'success' && (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
          {status === 'loading' && 'Verifying your email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h1>

        {/* Message */}
        <p className="text-center text-gray-600 mb-6">
          {message}
        </p>

        {/* Actions */}
        {status === 'success' && (
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-[#942017] text-white text-center py-3 px-4 rounded-lg font-semibold hover:bg-[#7D1A13] transition-colors"
            >
              Go to Login
            </Link>
            <p className="text-sm text-center text-gray-500">
              Redirecting in 3 seconds...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            {/* Resend verification form */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3 text-center">
                Need a new verification link?
              </p>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-[#942017] focus:border-transparent"
              />
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  resendLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#942017] text-white hover:bg-[#7D1A13]'
                }`}
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              {resendMessage && (
                <p className={`mt-3 text-sm text-center ${resendMessage.includes('error') || resendMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                  {resendMessage}
                </p>
              )}
            </div>

            {/* Back to login */}
            <Link
              href="/login"
              className="block w-full bg-gray-100 text-gray-700 text-center py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#942017] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
