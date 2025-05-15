"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  HashtagIcon,
  CodeBracketIcon,
  ListBulletIcon,
  LinkIcon,
  UserIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
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

interface LearningPoint {
  title: string;
  description: string;
}

interface CourseFeatures {
  videoClasses: string;
  guidedMeditations: string;
  studyMaterials: string;
  supportInfo: string;
  curriculumAids: string;
}

interface FeaturedQuote {
  quoteText: string;
  authorName: string;
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
    subtitle: "", // New subtitle field
    description: "",
    isFree: false,
    price: 0,
    startDate: "",
    endDate: "",
    instructorIds: [] as number[],
    publishImmediately: false,
    whatYouWillLearn: { learningPoints: [] as LearningPoint[] },
    courseFeatures: {
      videoClasses: "",
      guidedMeditations: "",
      studyMaterials: "",
      supportInfo: "",
      curriculumAids: "",
    },
    featuredQuote: { quoteText: "", authorName: "" },
    introduction: "",
    addendum: "",
  });

  // UI states
  const [showPreview, setShowPreview] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [previewMedia, setPreviewMedia] = useState<File[]>([]);
  const [quoteAuthorImage, setQuoteAuthorImage] = useState<File | null>(null);
  const [currentFeaturedImage, setCurrentFeaturedImage] = useState<
    string | null
  >(null);
  const [currentPreviewMedia, setCurrentPreviewMedia] = useState<
    { id: number; url: string; name: string }[]
  >([]);
  const [currentQuoteAuthorImage, setCurrentQuoteAuthorImage] = useState<
    string | null
  >(null);

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

          // Get preview media if it exists
          if (data.attributes.previewMedia?.data) {
            const mediaItems = data.attributes.previewMedia.data.map(
              (item: any) => ({
                id: item.id,
                url: `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${
                  item.attributes.url
                }`,
                name: item.attributes.name,
              })
            );
            setCurrentPreviewMedia(mediaItems);
          }

          // Get quote author image if it exists
          if (data.attributes.featuredQuote?.authorImage?.data) {
            const authorImageUrl = `${
              process.env.NEXT_PUBLIC_STRAPI_URL || ""
            }${data.attributes.featuredQuote.authorImage.data.attributes.url}`;
            setCurrentQuoteAuthorImage(authorImageUrl);
          }

          // Get instructor IDs
          const instructorIds = data.attributes.instructors?.data
            ? data.attributes.instructors.data.map(
                (instructor) => instructor.id
              )
            : [];

          // Get learning points
          const learningPoints =
            data.attributes.whatYouWillLearn?.learningPoints || [];

          // Get course features
          const courseFeatures = data.attributes.courseFeatures || {
            videoClasses: "",
            guidedMeditations: "",
            studyMaterials: "",
            supportInfo: "",
            curriculumAids: "",
          };

          // Get featured quote
          const featuredQuote = data.attributes.featuredQuote || {
            quoteText: "",
            authorName: "",
          };

          setFormData({
            title: data.attributes.title || "",
            slug: data.attributes.slug || "",
            subtitle: data.attributes.subtitle || "",
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
            publishImmediately: !!data.attributes.publishedAt,
            whatYouWillLearn: { learningPoints: learningPoints },
            courseFeatures: courseFeatures,
            featuredQuote: featuredQuote,
            introduction: data.attributes.introduction || "", // <-- New field
            addendum: data.attributes.addendum || "", // <-- New field
          });
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

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle nested object changes
  const handleNestedChange = (
    objectName: "whatYouWillLearn" | "courseFeatures" | "featuredQuote",
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [objectName]: {
        ...prev[objectName],
        [field]: value,
      },
    }));
  };

  // Handle learning point changes
  const handleLearningPointChange = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    setFormData((prev) => {
      const newLearningPoints = [...prev.whatYouWillLearn.learningPoints];
      newLearningPoints[index] = {
        ...newLearningPoints[index],
        [field]: value,
      };
      return {
        ...prev,
        whatYouWillLearn: {
          ...prev.whatYouWillLearn,
          learningPoints: newLearningPoints,
        },
      };
    });
  };

  // Add new learning point
  const addLearningPoint = () => {
    if (formData.whatYouWillLearn.learningPoints.length < 5) {
      setFormData((prev) => ({
        ...prev,
        whatYouWillLearn: {
          ...prev.whatYouWillLearn,
          learningPoints: [
            ...prev.whatYouWillLearn.learningPoints,
            { title: "", description: "" },
          ],
        },
      }));
    }
  };

  // Remove learning point
  const removeLearningPoint = (index: number) => {
    setFormData((prev) => {
      const newLearningPoints = [...prev.whatYouWillLearn.learningPoints];
      newLearningPoints.splice(index, 1);
      return {
        ...prev,
        whatYouWillLearn: {
          ...prev.whatYouWillLearn,
          learningPoints: newLearningPoints,
        },
      };
    });
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
    type: "featuredImage" | "quoteAuthorImage" | "previewMedia"
  ) => {
    if (type === "previewMedia") {
      const files = e.target.files ? Array.from(e.target.files) : [];
      setPreviewMedia([...previewMedia, ...files]);
    } else {
      const file = e.target.files?.[0] || null;
      if (type === "featuredImage") {
        setFeaturedImage(file);
      } else if (type === "quoteAuthorImage") {
        setQuoteAuthorImage(file);
      }
    }
  };

  // Remove preview media item
  const removePreviewMedia = (index: number) => {
    setPreviewMedia((prev) => {
      const newPreviewMedia = [...prev];
      newPreviewMedia.splice(index, 1);
      return newPreviewMedia;
    });
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

    // Validate learning points
    formData.whatYouWillLearn.learningPoints.forEach((point, index) => {
      if (point.title.length > 250) {
        newErrors[`learningPoint_${index}_title`] =
          "Title must be less than 250 characters";
      }
      if (point.description.length > 250) {
        newErrors[`learningPoint_${index}_description`] =
          "Description must be less than 250 characters";
      }
    });

    // Validate course features
    Object.entries(formData.courseFeatures).forEach(([key, value]) => {
      if (typeof value === "string" && value.length > 250) {
        newErrors[
          `courseFeature_${key}`
        ] = `This field must be less than 250 characters`;
      }
    });

    // Validate quote text
    if (
      formData.featuredQuote.quoteText &&
      formData.featuredQuote.quoteText.length > 300
    ) {
      newErrors.quoteText = "Quote must be less than 300 characters";
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
      let quoteAuthorImageId = null;
      let previewMediaIds: number[] = [];

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

      if (quoteAuthorImage) {
        try {
          const result = await courseApi.uploadFile(quoteAuthorImage);
          quoteAuthorImageId = result.id;
          console.log(
            "Quote author image uploaded successfully, ID:",
            quoteAuthorImageId
          );
        } catch (uploadError) {
          console.error("Quote author image upload failed:", uploadError);
          // Continue with form submission even if author image fails
        }
      }

      // Upload preview media files
      if (previewMedia.length > 0) {
        for (const media of previewMedia) {
          try {
            const result = await courseApi.uploadFile(media);
            previewMediaIds.push(result.id);
          } catch (uploadError) {
            console.error(
              `Preview media upload failed for ${media.name}:`,
              uploadError
            );
            // Continue with form submission even if some media fails
          }
        }
      }

      // Prepare request body with all the fields
      const courseData = {
        title: formData.title,
        slug: formData.slug,
        subtitle: formData.subtitle,
        description: formData.description,
        isFree: formData.isFree,
        price: formData.isFree ? 0 : formData.price,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        introduction: formData.introduction,
        addendum: formData.addendum,

        // Handle instructors correctly for Strapi v4
        instructors: {
          connect:
            formData.instructorIds.length > 0 ? formData.instructorIds : [],
        },

        // Format whatYouWillLearn as a direct array (as required by Strapi)
        whatYouWillLearn: formData.whatYouWillLearn.learningPoints,

        // Format courseFeatures as a single component with fields
        courseFeatures: {
          videoClasses: formData.courseFeatures.videoClasses,
          guidedMeditations: formData.courseFeatures.guidedMeditations,
          studyMaterials: formData.courseFeatures.studyMaterials,
          supportInfo: formData.courseFeatures.supportInfo,
          curriculumAids: formData.courseFeatures.curriculumAids,
        },

        featuredQuote: {
          quoteText: formData.featuredQuote.quoteText,
          authorName: formData.featuredQuote.authorName,
          ...(quoteAuthorImageId ? { authorImage: quoteAuthorImageId } : {}),
        },

        // Preview media
        ...(previewMediaIds.length > 0
          ? { previewMedia: previewMediaIds }
          : {}),

        // Featured image
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
          router.push("/dashboard/admin/course/${coureseId}");
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
        {/* Subtitle */}
        <div className="mb-6">
          <label
            htmlFor="subtitle"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subtitle
          </label>
          <input
            type="text"
            id="subtitle"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 focus:ring-purple-500`}
            placeholder="Enter a short subtitle to display on the course page"
          />
          <p className="mt-1 text-xs text-gray-500">
            A brief subtitle to display on the course selling page (will be
            shown instead of the full description)
          </p>
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

        {/* What You Will Learn Section */}
        <div className="mb-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            What You Will Learn
          </h3>

          {/* Learning Points */}
          {formData.whatYouWillLearn.learningPoints.map((point, index) => (
            <div key={index} className="mb-6 p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Learning Point {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeLearningPoint(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-3">
                <label
                  htmlFor={`learningPointTitle${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <input
                  type="text"
                  id={`learningPointTitle${index}`}
                  value={point.title}
                  onChange={(e) =>
                    handleLearningPointChange(index, "title", e.target.value)
                  }
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors[`learningPoint_${index}_title`]
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-purple-500"
                  }`}
                  placeholder="e.g., Discover A Unique Approach to Self-Realization"
                  maxLength={250}
                />
                {errors[`learningPoint_${index}_title`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[`learningPoint_${index}_title`]}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {point.title.length}/250 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor={`learningPointDescription${index}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id={`learningPointDescription${index}`}
                  value={point.description}
                  onChange={(e) =>
                    handleLearningPointChange(
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                    errors[`learningPoint_${index}_description`]
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-purple-500"
                  }`}
                  placeholder="Our novel approach to empowerment and a life of joyous fulfillment..."
                  maxLength={250}
                />
                {errors[`learningPoint_${index}_description`] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[`learningPoint_${index}_description`]}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {point.description.length}/250 characters
                </p>
              </div>
            </div>
          ))}

          {formData.whatYouWillLearn.learningPoints.length < 5 && (
            <button
              type="button"
              onClick={addLearningPoint}
              className="flex items-center text-purple-600 hover:text-purple-800"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Add Learning Point (
              {formData.whatYouWillLearn.learningPoints.length}/5)
            </button>
          )}
        </div>

        {/* Course Features */}
        <div className="mb-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            This course includes:
          </h3>

          {/* Video Classes */}
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <div className="mb-2">
              <label
                htmlFor="videoClasses"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Video Classes
              </label>
              <textarea
                id="videoClasses"
                value={formData.courseFeatures.videoClasses}
                onChange={(e) =>
                  handleNestedChange(
                    "courseFeatures",
                    "videoClasses",
                    e.target.value
                  )
                }
                rows={3}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.courseFeature_videoClasses
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-500"
                }`}
                placeholder="e.g., 7 video classes - These in-depth presentations comprise over 3.5 hours of class time!"
                maxLength={250}
              />
              {errors.courseFeature_videoClasses && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.courseFeature_videoClasses}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.courseFeatures.videoClasses.length}/250 characters
              </p>
            </div>
          </div>

          {/* Guided Meditations */}
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <div className="mb-2">
              <label
                htmlFor="guidedMeditations"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Guided Meditations
              </label>
              <textarea
                id="guidedMeditations"
                value={formData.courseFeatures.guidedMeditations}
                onChange={(e) =>
                  handleNestedChange(
                    "courseFeatures",
                    "guidedMeditations",
                    e.target.value
                  )
                }
                rows={3}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.courseFeature_guidedMeditations
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-500"
                }`}
                placeholder="e.g., 7 Guided meditations - Seven Specially selected meditations guided by Shunyamurti"
                maxLength={250}
              />
              {errors.courseFeature_guidedMeditations && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.courseFeature_guidedMeditations}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.courseFeatures.guidedMeditations.length}/250
                characters
              </p>
            </div>
          </div>

          {/* Study Materials */}
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <div className="mb-2">
              <label
                htmlFor="studyMaterials"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Study Materials
              </label>
              <textarea
                id="studyMaterials"
                value={formData.courseFeatures.studyMaterials}
                onChange={(e) =>
                  handleNestedChange(
                    "courseFeatures",
                    "studyMaterials",
                    e.target.value
                  )
                }
                rows={3}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.courseFeature_studyMaterials
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-500"
                }`}
                placeholder="e.g., Additional study materials - Each lesson is supplemented with illuminating videos and essays"
                maxLength={250}
              />
              {errors.courseFeature_studyMaterials && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.courseFeature_studyMaterials}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.courseFeatures.studyMaterials.length}/250 characters
              </p>
            </div>
          </div>

          {/* Support Info */}
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <div className="mb-2">
              <label
                htmlFor="supportInfo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Support Information
              </label>
              <textarea
                id="supportInfo"
                value={formData.courseFeatures.supportInfo}
                onChange={(e) =>
                  handleNestedChange(
                    "courseFeatures",
                    "supportInfo",
                    e.target.value
                  )
                }
                rows={3}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.courseFeature_supportInfo
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-500"
                }`}
                placeholder="e.g., Comments and questions - Radha Ma and the Sat Yoga Teaching Team will be available to answer questions"
                maxLength={250}
              />
              {errors.courseFeature_supportInfo && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.courseFeature_supportInfo}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.courseFeatures.supportInfo.length}/250 characters
              </p>
            </div>
          </div>

          {/* Curriculum Aids */}
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <div className="mb-2">
              <label
                htmlFor="curriculumAids"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Curriculum Aids
              </label>
              <textarea
                id="curriculumAids"
                value={formData.courseFeatures.curriculumAids}
                onChange={(e) =>
                  handleNestedChange(
                    "courseFeatures",
                    "curriculumAids",
                    e.target.value
                  )
                }
                rows={3}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors.courseFeature_curriculumAids
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-purple-500"
                }`}
                placeholder="e.g., Curriculum study aids - Heart opening writing exercises and mind-expanding thoughts experiments"
                maxLength={250}
              />
              {errors.courseFeature_curriculumAids && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.courseFeature_curriculumAids}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.courseFeatures.curriculumAids.length}/250 characters
              </p>
            </div>
          </div>
        </div>

        {/* Introduction Section */}
        <div className="mb-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Introduction
          </h3>
          <textarea
            id="introduction"
            name="introduction"
            value={formData.introduction}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Write an introductory text for the course..."
          />
        </div>

        {/* Addendum Section */}
        <div className="mb-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Addendum</h3>
          <textarea
            id="addendum"
            name="addendum"
            value={formData.addendum}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Write any additional notes or afterword for the course..."
          />
        </div>

        {/* Preview Media */}
        <div className="mb-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Preview Media (Optional)
          </h3>

          {/* Current preview media display */}
          {currentPreviewMedia.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Current Preview Media:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentPreviewMedia.map((media, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={media.url}
                        alt={`Preview media ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs mt-1 block truncate">
                      {media.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New preview media display */}
          {previewMedia.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                New Preview Media to Upload:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewMedia.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square border rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm text-gray-500 p-2 text-center">
                          {file.name}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePreviewMedia(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-xs mt-1 block truncate">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <label
              htmlFor="previewMedia"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Add Preview Images/Videos
            </label>
            <input
              type="file"
              id="previewMedia"
              multiple
              accept="image/*,video/*"
              onChange={(e) => handleFileChange(e, "previewMedia")}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0 file:text-sm file:font-semibold
                        file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Upload images or videos to promote your course (optional)
            </p>
          </div>
        </div>

        {/* Featured Quote */}
        <div className="mb-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Featured Quote (Optional)
          </h3>

          <div className="mb-4">
            <label
              htmlFor="quoteText"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Quote Text
            </label>
            <textarea
              id="quoteText"
              value={formData.featuredQuote.quoteText}
              onChange={(e) =>
                handleNestedChange("featuredQuote", "quoteText", e.target.value)
              }
              rows={3}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.quoteText
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-purple-500"
              }`}
              placeholder='e.g., "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."'
              maxLength={300}
            />
            {errors.quoteText && (
              <p className="mt-1 text-sm text-red-600">{errors.quoteText}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.featuredQuote.quoteText.length}/300 characters
            </p>
          </div>

          <div className="mb-4">
            <label
              htmlFor="authorName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Author Name
            </label>
            <input
              type="text"
              id="authorName"
              value={formData.featuredQuote.authorName}
              onChange={(e) =>
                handleNestedChange(
                  "featuredQuote",
                  "authorName",
                  e.target.value
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Shunyamurti"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="quoteAuthorImage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Author Image
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                id="quoteAuthorImage"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "quoteAuthorImage")}
                className="sr-only"
              />
              <label
                htmlFor="quoteAuthorImage"
                className="relative cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <span>Choose file</span>
              </label>
              <p className="ml-3 text-sm text-gray-500">
                {quoteAuthorImage ? quoteAuthorImage.name : "No file chosen"}
              </p>
            </div>
            {currentQuoteAuthorImage && !quoteAuthorImage && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2">Current image:</p>
                <div className="w-20 h-20 overflow-hidden rounded-full">
                  <img
                    src={currentQuoteAuthorImage}
                    alt="Current author image"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
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
