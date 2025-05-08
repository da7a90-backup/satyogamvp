"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { courseCommentApi } from "@/lib/courseCommentApi";
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface CourseCommentsProps {
  courseId: string;
  classIndex?: number; // Optional for testimonials
  sectionType: "video" | "additionalMaterials" | "testimonial";
}

interface Comment {
  id: number;
  attributes: {
    comment: string;
    createdAt: string;
    user: {
      data: {
        id: number;
        attributes: {
          username: string;
          email?: string;
          firstName?: string;
          lastName?: string;
        };
      };
    };
  };
}

const CourseCommentsComponent = ({
  courseId,
  classIndex,
  sectionType,
}: CourseCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Fetch comments when component mounts
  useEffect(() => {
    fetchComments();
    getCurrentUser();
  }, [courseId, classIndex, sectionType]);

  // Get current user information
  const getCurrentUser = async () => {
    try {
      const userData = await courseCommentApi.getCurrentUser();
      setCurrentUser(userData);
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  // Fetch comments based on filters
  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await courseCommentApi.getComments(
        courseId,
        sectionType,
        classIndex
      );

      setComments(response.data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit a new comment
  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in
    if (!currentUser) {
      // Redirect to login page with a return URL
      const currentPath = window.location.pathname;
      router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Validate comment text
    if (!newComment.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await courseCommentApi.addComment(
        courseId,
        sectionType,
        newComment,
        classIndex
      );

      // Reset the comment input and refresh comments
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
      setError("Failed to submit your comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start editing a comment
  const startEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.attributes.comment);
  };

  // Cancel editing a comment
  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  // Save edited comment
  const saveEditedComment = async (commentId: number) => {
    if (!editCommentText.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await courseCommentApi.updateComment(
        commentId.toString(),
        editCommentText
      );

      // Exit edit mode and refresh comments
      setEditingCommentId(null);
      setEditCommentText("");
      fetchComments();
    } catch (error) {
      console.error("Error updating comment:", error);
      setError("Failed to update your comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a comment
  const deleteComment = async (commentId: number) => {
    try {
      setIsDeleting(true);
      setError(null);

      await courseCommentApi.deleteComment(commentId.toString());

      // Remove the comment from local state for immediate UI update
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError("Failed to delete your comment. Please try again.");

      // Refresh comments if delete failed
      fetchComments();
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if comment belongs to current user
  const isOwnComment = (comment: Comment): boolean => {
    if (!currentUser || !comment.attributes.user.data) return false;
    return currentUser.id === comment.attributes.user.data.id;
  };

  // Format the time elapsed since the comment was posted
  const formatTimeElapsed = (dateString: string): string => {
    const commentDate = new Date(dateString);
    const now = new Date();

    const diffInSeconds = Math.floor(
      (now.getTime() - commentDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    }

    // For older comments, just show the date
    return commentDate.toLocaleDateString();
  };

  // Get the display name for a user
  const getUserDisplayName = (user: any): string => {
    if (user?.attributes) {
      // Try to use firstName and lastName if available
      if (user.attributes.firstName && user.attributes.lastName) {
        return `${user.attributes.firstName} ${user.attributes.lastName}`;
      }

      // Fall back to username
      if (user.attributes.username) {
        return user.attributes.username;
      }

      // Last resort, use email (but hide part of it for privacy)
      if (user.attributes.email) {
        const emailParts = user.attributes.email.split("@");
        return `${emailParts[0]}@...`;
      }
    }

    // If all else fails
    return "User";
  };

  // Get the initial for the user avatar
  const getUserInitial = (user: any): string => {
    if (user?.attributes) {
      if (user.attributes.firstName) {
        return user.attributes.firstName.charAt(0).toUpperCase();
      }
      if (user.attributes.username) {
        return user.attributes.username.charAt(0).toUpperCase();
      }
      if (user.attributes.email) {
        return user.attributes.email.charAt(0).toUpperCase();
      }
    }
    return "U";
  };

  return (
    <div>
      {/* Loading state */}
      {isLoading && comments.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {/* Comments list */}
          <div className="space-y-4 mb-6">
            {comments.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-t border-gray-100 pt-4">
                  <div className="flex items-start">
                    <div className="h-8 w-8 bg-gray-200 rounded-full mr-3 flex-shrink-0 flex items-center justify-center text-gray-500">
                      {comment.attributes.user && comment.attributes.user.data
                        ? getUserInitial(comment.attributes.user.data)
                        : "U"}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {comment.attributes.user &&
                          comment.attributes.user.data
                            ? getUserDisplayName(comment.attributes.user.data)
                            : "Unknown User"}
                        </span>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-2">
                            {formatTimeElapsed(comment.attributes.createdAt)}
                          </span>

                          {/* Edit/Delete buttons (only for user's own comments) */}
                          {isOwnComment(comment) && (
                            <div className="flex space-x-2">
                              {editingCommentId !== comment.id && (
                                <>
                                  <button
                                    onClick={() => startEditComment(comment)}
                                    className="text-gray-500 hover:text-blue-600"
                                    title="Edit"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteComment(comment.id)}
                                    className="text-gray-500 hover:text-red-600"
                                    title="Delete"
                                    disabled={isDeleting}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Edit mode or display mode based on state */}
                      {editingCommentId === comment.id ? (
                        <div className="mt-1">
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows={3}
                          />
                          <div className="flex justify-end mt-2 space-x-2">
                            <button
                              onClick={cancelEditComment}
                              className="flex items-center px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                              <XMarkIcon className="h-3 w-3 mr-1" />
                              Cancel
                            </button>
                            <button
                              onClick={() => saveEditedComment(comment.id)}
                              className="flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              disabled={!editCommentText.trim() || isSubmitting}
                            >
                              <CheckIcon className="h-3 w-3 mr-1" />
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm mt-1">
                          {comment.attributes.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment input form */}
          <form onSubmit={submitComment} className="border rounded-md p-3">
            <textarea
              placeholder={currentUser ? "Write a post" : "Login to comment"}
              className="w-full border-none resize-none focus:outline-none text-sm"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!currentUser || isSubmitting}
            ></textarea>

            <div className="flex justify-end items-center mt-2 pt-2 border-t">
              <button
                type="submit"
                className={`bg-purple-600 text-white px-4 py-1 rounded-md text-sm ${
                  !currentUser || isSubmitting || !newComment.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-purple-700"
                }`}
                disabled={!currentUser || isSubmitting || !newComment.trim()}
              >
                {isSubmitting ? "Sending..." : "Send"}
              </button>
            </div>
          </form>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Login prompt for non-authenticated users */}
          {!currentUser && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              <a href="/login" className="text-purple-600 hover:underline">
                Login to join the conversation
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseCommentsComponent;
