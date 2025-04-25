"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { courseApi } from "@/lib/courseApi";

interface ContentSectionProps {
  type: "video" | "key-concepts" | "writing-prompts" | "additional-materials";
  index: number;
  onDelete: () => void;
  onChange: (data: any) => void;
  data: any;
}

interface NewClassFormProps {
  courseSlug: string;
}

// Type definitions
interface Course {
  id: number;
  attributes: {
    title: string;
    slug: string;
    description: string;
  };
}

const NewClassForm = ({ courseSlug }: NewClassFormProps) => {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [nextOrderIndex, setNextOrderIndex] = useState(1); // Minimum is now 1

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    orderIndex: 1, // Set minimum to 1
    duration: 0,
    content: [] as Array<{
      type:
        | "video"
        | "key-concepts"
        | "writing-prompts"
        | "additional-materials";
      duration: number;
      // Additional fields for each type will be conditionally rendered
      videoUrl?: string;
      videoDescription?: string;
      videoTranscript?: string;
      videoAudioFile?: File | null;
      keyConceptsContent?: string;
      writingPromptsContent?: string;
      additionalMaterialsContent?: Array<{
        type: "video" | "essay" | "guided-meditation";
        title: string;
        content?: string;
        file?: File | null;
      }>;
    }>,
  });

  // Files state
  const [videoFiles, setVideoFiles] = useState<Record<number, File | null>>({});
  const [audioFiles, setAudioFiles] = useState<Record<number, File | null>>({});
  const [additionalFiles, setAdditionalFiles] = useState<
    Record<string, File | null>
  >({});

  // Step 1: Fetch course by slug
  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching course with slug "${courseSlug}"`);
        const response = await courseApi.getCourseBySlug(courseSlug);

        if (response && response.id) {
          // Success: We have a course
          setCourse(response);
          setCourseId(response.id.toString());
          console.log(
            `Found course: "${response.attributes.title}" with ID: ${response.id}`
          );
        } else {
          throw new Error("Course not found");
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course. Please check the URL and try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseSlug) {
      fetchCourse();
    }
  }, [courseSlug]);

  // Step 2: After we have the course ID, fetch classes to determine order index
  useEffect(() => {
    if (!courseId) return;

    const fetchClasses = async () => {
      try {
        console.log(`Fetching classes for course ID "${courseId}"`);
        const classesResponse = await courseApi.getClasses(courseId);

        if (classesResponse && classesResponse.data) {
          const existingClasses = classesResponse.data;
          let nextIndex = 1; // Start with minimum 1

          if (existingClasses.length > 0) {
            // Find the highest order index
            const orderIndices = existingClasses.map(
              (c: any) =>
                c.attributes && typeof c.attributes.orderIndex === "number"
                  ? c.attributes.orderIndex
                  : 1 // Default to 1 if not found
            );

            nextIndex = Math.max(...orderIndices, 0) + 1;
          }

          console.log(`Setting next order index to ${nextIndex}`);
          setNextOrderIndex(nextIndex);

          setFormData((prev) => ({
            ...prev,
            orderIndex: nextIndex,
          }));
        }
      } catch (error) {
        console.warn("Error fetching classes:", error);
        // Default to 1 if we can't fetch classes
        setFormData((prev) => ({
          ...prev,
          orderIndex: 1,
        }));
      }
    };

    fetchClasses();
  }, [courseId]);

  // Handle basic input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Ensure orderIndex stays at least 1
    if (name === "orderIndex") {
      const orderIndex = Math.max(parseInt(value) || 1, 1);
      setFormData((prev) => ({
        ...prev,
        orderIndex,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "duration" ? parseInt(value) || 0 : value,
      }));
    }
  };

  // Add content section
  const addContentSection = (
    type: "video" | "key-concepts" | "writing-prompts" | "additional-materials"
  ) => {
    const newSection = {
      type,
      duration: 0,
    };

    // Add type-specific default fields
    if (type === "video") {
      Object.assign(newSection, {
        videoUrl: "",
        videoDescription: "",
        videoTranscript: "",
      });
    } else if (type === "key-concepts") {
      Object.assign(newSection, {
        keyConceptsContent: "",
      });
    } else if (type === "writing-prompts") {
      Object.assign(newSection, {
        writingPromptsContent: "",
      });
    } else if (type === "additional-materials") {
      Object.assign(newSection, {
        additionalMaterialsContent: [],
      });
    }

    setFormData((prev) => ({
      ...prev,
      content: [...prev.content, newSection],
    }));
  };

  // Remove content section
  const removeContentSection = (index: number) => {
    setFormData((prev) => {
      const newContent = [...prev.content];
      newContent.splice(index, 1);
      return {
        ...prev,
        content: newContent,
      };
    });

    // Also remove any associated files
    if (videoFiles[index]) {
      const newVideoFiles = { ...videoFiles };
      delete newVideoFiles[index];
      setVideoFiles(newVideoFiles);
    }

    if (audioFiles[index]) {
      const newAudioFiles = { ...audioFiles };
      delete newAudioFiles[index];
      setAudioFiles(newAudioFiles);
    }
  };

  // Update content section
  const updateContentSection = (index: number, data: any) => {
    setFormData((prev) => {
      const newContent = [...prev.content];
      newContent[index] = {
        ...newContent[index],
        ...data,
      };

      // Update the total class duration based on content sections
      const totalDuration = newContent.reduce(
        (sum, section) => sum + (section.duration || 0),
        0
      );

      return {
        ...prev,
        content: newContent,
        duration: totalDuration,
      };
    });
  };

  // Handle file uploads
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "video" | "audio" | "additional",
    index: number,
    subIndex?: number
  ) => {
    const file = e.target.files?.[0] || null;

    if (type === "video") {
      setVideoFiles((prev) => ({
        ...prev,
        [index]: file,
      }));
    } else if (type === "audio") {
      setAudioFiles((prev) => ({
        ...prev,
        [index]: file,
      }));
    } else if (type === "additional" && subIndex !== undefined) {
      const key = `${index}-${subIndex}`;
      setAdditionalFiles((prev) => ({
        ...prev,
        [key]: file,
      }));
    }
  };

  // Add additional material
  const addAdditionalMaterial = (
    sectionIndex: number,
    type: "video" | "essay" | "guided-meditation"
  ) => {
    setFormData((prev) => {
      const newContent = [...prev.content];
      const section = newContent[sectionIndex];

      if (section && section.type === "additional-materials") {
        const newMaterial = {
          type,
          title: "",
          content: type === "essay" ? "" : undefined,
          file: null,
        };

        section.additionalMaterialsContent = [
          ...(section.additionalMaterialsContent || []),
          newMaterial,
        ];
      }

      return {
        ...prev,
        content: newContent,
      };
    });
  };

  // Remove additional material
  const removeAdditionalMaterial = (
    sectionIndex: number,
    materialIndex: number
  ) => {
    setFormData((prev) => {
      const newContent = [...prev.content];
      const section = newContent[sectionIndex];

      if (
        section &&
        section.type === "additional-materials" &&
        section.additionalMaterialsContent
      ) {
        section.additionalMaterialsContent.splice(materialIndex, 1);
      }

      return {
        ...prev,
        content: newContent,
      };
    });

    // Remove associated file if any
    const key = `${sectionIndex}-${materialIndex}`;
    if (additionalFiles[key]) {
      const newAdditionalFiles = { ...additionalFiles };
      delete newAdditionalFiles[key];
      setAdditionalFiles(newAdditionalFiles);
    }
  };

  // Update additional material
  const updateAdditionalMaterial = (
    sectionIndex: number,
    materialIndex: number,
    data: any
  ) => {
    setFormData((prev) => {
      const newContent = [...prev.content];
      const section = newContent[sectionIndex];

      if (
        section &&
        section.type === "additional-materials" &&
        section.additionalMaterialsContent
      ) {
        section.additionalMaterialsContent[materialIndex] = {
          ...section.additionalMaterialsContent[materialIndex],
          ...data,
        };
      }

      return {
        ...prev,
        content: newContent,
      };
    });
  };

  // Convert form data and upload files for API
  const prepareDataForSubmission = async () => {
    // Create a deep copy of form data
    const formattedData = { ...formData };

    // Upload all files and update references
    for (let i = 0; i < formData.content.length; i++) {
      const section = formData.content[i];

      // Upload video if exists
      if (section.type === "video" && videoFiles[i]) {
        try {
          const uploadResult = await courseApi.uploadFile(videoFiles[i]!);
          formattedData.content[i].videoUrl = uploadResult.url;
        } catch (error) {
          console.error("Error uploading video file:", error);
          throw new Error("Failed to upload video file");
        }
      }

      // Upload audio if exists
      if (section.type === "video" && audioFiles[i]) {
        try {
          const uploadResult = await courseApi.uploadFile(audioFiles[i]!);
          formattedData.content[i].videoAudioFile = uploadResult.url;
        } catch (error) {
          console.error("Error uploading audio file:", error);
          throw new Error("Failed to upload audio file");
        }
      }

      // Upload additional materials files if exist
      if (
        section.type === "additional-materials" &&
        section.additionalMaterialsContent
      ) {
        for (let j = 0; j < section.additionalMaterialsContent.length; j++) {
          const key = `${i}-${j}`;
          if (additionalFiles[key]) {
            try {
              const uploadResult = await courseApi.uploadFile(
                additionalFiles[key]!
              );
              formattedData.content[i].additionalMaterialsContent[j].file =
                uploadResult.url;
            } catch (error) {
              console.error("Error uploading additional file:", error);
              throw new Error("Failed to upload additional material file");
            }
          }
        }
      }
    }

    return formattedData;
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError("Class title is required");
      return false;
    }

    if (formData.content.length === 0) {
      setError("At least one content section is required");
      return false;
    }

    // Validate each content section
    for (let i = 0; i < formData.content.length; i++) {
      const section = formData.content[i];

      if (section.type === "video") {
        // For videos, either a file or URL should be provided
        if (!videoFiles[i] && !section.videoUrl) {
          setError(`Video file or URL is required for video section ${i + 1}`);
          return false;
        }
      } else if (
        section.type === "key-concepts" &&
        !section.keyConceptsContent?.trim()
      ) {
        setError(`Content is required for key concepts section ${i + 1}`);
        return false;
      } else if (
        section.type === "writing-prompts" &&
        !section.writingPromptsContent?.trim()
      ) {
        setError(`Content is required for writing prompts section ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId) {
      setError("Cannot create class: course ID is missing");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage("");

    try {
      // Prepare data with file uploads
      const preparedData = await prepareDataForSubmission();

      // Initialize empty content components
      let videoComponent = null;
      let keyConceptsComponent = null;
      let writingPromptsComponent = null;
      let additionalMaterialsComponent = null;

      // Process each content section and map to the correct component structure
      preparedData.content.forEach((section) => {
        if (section.type === "video") {
          videoComponent = {
            videoUrl: section.videoUrl || "",
            videoDescription: section.videoDescription || "",
            videoTranscript: section.videoTranscript || "",
            videoAudioFile: section.videoAudioFile || null,
            duration: section.duration || 0,
          };
        } else if (section.type === "key-concepts") {
          keyConceptsComponent = {
            content: section.keyConceptsContent || "",
            duration: section.duration || 0,
          };
        } else if (section.type === "writing-prompts") {
          writingPromptsComponent = {
            content: section.writingPromptsContent || "",
            duration: section.duration || 0,
          };
        } else if (section.type === "additional-materials") {
          // For additional materials, we just need the raw content objects
          additionalMaterialsComponent = {
            // Use the raw file/content values from the additionalMaterialsContent
            video:
              section.additionalMaterialsContent?.find(
                (m) => m.type === "video"
              )?.file || null,
            essay:
              section.additionalMaterialsContent?.find(
                (m) => m.type === "essay"
              )?.content || "",
            guidedMeditation:
              section.additionalMaterialsContent?.find(
                (m) => m.type === "guided-meditation"
              )?.file || null,
            duration: section.duration || 0,
          };
        }
      });

      // Create the properly structured class data
      const classData = {
        title: preparedData.title,
        orderIndex: Math.max(preparedData.orderIndex, 1),
        duration: preparedData.duration,
        course: parseInt(courseId),
        // Only include components that have content
        ...(videoComponent && { video: videoComponent }),
        ...(keyConceptsComponent && { keyConcepts: keyConceptsComponent }),
        ...(writingPromptsComponent && {
          writingPrompts: writingPromptsComponent,
        }),
        ...(additionalMaterialsComponent && {
          additionalMaterials: additionalMaterialsComponent,
        }),
      };

      console.log("Submitting class data:", JSON.stringify(classData, null, 2));
      await courseApi.createClass(classData);

      setSuccessMessage("Class created successfully!");

      // Redirect back to course classes page after a delay
      setTimeout(() => {
        router.push(`/dashboard/admin/course/${courseSlug}/classes`);
      }, 1500);
    } catch (error) {
      console.error("Error creating class:", error);
      setError("Failed to create class. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  // Render content section based on type
  const ContentSection = ({
    type,
    index,
    onDelete,
    onChange,
    data,
  }: ContentSectionProps) => {
    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      onChange({
        [name]: name === "duration" ? parseInt(value) || 0 : value,
      });
    };

    // Get section title and icon
    let sectionTitle = "";
    let SectionIcon = DocumentTextIcon;

    switch (type) {
      case "video":
        sectionTitle = "Video";
        SectionIcon = PlayIcon;
        break;
      case "key-concepts":
        sectionTitle = "Key Concepts";
        SectionIcon = DocumentTextIcon;
        break;
      case "writing-prompts":
        sectionTitle = "Writing Prompts";
        SectionIcon = BookOpenIcon;
        break;
      case "additional-materials":
        sectionTitle = "Additional Materials";
        SectionIcon = QuestionMarkCircleIcon;
        break;
    }

    return (
      <div className="mb-6 border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <SectionIcon className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium">{sectionTitle} Section</h3>
          </div>
          <button
            type="button"
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Common fields for all section types - only duration now */}
        <div className="mb-4">
          <label
            htmlFor={`section-${index}-duration`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Duration (minutes)
          </label>
          <input
            type="number"
            id={`section-${index}-duration`}
            name="duration"
            value={data.duration}
            onChange={handleInputChange}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="0"
          />
        </div>

        {/* Type-specific fields */}
        {type === "video" && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor={`section-${index}-video`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Video File
              </label>
              <input
                type="file"
                id={`section-${index}-video`}
                accept="video/*"
                onChange={(e) => handleFileChange(e, "video", index)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              {videoFiles[index] && (
                <p className="mt-1 text-sm text-green-600">
                  Selected: {videoFiles[index]?.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor={`section-${index}-video-url`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Or Video URL
              </label>
              <input
                type="text"
                id={`section-${index}-video-url`}
                name="videoUrl"
                value={data.videoUrl || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/video.mp4"
              />
              <p className="mt-1 text-xs text-gray-500">
                Either upload a video file or enter a URL
              </p>
            </div>

            <div>
              <label
                htmlFor={`section-${index}-video-description`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Video Description
              </label>
              <textarea
                id={`section-${index}-video-description`}
                name="videoDescription"
                value={data.videoDescription || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter video description"
              />
            </div>

            <div>
              <label
                htmlFor={`section-${index}-video-transcript`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Video Transcript
              </label>
              <textarea
                id={`section-${index}-video-transcript`}
                name="videoTranscript"
                value={data.videoTranscript || ""}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter video transcript"
              />
            </div>

            <div>
              <label
                htmlFor={`section-${index}-audio`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Audio File (Optional)
              </label>
              <input
                type="file"
                id={`section-${index}-audio`}
                accept="audio/*"
                onChange={(e) => handleFileChange(e, "audio", index)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              {audioFiles[index] && (
                <p className="mt-1 text-sm text-green-600">
                  Selected: {audioFiles[index]?.name}
                </p>
              )}
            </div>
          </div>
        )}

        {type === "key-concepts" && (
          <div>
            <label
              htmlFor={`section-${index}-key-concepts`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Key Concepts Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id={`section-${index}-key-concepts`}
              name="keyConceptsContent"
              value={data.keyConceptsContent || ""}
              onChange={handleInputChange}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter key concepts in Markdown format"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              You can use Markdown formatting for rich text
            </p>
          </div>
        )}

        {type === "writing-prompts" && (
          <div>
            <label
              htmlFor={`section-${index}-writing-prompts`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Writing Prompts Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id={`section-${index}-writing-prompts`}
              name="writingPromptsContent"
              value={data.writingPromptsContent || ""}
              onChange={handleInputChange}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter writing prompts in Markdown format"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              You can use Markdown formatting for rich text
            </p>
          </div>
        )}

        {type === "additional-materials" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium">Additional Materials</h4>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => addAdditionalMaterial(index, "video")}
                  className="inline-flex items-center px-2 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  <PlayIcon className="h-4 w-4 mr-1" />
                  Add Video
                </button>
                <button
                  type="button"
                  onClick={() => addAdditionalMaterial(index, "essay")}
                  className="inline-flex items-center px-2 py-1 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  Add Essay
                </button>
                <button
                  type="button"
                  onClick={() =>
                    addAdditionalMaterial(index, "guided-meditation")
                  }
                  className="inline-flex items-center px-2 py-1 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
                >
                  <BookOpenIcon className="h-4 w-4 mr-1" />
                  Add Meditation
                </button>
              </div>
            </div>

            {!data.additionalMaterialsContent ||
            data.additionalMaterialsContent.length === 0 ? (
              <div className="text-center p-4 bg-gray-50 rounded">
                <p className="text-gray-500">
                  No additional materials added yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.additionalMaterialsContent.map(
                  (material, materialIndex) => (
                    <div
                      key={materialIndex}
                      className="border border-gray-200 rounded p-3"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                          {material.type === "video" && (
                            <PlayIcon className="h-4 w-4 text-blue-600 mr-2" />
                          )}
                          {material.type === "essay" && (
                            <DocumentTextIcon className="h-4 w-4 text-green-600 mr-2" />
                          )}
                          {material.type === "guided-meditation" && (
                            <BookOpenIcon className="h-4 w-4 text-purple-600 mr-2" />
                          )}
                          <span className="text-sm font-medium capitalize">
                            {material.type.replace("-", " ")}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            removeAdditionalMaterial(index, materialIndex)
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mb-3">
                        <label
                          htmlFor={`material-${index}-${materialIndex}-title`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Title
                        </label>
                        <input
                          type="text"
                          id={`material-${index}-${materialIndex}-title`}
                          value={material.title || ""}
                          onChange={(e) =>
                            updateAdditionalMaterial(index, materialIndex, {
                              title: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter title"
                        />
                      </div>

                      {material.type === "video" && (
                        <div>
                          <label
                            htmlFor={`material-${index}-${materialIndex}-file`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Video File
                          </label>
                          <input
                            type="file"
                            id={`material-${index}-${materialIndex}-file`}
                            accept="video/*"
                            onChange={(e) =>
                              handleFileChange(
                                e,
                                "additional",
                                index,
                                materialIndex
                              )
                            }
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                          />
                          {additionalFiles[`${index}-${materialIndex}`] && (
                            <p className="mt-1 text-sm text-green-600">
                              Selected:{" "}
                              {
                                additionalFiles[`${index}-${materialIndex}`]
                                  ?.name
                              }
                            </p>
                          )}
                        </div>
                      )}

                      {material.type === "guided-meditation" && (
                        <div>
                          <label
                            htmlFor={`material-${index}-${materialIndex}-file`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Audio File
                          </label>
                          <input
                            type="file"
                            id={`material-${index}-${materialIndex}-file`}
                            accept="audio/*"
                            onChange={(e) =>
                              handleFileChange(
                                e,
                                "additional",
                                index,
                                materialIndex
                              )
                            }
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                          />
                          {additionalFiles[`${index}-${materialIndex}`] && (
                            <p className="mt-1 text-sm text-green-600">
                              Selected:{" "}
                              {
                                additionalFiles[`${index}-${materialIndex}`]
                                  ?.name
                              }
                            </p>
                          )}
                        </div>
                      )}

                      {material.type === "essay" && (
                        <div>
                          <label
                            htmlFor={`material-${index}-${materialIndex}-content`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Essay Content
                          </label>
                          <textarea
                            id={`material-${index}-${materialIndex}-content`}
                            value={material.content || ""}
                            onChange={(e) =>
                              updateAdditionalMaterial(index, materialIndex, {
                                content: e.target.value,
                              })
                            }
                            rows={5}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter essay content in Markdown format"
                          />
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Loading state
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
          href={`/dashboard/admin/course/${courseSlug}/classes`}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Class</h1>
          {course && (
            <p className="text-sm text-gray-500 mt-1">
              Course: {course.attributes.title}
            </p>
          )}
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
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md flex items-start">
          <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6"
      >
        {/* Basic class info */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Class Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter class title"
                required
              />
            </div>

            <div>
              <label
                htmlFor="orderIndex"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Class Position
              </label>
              <input
                type="number"
                id="orderIndex"
                name="orderIndex"
                value={formData.orderIndex}
                onChange={handleChange}
                min="1" // Minimum value is 1
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="1"
              />
              <p className="mt-1 text-xs text-gray-500">
                Position in the course (1 = first regular class, 0 is reserved
                for intro)
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Total Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-100"
              placeholder="0"
              readOnly
            />
            <p className="mt-1 text-xs text-gray-500">
              This will be calculated automatically from content sections
            </p>
          </div>
        </div>

        {/* Content sections */}
        <div className="mb-6 border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Content Sections
            </h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => addContentSection("video")}
                className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                Add Video
              </button>
              <button
                type="button"
                onClick={() => addContentSection("key-concepts")}
                className="inline-flex items-center px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100"
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Add Key Concepts
              </button>
              <button
                type="button"
                onClick={() => addContentSection("writing-prompts")}
                className="inline-flex items-center px-3 py-2 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100"
              >
                <BookOpenIcon className="h-5 w-5 mr-2" />
                Add Writing Prompts
              </button>
              <button
                type="button"
                onClick={() => addContentSection("additional-materials")}
                className="inline-flex items-center px-3 py-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
              >
                <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
                Add Materials
              </button>
            </div>
          </div>

          {formData.content.length === 0 ? (
            <div className="text-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <QuestionMarkCircleIcon className="h-10 w-10 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">
                No content sections added yet
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Add videos, key concepts, writing prompts, or additional
                materials using the buttons above
              </p>
              <button
                type="button"
                onClick={() => addContentSection("video")}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add First Section
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.content.map((section, index) => (
                <ContentSection
                  key={index}
                  type={section.type}
                  index={index}
                  onDelete={() => removeContentSection(index)}
                  onChange={(data) => updateContentSection(index, data)}
                  data={section}
                />
              ))}
            </div>
          )}
        </div>

        {/* Submit buttons */}
        <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6">
          <Link
            href={`/dashboard/admin/course/${courseSlug}/classes`}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving || !courseId}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <ArrowPathIcon className="inline h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Class"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewClassForm;
