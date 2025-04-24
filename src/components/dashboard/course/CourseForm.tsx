"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  HashtagIcon,
  CodeBracketIcon,
  ListBulletIcon,
  LinkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { courseApi } from "@/lib/courseApi";

interface Instructor {
  id: number;
  attributes: {
    name: string;
    title?: string;
    bio?: string;
  };
}

interface CourseFormProps {
  courseId?: string; // Optional for editing existing courses
}

const CourseForm = ({ courseId }: CourseFormProps) => {
  const router = useRouter();
  const isEditMode = !!courseId;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    isFree: false,
    price: 0,
    startDate: "",
    endDate: "",
    instructorIds: [] as number[],
    isFeatured: false,
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    canonicalUrl: "",
    publishImmediately: false,
  });

  // UI states
  const [showPreview, setShowPreview] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showSeoFields, setShowSeoFields] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [metaImage, setMetaImage] = useState<File | null>(null);
  const [currentFeaturedImage, setCurrentFeaturedImage] = useState<
    string | null
  >(null);
  const [currentMetaImage, setCurrentMetaImage] = useState<string | null>(null);

  // Fetch instructors
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        // Use courseApi utility function
        const response = await courseApi.getInstructors();
        setInstructors(response.data || []);
      } catch (error) {
        console.error("Error fetching instructors:", error);
        setInstructors([]);
      }
    };

    fetchInstructors();
  }, []);

  // If in edit mode, fetch the existing course
  useEffect(() => {
    if (isEditMode) {
      const fetchCourse = async () => {
        setIsLoading(true);
        try {
          // Use courseApi utility function
          const response = await courseApi.getCourse(courseId!);
          const data = response.data;

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

          // Get instructor IDs
          const instructorIds = data.attributes.instructors?.data
            ? data.attributes.instructors.data.map(
                (instructor) => instructor.id
              )
            : [];

          setFormData({
            title: data.attributes.title || "",
            slug: data.attributes.slug || "",
            description: data.attributes.description || "",
            isFree: data.attributes.isFree || false,
            price: data.attributes.price || 0,
            startDate: data.attributes.startDate
              ? new Date(data.attributes.startDate).toISOString().split("T")[0]
              : "",
            endDate: data.attributes.endDate
              ? new Date(data.attributes.endDate).toISOString().split("T")[0]
              : "",
            instructorIds: instructorIds,
            isFeatured: data.attributes.isFeatured || false,
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
          console.error("Error fetching course:", error);
          setErrors({ form: "Failed to load course" });
        } finally {
          setIsLoading(false);
        }
      };

      fetchCourse();
    }
  }, [isEditMode, courseId]);

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

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));

    // If making course free, reset price to 0
    if (name === "isFree" && checked) {
      setFormData((prev) => ({ ...prev, price: 0 }));
    }
  };

  // Handle multi-select for instructors
  const handleInstructorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value)
    );
    setFormData((prev) => ({ ...prev, instructorIds: selectedOptions }));
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

  // Handle URL validation
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

  // Helper function to format selected text in markdown
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
      case "link":
        newText =
          text.substring(0, start) +
          `[${selectedText || "Link text"}](https://example.com)` +
          text.substring(end);
        cursorOffset = selectedText ? 1 : 10;
        break;
      case "list":
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
    }

    setFormData({ ...formData, description: newText });

    // Set cursor position after formatting
    setTimeout(() => {
      if (textareaRef.current) {
        if (start === end) {
          const cursorPos = start + cursorOffset;
          textareaRef.current.selectionStart = cursorPos;
          textareaRef.current.selectionEnd = cursorPos;
        } else {
          let cursorPos;
          if (
            format.startsWith("h") &&
            (start === 0 || text[start - 1] !== "\n")
          ) {
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

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.isFree && (!formData.price || formData.price <= 0)) {
      newErrors.price = "Price must be greater than 0 for paid courses";
    }

    if (formData.canonicalUrl && !isValidUrl(formData.canonicalUrl)) {
      newErrors.canonicalUrl = "Please enter a valid URL";
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

    try {
      // First upload any images
      let featuredImageId = null;
      let metaImageId = null;

      if (featuredImage) {
        try {
          console.log("Attempting to upload featured image...");
          const result = await courseApi.uploadFile(featuredImage);
          featuredImageId = result.id; // Get the ID from the result
          console.log(
            "Featured image uploaded successfully, ID:",
            featuredImageId
          );
        } catch (uploadError) {
          console.error("Featured image upload failed:", uploadError);
          setErrors({
            form: "Failed to upload featured image. Please try again or skip adding an image.",
          });
          setIsSaving(false);
          return;
        }
      }

      if (metaImage) {
        try {
          const result = await courseApi.uploadFile(metaImage);
          metaImageId = result.id; // Get the ID from the result
          console.log("Meta image uploaded successfully, ID:", metaImageId);
        } catch (uploadError) {
          console.error("Meta image upload failed:", uploadError);
          // Continue with form submission even if meta image fails
        }
      }

      // Prepare request body with all the fields
      const courseData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        isFree: formData.isFree,
        price: formData.isFree ? 0 : formData.price,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        isFeatured: formData.isFeatured,

        // Handle instructors
        instructors:
          formData.instructorIds.length > 0
            ? { connect: formData.instructorIds }
            : undefined,

        // SEO fields
        ...(formData.metaTitle ||
        formData.metaDescription ||
        formData.keywords ||
        formData.canonicalUrl ||
        metaImageId
          ? {
              seo: {
                metaTitle: formData.metaTitle || undefined,
                metaDescription: formData.metaDescription || undefined,
                keywords: formData.keywords || undefined,
                canonicalURL: formData.canonicalUrl || undefined,
                ...(metaImageId
                  ? { metaImage: metaImageId } // Direct ID as per Strapi docs
                  : {}),
              },
            }
          : {}),

        // Featured image - DIRECT ID as per Strapi documentation
        ...(featuredImageId ? { featuredImage: featuredImageId } : {}),

        // Handle published state
        publishedAt: formData.publishImmediately
          ? new Date().toISOString()
          : null,
      };

      console.log(
        "Submitting course data:",
        JSON.stringify(courseData, null, 2)
      );

      if (isEditMode) {
        await courseApi.updateCourse(courseId!, courseData);
      } else {
        await courseApi.createCourse(courseData);
      }

      setSuccessMessage(
        isEditMode
          ? "Course updated successfully!"
          : "Course created successfully!"
      );

      // If creating a new course, redirect after a brief delay
      if (!isEditMode) {
        setTimeout(() => {
          router.push("/dashboard/admin/course");
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving course:", error);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Link
          href="/dashboard/admin/course"
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? "Edit Course" : "Create New Course"}
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
            placeholder="Enter course title"
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
            placeholder="enter-course-slug"
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

        {/* Description - Enhanced Rich Text (Markdown) */}
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description <span className="text-red-500">*</span>
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
              </div>
            </div>

            <div className="relative">
              {/* Editor */}
              {!showPreview && (
                <textarea
                  ref={textareaRef}
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={10}
                  className={`w-full px-4 py-2 border-0 focus:outline-none focus:ring-0 ${
                    errors.description ? "bg-red-50" : "bg-white"
                  }`}
                  placeholder="Write your course description here using Markdown..."
                />
              )}
              {/* Preview */}
              {showPreview && (
                <div className="prose max-w-none p-4 min-h-[200px] bg-white overflow-y-auto markdown-preview">
                  <ReactMarkdown>
                    {formData.description || "Nothing to preview yet"}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>

          {errors.description && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <ExclamationCircleIcon className="h-4 w-4 mr-1" />
              {errors.description}
            </p>
          )}

          <div className="mt-2 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              {showPreview ? "Edit" : "Preview"}
            </button>
          </div>
        </div>

        {/* Price Details */}
        <div className="mb-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Price Details
          </h3>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isFree"
                checked={formData.isFree}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                This is a free course
              </span>
            </label>
          </div>

          {!formData.isFree && (
            <div className="mb-4">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.price
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-500"
                }`}
                placeholder="29.99"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                  {errors.price}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Date Details */}
        <div className="mb-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5 mr-2 text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
            Course Dates
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Instructors */}
        <div className="mb-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
            Instructors
          </h3>

          <div className="mb-4">
            <label
              htmlFor="instructors"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Instructors
            </label>
            <select
              id="instructors"
              multiple
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={formData.instructorIds.map((id) => id.toString())}
              onChange={handleInstructorChange}
              size={Math.min(5, instructors.length)}
            >
              {instructors.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>
                  {instructor.attributes.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Hold Ctrl/Cmd key to select multiple instructors
            </p>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Course Image
          </h3>

          <div className="mb-4">
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
              Recommended size: 1200x630 pixels
            </p>
          </div>
        </div>

        {/* Additional Details */}
        <div className="mb-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Additional Options
          </h3>

          {/* Featured course */}
          <div className="mb-4 flex items-center">
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
              Feature this course (display prominently on the homepage)
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
                  placeholder="SEO title (defaults to course title if empty)"
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
                  Recommended size: 1200x630 pixels
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
            href="/dashboard/admin/course"
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
              <>{isEditMode ? "Update Course" : "Create Course"}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
