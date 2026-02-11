"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { forumApi, ForumCategory } from '@/lib/forum-api';
import { formatDistanceToNow } from 'date-fns';

export default function ForumCategoriesClient() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await forumApi.getCategories();
      setCategories(data.categories);
    } catch (err: any) {
      console.error('Error loading categories:', err);
      setError(err.message || 'Failed to load forum categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Forum</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadCategories}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div
        className="rounded-xl border p-12 text-center"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E5DED3'
        }}
      >
        <svg
          className="mx-auto h-16 w-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#B8860B"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h3
          className="mt-4 text-xl font-semibold"
          style={{
            fontFamily: 'Optima, Georgia, serif',
            color: '#2C1810'
          }}
        >
          No categories yet
        </h3>
        <p
          className="mt-2 text-base"
          style={{
            fontFamily: 'Avenir Next, sans-serif',
            color: '#5C4D42'
          }}
        >
          Forum categories will appear here once they are created.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/dashboard/user/forum/${category.id}`}
          className="block rounded-xl border transition-all duration-300 hover:shadow-lg"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E5DED3'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#7D1A13';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#E5DED3';
          }}
        >
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  {category.icon && (
                    <span className="text-3xl">{category.icon}</span>
                  )}
                  <h2
                    className="text-2xl font-semibold"
                    style={{
                      fontFamily: 'Optima, Georgia, serif',
                      color: '#2C1810'
                    }}
                  >
                    {category.name}
                  </h2>
                </div>
                {category.description && (
                  <p
                    className="mb-5 text-base leading-relaxed"
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      color: '#5C4D42'
                    }}
                  >
                    {category.description}
                  </p>
                )}
                <div
                  className="flex items-center gap-8 text-sm"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    color: '#8B7355'
                  }}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {category.thread_count || 0} {category.thread_count === 1 ? 'thread' : 'threads'}
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {category.post_count || 0} {category.post_count === 1 ? 'post' : 'posts'}
                  </span>
                </div>
              </div>

              {/* Latest Thread Info */}
              {category.latest_thread && (
                <div className="ml-8 text-right min-w-[220px]">
                  <p
                    className="text-sm font-medium mb-2 truncate max-w-[220px]"
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      color: '#2C1810'
                    }}
                  >
                    {category.latest_thread.title}
                  </p>
                  <p
                    className="text-xs mb-1"
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      color: '#8B7355'
                    }}
                  >
                    by {category.latest_thread.user.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      color: '#B8860B'
                    }}
                  >
                    {formatDistanceToNow(new Date(category.latest_thread.last_post_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
