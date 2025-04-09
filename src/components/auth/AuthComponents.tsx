'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

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
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 mb-2">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        required={required}
        autoComplete={autoComplete}
      />
    </div>
  );
};

// Social Auth Button
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
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064 5.963 5.963 0 014.23 1.74l2.694-2.689A9.99 9.99 0 0012.545 2.001a10.089 10.089 0 00-9.286 6.255 10.034 10.034 0 003.7 12.66 10.003 10.003 0 005.586 1.694c7.058 0 11.668-5.736 10.924-12.01l-10.924-.36z"
              />
            </svg>
          ),
          text: 'Sign in with Google',
        };
      case 'facebook':
        return {
          icon: (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M20.007 3H3.993A.993.993 0 003 3.993v16.014c0 .549.444.993.993.993h8.628v-6.961h-2.343v-2.813h2.343V9.312c0-2.325 1.42-3.591 3.494-3.591.993 0 1.847.073 2.096.106v2.43h-1.44c-1.125 0-1.345.532-1.345 1.315v1.723h2.689l-.35 2.813h-2.339V21h4.573a.993.993 0 00.993-.993V3.993A.993.993 0 0020.007 3z"
              />
            </svg>
          ),
          text: 'Sign in with Facebook',
        };
      case 'apple':
        return {
          icon: (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M17.05 20.28c-.98.95-2.05.88-3.08.45-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.47C2.79 15.22 3.51 7.89 8.42 7.56c1.57.05 2.62 1.06 3.54 1.1 1.35-.18 2.63-1.16 4.11-1.22.7.01 2.65.27 3.91 2.08-3.34 2.13-2.79 6.17.55 7.83-2.25 3.96-4.51 4.13-3.86 2.44.41-1.08 1.67-1.72 1.67-1.72-1.5-.92-1.82-3.32-1.29-4.79zM12.03 7.28c-.19-2.15 1.76-4 4.1-4.16.25 2.41-2.16 4.2-4.1 4.16z"
              />
            </svg>
          ),
          text: 'Sign in with Apple',
        };
    }
  };

  const { icon, text } = getProviderDetails();

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full border border-gray-300 rounded-md px-4 py-3 flex items-center justify-center text-gray-700 font-medium mt-3 hover:bg-gray-50 transition-colors"
    >
      {icon}
      {text}
    </button>
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
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: redirectTo,
      });
      
      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else if (result?.url) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(result.url);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      await signIn(provider, { callbackUrl: redirectTo });
    } catch (err) {
      console.error(`${provider} login error:`, err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <span className="text-2xl font-serif italic">Logo</span>
        </Link>
        <h1 className="text-3xl font-bold mt-8 mb-2">Log In</h1>
        <p className="text-gray-600">Enter your credentials to access your account</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember
            </label>
          </div>
          <div className="text-sm">
            <Link href="/forgot-password" className="text-purple-600 hover:text-purple-500">
              Forgot password
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full bg-gray-900 text-white rounded-md py-3 font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <SocialAuthButton provider="google" onClick={() => handleSocialLogin('google')} />
          <SocialAuthButton provider="facebook" onClick={() => handleSocialLogin('facebook')} />
          <SocialAuthButton provider="apple" onClick={() => handleSocialLogin('apple')} />
        </div>
      </div>

      <p className="mt-8 text-center text-gray-600">
        Don't have an account?{' '}
        <Link href="/signup" className="text-purple-600 font-medium hover:text-purple-500">
          Sign up
        </Link>
      </p>

      <p className="mt-8 text-center text-sm text-gray-500">
        © Satyoga {new Date().getFullYear()}
      </p>
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Register with Strapi
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to register');
      }
      
      // Handle successful registration
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to login page with success message
        router.push(`${redirectTo}?registered=true`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      await signIn(provider, { callbackUrl: redirectTo });
    } catch (err) {
      console.error(`${provider} signup error:`, err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block">
          <span className="text-2xl font-serif italic">Logo</span>
        </Link>
        <h1 className="text-3xl font-bold mt-8 mb-2">Sign Up</h1>
        <p className="text-gray-600">Create a new account to access Sat Yoga resources</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        
        <FormInput
          id="confirm-password"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />

        <div className="flex items-center my-4">
          <input
            id="terms"
            type="checkbox"
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the <Link href="/terms" className="text-purple-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-purple-600 hover:underline">Privacy Policy</Link>
          </label>
        </div>

        <button
          type="submit"
          className={`w-full bg-gray-900 text-white rounded-md py-3 font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <SocialAuthButton provider="google" onClick={() => handleSocialSignup('google')} />
          <SocialAuthButton provider="facebook" onClick={() => handleSocialSignup('facebook')} />
          <SocialAuthButton provider="apple" onClick={() => handleSocialSignup('apple')} />
        </div>
      </div>

      <p className="mt-8 text-center text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-purple-600 font-medium hover:text-purple-500">
          Login
        </Link>
      </p>

      <p className="mt-8 text-center text-sm text-gray-500">
        © Satyoga {new Date().getFullYear()}
      </p>
    </div>
  );
};

// Export Login and Signup pages for direct usage in app/
export const LoginPage: React.FC = () => (
  <div className="min-h-screen flex flex-col justify-center py-12">
    <Login />
  </div>
);

export const SignupPage: React.FC = () => (
  <div className="min-h-screen flex flex-col justify-center py-12">
    <Signup />
  </div>
);