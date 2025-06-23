'use client';

import { useState } from 'react';

interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    [key: string]: string | boolean;
  }
  
  interface Errors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    [key: string]: string | undefined;
  }
  
  interface AccountSectionProps {
    isLoggedIn: boolean;
    userEmail?: string | null;  // Add null here to match session?.user?.email type
    formData: FormData;
    errors: Errors;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onContinue: () => void;
    showLogin: boolean;
    setShowLogin: (show: boolean) => void;
    onSocialLogin: (provider: string) => void;
    onLoginSubmit: (e: React.FormEvent) => void;
    accountCreated?: boolean;
  }
  
export default function AccountSection({
  isLoggedIn,
  userEmail,
  formData,
  errors,
  onChange,
  onContinue,
  showLogin,
  setShowLogin,
  onSocialLogin,
  onLoginSubmit,
  accountCreated
}: AccountSectionProps) {
  
  // Render when logged in
  if (isLoggedIn) {
    return (
      <div className="mb-8">
        <h2 className="text-purple-600 text-lg font-medium mb-4">1. Create account or login</h2>
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
          <div className="flex items-center">
            <span className="text-sm font-medium">Logged in as:</span>
            <span className="ml-2 text-sm">{userEmail}</span>
            <span className="ml-2 text-green-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </div>
          <button
            type="button"
            onClick={() => window.location.href = '/api/auth/signout'}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
        {accountCreated && (
          <div className="mt-2 text-sm text-green-600">
            Account successfully created
          </div>
        )}
      </div>
    );
  }

  // Render login/signup form
  return (
    <div className="mb-8">
      <h2 className="text-purple-600 text-lg font-medium mb-4">1. Create account or login</h2>
      
      {/* Login/Signup Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          className={`py-2 px-4 ${!showLogin ? 'border-b-2 border-purple-600 font-medium text-gray-900' : 'text-gray-500'}`}
          onClick={() => setShowLogin(false)}
        >
          Sign up
        </button>
        <button
          type="button"
          className={`py-2 px-4 ${showLogin ? 'border-b-2 border-purple-600 font-medium text-gray-900' : 'text-gray-500'}`}
          onClick={() => setShowLogin(true)}
        >
          Log in
        </button>
      </div>
      
      {/* Social Login Buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          type="button"
          onClick={() => onSocialLogin('google')}
          className="flex-1 py-2 px-3 border border-gray-300 rounded-md flex justify-center items-center hover:bg-gray-50"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064 5.963 5.963 0 014.23 1.74l2.694-2.689A9.99 9.99 0 0012.545 2.001a10.089 10.089 0 00-9.286 6.255 10.034 10.034 0 003.7 12.66 10.003 10.003 0 005.586 1.694c7.058 0 11.668-5.736 10.924-12.01l-10.924-.36z"
            />
          </svg>
          <span>Google</span>
        </button>
        <button
          type="button"
          onClick={() => onSocialLogin('facebook')}
          className="flex-1 py-2 px-3 border border-gray-300 rounded-md flex justify-center items-center hover:bg-gray-50"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M20.007 3H3.993A.993.993 0 003 3.993v16.014c0 .549.444.993.993.993h8.628v-6.961h-2.343v-2.813h2.343V9.312c0-2.325 1.42-3.591 3.494-3.591.993 0 1.847.073 2.096.106v2.43h-1.44c-1.125 0-1.345.532-1.345 1.315v1.723h2.689l-.35 2.813h-2.339V21h4.573a.993.993 0 00.993-.993V3.993A.993.993 0 0020.007 3z"
            />
          </svg>
          <span>Facebook</span>
        </button>
        <button
          type="button"
          onClick={() => onSocialLogin('apple')}
          className="flex-1 py-2 px-3 border border-gray-300 rounded-md flex justify-center items-center hover:bg-gray-50"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M17.05 20.28c-.98.95-2.05.88-3.08.45-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.47C2.79 15.22 3.51 7.89 8.42 7.56c1.57.05 2.62 1.06 3.54 1.1 1.35-.18 2.63-1.16 4.11-1.22.7.01 2.65.27 3.91 2.08-3.34 2.13-2.79 6.17.55 7.83-2.25 3.96-4.51 4.13-3.86 2.44.41-1.08 1.67-1.72 1.67-1.72-1.5-.92-1.82-3.32-1.29-4.79zM12.03 7.28c-.19-2.15 1.76-4 4.1-4.16.25 2.41-2.16 4.2-4.1 4.16z"
            />
          </svg>
          <span>Apple</span>
        </button>
      </div>
      
      <div className="my-4 flex items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="px-4 text-sm text-gray-500">OR</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>
      
      {/* Login Form */}
      {showLogin ? (
        <form onSubmit={onLoginSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500`}
              placeholder="Enter your password"
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
          >
            Login
          </button>
        </form>
      ) : (
        /* Sign Up Form */
        <>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={onChange}
              className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500`}
              placeholder="Create a password"
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={onChange}
              className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500`}
              placeholder="Confirm password"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>
          
          <button
            type="button"
            onClick={onContinue}
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
          >
            Continue
          </button>
        </>
      )}
    </div>
  );
}