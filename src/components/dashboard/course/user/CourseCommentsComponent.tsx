"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { courseCommentApi } from "@/lib/courseCommentApi";
import {
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  PaperClipIcon,
  FaceSmileIcon,
  EllipsisHorizontalIcon,
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
          picture?: {
            data?: {
              attributes: {
                url: string;
              };
            };
          };
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

  // Reference for the textarea for focusing
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // Focus the editing textarea after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
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

  // Get user profile picture URL
  const getUserPictureUrl = (user: any): string | null => {
    if (user?.attributes?.picture?.data?.attributes?.url) {
      const url = user.attributes.picture.data.attributes.url;
      // Check if it's an absolute URL
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }
      // Otherwise, it's a relative URL, so prepend the base URL
      const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "";
      return `${baseUrl}${url}`;
    }
    return null;
  };

  // Get the initial for the user avatar when no picture is available
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

  // Handle attachments
  const handleAttachment = () => {
    // This would open a file picker in a real implementation
    alert("Attachment functionality would go here");
  };

  // Handle emoji picker
  const handleEmojiPicker = () => {
    // This would open an emoji picker in a real implementation
    alert("Emoji picker would go here");
  };

  // Handle more options
  const handleMoreOptions = () => {
    // This would show additional options in a real implementation
    alert("Additional options would go here");
  };

  return (
    <div className="bg-gray-50">
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
              <div className="text-center text-gray-500 py-4 bg-white rounded-lg">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start">
                    {/* User avatar - either picture or initial */}
                    <div className="flex-shrink-0 mr-3">
                      {getUserPictureUrl(comment.attributes.user.data) ? (
                        <img
                          src={getUserPictureUrl(comment.attributes.user.data)!}
                          alt={getUserDisplayName(comment.attributes.user.data)}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-medium">
                          {getUserInitial(comment.attributes.user.data)}
                        </div>
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex justify-between items-center">
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
                        <div className="mt-2">
                          <textarea
                            ref={textareaRef}
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

          {/* Comment input form - updated to match Figma design */}
          <div className="bg-white rounded-lg shadow-sm">
            <form onSubmit={submitComment} className="p-4">
              <textarea
                placeholder={currentUser ? "Write a post" : "Login to comment"}
                className="w-full border-none resize-none focus:outline-none text-sm"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!currentUser || isSubmitting}
              />

              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleAttachment}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                    title="Add attachment"
                  >
                    <PaperClipIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleEmojiPicker}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                    title="Add emoji"
                  >
                    <FaceSmileIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleMoreOptions}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                    title="More options"
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    !currentUser || isSubmitting || !newComment.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                  disabled={!currentUser || isSubmitting || !newComment.trim()}
                >
                  {isSubmitting ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>

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
