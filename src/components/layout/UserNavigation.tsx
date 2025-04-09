'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function UserNavigation() {
  const { data: session, status } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  
  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }
   
  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <Link 
          href="/donate" 
          className="hidden md:block bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Donate
        </Link>
        
        <Link 
          href="/login" 
          className="hidden md:block bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800"
        >
          Login
        </Link>
      </div>
    );
  }
  
  // If authenticated, show user menu
  return (
    <div className="flex items-center space-x-4">
      <Link 
        href="/donate" 
        className="hidden md:block bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50"
      >
        Donate
      </Link>
      
      <div className="relative">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-white p-1 text-gray-700 hover:text-gray-900 focus:outline-none"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <span className="hidden md:block text-sm font-medium">
            {session?.user?.name || 'My Account'}
          </span>
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {session?.user?.image ? (
              <Image 
                src={session.user.image}
                alt="Profile"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-gray-600">
                {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
              </span>
            )}
          </div>
        </button>
        
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            {session?.user?.role === 'admin' && (
              <Link
                href="/dashboard/admin"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowUserMenu(false)}
              >
                Admin Dashboard
              </Link>
            )}
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setShowUserMenu(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setShowUserMenu(false)}
            >
              Settings
            </Link>
            <button
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setShowUserMenu(false);
                signOut({ callbackUrl: '/' });
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}