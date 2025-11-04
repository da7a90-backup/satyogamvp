'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Common Form Input Component
interface FormInputProps {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  required = true,
  autoComplete,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-white lg:text-[#414651]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-3.5 py-2 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] text-base text-[#717680] placeholder:text-[#717680] focus:outline-none focus:ring-2 focus:ring-[#942017] focus:border-transparent"
        style={{ fontFamily: 'Avenir Next, sans-serif' }}
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
};

// Social Auth Button (Disabled)
interface SocialAuthButtonProps {
  provider: 'google' | 'facebook' | 'apple';
  onClick: () => void;
}

const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({ provider, onClick }) => {
  const getProviderDetails = () => {
    switch (provider) {
      case 'google':
        return {
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-50">
              <path d="M23.04 12.2614C23.04 11.4459 22.9668 10.6618 22.8309 9.90918H12V14.3575H18.1891C17.9225 15.795 17.1123 17.013 15.8943 17.8284V20.7139H19.6109C21.7855 18.7118 23.04 15.7637 23.04 12.2614Z" fill="#4285F4"/>
              <path d="M12 23.4998C15.105 23.4998 17.7081 22.47 19.6109 20.7137L15.8943 17.8282C14.8645 18.5182 13.5472 18.9259 12 18.9259C9.00474 18.9259 6.46951 16.903 5.56519 14.1848H1.72314V17.1644C3.61542 20.9228 7.50451 23.4998 12 23.4998Z" fill="#34A853"/>
              <path d="M5.56523 14.1851C5.33523 13.4951 5.20455 12.758 5.20455 12.0001C5.20455 11.2421 5.33523 10.5051 5.56523 9.81506V6.83545H1.72318C0.944318 8.38802 0.5 10.1444 0.5 12.0001C0.5 13.8557 0.944318 15.6121 1.72318 17.1647L5.56523 14.1851Z" fill="#FBBC04"/>
              <path d="M12 5.07386C13.6884 5.07386 15.2043 5.65409 16.3961 6.79364L19.6945 3.49523C17.7029 1.63955 15.0997 0.5 12 0.5 7.50451 0.5 3.61542 3.07705 1.72314 6.83545L5.56519 9.815C6.46951 7.09682 9.00474 5.07386 12 5.07386Z" fill="#EA4335"/>
            </svg>
          ),
          text: 'Sign in with Google',
        };
      case 'facebook':
        return {
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-50">
              <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" fill="#1877F2"/>
              <path d="M16.6711 15.4688L17.2031 12H13.875V9.75C13.875 8.80102 14.34 7.875 15.8306 7.875H17.3438V4.92188C17.3438 4.92188 15.9705 4.6875 14.6576 4.6875C11.9166 4.6875 10.125 6.34875 10.125 9.35625V12H7.07812V15.4688H10.125V23.8542C11.3674 24.0486 12.6326 24.0486 13.875 23.8542V15.4688H16.6711Z" fill="white"/>
            </svg>
          ),
          text: 'Sign in with Facebook',
        };
      case 'apple':
        return {
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-50">
              <path d="M17.5203 12.0001C17.5119 10.8097 17.9561 9.65752 18.7765 8.76221C19.5969 7.8669 20.7376 7.29062 21.9631 7.13777C21.5803 6.50665 21.0537 5.97252 20.4264 5.57862C19.7991 5.18472 19.0889 4.94198 18.3531 4.87077C16.8381 4.70571 15.3681 5.76652 14.5981 5.76652C13.8131 5.76652 12.6331 4.88677 11.3631 4.91327C10.4958 4.93949 9.65224 5.21814 8.93116 5.71625C8.21007 6.21437 7.64107 6.91287 7.29306 7.72777C5.39806 11.3673 6.78806 16.6008 8.59806 19.4783C9.50306 20.8883 10.5631 22.4573 11.9881 22.4088C13.3881 22.3553 13.9081 21.5963 15.4981 21.5963C17.0731 21.5963 17.5531 22.4088 18.8481 22.3788C20.1831 22.3553 21.1081 20.9553 21.9781 19.5323C22.5893 18.5991 23.0513 17.5779 23.3481 16.5053C22.9141 16.3371 22.5309 16.0628 22.2369 15.7087C21.9429 15.3546 21.7477 14.9323 21.6697 14.4818C21.5917 14.0312 21.6332 13.5671 21.79 13.1369C21.9468 12.7068 22.2133 12.3247 22.5631 12.0283C21.9696 11.2157 21.159 10.5874 20.2198 10.2132C19.2806 9.83906 18.2527 9.73299 17.2531 9.90777C17.4264 11.3136 17.5119 11.6607 17.5203 12.0001Z" fill="#000000"/>
              <path d="M15.7881 3.74627C16.5836 2.82086 16.9736 1.62702 16.8781 0.423767C15.6985 0.547517 14.6126 1.08652 13.8181 1.93777C13.4276 2.35699 13.1217 2.84643 12.9176 3.3795C12.7135 3.91257 12.6154 4.47986 12.6281 5.05077C13.2071 5.05627 13.7786 4.92852 14.2996 4.67752C14.8207 4.42652 15.2771 4.05927 15.6331 3.60277L15.7881 3.74627Z" fill="#000000"/>
            </svg>
          ),
          text: 'Sign in with Apple',
        };
    }
  };

  const { icon, text } = getProviderDetails();

  return (
    <div className="relative group">
      <button
        type="button"
        disabled
        className="w-full bg-[#F5F5F5] border border-[#E9EAEB] rounded-lg px-4 py-2 flex items-center justify-center gap-2 font-semibold text-[#A4A7AE] cursor-not-allowed shadow-[0px_1px_2px_rgba(10,13,18,0.05)]"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {icon}
        <span className="text-sm">{text}</span>
      </button>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        Temporarily disabled
      </div>
    </div>
  );
};

