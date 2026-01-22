'use client';

import { useState, useEffect } from 'react';
import { Retreat, ForumPost } from '@/types/retreat';
import {
  getForumPosts,
  createForumPost,
  likeForumPost,
  unlikeForumPost,
  RetreatsAPIError
} from '@/lib/retreats-api';
import { Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import MembersSidebar from './MembersSidebar';

interface ForumTabProps {
  retreat: Retreat;
}

type ErrorType = 'not_registered' | 'access_expired' | 'not_enabled' | 'network' | null;

const CATEGORIES = [
  { value: 'general', label: 'General', color: 'bg-gray-100 text-gray-700' },
  { value: 'questions', label: 'Questions', color: 'bg-gray-100 text-gray-700' },
  { value: 'insights', label: 'Insights', color: 'bg-gray-100 text-gray-700' },
  { value: 'experiences', label: 'Experiences', color: 'bg-gray-100 text-gray-700' },
  { value: 'meditation', label: 'Meditation', color: 'bg-gray-100 text-gray-700' },
  { value: 'teachings', label: 'Teachings', color: 'bg-gray-100 text-gray-700' },
];

// Reply Item Component (moved outside to prevent re-renders)
interface ReplyItemProps {
  reply: ForumPost;
  depth?: number;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  submitting: boolean;
  expandedReplies: Set<string>;
  toggleReplyExpansion: (id: string) => void;
  handleLikeToggle: (postId: string, isLiked: boolean) => void;
  handleSubmitReply: (parentId: string) => void;
}

function ReplyItem({
  reply,
  depth = 0,
  replyTo,
  setReplyTo,
  replyContent,
  setReplyContent,
  submitting,
  expandedReplies,
  toggleReplyExpansion,
  handleLikeToggle,
  handleSubmitReply,
}: ReplyItemProps) {
  const hasReplies = reply.replies && reply.replies.length > 0;
  const isExpanded = expandedReplies.has(reply.id);
  const isReplying = replyTo === reply.id;

  return (
    <div className={`${depth > 0 ? 'ml-8' : ''}`}>
      <div className="flex gap-4">
        {/* Reply Avatar */}
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          {reply.user_photo ? (
            <img
              src={reply.user_photo}
              alt={reply.user_name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-600 text-sm font-semibold font-avenir">
              {reply.user_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Reply Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-black text-sm font-avenir">
              {reply.user_name}
            </span>
            <span className="text-xs text-gray-500 font-avenir">
              {new Date(reply.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <p className="text-sm text-[#384250] whitespace-pre-wrap font-avenir mb-2" style={{ lineHeight: '20px' }}>
            {reply.content}
          </p>

          {/* Reply Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLikeToggle(reply.id, reply.is_liked_by_user)}
              className="flex items-center gap-1.5 text-xs font-medium hover:text-[#7D1A13] transition-colors font-avenir"
            >
              <Heart
                className={`w-3 h-3 ${
                  reply.is_liked_by_user ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
              <span>{reply.like_count || 0}</span>
            </button>

            <button
              onClick={() => setReplyTo(reply.id)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#7D1A13] transition-colors font-avenir"
            >
              <MessageCircle className="w-3 h-3" />
              <span>Reply</span>
            </button>

            {hasReplies && (
              <button
                onClick={() => toggleReplyExpansion(reply.id)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#7D1A13] transition-colors font-avenir"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    <span>Hide {reply.replies.length} {reply.replies.length === 1 ? 'reply' : 'replies'}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    <span>Show {reply.replies.length} {reply.replies.length === 1 ? 'reply' : 'replies'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {isReplying && (
        <div className="mt-3 ml-12 overflow-hidden transition-all duration-300 ease-in-out">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-[#7D1A13] focus:ring-1 focus:ring-[#7D1A13] font-avenir"
            style={{ minHeight: '80px' }}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setReplyTo(null)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-avenir"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmitReply(reply.id)}
              disabled={submitting || !replyContent.trim()}
              className="px-4 py-2 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-avenir"
            >
              Reply
            </button>
          </div>
        </div>
      )}

      {/* Nested Replies with Animation */}
      {hasReplies && isExpanded && (
        <div className="mt-4 space-y-4 transition-all duration-300 ease-in-out">
          {reply.replies.map((nestedReply) => (
            <ReplyItem
              key={nestedReply.id}
              reply={nestedReply}
              depth={depth + 1}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              submitting={submitting}
              expandedReplies={expandedReplies}
              toggleReplyExpansion={toggleReplyExpansion}
              handleLikeToggle={handleLikeToggle}
              handleSubmitReply={handleSubmitReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ForumTab({ retreat }: ForumTabProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorType>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // New post state
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('general');

  // Reply state
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPosts();
  }, [retreat.slug]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    setErrorMessage('');

    try {
      console.log('[ForumTab] Fetching posts for retreat:', retreat.slug);
      const response = await getForumPosts(retreat.slug);
      console.log('[ForumTab] Successfully loaded posts:', response.posts.length);
      setPosts(response.posts);
    } catch (err: any) {
      console.error('[ForumTab] Error fetching forum posts:', err);

      if (err instanceof RetreatsAPIError) {
        console.log('[ForumTab] API Error status:', err.status);
        console.log('[ForumTab] API Error data:', err.data);

        if (err.status === 403) {
          const detail = err.data?.detail || '';

          if (detail.includes('not registered')) {
            setError('not_registered');
            setErrorMessage('You must be registered for this retreat to access the forum.');
          } else if (detail.includes('expired')) {
            setError('access_expired');
            setErrorMessage('Your access to this retreat has expired.');
          } else if (detail.includes('not yet available') || detail.includes('not enabled')) {
            setError('not_enabled');
            setErrorMessage('The forum has not been enabled for this retreat yet.');
          } else {
            setError('network');
            setErrorMessage(detail || 'You do not have permission to access this forum.');
          }
        } else {
          setError('network');
          setErrorMessage(err.message || 'Failed to load forum posts.');
        }
      } else {
        setError('network');
        setErrorMessage('An unexpected error occurred while loading the forum.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('Please provide both a title and content for your post.');
      return;
    }

    setSubmitting(true);
    try {
      console.log('[ForumTab] Creating new post');
      await createForumPost(
        retreat.slug,
        newPostContent,
        undefined,
        newPostTitle,
        newPostCategory
      );
      console.log('[ForumTab] Post created successfully');
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostCategory('general');
      fetchPosts();
    } catch (err: any) {
      console.error('[ForumTab] Error creating post:', err);

      let errorMsg = 'Failed to create post. Please try again.';
      if (err instanceof RetreatsAPIError) {
        if (err.status === 403) {
          const detail = err.data?.detail || '';
          if (detail.includes('not enabled')) {
            errorMsg = 'The forum has been disabled for this retreat.';
          } else if (detail.includes('expired')) {
            errorMsg = 'Your access to this retreat has expired.';
          } else if (detail.includes('closed')) {
            errorMsg = 'The forum has been closed for this past retreat.';
          } else {
            errorMsg = detail || errorMsg;
          }
        }
      }
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      console.log('[ForumTab] Creating reply to post:', parentId);
      await createForumPost(retreat.slug, replyContent, parentId);
      console.log('[ForumTab] Reply created successfully');
      setReplyContent('');
      setReplyTo(null);
      fetchPosts();
    } catch (err: any) {
      console.error('[ForumTab] Error creating reply:', err);

      let errorMsg = 'Failed to create reply. Please try again.';
      if (err instanceof RetreatsAPIError) {
        if (err.status === 403) {
          const detail = err.data?.detail || '';
          if (detail.includes('not enabled')) {
            errorMsg = 'The forum has been disabled for this retreat.';
          } else if (detail.includes('expired')) {
            errorMsg = 'Your access to this retreat has expired.';
          } else if (detail.includes('closed')) {
            errorMsg = 'The forum has been closed for this past retreat.';
          } else {
            errorMsg = detail || errorMsg;
          }
        }
      }
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikeForumPost(retreat.slug, postId);
      } else {
        await likeForumPost(retreat.slug, postId);
      }
      fetchPosts(); // Refresh to get updated like counts
    } catch (err) {
      console.error('[ForumTab] Error toggling like:', err);
      alert('Failed to update like. Please try again.');
    }
  };

  const getCategoryColor = (category: string | null | undefined) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.color || 'bg-gray-100 text-gray-700';
  };

  const togglePostExpansion = (postId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const toggleReplyExpansion = (replyId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(replyId)) {
      newExpanded.delete(replyId);
    } else {
      newExpanded.add(replyId);
    }
    setExpandedReplies(newExpanded);
  };

  const filteredPosts = selectedCategory
    ? posts.filter(post => post.category === selectedCategory)
    : posts;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  if (error) {
    const getErrorDisplay = () => {
      switch (error) {
        case 'not_enabled':
          return {
            icon: '🔧',
            title: 'Forum Not Available Yet',
            message: errorMessage,
            color: 'blue',
          };
        case 'not_registered':
          return {
            icon: '🔒',
            title: 'Registration Required',
            message: errorMessage,
            color: 'gray',
          };
        case 'access_expired':
          return {
            icon: '⏰',
            title: 'Access Expired',
            message: errorMessage,
            color: 'yellow',
          };
        default:
          return {
            icon: '⚠️',
            title: 'Error Loading Forum',
            message: errorMessage,
            color: 'red',
          };
      }
    };

    const errorDisplay = getErrorDisplay();
    const bgColor = errorDisplay.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                     errorDisplay.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                     errorDisplay.color === 'red' ? 'bg-red-50 border-red-200' :
                     'bg-gray-50 border-gray-200';
    const textColor = errorDisplay.color === 'blue' ? 'text-blue-900' :
                      errorDisplay.color === 'yellow' ? 'text-yellow-900' :
                      errorDisplay.color === 'red' ? 'text-red-900' :
                      'text-gray-900';
    const subTextColor = errorDisplay.color === 'blue' ? 'text-blue-700' :
                         errorDisplay.color === 'yellow' ? 'text-yellow-700' :
                         errorDisplay.color === 'red' ? 'text-red-700' :
                         'text-gray-700';

    return (
      <div className="max-w-4xl">
        <div className={`${bgColor} border rounded-lg p-8 text-center`}>
          <div className="text-5xl mb-4">{errorDisplay.icon}</div>
          <h3 className={`text-lg font-semibold ${textColor} mb-2 font-avenir`}>
            {errorDisplay.title}
          </h3>
          <p className={`${subTextColor} font-avenir mb-4`}>
            {errorDisplay.message}
          </p>
          {error === 'not_enabled' && (
            <p className="text-sm text-gray-600 font-avenir">
              The administrators will enable the forum when the retreat begins or when it's ready for discussions.
            </p>
          )}
          <button
            onClick={fetchPosts}
            className="mt-4 px-6 py-2 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity font-avenir"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 items-start min-h-full">
      {/* Main Forum Content */}
      <div className="flex-1 max-w-4xl space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors font-avenir ${
            selectedCategory === null
              ? 'bg-[#7D1A13] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Posts
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors font-avenir ${
              selectedCategory === cat.value
                ? 'bg-[#7D1A13] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Create New Post */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black mb-4 font-avenir">
          Create a New Post
        </h3>

        {/* Title Input */}
        <input
          type="text"
          value={newPostTitle}
          onChange={(e) => setNewPostTitle(e.target.value)}
          placeholder="Post title (required)"
          className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:border-[#7D1A13] focus:ring-1 focus:ring-[#7D1A13] font-avenir"
        />

        {/* Category Select */}
        <select
          value={newPostCategory}
          onChange={(e) => setNewPostCategory(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:border-[#7D1A13] focus:ring-1 focus:ring-[#7D1A13] font-avenir"
        >
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Content Textarea */}
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="Share your thoughts with the community..."
          className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-[#7D1A13] focus:ring-1 focus:ring-[#7D1A13] font-avenir"
          style={{ minHeight: '120px' }}
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmitPost}
            disabled={submitting || !newPostTitle.trim() || !newPostContent.trim()}
            className="px-6 py-2 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-avenir"
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>

      {/* Forum Posts */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 font-avenir">
              {selectedCategory
                ? `No posts in this category yet. Be the first to start a conversation!`
                : 'No posts yet. Be the first to start a conversation!'}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Post Header */}
              <div className="flex items-start gap-4 mb-4">
                {/* User Avatar */}
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {post.user_photo ? (
                    <img
                      src={post.user_photo}
                      alt={post.user_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold font-avenir">
                      {post.user_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Post Info */}
                <div className="flex-1">
                  {/* Category Badge */}
                  {post.category && (
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${getCategoryColor(post.category)} font-avenir`}>
                      {CATEGORIES.find(c => c.value === post.category)?.label || post.category}
                    </span>
                  )}

                  {/* Title */}
                  {post.title && (
                    <h4 className="text-lg font-semibold text-black mb-2 font-avenir">
                      {post.title}
                    </h4>
                  )}

                  {/* User and Date */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-black font-avenir">
                      {post.user_name}
                    </span>
                    <span className="text-sm text-gray-500 font-avenir">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-base text-[#384250] whitespace-pre-wrap font-avenir" style={{ lineHeight: '24px' }}>
                    {post.content}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                {/* Like Button */}
                <button
                  onClick={() => handleLikeToggle(post.id, post.is_liked_by_user)}
                  className="flex items-center gap-1.5 text-sm font-medium hover:text-[#7D1A13] transition-colors font-avenir"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      post.is_liked_by_user ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`}
                  />
                  <span>{post.like_count || 0}</span>
                </button>

                {/* Reply Button */}
                <button
                  onClick={() => setReplyTo(post.id)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#7D1A13] transition-colors font-avenir"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reply</span>
                </button>

                {/* Show Replies Toggle */}
                {post.replies && post.replies.length > 0 && (
                  <button
                    onClick={() => togglePostExpansion(post.id)}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#7D1A13] transition-colors font-avenir ml-auto"
                  >
                    {expandedPosts.has(post.id) ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Hide {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>Show {post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Reply Form */}
              {replyTo === post.id && (
                <div className="mt-4 ml-14">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-[#7D1A13] focus:ring-1 focus:ring-[#7D1A13] font-avenir"
                    style={{ minHeight: '80px' }}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setReplyTo(null)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-avenir"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmitReply(post.id)}
                      disabled={submitting || !replyContent.trim()}
                      className="px-4 py-2 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-avenir"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Replies with Animation */}
              {post.replies && post.replies.length > 0 && expandedPosts.has(post.id) && (
                <div className="ml-14 mt-4 space-y-4 transition-all duration-300 ease-in-out">
                  {post.replies.map((reply) => (
                    <ReplyItem
                      key={reply.id}
                      reply={reply}
                      depth={0}
                      replyTo={replyTo}
                      setReplyTo={setReplyTo}
                      replyContent={replyContent}
                      setReplyContent={setReplyContent}
                      submitting={submitting}
                      expandedReplies={expandedReplies}
                      toggleReplyExpansion={toggleReplyExpansion}
                      handleLikeToggle={handleLikeToggle}
                      handleSubmitReply={handleSubmitReply}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      </div>

      {/* Members Sidebar */}
      <MembersSidebar retreatSlug={retreat.slug} />
    </div>
  );
}
