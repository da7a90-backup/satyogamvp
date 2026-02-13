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
      <div className="mb-8">
        <Link
          href="/dashboard/user/forum"
          className="inline-flex items-center text-sm mb-4 transition-colors"
          style={{ color: '#5C4D42', fontFamily: 'Avenir Next, sans-serif' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#2C1810'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#5C4D42'}
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Forum
        </Link>
        <h1 className="text-4xl font-semibold" style={{ fontFamily: 'Optima, Georgia, serif', color: '#2C1810' }}>Create New Thread</h1>
        <p className="mt-2 text-lg" style={{ fontFamily: 'Avenir Next, sans-serif', color: '#5C4D42' }}>Start a new discussion topic</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border p-8 space-y-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5DED3' }}>
        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-2" style={{ color: '#2C1810', fontFamily: 'Avenir Next, sans-serif' }}>
            Category
          </label>
          <select
            id="category"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent transition-colors"
            style={{ border: '1px solid #E5DED3', fontFamily: 'Avenir Next, sans-serif', color: '#2C1810' }}
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
          <label htmlFor="title" className="block text-sm font-medium mb-2" style={{ color: '#2C1810', fontFamily: 'Avenir Next, sans-serif' }}>
            Thread Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a clear, descriptive title..."
            maxLength={255}
            className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent transition-colors"
            style={{ border: '1px solid #E5DED3', fontFamily: 'Avenir Next, sans-serif', color: '#2C1810' }}
            disabled={loading}
          />
          <p className="mt-1 text-xs" style={{ color: '#5C4D42', fontFamily: 'Avenir Next, sans-serif' }}>{title.length}/255 characters</p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2C1810', fontFamily: 'Avenir Next, sans-serif' }}>
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
          <div className="rounded-lg p-4" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
            <p style={{ color: '#991B1B', fontFamily: 'Avenir Next, sans-serif' }}>{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: '1px solid #E5DED3' }}>
          <Link
            href="/dashboard/user/forum"
            className="px-6 py-2 rounded-lg transition-colors"
            style={{ color: '#5C4D42', fontFamily: 'Avenir Next, sans-serif' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAF8F1'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !title.trim() || !content.trim() || content === '<p></p>'}
            className="px-6 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6A1610] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            {loading ? 'Creating...' : 'Create Thread'}
          </button>
        </div>
      </form>

      {/* Guidelines */}
      <div className="mt-6 rounded-lg p-4" style={{ backgroundColor: '#FFF9F0', border: '1px solid #E5DED3' }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: '#2C1810', fontFamily: 'Avenir Next, sans-serif' }}>Community Guidelines</h3>
        <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: '#5C4D42', fontFamily: 'Avenir Next, sans-serif' }}>
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
