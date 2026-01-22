"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  getBlogCategories,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  uploadBlogImage,
  type BlogCategory,
  type BlogPost,
} from "@/lib/blog-api";

interface BlogPostFormProps {
  postId?: string;
}

export default function BlogPostForm({ postId }: BlogPostFormProps) {
  const router = useRouter();
  const isEditMode = !!postId;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category_id: "",
    author_name: "",
    read_time: 5,
    is_featured: false,
    is_published: false,
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    featured_image: "",
  });

  // UI state
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showSeoFields, setShowSeoFields] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getBlogCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch existing post in edit mode
  useEffect(() => {
    if (isEditMode && postId) {
      const fetchPost = async () => {
        setIsLoading(true);
        try {
          const post = await getBlogPostById(postId);
          setFormData({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt || "",
            category_id: post.category_id || "",
            author_name: post.author_name || "",
            read_time: post.read_time || 5,
            is_featured: post.is_featured,
            is_published: post.is_published,
            meta_title: post.meta_title || "",
            meta_description: post.meta_description || "",
            meta_keywords: post.meta_keywords || "",
            featured_image: post.featured_image || "",
          });

          // Show SEO fields if they have data
          if (post.meta_title || post.meta_description || post.meta_keywords) {
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Auto-generate slug when title changes
    if (name === "title" && (!formData.slug || formData.slug === generateSlug(formData.title))) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    }

    // Clear error
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors({ featured_image: "Please select an image file" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ featured_image: "Image size must be less than 5MB" });
      return;
    }

    setUploadingImage(true);
    try {
      const result = await uploadBlogImage(file);
      setFormData((prev) => ({ ...prev, featured_image: result.url }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.featured_image;
        return newErrors;
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrors({ featured_image: "Failed to upload image" });
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove featured image
  const removeFeaturedImage = () => {
    setFormData((prev) => ({ ...prev, featured_image: "" }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    setSuccessMessage("");
    setErrors({});

    try {
      const postData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt || undefined,
        category_id: formData.category_id || undefined,
        author_name: formData.author_name || undefined,
        read_time: formData.read_time || undefined,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
        meta_title: formData.meta_title || undefined,
        meta_description: formData.meta_description || undefined,
        meta_keywords: formData.meta_keywords || undefined,
        featured_image: formData.featured_image || undefined,
      };

      if (isEditMode && postId) {
        await updateBlogPost(postId, postData);
        setSuccessMessage("Blog post updated successfully!");
      } else {
        await createBlogPost(postData);
        setSuccessMessage("Blog post created successfully!");

        // Redirect after brief delay
        setTimeout(() => {
          router.push("/dashboard/admin/blog");
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving post:", error);
      setErrors({
        form: error instanceof Error ? error.message : "Failed to save post",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Insert markdown syntax
  const insertMarkdown = (syntax: string, placeholder: string = "") => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const text = selectedText || placeholder;

    let newText = "";
    let cursorOffset = 0;

    switch (syntax) {
      case "bold":
        newText = `**${text}**`;
        cursorOffset = text === placeholder ? 2 : newText.length;
        break;
      case "italic":
        newText = `*${text}*`;
        cursorOffset = text === placeholder ? 1 : newText.length;
        break;
      case "code":
        newText = `\`${text}\``;
        cursorOffset = text === placeholder ? 1 : newText.length;
        break;
      case "link":
        newText = `[${text}](url)`;
        cursorOffset = text === placeholder ? 1 : newText.length - 4;
        break;
      case "image":
        newText = `![${text}](image-url)`;
        cursorOffset = newText.length - 1;
        break;
      case "h1":
        newText = `# ${text}`;
        cursorOffset = text === placeholder ? 2 : newText.length;
        break;
      case "h2":
        newText = `## ${text}`;
        cursorOffset = text === placeholder ? 3 : newText.length;
        break;
      case "h3":
        newText = `### ${text}`;
        cursorOffset = text === placeholder ? 4 : newText.length;
        break;
      case "ul":
        newText = `- ${text}`;
        cursorOffset = text === placeholder ? 2 : newText.length;
        break;
      case "ol":
        newText = `1. ${text}`;
        cursorOffset = text === placeholder ? 3 : newText.length;
        break;
    }

    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    const newValue = before + newText + after;

    setFormData((prev) => ({ ...prev, content: newValue }));

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/admin/blog"
            className="text-[#737373] hover:text-[#1F2937]"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-[#1F2937]">
            {isEditMode ? "Edit Blog Post" : "Create Blog Post"}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="inline-flex items-center px-4 py-2 bg-gray-200 text-[#374151] rounded-lg hover:bg-gray-300"
        >
          {showPreview ? (
            <>
              <EyeSlashIcon className="h-5 w-5 mr-2" />
              Hide Preview
            </>
          ) : (
            <>
              <EyeIcon className="h-5 w-5 mr-2" />
              Show Preview
            </>
          )}
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errors.form && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#374151] mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.title ? "border-red-500" : "border-[#E5E7EB]"
                }`}
                placeholder="Enter post title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-[#374151] mb-2">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.slug ? "border-red-500" : "border-[#E5E7EB]"
                }`}
                placeholder="post-url-slug"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-[#374151] mb-2">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Brief description of the post"
              />
            </div>

            {/* Content Editor */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-[#374151] mb-2">
                Content * {showPreview && "(Markdown)"}
              </label>

              {/* Markdown Toolbar */}
              <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-50 rounded-t-md border border-b-0 border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => insertMarkdown("bold", "bold text")}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("italic", "italic text")}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("h1", "Heading 1")}
                  className="p-2 hover:bg-gray-200 rounded text-sm"
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("h2", "Heading 2")}
                  className="p-2 hover:bg-gray-200 rounded text-sm"
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("h3", "Heading 3")}
                  className="p-2 hover:bg-gray-200 rounded text-sm"
                  title="Heading 3"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("ul", "list item")}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Bullet List"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("ol", "list item")}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Numbered List"
                >
                  1. List
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("link", "link text")}
                  className="p-2 hover:bg-gray-200 rounded"
                  title="Link"
                >
                  🔗
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown("code", "code")}
                  className="p-2 hover:bg-gray-200 rounded font-mono text-sm"
                  title="Code"
                >
                  &lt;/&gt;
                </button>
              </div>

              {showPreview ? (
                <div className="w-full min-h-[400px] px-4 py-2 border border-[#E5E7EB] rounded-b-md bg-white prose max-w-none">
                  <ReactMarkdown>{formData.content}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={20}
                  className={`w-full px-4 py-2 border rounded-b-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm ${
                    errors.content ? "border-red-500" : "border-[#E5E7EB]"
                  }`}
                  placeholder="Write your post content in Markdown..."
                />
              )}
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            {/* SEO Fields (Expandable) */}
            <div className="border-t pt-6">
              <button
                type="button"
                onClick={() => setShowSeoFields(!showSeoFields)}
                className="text-[#7D1A13] hover:text-[#7D1A13] font-medium"
              >
                {showSeoFields ? "− Hide" : "+ Show"} SEO Fields
              </button>

              {showSeoFields && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="meta_title" className="block text-sm font-medium text-[#374151] mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      id="meta_title"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="SEO title for search engines"
                    />
                  </div>

                  <div>
                    <label htmlFor="meta_description" className="block text-sm font-medium text-[#374151] mb-2">
                      Meta Description
                    </label>
                    <textarea
                      id="meta_description"
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="SEO description for search engines"
                    />
                  </div>

                  <div>
                    <label htmlFor="meta_keywords" className="block text-sm font-medium text-[#374151] mb-2">
                      Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      id="meta_keywords"
                      name="meta_keywords"
                      value={formData.meta_keywords}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Options */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-[#1F2937] mb-4">Publish</h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_published"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#7D1A13] focus:ring-purple-500 border-[#E5E7EB] rounded"
                  />
                  <label htmlFor="is_published" className="ml-2 block text-sm text-[#374151]">
                    Publish immediately
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="h-4 w-4 text-[#7D1A13] focus:ring-purple-500 border-[#E5E7EB] rounded"
                  />
                  <label htmlFor="is_featured" className="ml-2 block text-sm text-[#374151]">
                    Featured post
                  </label>
                </div>

                <div className="pt-4 border-t">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710] disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : isEditMode ? "Update Post" : "Create Post"}
                  </button>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-[#1F2937] mb-4">Category</h3>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-[#1F2937] mb-4">Author</h3>
              <input
                type="text"
                id="author_name"
                name="author_name"
                value={formData.author_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Author name"
              />
            </div>

            {/* Read Time */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-[#1F2937] mb-4">Read Time</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  id="read_time"
                  name="read_time"
                  value={formData.read_time}
                  onChange={handleChange}
                  min="1"
                  className="w-20 px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm text-[#737373]">minutes</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-[#1F2937] mb-4">Featured Image</h3>

              {formData.featured_image ? (
                <div className="relative">
                  <img
                    src={formData.featured_image}
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeFeaturedImage}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="featured_image"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-[#E5E7EB] border-dashed rounded-lg cursor-pointer hover:border-purple-500"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-[#737373]">
                        {uploadingImage ? "Uploading..." : "Click to upload image"}
                      </p>
                    </div>
                    <input
                      id="featured_image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  {errors.featured_image && (
                    <p className="mt-1 text-sm text-red-600">{errors.featured_image}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
