"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forumApi, ForumCategory, ForumThreadSummary } from '@/lib/forum-api';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  categoryId: string;
  initialPage?: number;
  initialSearch?: string;
}

export default function ForumThreadListClient({
  categoryId,
  initialPage = 1,
  initialSearch = '',
}: Props) {
  const router = useRouter();
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ForumThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    loadData();
  }, [categoryId, page, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load category and threads in parallel
      const [categoryData, threadsData] = await Promise.all([
        forumApi.getCategory(categoryId),
        forumApi.getThreads({
          category_id: categoryId,
          search: search || undefined,
          skip: (page - 1) * 20,
          limit: 20,
        }),
      ]);

      setCategory(categoryData);
      setThreads(threadsData.threads);
      setTotalPages(threadsData.total_pages);
    } catch (err: any) {
      console.error('Error loading threads:', err);
      setError(err.message || 'Failed to load threads');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
  };

  if (loading && !category) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Category</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/user/forum"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Forum
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              {category?.icon && <span className="text-4xl">{category.icon}</span>}
              {category?.name}
            </h1>
            {category?.description && (
              <p className="mt-2 text-gray-600">{category.description}</p>
            )}
          </div>
          <Link
            href={`/dashboard/user/forum/create?category=${categoryId}`}
            className="px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6A1610] transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Thread
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search threads..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Threads */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-semibold text-gray-900">No threads yet</h3>
          <p className="mt-1 text-gray-500">
            Be the first to start a discussion in this category!
          </p>
          <Link
            href={`/dashboard/user/forum/create?category=${categoryId}`}
            className="mt-4 inline-flex items-center px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6A1610] transition-colors"
          >
            Create Thread
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/dashboard/user/forum/thread/${thread.id}`}
              className="block bg-white rounded-lg border border-gray-200 hover:border-[#7D1A13] hover:shadow-md transition-all p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {thread.is_pinned && (
                      <svg className="w-4 h-4 text-[#7D1A13]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
                      </svg>
                    )}
                    {thread.is_locked && (
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">{thread.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>by {thread.user.name}</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {thread.view_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {thread.post_count}
                    </span>
                  </div>
                </div>
                <div className="ml-6 text-right text-sm text-gray-500">
                  {formatDistanceToNow(new Date(thread.last_post_at), { addSuffix: true })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
