"use client";

import { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { blogApi } from "@/lib/strapi";

interface Category {
  id: number;
  attributes: {
    name: string;
    slug: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };
}

const BlogCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  // Fetch categories
  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const categories: any = await blogApi.getCategories()
      setCategories(categories.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate slug when name changes
    if (
      name === "name" &&
      (!formData.slug || formData.slug === generateSlug(formData.name))
    ) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
    });
  };

  // Open edit modal with category data
  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.attributes.name,
      slug: category.attributes.slug,
      description: category.attributes.description || "",
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const handleDeleteClick = (category: Category) => {
    setCurrentCategory(category);
    setShowDeleteModal(true);
  };

  // Handle create category
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.slug.trim()) {
      setError("Name and slug are required");
      return;
    }

    try {

      const createdCategory: any = await blogApi.createCategory({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
      })

      if (!createdCategory.data.id) {
        throw new Error(
          JSON.stringify(createdCategory) || "Failed to create category"
        );
      }

      // Refresh categories and close modal
      setShowAddModal(false);
      resetForm();
      fetchCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create category"
      );
    }
  };

  // Handle update category
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentCategory) return;

    if (!formData.name.trim() || !formData.slug.trim()) {
      setError("Name and slug are required");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/blog-categories/${currentCategory.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
          body: JSON.stringify({
            data: {
              name: formData.name,
              slug: formData.slug,
              description: formData.description,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "Failed to update category"
        );
      }

      // Refresh categories and close modal
      setShowEditModal(false);
      setCurrentCategory(null);
      resetForm();
      fetchCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update category"
      );
    }
  };

  // Handle delete category
  const handleDelete = async () => {
    if (!currentCategory) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/blog-categories/${currentCategory.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "Failed to delete category"
        );
      }

      // Refresh categories and close modal
      setShowDeleteModal(false);
      setCurrentCategory(null);
      fetchCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category"
      );
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

  // Category form modal (used for both add and edit)
  const CategoryFormModal = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {isEdit ? "Edit Category" : "Add New Category"}
          </h3>
          <button
            onClick={() => {
              isEdit ? setShowEditModal(false) : setShowAddModal(false);
              resetForm();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={isEdit ? handleUpdate : handleCreate}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Category name"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="category-slug"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              URL-friendly version of the name. Will be auto-generated.
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Category description (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                isEdit ? setShowEditModal(false) : setShowAddModal(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              {isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Delete confirmation modal
  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Confirm Delete
        </h3>
        <p className="mb-6 text-gray-600">
          Are you sure you want to delete the category "
          {currentCategory?.attributes.name}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          Blog Categories
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Category
          </button>
          <button
            onClick={fetchCategories}
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <ArrowPathIcon className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Categories table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Slug
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.attributes.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {category.attributes.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {category.attributes.description || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(category.attributes.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(category)}
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
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No categories found.
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="text-purple-600 hover:underline ml-1"
                      >
                        Create a new category
                      </button>
                      .
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modals */}
      {showAddModal && <CategoryFormModal />}
      {showEditModal && <CategoryFormModal isEdit />}
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
};

export default BlogCategories;
