'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement password reset logic
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden relative">
      {/* Mobile Background Image */}
      <div className="absolute inset-0 lg:hidden">
        <Image
          src="https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/4f8ae861-9547-435c-f383-63b569b6dd00/public"
          alt="Spiritual meditation"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/75 to-black/80" />
      </div>

      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 lg:px-16 bg-transparent lg:bg-white overflow-y-auto relative z-10">
        <div className="w-full max-w-[480px] flex flex-col gap-6 py-8">
          {/* Section Title */}
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-4xl font-bold text-center leading-tight tracking-[-0.02em] text-white lg:text-black" style={{ fontFamily: 'Optima, serif' }}>
              Forgot Password
            </h1>
            <p className="text-base text-center text-white lg:text-[#414651]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success ? (
            <div className="flex flex-col gap-6">
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <p className="text-green-700 text-sm">
                  If an account exists with that email, we've sent password reset instructions.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full bg-white border border-[#D5D7DA] rounded-lg px-4 py-2.5 text-center font-semibold text-[#414651] hover:bg-gray-50 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-white lg:text-[#414651]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] text-base text-[#717680] placeholder:text-[#717680] focus:outline-none focus:ring-2 focus:ring-[#942017] focus:border-transparent"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Disabled Reset Button with Tooltip */}
              <div className="relative group">
                <button
                  type="button"
                  disabled
                  className="w-full bg-[#F5F5F5] border border-[#E9EAEB] rounded-lg px-4 py-2.5 font-semibold text-[#A4A7AE] cursor-not-allowed shadow-[0px_1px_2px_rgba(10,13,18,0.05)]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Reset Password
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Temporarily disabled
                </div>
              </div>

              <Link
                href="/login"
                className="text-center text-sm text-white lg:text-[#535862] hover:text-white lg:hover:text-[#AB261B] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Back to Login
              </Link>
            </form>
          )}

          {/* Footer */}
          <div className="flex items-center justify-center pt-4">
            <p className="text-sm text-center text-white lg:text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
              © Satyoga {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/84 to-black" />
        <Image
          src="https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/4f8ae861-9547-435c-f383-63b569b6dd00/public"
          alt="Spiritual meditation"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-24 left-0 right-0 flex flex-col items-center gap-3 px-8 z-10">
          <h2
            className="text-[69px] leading-[93px] text-center"
            style={{
              fontFamily: 'Cinzel Decorative, serif',
              background: 'linear-gradient(92.66deg, rgba(255, 255, 255, 0.9) 29.46%, rgba(255, 255, 255, 0.45) 92.26%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Sat Yoga
          </h2>
          <p
            className="text-[22px] leading-[120%] text-center max-w-[440px]"
            style={{
              fontFamily: 'Optima, serif',
              background: 'linear-gradient(92.66deg, rgba(255, 255, 255, 0.9) 29.46%, rgba(255, 255, 255, 0.45) 92.26%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Discover your true self through meditation and mindfulness
          </p>
        </div>
      </div>
    </div>
  );
};