// Login Component
interface LoginProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, redirectTo = '/dashboard' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Disabled for now
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    // Disabled for now
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
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 lg:px-12 bg-transparent lg:bg-white overflow-y-auto relative z-10">
        <div className="w-full max-w-[480px] flex flex-col gap-5 py-4 lg:bg-transparent">
          {/* Section Title */}
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-4xl font-bold text-center leading-tight tracking-[-0.02em] text-white lg:text-black" style={{ fontFamily: 'Optima, serif' }}>
              Log In
            </h1>
            <p className="text-base text-center text-white lg:text-[#414651]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Welcome back! Please login to your account.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormInput
                id="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

              <FormInput
                id="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="w-4 h-4 border border-[#D5D7DA] rounded text-[#942017] focus:ring-[#942017]"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="text-xs font-medium text-white lg:text-[#414651]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Remember for 30 days
                  </label>
                </div>
                <Link href="/forgot-password" className="text-xs font-semibold text-white lg:text-[#AB261B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Forgot password
                </Link>
              </div>

              {/* Disabled Login Button with Tooltip */}
              <div className="relative group">
                <button
                  type="button"
                  disabled
                  className="w-full bg-[#F5F5F5] border border-[#E9EAEB] rounded-lg px-4 py-2 font-semibold text-[#A4A7AE] cursor-not-allowed shadow-[0px_1px_2px_rgba(10,13,18,0.05)]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Login
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Temporarily disabled
                </div>
              </div>
            </form>

            {/* Separator */}
            <div className="flex items-center py-2">
              <div className="flex-1 border-t border-[#BEBEBE]"></div>
            </div>

            {/* Social Buttons */}
            <div className="flex flex-col gap-2">
              <SocialAuthButton provider="google" onClick={() => handleSocialLogin('google')} />
              <SocialAuthButton provider="facebook" onClick={() => handleSocialLogin('facebook')} />
              <SocialAuthButton provider="apple" onClick={() => handleSocialLogin('apple')} />
            </div>

            {/* Links */}
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-xs text-white lg:text-[#535862]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Don't have an account?
              </span>
              <Link href="/signup" className="text-xs font-semibold text-white lg:text-[#AB261B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Sign up
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center pt-2">
            <p className="text-xs text-center text-white lg:text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
              © Satyoga {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/84 to-black z-10" />
        <Image
          src="https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/4f8ae861-9547-435c-f383-63b569b6dd00/public"
          alt="Spiritual meditation"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center gap-2 px-8 z-20">
          <h2
            className="text-[60px] leading-[80px] text-center"
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
            className="text-[20px] leading-[120%] text-center max-w-[440px]"
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

// Signup Component
interface SignupProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const Signup: React.FC<SignupProps> = ({ onSuccess, redirectTo = '/login' }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNewsletter, setAcceptNewsletter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Disabled for now
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook' | 'apple') => {
    // Disabled for now
  };

  return (
    <div className="h-screen flex overflow-hidden relative">
      {/* Mobile Background Image */}
      <div className="absolute inset-0 lg:hidden">
        <Image
          src="https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/e285d29a-32bf-4eee-4d44-a749ab793d00/public"
          alt="Spiritual meditation"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/75 to-black/80" />
      </div>

      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-8 lg:px-12 bg-transparent lg:bg-white overflow-y-auto relative z-10">
        <div className="w-full max-w-[480px] flex flex-col gap-4 py-4">
          {/* Section Title */}
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-4xl font-bold text-center leading-tight tracking-[-0.02em] text-white lg:text-black" style={{ fontFamily: 'Optima, serif' }}>
              Sign Up
            </h1>
            <p className="text-base text-center text-white lg:text-[#414651]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Create your account to get started
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="flex flex-col gap-3">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <FormInput
                id="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

              <FormInput
                id="username"
                label="Username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />

              <FormInput
                id="password"
                label="Confirm Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />

              {/* Checkboxes */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center pt-0.5">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 border border-[#942017] rounded bg-[#942017] text-white focus:ring-[#942017] checked:bg-[#942017]"
                    />
                  </div>
                  <label htmlFor="terms" className="text-xs text-white lg:text-[#414651]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    I have read and accept the Terms of Service and the Privacy Policy.
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center pt-0.5">
                    <input
                      id="newsletter"
                      type="checkbox"
                      checked={acceptNewsletter}
                      onChange={(e) => setAcceptNewsletter(e.target.checked)}
                      className="w-4 h-4 border border-[#942017] rounded bg-[#942017] text-white focus:ring-[#942017] checked:bg-[#942017]"
                    />
                  </div>
                  <label htmlFor="newsletter" className="text-xs text-white lg:text-[#414651]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    I accept receiving the newsletter.
                  </label>
                </div>
              </div>

              {/* Disabled Sign Up Button with Tooltip */}
              <div className="relative group">
                <button
                  type="button"
                  disabled
                  className="w-full bg-[#F5F5F5] border border-[#E9EAEB] rounded-lg px-4 py-2 font-semibold text-[#A4A7AE] cursor-not-allowed shadow-[0px_1px_2px_rgba(10,13,18,0.05)]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Sign up
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Temporarily disabled
                </div>
              </div>
            </form>

            {/* Separator */}
            <div className="flex items-center py-2">
              <div className="flex-1 border-t border-[#BEBEBE]"></div>
            </div>

            {/* Social Buttons */}
            <div className="flex flex-col gap-2">
              <SocialAuthButton provider="google" onClick={() => handleSocialSignup('google')} />
              <SocialAuthButton provider="facebook" onClick={() => handleSocialSignup('facebook')} />
              <SocialAuthButton provider="apple" onClick={() => handleSocialSignup('apple')} />
            </div>

            {/* Links */}
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-xs text-white lg:text-[#535862]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Already have an account?
              </span>
              <Link href="/login" className="text-xs font-semibold text-white lg:text-[#6941C6]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Log in
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center pt-2">
            <p className="text-xs text-center text-white lg:text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
              © Satyoga {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/84 to-black z-10" />
        <Image
          src="https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/e285d29a-32bf-4eee-4d44-a749ab793d00/public"
          alt="Spiritual meditation"
          fill
          className="object-cover"
        />
        <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center gap-2 px-8 z-20">
          <h2
            className="text-[60px] leading-[80px] text-center"
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
            className="text-[20px] leading-[120%] text-center max-w-[440px]"
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

// Export Login and Signup pages for direct usage in app/
export const LoginPage: React.FC = () => <Login />;
export const SignupPage: React.FC = () => <Signup />;
