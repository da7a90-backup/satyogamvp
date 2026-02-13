"use client";

import { useState } from 'react';
import { ForumPost, forumApi } from '@/lib/forum-api';
import { formatDistanceToNow } from 'date-fns';
import ForumReplyForm from './ForumReplyForm';

interface Props {
  post: ForumPost;
  threadId: string;
  isLocked: boolean;
  depth?: number;
  onReplySuccess: () => void;
}

export default function ForumPostCard({
  post,
  threadId,
  isLocked,
  depth = 0,
  onReplySuccess,
}: Props) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [reacting, setReacting] = useState(false);

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onReplySuccess();
  };

  const handleReaction = async (reactionType: string) => {
    if (reacting) return;

    try {
      setReacting(true);
      await forumApi.toggleReaction(post.id, reactionType);
      onReplySuccess(); // Reload to show updated reactions
    } catch (error: any) {
      console.error('Error toggling reaction:', error);
      alert(error.message || 'Failed to react');
    } finally {
      setReacting(false);
    }
  };

  const bgColor = depth === 0 ? 'bg-white' : depth === 1 ? 'bg-gray-50' : 'bg-gray-100';
  const borderLeft = depth > 0 ? 'border-l-2 border-gray-300 pl-4' : '';

  return (
    <div className={`${borderLeft}`}>
      <div className={`${bgColor} rounded-lg border border-gray-200 p-4`}>
        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7D1A13] text-white flex items-center justify-center font-semibold">
              {post.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{post.user.name}</span>
                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                  {post.user.membership_tier}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                {post.is_edited && (
                  <>
                    <span>•</span>
                    <span>Edited</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Collapse button for posts with replies */}
          {post.replies && post.replies.length > 0 && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-500 hover:text-gray-700"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              <svg
                className={`w-5 h-5 transition-transform ${collapsed ? '' : 'rotate-180'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Post Content */}
        {!collapsed && (
          <>
            <div
              className="prose prose-sm max-w-none mb-4 text-gray-800"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Post Actions */}
            <div className="flex items-center gap-4 text-sm flex-wrap">
              {!isLocked && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-gray-600 hover:text-[#7D1A13] font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Reply
                </button>
              )}

              {post.reply_count > 0 && (
                <span className="text-gray-500">
                  {post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}
                </span>
              )}

              {/* Reaction Buttons */}
              <div className="flex items-center gap-1 border-l border-gray-300 pl-4 ml-auto">
                {(['like', 'love', 'insightful', 'grateful', 'question'] as const).map((type) => {
                  const count = post.reaction_counts[type] || 0;
                  const isActive = post.user_reaction === type;
                  return (
                    <button
                      key={type}
                      onClick={() => handleReaction(type)}
                      disabled={reacting}
                      className={`flex items-center gap-1 px-2 py-1 rounded transition-colors text-xs font-medium ${
                        isActive
                          ? 'bg-[#7D1A13] text-white'
                          : 'hover:bg-gray-200 text-gray-600'
                      } disabled:opacity-50`}
                      title={type}
                    >
                      <span className="capitalize">{type}</span>
                      {count > 0 && <span className="text-xs">({count})</span>}
                    </button>
                  );
                })}
              </div>

              {/* Edit Button (only if can_edit) */}
              {post.can_edit && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                  title="Edit post (within 15 minutes)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}

              {/* Report Button */}
              <button
                onClick={() => setShowReportModal(true)}
                className="text-gray-500 hover:text-red-600 transition-colors"
                title="Report post"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </button>
            </div>

            {/* Reply Form */}
            {showReplyForm && !isLocked && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <ForumReplyForm
                  threadId={threadId}
                  parentPostId={post.id}
                  onSuccess={handleReplySuccess}
                  onCancel={() => setShowReplyForm(false)}
                />
              </div>
            )}
          </>
        )}

        {collapsed && post.replies && post.replies.length > 0 && (
          <div className="text-sm text-gray-500">
            {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'} hidden
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {!collapsed && post.replies && post.replies.length > 0 && (
        <div className="mt-3 space-y-3 ml-6">
          {post.replies.map((reply) => (
            <ForumPostCard
              key={reply.id}
              post={reply}
              threadId={threadId}
              isLocked={isLocked}
              depth={depth + 1}
              onReplySuccess={onReplySuccess}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            onReplySuccess(); // Reload to show updated post
          }}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportPostModal
          postId={post.id}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {
            setShowReportModal(false);
            alert('Report submitted successfully. Thank you for helping keep our community safe.');
          }}
        />
      )}
    </div>
  );
}

// Edit Post Modal Component
function EditPostModal({
  post,
  onClose,
  onSuccess,
}: {
  post: ForumPost;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [content, setContent] = useState(post.content);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || content === '<p></p>') {
      setError('Content cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await forumApi.updatePost(post.id, { content });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Post</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
          You can edit your post within 15 minutes of posting.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <div className="prose-editor">
              <textarea
                value={content.replace(/<[^>]*>/g, '')} // Strip HTML for editing
                onChange={(e) => setContent(`<p>${e.target.value}</p>`)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent font-mono text-sm"
                disabled={submitting}
                placeholder="Edit your post content..."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-6 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6A1610] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Report Modal Component
function ReportPostModal({
  postId,
  onClose,
  onSuccess,
}: {
  postId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (reason.trim().length < 10) {
      setError('Please provide a detailed reason (at least 10 characters)');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await forumApi.reportPost(postId, reason);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Report Post</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why are you reporting this post?
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe the issue in detail..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              disabled={submitting}
            />
            <p className="mt-1 text-xs text-gray-500">{reason.length}/500 characters</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || reason.trim().length < 10}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
