"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { forumApi, ForumCategory } from '@/lib/forum-api';
import RichTextEditor from './RichTextEditor';

interface Props {
  initialCategoryId?: string;
}

export default function ForumCreateThreadClient({ initialCategoryId }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId || '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await forumApi.getCategories();
      setCategories(data.categories);

      // Set initial category if not already set
      if (!selectedCategoryId && data.categories.length > 0) {
        setSelectedCategoryId(data.categories[0].id);
      }
    } catch (err: any) {
      console.error('Error loading categories:', err);
      setError(err.message || 'Failed to load categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter a thread title');
      return;
    }

    if (!content.trim() || content === '<p></p>') {
      setError('Please enter thread content');
      return;
    }

    if (!selectedCategoryId) {
      setError('Please select a category');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const thread = await forumApi.createThread({
        title: title.trim(),
        category_id: selectedCategoryId,
        initial_post_content: content,
      });

      // Redirect to the new thread
      router.push(`/dashboard/user/forum/thread/${thread.id}`);
    } catch (err: any) {
      console.error('Error creating thread:', err);
      setError(err.message || 'Failed to create thread');
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Create New Thread</h1>
        <p className="mt-2 text-gray-600">Start a new discussion topic</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            disabled={loading}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon && `${category.icon} `}{category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Thread Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a clear, descriptive title..."
            maxLength={255}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">{title.length}/255 characters</p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Share your thoughts, ask a question, or start a discussion..."
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Link
            href="/dashboard/user/forum"
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !title.trim() || !content.trim() || content === '<p></p>'}
            className="px-6 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6A1610] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Creating...' : 'Create Thread'}
          </button>
        </div>
      </form>

      {/* Guidelines */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Community Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Be respectful and kind to fellow members</li>
          <li>Stay on topic and use appropriate categories</li>
          <li>Search before posting to avoid duplicates</li>
          <li>Use clear, descriptive titles</li>
          <li>Provide context and details in your posts</li>
        </ul>
      </div>
    </div>
  );
}
