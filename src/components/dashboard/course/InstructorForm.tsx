"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { courseApi } from "@/lib/courseApi";

interface InstructorFormProps {
  instructorId?: string; // Optional for editing existing instructors
}

const InstructorForm = ({ instructorId }: InstructorFormProps) => {
  const router = useRouter();
  const isEditMode = !!instructorId;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    email: "",
    website: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [currentProfileImage, setCurrentProfileImage] = useState<string | null>(
    null
  );

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // If in edit mode, fetch the existing instructor
  useEffect(() => {
    if (isEditMode) {
      const fetchInstructor = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/instructors/${instructorId}?populate=profileImage`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt")}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch instructor data");
          }

          const data = await response.json();

          // Get profile image URL if it exists
          let profileImageUrl = null;
          if (data.data.attributes.profileImage?.data) {
            profileImageUrl = `${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${
              data.data.attributes.profileImage.data.attributes.url
            }`;
            setCurrentProfileImage(profileImageUrl);
          }

          setFormData({
            name: data.data.attributes.name || "",
            title: data.data.attributes.title || "",
            bio: data.data.attributes.bio || "",
            email: data.data.attributes.email || "",
            website: data.data.attributes.website || "",
          });
        } catch (error) {
          console.error("Error fetching instructor:", error);
          setErrors({ form: "Failed to load instructor data" });
        } finally {
          setIsLoading(false);
        }
      };

      fetchInstructor();
    }
  }, [isEditMode, instructorId]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle file changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileImage(file);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.bio.trim()) {
      newErrors.bio = "Bio is required";
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if URL is valid
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Upload a file to Strapi
  const uploadFile = async (file: File): Promise<number> => {
    const formData = new FormData();
    formData.append("files", file);

    const uploadResult = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`,
        },
        body: formData,
      }
    ).then((res) => res.json());

    return uploadResult[0].id;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    setSuccessMessage("");

    try {
      // Upload profile image if provided
      let profileImageId = null;
      if (profileImage) {
        profileImageId = await uploadFile(profileImage);
      }

      // Prepare instructor data
      const instructorData = {
        name: formData.name,
        title: formData.title,
        bio: formData.bio,
        email: formData.email || undefined,
        website: formData.website || undefined,

        // Handle profile image
        profileImage: profileImageId
          ? { connect: [profileImageId] }
          : undefined,
      };

      if (isEditMode) {
        // Update existing instructor
        await courseApi.updateInstructor(instructorId!, instructorData);
        setSuccessMessage("Instructor updated successfully!");
      } else {
        // Create new instructor
        await courseApi.createInstructor(instructorData);
        setSuccessMessage("Instructor created successfully!");

        // Redirect after a brief delay
        setTimeout(() => {
          router.push("/dashboard/admin/instructors");
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving instructor:", error);
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
          href="/dashboard/admin/instructors"
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? "Edit Instructor" : "Add New Instructor"}
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
        {/* Name */}
        <div className="mb-6">
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
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-purple-500"
            }`}
            placeholder="Enter instructor name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <ExclamationCircleIcon className="h-4 w-4 mr-1" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Title */}
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., Yoga Instructor, Meditation Teacher"
          />
        </div>

        {/* Bio */}
        <div className="mb-6">
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Bio <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex justify-between items-center">
              <span className="text-xs text-gray-500">Markdown Supported</span>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200"
              >
                {showPreview ? "Edit" : "Preview"}
              </button>
            </div>

            <div className="relative">
              {!showPreview ? (
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={8}
                  className={`w-full px-4 py-2 border-0 focus:outline-none focus:ring-0 ${
                    errors.bio ? "bg-red-50" : "bg-white"
                  }`}
                  placeholder="Enter instructor bio"
                />
              ) : (
                <div className="prose max-w-none p-4 min-h-[200px] bg-white overflow-y-auto">
                  <ReactMarkdown>
                    {formData.bio || "Nothing to preview yet"}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <ExclamationCircleIcon className="h-4 w-4 mr-1" />
              {errors.bio}
            </p>
          )}
        </div>

        {/* Contact Info Section */}
        <div className="mb-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Contact Information
          </h3>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-purple-500"
              }`}
              placeholder="instructor@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Website */}
          <div className="mb-4">
            <label
              htmlFor="website"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.website
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-purple-500"
              }`}
              placeholder="https://example.com"
            />
            {errors.website && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                {errors.website}
              </p>
            )}
          </div>
        </div>

        {/* Profile Image */}
        <div className="mb-6 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Profile Image
          </h3>

          <div className="mb-4">
            <label
              htmlFor="profileImage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Instructor Photo
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
              <label
                htmlFor="profileImage"
                className="relative cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <span>Choose file</span>
              </label>
              <p className="ml-3 text-sm text-gray-500">
                {profileImage ? profileImage.name : "No file chosen"}
              </p>
            </div>
            {currentProfileImage && !profileImage && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2">Current image:</p>
                <div className="w-40 h-40 overflow-hidden rounded-md">
                  <img
                    src={currentProfileImage}
                    alt="Current profile image"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Recommended size: Square image, at least 400x400 pixels
            </p>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/dashboard/admin/instructors"
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
              <>{isEditMode ? "Update Instructor" : "Add Instructor"}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InstructorForm;
