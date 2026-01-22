"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { forumApi, ForumThreadSummary } from '@/lib/forum-api';
import { formatDistanceToNow } from 'date-fns';

export default function ForumActivityCard() {
  const [threads, setThreads] = useState<ForumThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentThreads();
  }, []);

  const loadRecentThreads = async () => {
    try {
      const data = await forumApi.getThreads({ limit: 5 });
      setThreads(data.threads);
    } catch (error) {
      console.error('Error loading forum activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Forum Activity</h2>
        </div>
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-b border-gray-100 pb-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-[#7D1A13]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900">Forum Activity</h2>
        </div>
        <Link
          href="/dashboard/user/forum"
          className="text-sm text-[#7D1A13] hover:text-[#6A1610] font-medium"
        >
          View All →
        </Link>
      </div>

      {threads.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm">No forum activity yet</p>
          <Link
            href="/dashboard/user/forum"
            className="mt-2 inline-block text-sm text-[#7D1A13] hover:underline"
          >
            Start a discussion
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/dashboard/user/forum/thread/${thread.id}`}
              className="block border-b border-gray-100 last:border-0 pb-3 last:pb-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate flex items-center gap-2">
                    {thread.is_pinned && (
                      <svg className="w-3 h-3 text-[#7D1A13] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
                      </svg>
                    )}
                    {thread.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{thread.user.name}</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {thread.post_count}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {formatDistanceToNow(new Date(thread.last_post_at), { addSuffix: true })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link
          href="/dashboard/user/forum"
          className="w-full block text-center px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6A1610] transition-colors text-sm font-medium"
        >
          Explore Forum
        </Link>
      </div>
    </div>
  );
}
