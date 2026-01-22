"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import {
  getBlogPostComments,
  createBlogComment,
  updateBlogComment,
  deleteBlogComment,
  type BlogComment,
} from "@/lib/blog-api";

interface BlogCommentsProps {
  postId: string;
}

const BlogComments = ({ postId }: BlogCommentsProps) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBlogPostComments(postId);
      setComments(data.comments);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load comments"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createBlogComment(postId, newComment);
      setNewComment("");
      fetchComments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to post comment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !session) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createBlogComment(postId, replyContent, parentId);
      setReplyContent("");
      setReplyTo(null);
      fetchComments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to post reply"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateBlogComment(commentId, editContent);
      setEditContent("");
      setEditingComment(null);
      fetchComments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update comment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await deleteBlogComment(commentId);
      fetchComments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete comment"
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const CommentItem = ({ comment, isReply = false }: { comment: BlogComment; isReply?: boolean }) => {
    const isAuthor = session?.user?.id === comment.user_id;
    const isAdmin = session?.user?.role === "admin";

    return (
      <div className={`${isReply ? "ml-12" : ""}`}>
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-[#7D1A13] text-white rounded-full flex items-center justify-center font-semibold">
              {comment.user.full_name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Comment content */}
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-4 border border-[#E5E7EB]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold text-[#1F2937]">
                    {comment.user.full_name}
                  </span>
                  <span className="text-sm text-[#737373] ml-2">
                    {formatDate(comment.created_at)}
                  </span>
                  {!comment.is_approved && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Pending approval
                    </span>
                  )}
                </div>
                {(isAuthor || isAdmin) && (
                  <div className="flex space-x-2">
                    {isAuthor && (
                      <button
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditContent(comment.content);
                        }}
                        className="text-[#7D1A13] hover:text-[#6B1710]"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {editingComment === comment.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D1A13] text-sm"
                    rows={3}
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleEdit(comment.id)}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] text-sm disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent("");
                      }}
                      className="px-3 py-1.5 bg-gray-200 text-[#1F2937] rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[#1F2937] whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>

            {/* Reply button */}
            {session && !isReply && editingComment !== comment.id && (
              <button
                onClick={() => setReplyTo(comment.id)}
                className="mt-2 text-sm text-[#7D1A13] hover:text-[#6B1710] flex items-center"
              >
                <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                Reply
              </button>
            )}

            {/* Reply form */}
            {replyTo === comment.id && (
              <div className="mt-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D1A13] text-sm"
                  rows={3}
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={isSubmitting || !replyContent.trim()}
                    className="px-3 py-1.5 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] text-sm disabled:opacity-50"
                  >
                    Post Reply
                  </button>
                  <button
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContent("");
                    }}
                    className="px-3 py-1.5 bg-gray-200 text-[#1F2937] rounded-lg hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Nested replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-4">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12 border-t border-[#E5E7EB] pt-8" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#1F2937]">
          Comments ({comments.length})
        </h2>
        <button
          onClick={fetchComments}
          className="text-[#7D1A13] hover:text-[#6B1710]"
          title="Refresh comments"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Comment form */}
      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7D1A13] resize-none"
              rows={4}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-6 py-2.5 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
          <p className="mt-2 text-sm text-[#737373]">
            Your comment will be reviewed before being published.
          </p>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-gray-50 border border-[#E5E7EB] rounded-lg text-center">
          <p className="text-[#737373] mb-3">
            Please sign in to leave a comment
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2.5 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] transition-colors font-medium"
          >
            Sign In
          </a>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <ArrowPathIcon className="h-8 w-8 text-[#7D1A13] animate-spin" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-[#737373]">
          <ChatBubbleLeftIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

export default BlogComments;
