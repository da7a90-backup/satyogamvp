"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { fetchAPI, blogApi } from "@/lib/strapi";

interface Category {
  id: number;
  attributes: {
    name: string;
    slug: string;
  };
}

interface BlogFormProps {
  postId?: string; // Optional for editing existing posts
}

const BlogPostForm = ({ postId }: BlogFormProps) => {
  const router = useRouter();
  const isEditMode = !!postId;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    categoryId: "",
    author: "",
    readTime: 0,
    isFeatured: false,
    hiddenTag: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    canonicalUrl: "",
    publishImmediately: false,
  });

  // File upload state
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [metaImage, setMetaImage] = useState<File | null>(null);
  const [currentFeaturedImage, setCurrentFeaturedImage] = useState<
    string | null
  >(null);
  const [currentMetaImage, setCurrentMetaImage] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSeoFields, setShowSeoFields] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Use the fetchAPI helper instead of direct fetch
        const data: any = await fetchAPI("/api/blog-categories");
        setCategories(data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // If in edit mode, fetch the existing post
  useEffect(() => {
    if (isEditMode) {
      const fetchPost = async () => {
        setIsLoading(true);
        try {
          // Use blogApi helper instead of direct fetch
          const { data }: any = await blogApi.getPost(postId!);

          // Get the featured image URL if it exists
          let featuredImageUrl = null;
          if (data.attributes.featuredImage?.data) {
            featuredImageUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${
              data.attributes.featuredImage.data.attributes.url
            }`;
            setCurrentFeaturedImage(featuredImageUrl);
          }

          // Get the meta image URL if it exists
          let metaImageUrl = null;
          if (data.attributes.seo?.metaImage?.data) {
            metaImageUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${
              data.attributes.seo.metaImage.data.attributes.url
            }`;
            setCurrentMetaImage(metaImageUrl);
          }

          setFormData({
            title: data.attributes.title || "",
            slug: data.attributes.slug || "",
            content: data.attributes.content || "",
            excerpt: data.attributes.excerpt || "",
            categoryId: data.attributes.category?.data?.id.toString() || "",
            author: data.attributes.author?.data?.attributes.name || "",
            readTime: data.attributes.readTime || 0,
            isFeatured: data.attributes.isFeatured || false,
            hiddenTag: data.attributes.hiddenTag || "",
            metaTitle: data.attributes.seo?.metaTitle || "",
            metaDescription: data.attributes.seo?.metaDescription || "",
            keywords: data.attributes.seo?.keywords || "",
            canonicalUrl: data.attributes.seo?.canonicalURL || "",
            publishImmediately: !!data.attributes.publishedAt,
          });

          // Expand SEO fields if they have data
          if (
            data.attributes.seo?.metaTitle ||
            data.attributes.seo?.metaDescription ||
            data.attributes.seo?.keywords ||
            data.attributes.seo?.canonicalURL ||
            data.attributes.seo?.metaImage
          ) {
            setShowSeoFields(true);
          }
        } catch (error) {
          console.error("Error fetching post:", error);
          setErrors({ form: "Failed to load blog post" });
        } finally {
          setIsLoading(false);
        }
      };

      fetchPost();
    }
  }, [isEditMode, postId]);

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-generate slug when title changes
    if (
      name === "title" &&
      (!formData.slug || formData.slug === generateSlug(formData.title))
    ) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle file changes
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "featuredImage" | "metaImage"
  ) => {
    const file = e.target.files?.[0] || null;
    if (type === "featuredImage") {
      setFeaturedImage(file);
    } else {
      setMetaImage(file);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = "Excerpt is required";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload a file to Strapi
  const uploadFile = async (file: File): Promise<number> => {
    const formData = new FormData();
    formData.append("files", file);

    // Use fetchAPI helper instead of direct fetch
    const uploadResult: any = await fetchAPI("/api/upload", {
      method: "POST",
      headers: {
        // Don't set Content-Type header as it's automatically set by FormData
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      },
      body: formData,
    });

    return uploadResult[0].id;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    setSuccessMessage("");

    try {
      // First upload any images
      let featuredImageId = null;
      let metaImageId = null;

      if (featuredImage) {
        featuredImageId = await uploadFile(featuredImage);
      }

      if (metaImage) {
        metaImageId = await uploadFile(metaImage);
      }

      // Prepare request body with all the fields
      const postData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.categoryId
          ? { connect: [parseInt(formData.categoryId)] }
          : undefined,
        readTime: formData.readTime || undefined,
        isFeatured: formData.isFeatured,
        hiddenTag: formData.hiddenTag || undefined,

        // Handle SEO fields
        seo: {
          metaTitle: formData.metaTitle || undefined,
          metaDescription: formData.metaDescription || undefined,
          keywords: formData.keywords || undefined,
          canonicalURL: formData.canonicalUrl || undefined,
          metaImage: metaImageId ? { connect: [metaImageId] } : undefined,
        },

        // Handle featured image
        featuredImage: featuredImageId
          ? { connect: [featuredImageId] }
          : undefined,

        // If publishImmediately is true and it's a new post, set publishedAt to now
        ...(formData.publishImmediately &&
          !isEditMode && { publishedAt: new Date().toISOString() }),
        // If we're editing a post and changing its published state
        ...(isEditMode && {
          publishedAt: formData.publishImmediately
            ? // If it wasn't published before but should be now, set it to now
              new Date().toISOString()
            : // If it should be unpublished, set to null
              null,
        }),
      };

      // Use blogApi helpers instead of direct fetch
      if (isEditMode) {
        await blogApi.updatePost(postId!, postData);
      } else {
        await blogApi.createPost(postData);
      }

      setSuccessMessage(
        isEditMode
          ? "Blog post updated successfully!"
          : "Blog post created successfully!"
      );

      // If creating a new post, reset form or redirect
      if (!isEditMode) {
        setTimeout(() => {
          router.push("/dashboard/admin/blog");
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving post:", error);
      setErrors({
        form:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-purple-600 animate-spin" />
      </div>
    );
  }
// Return statement for BlogPostForm component
return (
  <div className="container mx-auto px-4 py-8">
    <div className="mb-6 flex items-center">
      <Link
        href="/dashboard/admin/blog"
        className="mr-4 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">
        {isEditMode ? "Edit Blog Post" : "Create New Blog Post"}
      </h1>
    </div>

    {/* Success message */}
    {successMessage && (
      <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
        {successMessage}
      </div>
    )}

    {/* Error message */}
    {errors.form && (
      <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
        {errors.form}
      </div>
    )}

    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-6"
    >
      {/* Title */}
      <div className="mb-6">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.title
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-purple-500"
          }`}
          placeholder="Enter post title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Slug */}
      <div className="mb-6">
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
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.slug
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-purple-500"
          }`}
          placeholder="enter-post-slug"
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            {errors.slug}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          The URL-friendly version of the title. Will be automatically
          generated from the title.
        </p>
      </div>

      {/* Category */}
      <div className="mb-6">
        <label
          htmlFor="categoryId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.categoryId
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-purple-500"
          }`}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.attributes.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            {errors.categoryId}
          </p>
        )}
      </div>

      {/* Excerpt */}
      <div className="mb-6">
        <label
          htmlFor="excerpt"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Excerpt <span className="text-red-500">*</span>
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          rows={3}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.excerpt
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-purple-500"
          }`}
          placeholder="Brief summary of the post"
        />
        {errors.excerpt && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            {errors.excerpt}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          A short summary that will appear in blog listings and search
          results.
        </p>
      </div>

      {/* Content */}
      <div className="mb-6">
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={12}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.content
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-purple-500"
          }`}
          placeholder="Write your blog post content here..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            {errors.content}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Markdown is supported. You can use # for headings, * for lists, etc.
        </p>
      </div>

      {/* Featured Image */}
      <div className="mb-6">
        <label
          htmlFor="featuredImage"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Featured Image
        </label>
        <div className="mt-1 flex items-center">
          <input
            type="file"
            id="featuredImage"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "featuredImage")}
            className="sr-only"
          />
          <label
            htmlFor="featuredImage"
            className="relative cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <span>Choose file</span>
          </label>
          <p className="ml-3 text-sm text-gray-500">
            {featuredImage ? featuredImage.name : "No file chosen"}
          </p>
        </div>
        {currentFeaturedImage && !featuredImage && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-2">Current image:</p>
            <div className="w-40 h-auto overflow-hidden rounded-md">
              <img
                src={currentFeaturedImage}
                alt="Current featured image"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Recommended size: 1200x630 pixels.
        </p>
      </div>

      {/* Additional Blog Details Section */}
      <div className="mb-6 border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Additional Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Author */}
          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Author
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Author name"
            />
          </div>

          {/* Read Time */}
          <div>
            <label
              htmlFor="readTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Read Time (minutes)
            </label>
            <input
              type="number"
              id="readTime"
              name="readTime"
              value={formData.readTime}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Hidden Tag */}
          <div>
            <label
              htmlFor="hiddenTag"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Hidden Tag
            </label>
            <input
              type="text"
              id="hiddenTag"
              name="hiddenTag"
              value={formData.hiddenTag}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Internal tag (not visible to readers)"
            />
          </div>
        </div>

        {/* Featured post */}
        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="isFeatured"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isFeatured"
            className="ml-2 block text-sm text-gray-700"
          >
            Feature this post (display prominently on the blog homepage)
          </label>
        </div>
      </div>

      {/* SEO Section - Toggle */}
      <div className="mb-6 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => setShowSeoFields(!showSeoFields)}
          className="text-lg font-medium text-gray-900 mb-4 flex items-center"
        >
          SEO Settings
          <svg
            className={`ml-2 h-5 w-5 transition-transform ${
              showSeoFields ? "transform rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {showSeoFields && (
          <div className="bg-gray-50 p-4 rounded-md">
            {/* Meta Title */}
            <div className="mb-4">
              <label
                htmlFor="metaTitle"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Meta Title
              </label>
              <input
                type="text"
                id="metaTitle"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="SEO title (defaults to post title if empty)"
              />
              <p className="mt-1 text-xs text-gray-500">
                Recommended length: 50-60 characters
              </p>
            </div>

            {/* Meta Description */}
            <div className="mb-4">
              <label
                htmlFor="metaDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Brief description for search engines"
              />
              <p className="mt-1 text-xs text-gray-500">
                Recommended length: 150-160 characters
              </p>
            </div>

            {/* Keywords */}
            <div className="mb-4">
              <label
                htmlFor="keywords"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Keywords
              </label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            {/* Canonical URL */}
            <div className="mb-4">
              <label
                htmlFor="canonicalUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Canonical URL
              </label>
              <input
                type="text"
                id="canonicalUrl"
                name="canonicalUrl"
                value={formData.canonicalUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/canonical-path"
              />
              <p className="mt-1 text-xs text-gray-500">
                Use this when content appears on multiple URLs to specify the
                preferred version
              </p>
            </div>

            {/* Meta Image */}
            <div className="mb-4">
              <label
                htmlFor="metaImage"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Social Media Image
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  id="metaImage"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "metaImage")}
                  className="sr-only"
                />
                <label
                  htmlFor="metaImage"
                  className="relative cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <span>Choose file</span>
                </label>
                <p className="ml-3 text-sm text-gray-500">
                  {metaImage ? metaImage.name : "No file chosen"}
                </p>
              </div>
              {currentMetaImage && !metaImage && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">Current image:</p>
                  <div className="w-40 h-auto overflow-hidden rounded-md">
                    <img
                      src={currentMetaImage}
                      alt="Current meta image"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Image that appears when shared on social media. Recommended
                size: 1200x630 pixels.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Publish immediately checkbox */}
      <div className="mb-6 flex items-center">
        <input
          type="checkbox"
          id="publishImmediately"
          name="publishImmediately"
          checked={formData.publishImmediately}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
        />
        <label
          htmlFor="publishImmediately"
          className="ml-2 block text-sm text-gray-700"
        >
          {isEditMode
            ? formData.publishImmediately
              ? "Published"
              : "Save as draft"
            : "Publish immediately"}
        </label>
      </div>

      {/* Submit buttons */}
      <div className="flex justify-end space-x-3">
        <Link
          href="/dashboard/admin/blog"
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <ArrowPathIcon className="inline h-4 w-4 mr-2 animate-spin" />
              {isEditMode ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEditMode ? "Update Post" : "Create Post"}</>
          )}
        </button>
      </div>
    </form>
  </div>
)
}

export default BlogPostForm;
