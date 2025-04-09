"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  HashtagIcon,
  CodeBracketIcon,
  ListBulletIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
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

  const [showPreview, setShowPreview] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

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
    // In your useEffect that fetches categories
    const fetchCategories = async () => {
      try {
        // Use the fetchAPI helper
        const data: any = await fetchAPI("/api/blog-categories");
        console.log("Categories API response:", data);
        setCategories(data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
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

    // Validate canonical URL
    if (name === "canonicalUrl") {
      if (value && !isValidUrl(value)) {
        setUrlError(
          "Please enter a valid URL (e.g., https://example.com/page)"
        );
      } else {
        setUrlError(null);
      }
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

  // Helper function to handle list continuation
  const handleContentKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    // Allow default behavior for copy/paste shortcuts
    if (
      (e.metaKey || e.ctrlKey) &&
      (e.key === "c" || e.key === "v" || e.key === "x")
    ) {
      return; // Let the browser handle copy/paste/cut
    }

    // Handle tab key for indentation
    if (e.key === "Tab") {
      e.preventDefault(); // Prevent moving focus to the next element

      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      // If text is selected, indent each line in the selection
      if (start !== end) {
        const selectedText = value.substring(start, end);
        const lines = selectedText.split("\n");

        // Handle shift+tab (outdent)
        if (e.shiftKey) {
          const outdentedLines = lines.map((line) => {
            if (line.startsWith("    ")) {
              return line.substring(4); // Remove 4 spaces
            } else if (line.startsWith("\t")) {
              return line.substring(1); // Remove 1 tab
            } else if (line.startsWith("  ")) {
              return line.substring(2); // Remove 2 spaces
            }
            return line;
          });

          const newText = outdentedLines.join("\n");
          const newContent =
            value.substring(0, start) + newText + value.substring(end);

          setFormData({ ...formData, content: newContent });

          // Set selection to maintain the same range
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = start;
              textareaRef.current.selectionEnd = start + newText.length;
            }
          }, 0);
        }
        // Regular tab (indent)
        else {
          const indentedLines = lines.map((line) => "    " + line);
          const newText = indentedLines.join("\n");
          const newContent =
            value.substring(0, start) + newText + value.substring(end);

          setFormData({ ...formData, content: newContent });

          // Set selection to maintain the same range
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = start;
              textareaRef.current.selectionEnd = start + newText.length;
            }
          }, 0);
        }
      }
      // No selection, just insert indentation at cursor position
      else {
        const newContent =
          value.substring(0, start) +
          "    " + // Insert 4 spaces
          value.substring(end);

        setFormData({ ...formData, content: newContent });

        // Place cursor after the inserted indentation
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start + 4;
            textareaRef.current.selectionEnd = start + 4;
          }
        }, 0);
      }
    }

    if (e.key === "Enter") {
      const textarea = e.currentTarget;
      const { value, selectionStart } = textarea;

      // Get the current line
      const currentLineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const currentLine = value.substring(currentLineStart, selectionStart);

      // Check if it's a list item
      const listItemMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);

      if (listItemMatch) {
        // If the list item is empty (just the bullet/number), end the list
        if (!listItemMatch[3].trim()) {
          e.preventDefault();
          const beforeCursor = value.substring(0, currentLineStart);
          const afterCursor = value.substring(selectionStart);
          setFormData({
            ...formData,
            content: beforeCursor + "\n" + afterCursor,
          });

          // Set cursor position after the inserted newline
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = currentLineStart + 1;
              textareaRef.current.selectionEnd = currentLineStart + 1;
            }
          }, 0);
        } else {
          // Continue the list with a new bullet/number
          e.preventDefault();
          const [, indent, bullet] = listItemMatch;
          const isNumbered = /^\d+\./.test(bullet);

          let newBullet;
          if (isNumbered) {
            const num = parseInt(bullet, 10);
            newBullet = `${num + 1}.`;
          } else {
            newBullet = bullet;
          }

          const insertion = `\n${indent}${newBullet} `;
          const newContent =
            value.substring(0, selectionStart) +
            insertion +
            value.substring(selectionStart);

          setFormData({ ...formData, content: newContent });

          // Set cursor position after the inserted list item
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart =
                selectionStart + insertion.length;
              textareaRef.current.selectionEnd =
                selectionStart + insertion.length;
            }
          }, 0);
        }
      }
    }
  };

  // Helper function to format selected text
  const formatSelectedText = (format: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const text = textarea.value;
    let newText = text;
    let cursorOffset = 0;

    switch (format) {
      case "bold":
        newText =
          text.substring(0, start) +
          `**${selectedText}**` +
          text.substring(end);
        cursorOffset = 2;
        break;
      case "italic":
        newText =
          text.substring(0, start) + `*${selectedText}*` + text.substring(end);
        cursorOffset = 1;
        break;
      case "h1":
        // For headings, ensure it starts on a new line
        if (start === 0 || text[start - 1] === "\n") {
          newText =
            text.substring(0, start) +
            `# ${selectedText}` +
            text.substring(end);
          cursorOffset = 2;
        } else {
          newText =
            text.substring(0, start) +
            `\n# ${selectedText}` +
            text.substring(end);
          cursorOffset = 3;
        }
        break;
      case "h2":
        if (start === 0 || text[start - 1] === "\n") {
          newText =
            text.substring(0, start) +
            `## ${selectedText}` +
            text.substring(end);
          cursorOffset = 3;
        } else {
          newText =
            text.substring(0, start) +
            `\n## ${selectedText}` +
            text.substring(end);
          cursorOffset = 4;
        }
        break;
      case "h3":
        if (start === 0 || text[start - 1] === "\n") {
          newText =
            text.substring(0, start) +
            `### ${selectedText}` +
            text.substring(end);
          cursorOffset = 4;
        } else {
          newText =
            text.substring(0, start) +
            `\n### ${selectedText}` +
            text.substring(end);
          cursorOffset = 5;
        }
        break;
      case "link":
        newText =
          text.substring(0, start) +
          `[${selectedText || "Link text"}](https://example.com)` +
          text.substring(end);
        cursorOffset = selectedText ? 1 : 10;
        break;
      case "list":
        // If selected text spans multiple lines, format each line as a list item
        if (selectedText.includes("\n")) {
          const lines = selectedText.split("\n");
          const formattedLines = lines.map((line) => `- ${line}`).join("\n");
          newText =
            text.substring(0, start) + formattedLines + text.substring(end);
        } else {
          newText =
            text.substring(0, start) +
            `- ${selectedText}` +
            text.substring(end);
        }
        cursorOffset = 2;
        break;
      case "code":
        // Format code block properly ensuring it's on its own lines
        if (selectedText.includes("\n")) {
          // For multiline selection, wrap in code fence
          if (start === 0 || text[start - 1] === "\n") {
            newText =
              text.substring(0, start) +
              "```\n" +
              selectedText +
              "\n```" +
              text.substring(end);
          } else {
            newText =
              text.substring(0, start) +
              "\n```\n" +
              selectedText +
              "\n```" +
              text.substring(end);
          }
          cursorOffset = 4;
        } else {
          // For single line, use inline code
          newText =
            text.substring(0, start) +
            "`" +
            selectedText +
            "`" +
            text.substring(end);
          cursorOffset = 1;
        }
        break;
      case "codeblock":
        // Always insert a code fence block
        if (start === 0 || text[start - 1] === "\n") {
          newText =
            text.substring(0, start) +
            "```\n" +
            selectedText +
            "\n```" +
            text.substring(end);
        } else {
          newText =
            text.substring(0, start) +
            "\n```\n" +
            selectedText +
            "\n```" +
            text.substring(end);
        }
        cursorOffset = 4;
        break;
    }

    setFormData({ ...formData, content: newText });

    // Set cursor position after formatting
    setTimeout(() => {
      if (textareaRef.current) {
        if (start === end) {
          // If no text was selected, place cursor in the meaningful position
          const cursorPos = start + cursorOffset;
          textareaRef.current.selectionStart = cursorPos;
          textareaRef.current.selectionEnd = cursorPos;
        } else {
          // If text was selected, place cursor at the end of the formatted block
          let cursorPos;
          if (format === "code" && selectedText.includes("\n")) {
            // For code blocks with multiple lines, place cursor after the closing ```
            cursorPos = start + selectedText.length + 8; // Account for ```\n and \n```
          } else if (format === "codeblock") {
            cursorPos = start + selectedText.length + 8; // Account for ```\n and \n```
          } else if (
            format.startsWith("h") &&
            (start === 0 || text[start - 1] !== "\n")
          ) {
            // For headings that needed a newline added
            cursorPos = end + cursorOffset + 1;
          } else {
            cursorPos = end + cursorOffset * 2;
          }
          textareaRef.current.selectionStart = cursorPos;
          textareaRef.current.selectionEnd = cursorPos;
        }
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Function to detect and apply markdown syntax on selection and shortcut keys
  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check if user has typed markdown syntax and selected text
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      // Only process if there's selected text
      if (start !== end) {
        const selectedText = text.substring(start, end);

        // Get the current line start
        const currentLineStart = text.lastIndexOf("\n", start - 1) + 1;

        // If user types ** at the beginning and end of selection, apply bold
        if (
          text.substring(start - 2, start) === "**" &&
          text.substring(end, end + 2) === "**"
        ) {
          // Remove the markdown syntax and apply formatting
          const newText =
            text.substring(0, start - 2) +
            selectedText +
            text.substring(end + 2);

          setFormData({ ...formData, content: newText });

          // Apply bold formatting programmatically
          formatSelectedText("bold");
        }

        // If user types * at the beginning and end of selection, apply italic
        else if (
          text.substring(start - 1, start) === "*" &&
          text.substring(end, end + 1) === "*" &&
          text.substring(start - 2, start) !== "**" &&
          text.substring(end, end + 2) !== "**"
        ) {
          // Remove the markdown syntax and apply formatting
          const newText =
            text.substring(0, start - 1) +
            selectedText +
            text.substring(end + 1);

          setFormData({ ...formData, content: newText });

          // Apply italic formatting programmatically
          formatSelectedText("italic");
        }

        // If user types # at the beginning of a line with selected text
        else if (text.substring(currentLineStart, start) === "# ") {
          // Apply heading formatting
          formatSelectedText("h1");
        } else if (text.substring(currentLineStart, start) === "## ") {
          // Apply heading formatting
          formatSelectedText("h2");
        } else if (text.substring(currentLineStart, start) === "### ") {
          // Apply heading formatting
          formatSelectedText("h3");
        }
      }
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

  // Handle URL changes
  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty URL is considered valid (just not filled)

    try {
      // Try to create a URL object - this will throw an error for invalid URLs
      new URL(url);
      return true;
    } catch (error) {
      return false;
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

    // Check canonical URL
    if (formData.canonicalUrl && !isValidUrl(formData.canonicalUrl)) {
      newErrors.canonicalUrl = "Please enter a valid URL";
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

        {/* Content - Further Enhanced Rich Text (Markdown) */}
        <div className="mb-6">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Content <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex justify-between items-center">
              <span className="text-xs text-gray-500">Markdown Editor</span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => formatSelectedText("bold")}
                  title="Bold"
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <strong className="text-xs">B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => formatSelectedText("italic")}
                  title="Italic"
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <em className="text-xs">I</em>
                </button>

                {/* Heading dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowHeadingMenu(!showHeadingMenu)}
                    title="Headings"
                    className="p-1 rounded hover:bg-gray-200 flex items-center"
                  >
                    <HashtagIcon className="h-4 w-4" />
                  </button>

                  {showHeadingMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10">
                      <button
                        type="button"
                        onClick={() => {
                          formatSelectedText("h1");
                          setShowHeadingMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <span className="font-bold text-lg">Heading 1</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          formatSelectedText("h2");
                          setShowHeadingMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <span className="font-bold text-base">Heading 2</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          formatSelectedText("h3");
                          setShowHeadingMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <span className="font-bold text-sm">Heading 3</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => formatSelectedText("link")}
                  title="Link"
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => formatSelectedText("list")}
                  title="List"
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => formatSelectedText("codeblock")}
                  title="Code Block"
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <CodeBracketIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative">
              {/* Editor */}
              {!showPreview && (
                <textarea
                  ref={textareaRef}
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  onKeyDown={handleContentKeyDown}
                  onKeyUp={handleKeyUp}
                  rows={15}
                  className={`w-full px-4 py-2 border-0 focus:outline-none focus:ring-0 ${
                    errors.content ? "bg-red-50" : "bg-white"
                  }`}
                  placeholder="Write your blog post content here using Markdown..."
                />
              )}
              {/* Preview */}
              {showPreview && (
                <div className="prose max-w-none p-4 min-h-[300px] bg-white overflow-y-auto markdown-preview">
                  <ReactMarkdown>
                    {formData.content || "Nothing to preview yet"}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          {errors.content && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <ExclamationCircleIcon className="h-4 w-4 mr-1" />
              {errors.content}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Supports Markdown: **bold**, *italic*, headings, lists, code
              blocks, and more
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-500">
                {formData.content.length} characters
              </p>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200"
              >
                {showPreview ? "Edit" : "Preview"}
              </button>
            </div>
          </div>
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
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    urlError || errors.canonicalUrl
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-purple-500"
                  }`}
                  placeholder="https://example.com/canonical-path"
                />
                {(urlError || errors.canonicalUrl) && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    {urlError || errors.canonicalUrl}
                  </p>
                )}
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
  );
};

export default BlogPostForm;
