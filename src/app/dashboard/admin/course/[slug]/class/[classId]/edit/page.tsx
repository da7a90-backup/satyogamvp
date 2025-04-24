"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  PaperClipIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface ClassContent {
  video: string | null;
  videoTitle: string;
  videoDescription: string;
  videoTranscript: string;
  videoAudioFile: string | null;
  keyConcepts: string;
  writingPrompts: string;
  additionalMaterials: {
    video?: string | null;
    essay?: string;
    guidedMeditation?: string | null;
  }[];
}

interface ClassType {
  id: number;
  attributes: {
    title: string;
    inClassPosition: number;
    duration: number;
    classContent: ClassContent | null;
    createdAt: string;
    updatedAt: string;
    course: {
      data: {
        id: number;
      };
    };
  };
}

interface CourseType {
  id: number;
  attributes: {
    title: string;
    slug: string;
  };
}

interface EditClassPageProps {
  params: {
    slug: string;
    classId: string;
  };
}

export default function EditClassContentPage({ params }: EditClassPageProps) {
  // Use React.useMemo to handle params to avoid Next.js warnings
  const courseId = React.useMemo(() => params.slug, [params.slug]);
  const classId = React.useMemo(() => params.classId, [params.classId]);
  
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [course, setCourse] = useState<CourseType | null>(null);
  const [classData, setClassData] = useState<ClassType | null>(null);
  const [activeTab, setActiveTab] = useState("videoContent");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize form data with default empty structure for class content
  const [formData, setFormData] = useState<ClassContent>({
    video: null,
    videoTitle: "",
    videoDescription: "",
    videoTranscript: "",
    videoAudioFile: null,
    keyConcepts: "",
    writingPrompts: "",
    additionalMaterials: [],
  });

  // Fetch class and course data
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !classId) return;
      
      setIsLoading(true);
      setError(null);

      try {
        // Fetch course details
        const courseResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/courses/${courseId}?populate=*`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
            },
          }
        );

        if (!courseResponse.ok) {
          throw new Error(`Failed to fetch course: ${courseResponse.statusText}`);
        }

        const courseData = await courseResponse.json();
        setCourse(courseData.data);

        // Fetch class details
        const classResponse = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/course-classes/${classId}?populate[0]=course`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
            },
          }
        );

        if (!classResponse.ok) {
          throw new Error(`Failed to fetch class: ${classResponse.statusText}`);
        }

        const data = await classResponse.json();
        setClassData(data.data);

        // If class has content, use it; otherwise use empty defaults
        if (data.data.attributes.classContent) {
          setFormData(data.data.attributes.classContent);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId, classId]);

  // Handle text input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasUnsavedChanges(true);
  };

  // Handle file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setIsSaving(true);

    try {
      // Upload file using FormData
      const formData = new FormData();
      formData.append("files", file);

      const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
      const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

      const response = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload error response:", errorText);
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      const fileUrl = result[0].url;
      
      setFormData((prev) => ({
        ...prev,
        [fieldName]: fileUrl,
      }));
      
      setSuccessMessage(`${file.name} uploaded successfully`);
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      setHasUnsavedChanges(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
      console.error("Error uploading file:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new additional material
  const addAdditionalMaterial = () => {
    setFormData((prev) => ({
      ...prev,
      additionalMaterials: [
        ...prev.additionalMaterials,
        { video: null, essay: "", guidedMeditation: null },
      ],
    }));
    setHasUnsavedChanges(true);
  };

  // Remove an additional material
  const removeAdditionalMaterial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalMaterials: prev.additionalMaterials.filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  // Update an additional material field
  const updateAdditionalMaterial = (index: number, field: string, value: string | null) => {
    setFormData((prev) => {
      const updatedMaterials = [...prev.additionalMaterials];
      updatedMaterials[index] = {
        ...updatedMaterials[index],
        [field]: value,
      };
      return {
        ...prev,
        additionalMaterials: updatedMaterials,
      };
    });
    setHasUnsavedChanges(true);
  };

  // Save class content
  const handleSave = async () => {
    if (!classData) return;
    
    setIsSaving(true);
    setError(null);

    try {
      // Update class content in the API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/course-classes/${classId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
          },
          body: JSON.stringify({
            data: {
              classContent: formData,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || "Failed to update class content");
      }

      setSuccessMessage("Class content saved successfully!");
      setHasUnsavedChanges(false);
      
      // Hide success message after a few seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save class content");
      console.error("Error saving class content:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 p-4 rounded-md text-red-700">
          Class not found or could not be loaded.
        </div>
        <div className="mt-4">
          <Link
            href={`/dashboard/admin/course/${courseId}`}
            className="text-purple-600 hover:text-purple-800"
          >
            Back to course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href={`/dashboard/admin/course/${courseId}`}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Class: {classData.attributes.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Course: {course?.attributes.title || 'Loading...'}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {hasUnsavedChanges && (
            <p className="text-amber-600 mr-3 text-sm">Unsaved changes</p>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded-md ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Content Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("videoContent")}
            className={`mr-8 py-4 text-sm font-medium ${
              activeTab === "videoContent"
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Video Content
          </button>
          <button
            onClick={() => setActiveTab("keyConcepts")}
            className={`mr-8 py-4 text-sm font-medium ${
              activeTab === "keyConcepts"
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Key Concepts
          </button>
          <button
            onClick={() => setActiveTab("writingPrompts")}
            className={`mr-8 py-4 text-sm font-medium ${
              activeTab === "writingPrompts"
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Writing Prompts
          </button>
          <button
            onClick={() => setActiveTab("additionalMaterials")}
            className={`py-4 text-sm font-medium ${
              activeTab === "additionalMaterials"
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Additional Materials
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Video Content Tab */}
        {activeTab === "videoContent" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">Video Content</h2>
              <p className="text-sm text-gray-500 mb-6">
                Upload the main video for this class and provide title, description and transcript.
              </p>
            </div>

            <div className="mb-6">
              <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-1">
                Video File
              </label>
              <div className="mt-1 flex items-center">
                {formData.video ? (
                  <div className="flex items-center">
                    <span className="bg-gray-100 px-3 py-2 rounded-md text-sm text-gray-800 flex-grow">
                      Video uploaded
                    </span>
                    <button
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, video: null }));
                        setHasUnsavedChanges(true);
                      }}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex-grow">
                    <label className="relative flex items-center justify-center w-full h-20 px-4 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                      <div className="space-y-1 text-center">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-purple-600 hover:text-purple-500">
                            Upload audio version
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">MP3 or WAV format</p>
                      </div>
                      <input
                        id="videoAudioFile"
                        name="videoAudioFile"
                        type="file"
                        accept="audio/*"
                        className="sr-only"
                        onChange={(e) => handleFileUpload(e, "videoAudioFile")}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Key Concepts Tab */}
        {activeTab === "keyConcepts" && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Key Concepts</h2>
              <p className="text-sm text-gray-500 mb-4">
                Outline the main concepts and takeaways from this class. 
                This can include definitions, summaries, and important points.
              </p>
            </div>
            <div>
              <label htmlFor="keyConcepts" className="sr-only">
                Key Concepts Content
              </label>
              <textarea
                id="keyConcepts"
                name="keyConcepts"
                value={formData.keyConcepts}
                onChange={handleChange}
                rows={16}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter key concepts and takeaways..."
              />
              <p className="mt-2 text-xs text-gray-500">
                You can use Markdown formatting for rich text.
              </p>
            </div>
          </div>
        )}

        {/* Writing Prompts Tab */}
        {activeTab === "writingPrompts" && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Writing Prompts</h2>
              <p className="text-sm text-gray-500 mb-4">
                Add reflective writing prompts, questions, or exercises for students 
                to complete after watching the class.
              </p>
            </div>
            <div>
              <label htmlFor="writingPrompts" className="sr-only">
                Writing Prompts Content
              </label>
              <textarea
                id="writingPrompts"
                name="writingPrompts"
                value={formData.writingPrompts}
                onChange={handleChange}
                rows={16}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter writing prompts and reflective exercises..."
              />
              <p className="mt-2 text-xs text-gray-500">
                You can use Markdown formatting for rich text.
              </p>
            </div>
          </div>
        )}

        {/* Additional Materials Tab */}
        {activeTab === "additionalMaterials" && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Additional Materials</h2>
              <p className="text-sm text-gray-500 mb-4">
                Add supplementary materials like additional videos, essays, or guided meditations.
              </p>
            </div>
            
            {formData.additionalMaterials.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <p className="text-gray-500 mb-4">No additional materials added yet</p>
              </div>
            ) : (
              <div className="space-y-6 mb-6">
                {formData.additionalMaterials.map((material, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 relative">
                    <button
                      onClick={() => removeAdditionalMaterial(index)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                      title="Remove this material"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                    
                    <h3 className="text-md font-medium text-gray-900 mb-3">
                      Supplementary Material #{index + 1}
                    </h3>
                    
                    {/* Video upload */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Supplementary Video (Optional)
                      </label>
                      <div className="mt-1">
                        {material.video ? (
                          <div className="flex items-center">
                            <span className="bg-gray-100 px-3 py-2 rounded-md text-sm text-gray-800 flex-grow">
                              Video uploaded
                            </span>
                            <button
                              onClick={() => updateAdditionalMaterial(index, 'video', null)}
                              className="ml-2 text-red-600 hover:text-red-800"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <label className="relative flex items-center justify-center w-full h-20 px-4 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                              <div className="space-y-1 text-center">
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium text-purple-600 hover:text-purple-500">
                                    Upload supplementary video
                                  </span>
                                </div>
                              </div>
                              <input
                                type="file"
                                accept="video/*"
                                className="sr-only"
                                onChange={async (e) => {
                                  if (!e.target.files || e.target.files.length === 0) return;
                                  
                                  const file = e.target.files[0];
                                  setIsSaving(true);
                                  
                                  try {
                                    // Use the file upload function directly
                                    const formData = new FormData();
                                    formData.append("files", file);

                                    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
                                    const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

                                    const response = await fetch(`${apiUrl}/api/upload`, {
                                      method: "POST",
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                      body: formData,
                                    });

                                    if (!response.ok) {
                                      throw new Error(`Upload failed with status ${response.status}`);
                                    }

                                    const result = await response.json();
                                    const fileUrl = result[0].url;
                                    
                                    updateAdditionalMaterial(index, 'video', fileUrl);
                                    setSuccessMessage(`${file.name} uploaded successfully`);
                                    setTimeout(() => setSuccessMessage(""), 3000);
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : "Failed to upload file");
                                  } finally {
                                    setIsSaving(false);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Essay/text content */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Essay/Text Content
                      </label>
                      <textarea
                        value={material.essay || ""}
                        onChange={(e) => updateAdditionalMaterial(index, 'essay', e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter any text content for this supplementary material..."
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        You can use Markdown formatting for rich text.
                      </p>
                    </div>
                    
                    {/* Guided meditation upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Guided Meditation Audio (Optional)
                      </label>
                      <div className="mt-1">
                        {material.guidedMeditation ? (
                          <div className="flex items-center">
                            <span className="bg-gray-100 px-3 py-2 rounded-md text-sm text-gray-800 flex-grow">
                              Meditation audio uploaded
                            </span>
                            <button
                              onClick={() => updateAdditionalMaterial(index, 'guidedMeditation', null)}
                              className="ml-2 text-red-600 hover:text-red-800"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <label className="relative flex items-center justify-center w-full h-20 px-4 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                              <div className="space-y-1 text-center">
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium text-purple-600 hover:text-purple-500">
                                    Upload meditation audio
                                  </span>
                                </div>
                              </div>
                              <input
                                type="file"
                                accept="audio/*"
                                className="sr-only"
                                onChange={async (e) => {
                                  if (!e.target.files || e.target.files.length === 0) return;
                                  
                                  const file = e.target.files[0];
                                  setIsSaving(true);
                                  
                                  try {
                                    // Use the file upload function directly
                                    const formData = new FormData();
                                    formData.append("files", file);

                                    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
                                    const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;

                                    const response = await fetch(`${apiUrl}/api/upload`, {
                                      method: "POST",
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                      body: formData,
                                    });

                                    if (!response.ok) {
                                      throw new Error(`Upload failed with status ${response.status}`);
                                    }

                                    const result = await response.json();
                                    const fileUrl = result[0].url;
                                    
                                    updateAdditionalMaterial(index, 'guidedMeditation', fileUrl);
                                    setSuccessMessage(`${file.name} uploaded successfully`);
                                    setTimeout(() => setSuccessMessage(""), 3000);
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : "Failed to upload file");
                                  } finally {
                                    setIsSaving(false);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4">
              <button
                onClick={addAdditionalMaterial}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Material
              </button>
            </div>
          </div>
        )}

        {/* Save button at bottom */}
        <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2 rounded-md ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}="ml-2 text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex-grow">
                    <label className="relative flex items-center justify-center w-full h-32 px-4 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                      <div className="space-y-1 text-center">
                        <PaperClipIcon className="h-8 w-8 mx-auto text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-purple-600 hover:text-purple-500">
                            Click to upload video
                          </span>{" "}
                          or drag and drop
                        </div>
                        <p className="text-xs text-gray-500">
                          MP4, MOV, or WEBM up to 500MB
                        </p>
                      </div>
                      <input
                        id="video"
                        name="video"
                        type="file"
                        accept="video/*"
                        className="sr-only"
                        onChange={(e) => handleFileUpload(e, "video")}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Video Title
              </label>
              <input
                type="text"
                id="videoTitle"
                name="videoTitle"
                value={formData.videoTitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter video title"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="videoDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Video Description
              </label>
              <textarea
                id="videoDescription"
                name="videoDescription"
                value={formData.videoDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter a brief description of the video content"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="videoTranscript" className="block text-sm font-medium text-gray-700 mb-1">
                Video Transcript
              </label>
              <textarea
                id="videoTranscript"
                name="videoTranscript"
                value={formData.videoTranscript}
                onChange={handleChange}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter the full transcript of the video"
              />
            </div>

            <div>
              <label htmlFor="videoAudioFile" className="block text-sm font-medium text-gray-700 mb-1">
                Audio Only Version (Optional)
              </label>
              <div className="mt-1 flex items-center">
                {formData.videoAudioFile ? (
                  <div className="flex items-center">
                    <span className="bg-gray-100 px-3 py-2 rounded-md text-sm text-gray-800 flex-grow">
                      Audio file uploaded
                    </span>
                    <button
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, videoAudioFile: null }));
                        setHasUnsavedChanges(true);
                      }}
                      className