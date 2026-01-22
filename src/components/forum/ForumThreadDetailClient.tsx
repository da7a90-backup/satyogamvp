"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { forumApi, ForumThreadDetail, ForumPost } from '@/lib/forum-api';
import { formatDistanceToNow } from 'date-fns';
import ForumPostCard from './ForumPostCard';
import ForumReplyForm from './ForumReplyForm';

interface Props {
  threadId: string;
}

export default function ForumThreadDetailClient({ threadId }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [thread, setThread] = useState<ForumThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);

  const isAdmin = (session?.user as any)?.is_admin || false;

  useEffect(() => {
    loadThread();
  }, [threadId]);

  const loadThread = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await forumApi.getThread(threadId);
      setThread(data);
    } catch (err: any) {
      console.error('Error loading thread:', err);
      setError(err.message || 'Failed to load thread');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    loadThread(); // Reload to show new reply
  };

  const handlePinThread = async () => {
    try {
      await forumApi.pinThread(threadId);
      loadThread();
    } catch (error: any) {
      alert(error.message || 'Failed to toggle pin');
    }
  };

  const handleLockThread = async () => {
    try {
      await forumApi.lockThread(threadId);
      loadThread();
    } catch (error: any) {
      alert(error.message || 'Failed to toggle lock');
    }
  };

  const handleDeleteThread = async () => {
    if (!confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
      return;
    }

    try {
      await forumApi.deleteThread(threadId);
      router.push('/dashboard/user/forum');
    } catch (error: any) {
      alert(error.message || 'Failed to delete thread');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
        <div className="bg-white rounded-lg border p-6">
          <div className="h-4 bg-gray-100 rounded w-full mb-3"></div>
          <div className="h-4 bg-gray-100 rounded w-full mb-3"></div>
          <div className="h-4 bg-gray-100 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Thread</h3>
        <p className="text-red-700">{error || 'Thread not found'}</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={loadThread}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/dashboard/user/forum"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/dashboard/user/forum" className="hover:text-gray-900">
            Forum
          </Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link
            href={`/dashboard/user/forum/${thread.category.id}`}
            className="hover:text-gray-900"
          >
            {thread.category.name}
          </Link>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900">{thread.title}</span>
        </div>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="mb-6 bg-gray-800 text-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Admin Controls</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePinThread}
                className={`px-3 py-1 rounded transition-colors ${
                  thread?.is_pinned
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {thread?.is_pinned ? 'Unpin' : 'Pin'} Thread
              </button>
              <button
                onClick={handleLockThread}
                className={`px-3 py-1 rounded transition-colors ${
                  thread?.is_locked
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {thread?.is_locked ? 'Unlock' : 'Lock'} Thread
              </button>
              <button
                onClick={handleDeleteThread}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Delete Thread
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thread Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {thread.is_pinned && (
              <svg className="w-6 h-6 text-[#7D1A13]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
              </svg>
            )}
            {thread.title}
            {thread.is_locked && (
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span>Started by {thread.user.name}</span>
          <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {thread.view_count} views
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {thread.post_count} {thread.post_count === 1 ? 'post' : 'posts'}
          </span>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4 mb-6">
        {thread.posts && thread.posts.length > 0 ? (
          thread.posts.map((post) => (
            <ForumPostCard
              key={post.id}
              post={post}
              threadId={threadId}
              isLocked={thread.is_locked}
              onReplySuccess={handleReplySuccess}
            />
          ))
        ) : (
          <div className="bg-white rounded-lg border p-6 text-center text-gray-500">
            No posts yet
          </div>
        )}
      </div>

      {/* Reply Button */}
      {!thread.is_locked && (
        <div className="bg-white rounded-lg border p-6">
          {!showReplyForm ? (
            <button
              onClick={() => setShowReplyForm(true)}
              className="w-full px-4 py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6A1610] transition-colors font-medium"
            >
              Reply to Thread
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Post Reply</h3>
                <button
                  onClick={() => setShowReplyForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ForumReplyForm
                threadId={threadId}
                onSuccess={handleReplySuccess}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      )}

      {thread.is_locked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-yellow-800">This thread is locked. No new replies can be posted.</span>
        </div>
      )}
    </div>
  );
}
