"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  ArrowPathIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import {
  getAllBlogComments,
  approveBlogComment,
  deleteBlogComment,
  type BlogComment,
} from "@/lib/blog-api";

const BlogCommentsManagement = () => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending">("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const fetchComments = async (page = 1, status: "all" | "approved" | "pending" = "all") => {
    setIsLoading(true);
    try {
      const isApprovedFilter = status === "all" ? undefined : status === "approved";
      const data = await getAllBlogComments(page, 20, isApprovedFilter);

      setComments(data.comments);
      setTotalPages(data.total_pages);
      setCurrentPage(data.page);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchComments(currentPage, filterStatus);
  }, [currentPage, filterStatus]);

  // Approve comment
  const handleApprove = async (commentId: string) => {
    try {
      await approveBlogComment(commentId);
      // Refresh comments list
      fetchComments(currentPage, filterStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve comment");
    }
  };

  // Delete comment
  const handleDelete = async (id: string) => {
    try {
      await deleteBlogComment(id);

      // Refresh the comments list
      fetchComments(currentPage, filterStatus);
      setShowDeleteModal(false);
      setCommentToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete comment");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Truncate content for display
  const truncateContent = (text: string, maxLength = 100) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Confirm delete modal
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium text-[#1F2937] mb-4">
          Confirm Delete
        </h3>
        <p className="mb-6 text-[#737373]">
          Are you sure you want to delete this comment? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 bg-gray-200 text-[#1F2937] rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              commentToDelete !== null && handleDelete(commentToDelete)
            }
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Avenir Next, sans-serif' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]">Blog Comments</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchComments(currentPage, filterStatus)}
            className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#374151] hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 border-b border-[#E5E7EB]">
        <nav className="flex space-x-8">
          <button
            onClick={() => setFilterStatus("all")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              filterStatus === "all"
                ? "border-[#7D1A13] text-[#7D1A13]"
                : "border-transparent text-[#737373] hover:text-[#1F2937] hover:border-gray-300"
            }`}
          >
            All Comments
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              filterStatus === "pending"
                ? "border-[#7D1A13] text-[#7D1A13]"
                : "border-transparent text-[#737373] hover:text-[#1F2937] hover:border-gray-300"
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => setFilterStatus("approved")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              filterStatus === "approved"
                ? "border-[#7D1A13] text-[#7D1A13]"
                : "border-transparent text-[#737373] hover:text-[#1F2937] hover:border-gray-300"
            }`}
          >
            Approved
          </button>
        </nav>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <ArrowPathIcon className="h-8 w-8 text-[#7D1A13] animate-spin" />
        </div>
      ) : (
        <>
          {/* Comments table */}
          <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-[#F3F4F6]">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider"
                  >
                    Author
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider"
                  >
                    Comment
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider"
                  >
                    Blog Post
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-[#737373] uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#F3F4F6]">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <tr key={comment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-[#737373] text-sm font-medium">
                              {comment.user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[#1F2937]">
                              {comment.user.full_name}
                            </div>
                            <div className="text-sm text-[#737373]">
                              {comment.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#1F2937] max-w-md">
                          {truncateContent(comment.content)}
                        </div>
                        {comment.parent_comment_id && (
                          <div className="mt-1 flex items-center text-xs text-[#737373]">
                            <ChatBubbleLeftIcon className="h-3 w-3 mr-1" />
                            Reply to comment
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#737373]">
                          Post ID: {comment.blog_post_id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#737373]">
                          {formatDate(comment.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            comment.is_approved
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {comment.is_approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {!comment.is_approved && (
                            <button
                              onClick={() => handleApprove(comment.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve comment"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setCommentToDelete(comment.id);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete comment"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-[#737373]"
                    >
                      No comments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center space-x-4" aria-label="Pagination">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-[#E5E7EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white text-[#374151] hover:bg-gray-50"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-[#374151]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-[#E5E7EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white text-[#374151] hover:bg-gray-50"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
};

export default BlogCommentsManagement;
