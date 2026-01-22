"use client";

import { useState } from 'react';
import { forumApi } from '@/lib/forum-api';
import RichTextEditor from './RichTextEditor';

interface Props {
  threadId: string;
  parentPostId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ForumReplyForm({ threadId, parentPostId, onSuccess, onCancel }: Props) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || content === '<p></p>') {
      setError('Please enter a message');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await forumApi.createPost({
        thread_id: threadId,
        content,
        parent_post_id: parentPostId,
      });

      setContent('');
      onSuccess();
    } catch (err: any) {
      console.error('Error posting reply:', err);
      setError(err.message || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RichTextEditor
        content={content}
        onChange={setContent}
        placeholder={parentPostId ? 'Write your reply...' : 'Write your post...'}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !content.trim() || content === '<p></p>'}
          className="px-6 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6A1610] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {submitting ? 'Posting...' : 'Post Reply'}
        </button>
      </div>
    </form>
  );
}
