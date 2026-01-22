'use client';

import { useEffect, useState } from 'react';
import { getComponentComments, postComponentComment } from '@/lib/courses-api';
import { CourseComment } from '@/types/course';
import { MessageCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentsSectionProps {
  componentId: string;
}

export default function CommentsSection({ componentId }: CommentsSectionProps) {
  const [comments, setComments] = useState<CourseComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [componentId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await getComponentComments(componentId);
      setComments(response.comments || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      setPosting(true);
      await postComponentComment(componentId, newComment);
      setNewComment('');
      await loadComments(); // Reload comments
    } catch (err) {
      console.error('Failed to post comment:', err);
      setError('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#942017] mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Post Comment Form */}
      <form onSubmit={handlePostComment} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Write a post
        </label>
        <textarea
          id="comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#942017] focus:border-transparent resize-none"
          disabled={posting}
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-500">
            {newComment.length} / 1000 characters
          </p>
          <button
            type="submit"
            disabled={posting || !newComment.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#942017] text-white text-sm rounded hover:bg-[#7a1a13] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="w-4 h-4" />
            {posting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#942017] to-[#7a1a13] flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {comment.user_name?.charAt(0).toUpperCase() || 'U'}
                </div>

                <div className="flex-1 min-w-0">
                  {/* User Name and Timestamp */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{comment.user_name || 'Anonymous'}</span>
                    <span className="text-xs text-gray-500">
                      {comment.created_at
                        ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
                        : 'Just now'}
                    </span>
                  </div>

                  {/* Comment Content */}
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
