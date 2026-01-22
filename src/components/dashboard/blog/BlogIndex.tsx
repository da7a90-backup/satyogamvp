"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  EyeIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  getBlogPosts,
  deleteBlogPost as deleteBlogPostApi,
  type BlogPost,
} from "@/lib/blog-api";

const BlogIndex = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const fetchBlogPosts = async (page = 1, query = "") => {
    setIsLoading(true);
    try {
      // Fetch posts from FastAPI backend - show all posts (published and drafts) in admin
      const data = await getBlogPosts(page, 10, query, undefined, undefined, undefined);

      setBlogPosts(data.posts);
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
    fetchBlogPosts(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchBlogPosts(1, searchQuery);
  };

  // Delete blog post
  const deleteBlogPost = async (id: string) => {
    try {
      await deleteBlogPostApi(id);

      // Refresh the blog posts list
      fetchBlogPosts(currentPage, searchQuery);
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Truncate excerpt for display
  const truncateExcerpt = (text?: string, maxLength = 50) => {
    if (!text) return "-";
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
          Are you sure you want to delete this blog post? This action cannot be
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
              postToDelete !== null && deleteBlogPost(postToDelete)
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
        <h1 className="text-2xl font-bold text-[#1F2937]">
          Blog Posts
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchBlogPosts(currentPage, searchQuery)}
            className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#374151] hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <Link
            href="/dashboard/admin/blog/create"
            className="px-4 py-2 bg-[#7D1A13] rounded-lg text-sm font-medium text-white hover:bg-[#6B1710] transition-colors inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Post
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            placeholder="Search blog posts..."
            className="px-4 py-2 border border-[#E5E7EB] rounded-l-md flex-grow focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#7D1A13] text-white rounded-r-md hover:bg-[#6B1710]"
          >
            Search
          </button>
        </form>
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
          {/* Blog posts table */}
          <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-[#F3F4F6]">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider"
                  >
                    Excerpt
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider"
                  >
                    Category
                  </th>
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
                {blogPosts.length > 0 ? (
                  blogPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {post.is_featured && (
                            <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                          )}
                          <div className="text-sm font-medium text-[#1F2937] truncate max-w-xs">
                            {post.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#737373] truncate max-w-xs">
                          {truncateExcerpt(post.excerpt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#737373]">
                          {post.category?.name || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#737373]">
                          {post.author_name || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#737373]">
                          {formatDate(post.created_at)}
                        </div>
                        {post.read_time && (
                          <div className="text-xs text-gray-400">
                            {post.read_time} min read
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            post.is_published
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {post.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/dashboard/admin/blog/edit/${post.id}`}
                            className="text-[#7D1A13] hover:text-blue-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => {
                              setPostToDelete(post.id);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
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
                      colSpan={7}
                      className="px-6 py-10 text-center text-[#737373]"
                    >
                      No blog posts found.{" "}
                      {searchQuery && "Try a different search term or "}
                      <Link
                        href="/dashboard/admin/blog/create"
                        className="text-[#7D1A13] hover:underline"
                      >
                        create a new post
                      </Link>
                      .
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

export default BlogIndex;