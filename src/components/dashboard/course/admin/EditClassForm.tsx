"use client";

import { useState, useEffect, useRef } from "react";
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

interface EditClassFormProps {
  courseSlug: string;
  classId: string;
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

interface ClassContent {
  video?: any;
  keyConcepts?: any;
  writingPrompts?: any;
  additionalMaterials?: any;
}

interface ClassData {
  id: number;
  attributes: {
    title: string;
    orderIndex: number;
    duration: number;
    content?: ClassContent;
  };
}

const EditClassForm = ({ courseSlug, classId }: EditClassFormProps) => {
  // Prevent default form submission which can cause page refresh and focus loss
  useEffect(() => {
    const handleSubmit = (e: any) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        e.stopPropagation();
      }
    };

    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorField, setErrorField] = useState<string | null>(null);

  // Refs for scrolling to elements
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const inputRefs = useRef<
    Record<string, HTMLInputElement | HTMLTextAreaElement | null>
  >({});

  // Track which section types already exist
  const [existingSectionTypes, setExistingSectionTypes] = useState<Set<string>>(
    new Set()
  );
  const [existingAdditionalMaterialTypes, setExistingAdditionalMaterialTypes] =
    useState<Record<number, Set<string>>>({});

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    orderIndex: 1,
    duration: 0,
    content: [] as Array<{
      type:
        | "video"
        | "key-concepts"
        | "writing-prompts"
        | "additional-materials";
      duration: number;
      // Additional fields for each type will be conditionally rendered
      videoDescription?: string;
      videoTranscript?: string;
      keyConceptsContent?: string;
      writingPromptsContent?: string;
      additionalMaterialsContent?: Array<{
        type: "video" | "essay" | "guided-meditation";
        title: string;
        content?: string;
      }>;
    }>,
  });

  // Files state
  const [videoFiles, setVideoFiles] = useState<Record<number, File | null>>({});
  const [audioFiles, setAudioFiles] = useState<Record<number, File | null>>({});
  const [additionalFiles, setAdditionalFiles] = useState<
    Record<string, File | null>
  >({});

  // Existing media URLs for preview
  const [existingVideoUrls, setExistingVideoUrls] = useState<
    Record<number, string>
  >({});
  const [existingAudioUrls, setExistingAudioUrls] = useState<
    Record<number, string>
  >({});
  const [existingAdditionalUrls, setExistingAdditionalUrls] = useState<
    Record<string, string>
  >({});

  // Fetch course and then class data
  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching course with slug "${courseSlug}"`);
        const response = await courseApi.getCourseBySlug(courseSlug);

        if (response && response.id) {
          setCourse(response);
          setCourseId(response.id.toString());
          console.log(
            `Found course: "${response.attributes.title}" with ID: ${response.id}`
          );

          // Now fetch class data with the valid course ID
          await fetchClassData(response.id.toString(), classId);
        } else {
          throw new Error("Course not found");
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course. Please check the URL and try again.");
        setIsLoading(false);
      }
    };

    if (courseSlug && classId) {
      fetchCourse();
    }
  }, [courseSlug, classId]);

  // Helper function to get the base URL for media files
  const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_STRAPI_URL || "";
  };

  // Helper function to convert Strapi media object to URL
  const getMediaUrl = (mediaObject: any) => {
    if (!mediaObject || !mediaObject.data || !mediaObject.data.attributes) {
      return null;
    }

    const url = mediaObject.data.attributes.url;
    if (!url) return null;

    // If it's already an absolute URL, return it as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Otherwise, prepend the base URL
    return `${getBaseUrl()}${url}`;
  };

  // This function fetches the class data
  const fetchClassData = async (courseId: string, classId: string) => {
    try {
      console.log(`Fetching class data for class ID "${classId}"`);

      // Use a more complete populate parameter to get all content sections
      const response = await courseApi.getClass(classId);

      if (!response || !response.data) {
        throw new Error("Class not found");
      }

      console.log("Class data received:", response.data);
      setClassData(response.data);

      // Convert class data to form data format
      convertClassDataToFormData(response.data);
    } catch (err) {
      console.error("Error fetching class data:", err);
      setError("Failed to load class data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const convertClassDataToFormData = (classData: ClassData) => {
    const { attributes } = classData;
    const content = attributes.content || {};

    console.log("Converting class data to form data:", content);

    // Initialize form data with basic class info
    const newFormData = {
      title: attributes.title || "",
      orderIndex: attributes.orderIndex || 1,
      duration: attributes.duration || 0,
      content: [] as any[],
    };

    // Clear existing section types
    setExistingSectionTypes(new Set());
    setExistingAdditionalMaterialTypes({});

    // Process video section if it exists
    if (content.video) {
      console.log("Processing video section:", content.video);

      const videoContent = {
        type: "video" as const,
        duration: content.video.duration || 0,
        videoDescription: content.video.videoDescription || "",
        videoTranscript: content.video.videoTranscript || "",
      };

      newFormData.content.push(videoContent);
      setExistingSectionTypes((prev) => new Set([...prev, "video"]));

      // Store video URL for preview if available
      if (content.video.videoFile) {
        const videoUrl = getMediaUrl(content.video.videoFile);
        if (videoUrl) {
          setExistingVideoUrls((prev) => ({ ...prev, [0]: videoUrl }));
        }
      }

      // Store audio URL for preview if available
      if (content.video.AudioFile) {
        const audioUrl = getMediaUrl(content.video.AudioFile);
        if (audioUrl) {
          setExistingAudioUrls((prev) => ({ ...prev, [0]: audioUrl }));
        }
      }
    }

    // Process key concepts section if it exists
    if (content.keyConcepts) {
      console.log("Processing key concepts section:", content.keyConcepts);

      const keyConceptsContent = {
        type: "key-concepts" as const,
        duration: content.keyConcepts.duration || 0,
        keyConceptsContent: content.keyConcepts.content || "",
      };

      newFormData.content.push(keyConceptsContent);
      setExistingSectionTypes((prev) => new Set([...prev, "key-concepts"]));
    }

    // Process writing prompts section if it exists
    if (content.writingPrompts) {
      console.log(
        "Processing writing prompts section:",
        content.writingPrompts
      );

      const writingPromptsContent = {
        type: "writing-prompts" as const,
        duration: content.writingPrompts.duration || 0,
        writingPromptsContent: content.writingPrompts.content || "",
      };

      newFormData.content.push(writingPromptsContent);
      setExistingSectionTypes((prev) => new Set([...prev, "writing-prompts"]));
    }

    // Process additional materials section if it exists
    if (content.additionalMaterials) {
      console.log(
        "Processing additional materials section:",
        content.additionalMaterials
      );

      const additionalIndex = newFormData.content.length;
      const additionalMaterialsContent = {
        type: "additional-materials" as const,
        duration: content.additionalMaterials.duration || 0,
        additionalMaterialsContent: [] as any[],
      };

      // Initialize tracking set for additional material types
      const materialTypes = new Set<string>();

      // Process video in additional materials
      if (content.additionalMaterials.video) {
        console.log(
          "Found video in additional materials",
          content.additionalMaterials.video
        );

        materialTypes.add("video");
        additionalMaterialsContent.additionalMaterialsContent.push({
          type: "video" as const,
          title: "Video", // Default title if none provided
        });

        // Store video URL
        const videoUrl = getMediaUrl(content.additionalMaterials.video);
        if (videoUrl) {
          setExistingAdditionalUrls((prev) => ({
            ...prev,
            [`${additionalIndex}-0`]: videoUrl,
          }));
        }
      }

      // Process essay in additional materials
      if (content.additionalMaterials.essay) {
        console.log(
          "Found essay in additional materials",
          content.additionalMaterials.essay
        );

        materialTypes.add("essay");
        additionalMaterialsContent.additionalMaterialsContent.push({
          type: "essay" as const,
          title: "Essay", // Default title if none provided
          content: content.additionalMaterials.essay || "",
        });
      }

      // Process guided meditation in additional materials
      if (content.additionalMaterials.guidedMeditation) {
        console.log(
          "Found guided meditation in additional materials",
          content.additionalMaterials.guidedMeditation
        );

        materialTypes.add("guided-meditation");

        // Position matters here - need to know the index after adding other materials
        const meditationIndex =
          additionalMaterialsContent.additionalMaterialsContent.length;

        additionalMaterialsContent.additionalMaterialsContent.push({
          type: "guided-meditation" as const,
          title: "Guided Meditation", // Default title if none provided
        });

        // Store audio URL
        const audioUrl = getMediaUrl(
          content.additionalMaterials.guidedMeditation
        );
        if (audioUrl) {
          setExistingAdditionalUrls((prev) => ({
            ...prev,
            [`${additionalIndex}-${meditationIndex}`]: audioUrl,
          }));
        }
      }

      // Add additional materials section if it has content
      if (additionalMaterialsContent.additionalMaterialsContent.length > 0) {
        newFormData.content.push(additionalMaterialsContent);
        setExistingSectionTypes(
          (prev) => new Set([...prev, "additional-materials"])
        );
        setExistingAdditionalMaterialTypes((prev) => ({
          ...prev,
          [additionalIndex]: materialTypes,
        }));
      }
    }

    // Log the final form data
    console.log("Final form data:", newFormData);

    // Set the form data
    setFormData(newFormData);
  };

  // Scroll to success message when it appears
  useEffect(() => {
    if (successMessage && successRef.current) {
      successRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [successMessage]);

  // Scroll to error field when validation fails
  useEffect(() => {
    if (errorField && sectionRefs.current[errorField]) {
      sectionRefs.current[errorField]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [errorField]);

  // Register refs for inputs to maintain focus
  const registerInputRef = (
    id: string,
    ref: HTMLInputElement | HTMLTextAreaElement | null
  ) => {
    inputRefs.current[id] = ref;
  };

  // Handle basic input changes with focus preservation
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const { name, value, selectionStart, selectionEnd } = e.target;
    const inputId = e.target.id;

    // Record current selection position
    const currentSelection = {
      start: selectionStart,
      end: selectionEnd,
    };

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

    // Schedule focus restoration after state update
    setTimeout(() => {
      const input = inputRefs.current[inputId];
      if (input) {
        input.focus();
        if (currentSelection.start !== null && currentSelection.end !== null) {
          input.selectionStart = currentSelection.start;
          input.selectionEnd = currentSelection.end;
        }
      }
    }, 0);
  };

  // Add content section - now checks if the section type already exists
  const addContentSection = (
    type: "video" | "key-concepts" | "writing-prompts" | "additional-materials"
  ) => {
    // Check if section type already exists (for all section types including additional-materials)
    if (existingSectionTypes.has(type)) {
      console.log(`Section type ${type} already exists, ignoring...`);
      // Section already exists, don't add another one
      return;
    }

    // First update the tracking state to prevent duplicate additions
    setExistingSectionTypes((prev) => new Set([...prev, type]));

    const newSection = {
      type,
      duration: 0,
    };

    // Add type-specific default fields
    if (type === "video") {
      Object.assign(newSection, {
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
      const section = prev.content[index];
      const newContent = [...prev.content];
      newContent.splice(index, 1);

      // Remove the section type from existingSectionTypes if it's the last of its kind
      const remainingSections = newContent.filter(
        (s) => s.type === section.type
      );
      if (remainingSections.length === 0) {
        setExistingSectionTypes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(section.type);
          return newSet;
        });
      }

      // Remove any additional material types for this section
      if (section.type === "additional-materials") {
        const newExistingAdditionalMaterialTypes = {
          ...existingAdditionalMaterialTypes,
        };
        delete newExistingAdditionalMaterialTypes[index];
        setExistingAdditionalMaterialTypes(newExistingAdditionalMaterialTypes);
      }

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

  // Update content section with focus preservation
  const updateContentSection = (index: number, data: any) => {
    // Store the focused element to restore focus after state update
    const focusedElement = document.activeElement;
    const selectionStart =
      focusedElement && "selectionStart" in focusedElement
        ? focusedElement.selectionStart
        : null;
    const selectionEnd =
      focusedElement && "selectionEnd" in focusedElement
        ? focusedElement.selectionEnd
        : null;

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

    // Restore focus after state update
    setTimeout(() => {
      if (focusedElement) {
        // Attempt to refocus the element
        (focusedElement as HTMLElement).focus();

        // Restore selection if applicable
        if (
          "selectionStart" in focusedElement &&
          selectionStart !== null &&
          selectionEnd !== null
        ) {
          (
            focusedElement as HTMLInputElement | HTMLTextAreaElement
          ).selectionStart = selectionStart;
          (
            focusedElement as HTMLInputElement | HTMLTextAreaElement
          ).selectionEnd = selectionEnd;
        }
      }
    }, 0);
  };

  // Improved file change handler to avoid UI inconsistencies
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "video" | "audio" | "additional",
    index: number,
    subIndex?: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.target.files?.[0] || null;

    // If no file was selected, don't change the current selection
    if (!file) {
      console.log(`No file selected for ${type} upload`);
      return;
    }

    if (type === "video") {
      setVideoFiles((prev) => ({
        ...prev,
        [index]: file,
      }));

      // Also update the validation state to ensure form submission works
      const section = formData.content[index];
      if (section && section.type === "video") {
        console.log(`Updated video file for section ${index}: ${file.name}`);
      }
    } else if (type === "audio") {
      setAudioFiles((prev) => ({
        ...prev,
        [index]: file,
      }));
      console.log(`Updated audio file for section ${index}: ${file.name}`);
    } else if (type === "additional" && subIndex !== undefined) {
      const key = `${index}-${subIndex}`;
      setAdditionalFiles((prev) => ({
        ...prev,
        [key]: file,
      }));
      console.log(`Updated additional file ${key}: ${file.name}`);
    }
  };

  // Add additional material - now checks if material type already exists
  const addAdditionalMaterial = (
    sectionIndex: number,
    type: "video" | "essay" | "guided-meditation"
  ) => {
    // First, check if this material type already exists in this section
    // This check happens BEFORE we attempt to modify any state
    if (existingAdditionalMaterialTypes[sectionIndex]?.has(type)) {
      console.log(
        `Material type ${type} already exists in section ${sectionIndex}, ignoring...`
      );
      // Material type already exists in this section, don't add another one
      return;
    }

    // Update the tracking before adding the material to prevent race conditions
    setExistingAdditionalMaterialTypes((prev) => {
      const newState = { ...prev };
      if (!newState[sectionIndex]) {
        newState[sectionIndex] = new Set();
      }
      newState[sectionIndex].add(type);
      return newState;
    });

    // Now add the new material to the form data
    setFormData((prev) => {
      const newContent = [...prev.content];
      const section = newContent[sectionIndex];

      if (section && section.type === "additional-materials") {
        const newMaterial = {
          type,
          title: "",
          content: type === "essay" ? "" : undefined,
        };

        // Create a new array with the added material
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
        // Get the material type before removing it
        const materialType =
          section.additionalMaterialsContent[materialIndex].type;

        // Remove the material
        section.additionalMaterialsContent.splice(materialIndex, 1);

        // Remove this material type from the existingAdditionalMaterialTypes if it's the last one
        const remainingMaterials = section.additionalMaterialsContent.filter(
          (m) => m.type === materialType
        );
        if (remainingMaterials.length === 0) {
          setExistingAdditionalMaterialTypes((prev) => {
            const newState = { ...prev };
            if (newState[sectionIndex]) {
              newState[sectionIndex].delete(materialType);
            }
            return newState;
          });
        }
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

  // Update additional material with focus preservation
  const updateAdditionalMaterial = (
    sectionIndex: number,
    materialIndex: number,
    data: any
  ) => {
    // Store the focused element to restore focus after state update
    const focusedElement = document.activeElement;
    const selectionStart =
      focusedElement && "selectionStart" in focusedElement
        ? focusedElement.selectionStart
        : null;
    const selectionEnd =
      focusedElement && "selectionEnd" in focusedElement
        ? focusedElement.selectionEnd
        : null;

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

    // Restore focus after state update
    setTimeout(() => {
      if (focusedElement) {
        // Attempt to refocus the element
        (focusedElement as HTMLElement).focus();

        // Restore selection if applicable
        if (
          "selectionStart" in focusedElement &&
          selectionStart !== null &&
          selectionEnd !== null
        ) {
          (
            focusedElement as HTMLInputElement | HTMLTextAreaElement
          ).selectionStart = selectionStart;
          (
            focusedElement as HTMLInputElement | HTMLTextAreaElement
          ).selectionEnd = selectionEnd;
        }
      }
    }, 0);
  };

  // Process uploads and prepare data
  const prepareDataForSubmission = async () => {
    try {
      // Upload files and keep track of media IDs
      const mediaIds: Record<string, number> = {};

      // Get the original class data to preserve existing media IDs
      if (classData && classData.attributes && classData.attributes.content) {
        const content = classData.attributes.content;

        // Save video file ID if it exists
        if (content.video?.videoFile?.data?.id) {
          mediaIds[`video_0_original`] = content.video.videoFile.data.id;
        }

        // Save audio file ID if it exists
        if (content.video?.AudioFile?.data?.id) {
          mediaIds[`audio_0_original`] = content.video.AudioFile.data.id;
        }

        // Save additional materials file IDs if they exist
        if (content.additionalMaterials) {
          if (content.additionalMaterials.video?.data?.id) {
            mediaIds[`additional_0-0_original`] =
              content.additionalMaterials.video.data.id;
          }

          if (content.additionalMaterials.guidedMeditation?.data?.id) {
            // Find the index of guided meditation in additionalMaterialsContent
            let meditationIndex = -1;
            const additionalIndex = formData.content.findIndex(
              (section) => section.type === "additional-materials"
            );

            if (additionalIndex >= 0) {
              meditationIndex =
                formData.content[
                  additionalIndex
                ].additionalMaterialsContent?.findIndex(
                  (m) => m.type === "guided-meditation"
                ) || -1;

              if (meditationIndex >= 0) {
                mediaIds[
                  `additional_${additionalIndex}-${meditationIndex}_original`
                ] = content.additionalMaterials.guidedMeditation.data.id;
              }
            }
          }
        }
      }

      // Upload video files
      for (const [index, file] of Object.entries(videoFiles)) {
        if (file) {
          try {
            const result = await courseApi.uploadFile(file);
            mediaIds[`video_${index}`] = result.id;
          } catch (error) {
            console.error(
              `Error uploading video file for section ${index}:`,
              error
            );
            throw new Error(`Failed to upload video file for section ${index}`);
          }
        }
      }

      // Upload audio files
      for (const [index, file] of Object.entries(audioFiles)) {
        if (file) {
          try {
            const result = await courseApi.uploadFile(file);
            mediaIds[`audio_${index}`] = result.id;
          } catch (error) {
            console.error(
              `Error uploading audio file for section ${index}:`,
              error
            );
            throw new Error(`Failed to upload audio file for section ${index}`);
          }
        }
      }

      // Upload additional material files
      for (const [key, file] of Object.entries(additionalFiles)) {
        if (file) {
          try {
            const result = await courseApi.uploadFile(file);
            mediaIds[`additional_${key}`] = result.id;
          } catch (error) {
            console.error(`Error uploading additional file ${key}:`, error);
            throw new Error(`Failed to upload additional file ${key}`);
          }
        }
      }

      // Initialize empty content components
      let videoComponent = null;
      let keyConceptsComponent = null;
      let writingPromptsComponent = null;
      let additionalMaterialsComponent = null;

      // Process each content section and map to the correct component structure
      formData.content.forEach((section, sectionIndex) => {
        if (section.type === "video") {
          // Use new uploaded file or fall back to original ID
          const videoId =
            mediaIds[`video_${sectionIndex}`] ||
            mediaIds[`video_${sectionIndex}_original`] ||
            null;

          const audioId =
            mediaIds[`audio_${sectionIndex}`] ||
            mediaIds[`audio_${sectionIndex}_original`] ||
            null;

          videoComponent = {
            videoFile: videoId,
            videoDescription: section.videoDescription || "",
            videoTranscript: section.videoTranscript || "",
            AudioFile: audioId,
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
          // Process additional materials
          const videoMaterial = section.additionalMaterialsContent?.find(
            (m) => m.type === "video"
          );
          const essayMaterial = section.additionalMaterialsContent?.find(
            (m) => m.type === "essay"
          );
          const meditationMaterial = section.additionalMaterialsContent?.find(
            (m) => m.type === "guided-meditation"
          );

          const videoIndex = section.additionalMaterialsContent?.findIndex(
            (m) => m.type === "video"
          );
          const meditationIndex = section.additionalMaterialsContent?.findIndex(
            (m) => m.type === "guided-meditation"
          );

          // Use new uploaded file or fall back to original ID
          const videoFileId =
            videoIndex !== undefined && videoIndex >= 0
              ? mediaIds[`additional_${sectionIndex}-${videoIndex}`] ||
                mediaIds[`additional_${sectionIndex}-${videoIndex}_original`] ||
                null
              : null;

          const meditationFileId =
            meditationIndex !== undefined && meditationIndex >= 0
              ? mediaIds[`additional_${sectionIndex}-${meditationIndex}`] ||
                mediaIds[
                  `additional_${sectionIndex}-${meditationIndex}_original`
                ] ||
                null
              : null;

          additionalMaterialsComponent = {
            video: videoFileId,
            essay: essayMaterial?.content || "",
            guidedMeditation: meditationFileId,
            duration: section.duration || 0,
          };
        }
      });

      // Create final structure for API
      const updatedClassData = {
        title: formData.title,
        orderIndex: Math.max(formData.orderIndex, 1),
        duration: formData.duration,
        course: parseInt(courseId!),
        content: {
          video: videoComponent,
          keyConcepts: keyConceptsComponent,
          writingPrompts: writingPromptsComponent,
          additionalMaterials: additionalMaterialsComponent,
        },
      };

      return updatedClassData;
    } catch (error) {
      console.error("Error preparing data:", error);
      throw error;
    }
  };

  // Updated validateForm function to properly handle file uploads and scrolling to error fields
  const validateForm = (): boolean => {
    setErrorField(null);

    if (!formData.title.trim()) {
      setError("Class title is required");
      setErrorField("title");
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
        // For editing, we don't require a new video file if there's an existing one
        const hasExistingVideo = existingVideoUrls[i];
        const hasNewVideo = videoFiles[i];

        if (!hasExistingVideo && !hasNewVideo) {
          setError(`Video file is required for video section ${i + 1}`);
          setErrorField(`section-${i}`);
          return false;
        }
      } else if (
        section.type === "key-concepts" &&
        !section.keyConceptsContent?.trim()
      ) {
        setError(`Content is required for key concepts section ${i + 1}`);
        setErrorField(`section-${i}`);
        return false;
      } else if (
        section.type === "writing-prompts" &&
        !section.writingPromptsContent?.trim()
      ) {
        setError(`Content is required for writing prompts section ${i + 1}`);
        setErrorField(`section-${i}`);
        return false;
      } else if (section.type === "additional-materials") {
        // Additional materials are optional, only validate if they exist
        if (
          section.additionalMaterialsContent &&
          section.additionalMaterialsContent.length > 0
        ) {
          for (let j = 0; j < section.additionalMaterialsContent.length; j++) {
            const material = section.additionalMaterialsContent[j];

            // Validate title for all material types
            if (!material.title?.trim()) {
              setError(
                `Title is required for additional material ${
                  j + 1
                } in section ${i + 1}`
              );
              setErrorField(`section-${i}-material-${j}`);
              return false;
            }

            // Only validate essay content if essay type was added
            if (material.type === "essay" && !material.content?.trim()) {
              setError(`Content is required for essay in section ${i + 1}`);
              setErrorField(`section-${i}-material-${j}`);
              return false;
            }
          }
        }
      }
    }

    return true;
  };

  // Handle form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Basic validation checks
    if (!courseId) {
      setError("Cannot update class: course ID is missing");
      return;
    }

    if (!classId) {
      setError("Cannot update class: class ID is missing");
      return;
    }

    // IMPORTANT CHANGE: Check if classData has loaded
    if (!classData) {
      setError("Cannot update class: class data is still loading");
      return;
    }

    // Continue with form validation and submission
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage("");

    try {
      // Prepare data with file uploads
      const updatedClassData = await prepareDataForSubmission();

      console.log(
        "Submitting updated class data:",
        JSON.stringify(updatedClassData, null, 2)
      );

      // IMPORTANT CHANGE: Use classId prop directly instead of accessing it through classData
      await courseApi.updateClass(classId, updatedClassData);

      setSuccessMessage("Class updated successfully!");

      // Scroll to success message
      if (successRef.current) {
        successRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      // Redirect back to course page after a delay
      setTimeout(() => {
        router.push(`/dashboard/admin/course/${courseSlug}`);
      }, 1500);
    } catch (error) {
      console.error("Error updating class:", error);
      setError("Failed to update class. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Disable HTML5 validation
  useEffect(() => {
    // Find the form element and disable native HTML5 validation
    const form = document.querySelector("form");
    if (form) {
      form.setAttribute("novalidate", "true");
      console.log(
        "Disabled native form validation, using custom validation instead"
      );
    }
  }, []);

  // Function to register refs for scrolling
  const registerSectionRef = (id: string, ref: HTMLDivElement | null) => {
    sectionRefs.current[id] = ref;
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
      e.preventDefault();
      e.stopPropagation();

      const { name, value } = e.target;
      const { selectionStart, selectionEnd } = e.target;
      const inputId = e.target.id;

      // Store selection position for restoration
      const selection = {
        start: selectionStart,
        end: selectionEnd,
      };

      onChange({
        [name]: name === "duration" ? parseInt(value) || 0 : value,
      });

      // Re-focus the input after state update
      setTimeout(() => {
        const input = inputRefs.current[inputId];
        if (input) {
          input.focus();
          if (selection.start !== null && selection.end !== null) {
            input.selectionStart = selection.start;
            input.selectionEnd = selection.end;
          }
        }
      }, 0);
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
      <div
        className="mb-6 border border-gray-200 rounded-lg p-4"
        ref={(el) => registerSectionRef(`section-${index}`, el)}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <SectionIcon className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium">{sectionTitle} Section</h3>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
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
            onFocus={(e) => e.stopPropagation()}
            onBlur={(e) => e.stopPropagation()}
            ref={(el) => registerInputRef(`section-${index}-duration`, el)}
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
                Video File{" "}
                {existingVideoUrls[index] ? (
                  ""
                ) : (
                  <span className="text-red-500">*</span>
                )}
              </label>

              {/* Show existing video if available */}
              {existingVideoUrls[index] && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1">
                    Current video file:
                  </p>
                  <div className="bg-gray-100 p-2 rounded text-sm text-gray-700 flex items-center">
                    <PlayIcon className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="truncate">
                      {existingVideoUrls[index].split("/").pop() ||
                        "Video file"}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  id={`section-${index}-video`}
                  accept="video/*"
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFileChange(e, "video", index);
                  }}
                  className="hidden" // Hide the default input
                />
                <label
                  htmlFor={`section-${index}-video`}
                  className="cursor-pointer px-4 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 font-semibold text-sm"
                >
                  {existingVideoUrls[index] ? "Replace video" : "Choose file"}
                </label>
                <span className="ml-3 text-sm text-gray-500">
                  {videoFiles[index]
                    ? videoFiles[index].name
                    : "No new file chosen"}
                </span>
              </div>
              {videoFiles[index] && (
                <p className="mt-1 text-sm text-green-600">
                  Selected new file: {videoFiles[index]?.name}
                </p>
              )}
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
                onFocus={(e) => e.stopPropagation()}
                onBlur={(e) => e.stopPropagation()}
                ref={(el) =>
                  registerInputRef(`section-${index}-video-description`, el)
                }
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
                onFocus={(e) => e.stopPropagation()}
                onBlur={(e) => e.stopPropagation()}
                ref={(el) =>
                  registerInputRef(`section-${index}-video-transcript`, el)
                }
              />
            </div>

            <div>
              <label
                htmlFor={`section-${index}-audio`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Audio File (Optional)
              </label>

              {/* Show existing audio if available */}
              {existingAudioUrls[index] && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1">
                    Current audio file:
                  </p>
                  <div className="bg-gray-100 p-2 rounded text-sm text-gray-700 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                    <span className="truncate">
                      {existingAudioUrls[index].split("/").pop() ||
                        "Audio file"}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  id={`section-${index}-audio`}
                  accept="audio/*"
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleFileChange(e, "audio", index);
                  }}
                  className="hidden" // Hide the default input
                />
                <label
                  htmlFor={`section-${index}-audio`}
                  className="cursor-pointer px-4 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 font-semibold text-sm"
                >
                  {existingAudioUrls[index] ? "Replace audio" : "Choose file"}
                </label>
                <span className="ml-3 text-sm text-gray-500">
                  {audioFiles[index]
                    ? audioFiles[index].name
                    : "No new file chosen"}
                </span>
              </div>
              {audioFiles[index] && (
                <p className="mt-1 text-sm text-green-600">
                  Selected new file: {audioFiles[index]?.name}
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
              onFocus={(e) => e.stopPropagation()}
              onBlur={(e) => e.stopPropagation()}
              ref={(el) =>
                registerInputRef(`section-${index}-key-concepts`, el)
              }
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
              onFocus={(e) => e.stopPropagation()}
              onBlur={(e) => e.stopPropagation()}
              ref={(el) =>
                registerInputRef(`section-${index}-writing-prompts`, el)
              }
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addAdditionalMaterial(index, "video");
                  }}
                  className={`inline-flex items-center px-2 py-1 text-sm rounded 
                    ${
                      existingAdditionalMaterialTypes[index]?.has("video")
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  disabled={existingAdditionalMaterialTypes[index]?.has(
                    "video"
                  )}
                >
                  <PlayIcon className="h-4 w-4 mr-1" />
                  Add Video
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addAdditionalMaterial(index, "essay");
                  }}
                  className={`inline-flex items-center px-2 py-1 text-sm rounded 
                    ${
                      existingAdditionalMaterialTypes[index]?.has("essay")
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  disabled={existingAdditionalMaterialTypes[index]?.has(
                    "essay"
                  )}
                >
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  Add Essay
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addAdditionalMaterial(index, "guided-meditation");
                  }}
                  className={`inline-flex items-center px-2 py-1 text-sm rounded 
                    ${
                      existingAdditionalMaterialTypes[index]?.has(
                        "guided-meditation"
                      )
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                    }`}
                  disabled={existingAdditionalMaterialTypes[index]?.has(
                    "guided-meditation"
                  )}
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
                      ref={(el) =>
                        registerSectionRef(
                          `section-${index}-material-${materialIndex}`,
                          el
                        )
                      }
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
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeAdditionalMaterial(index, materialIndex);
                          }}
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
                          onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateAdditionalMaterial(index, materialIndex, {
                              title: e.target.value,
                            });
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Enter title"
                          onFocus={(e) => e.stopPropagation()}
                          onBlur={(e) => e.stopPropagation()}
                          ref={(el) =>
                            registerInputRef(
                              `material-${index}-${materialIndex}-title`,
                              el
                            )
                          }
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

                          {/* Show existing video if available */}
                          {existingAdditionalUrls[
                            `${index}-${materialIndex}`
                          ] &&
                            material.type === "video" && (
                              <div className="mb-2">
                                <p className="text-sm text-gray-600 mb-1">
                                  Current video file:
                                </p>
                                <div className="bg-gray-100 p-2 rounded text-sm text-gray-700 flex items-center">
                                  <PlayIcon className="h-4 w-4 mr-2 text-purple-600" />
                                  <span className="truncate">
                                    {existingAdditionalUrls[
                                      `${index}-${materialIndex}`
                                    ]
                                      .split("/")
                                      .pop() || "Video file"}
                                  </span>
                                </div>
                              </div>
                            )}

                          <div className="mt-1 flex items-center">
                            <input
                              type="file"
                              id={`material-${index}-${materialIndex}-file`}
                              accept="video/*"
                              onChange={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFileChange(
                                  e,
                                  "additional",
                                  index,
                                  materialIndex
                                );
                              }}
                              className="hidden" // Hide the default input
                            />
                            <label
                              htmlFor={`material-${index}-${materialIndex}-file`}
                              className="cursor-pointer px-4 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 font-semibold text-sm"
                            >
                              {existingAdditionalUrls[
                                `${index}-${materialIndex}`
                              ]
                                ? "Replace video"
                                : "Choose file"}
                            </label>
                            <span className="ml-3 text-sm text-gray-500">
                              {additionalFiles[`${index}-${materialIndex}`]
                                ? additionalFiles[`${index}-${materialIndex}`]
                                    .name
                                : "No new file chosen"}
                            </span>
                          </div>
                          {additionalFiles[`${index}-${materialIndex}`] && (
                            <p className="mt-1 text-sm text-green-600">
                              Selected new file:{" "}
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

                          {/* Show existing audio if available */}
                          {existingAdditionalUrls[
                            `${index}-${materialIndex}`
                          ] &&
                            material.type === "guided-meditation" && (
                              <div className="mb-2">
                                <p className="text-sm text-gray-600 mb-1">
                                  Current audio file:
                                </p>
                                <div className="bg-gray-100 p-2 rounded text-sm text-gray-700 flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2 text-purple-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                    />
                                  </svg>
                                  <span className="truncate">
                                    {existingAdditionalUrls[
                                      `${index}-${materialIndex}`
                                    ]
                                      .split("/")
                                      .pop() || "Audio file"}
                                  </span>
                                </div>
                              </div>
                            )}

                          <div className="mt-1 flex items-center">
                            <input
                              type="file"
                              id={`material-${index}-${materialIndex}-file`}
                              accept="audio/*"
                              onChange={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFileChange(
                                  e,
                                  "additional",
                                  index,
                                  materialIndex
                                );
                              }}
                              className="hidden" // Hide the default input
                            />
                            <label
                              htmlFor={`material-${index}-${materialIndex}-file`}
                              className="cursor-pointer px-4 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 font-semibold text-sm"
                            >
                              {existingAdditionalUrls[
                                `${index}-${materialIndex}`
                              ]
                                ? "Replace audio"
                                : "Choose file"}
                            </label>
                            <span className="ml-3 text-sm text-gray-500">
                              {additionalFiles[`${index}-${materialIndex}`]
                                ? additionalFiles[`${index}-${materialIndex}`]
                                    .name
                                : "No new file chosen"}
                            </span>
                          </div>
                          {additionalFiles[`${index}-${materialIndex}`] && (
                            <p className="mt-1 text-sm text-green-600">
                              Selected new file:{" "}
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
                            onChange={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateAdditionalMaterial(index, materialIndex, {
                                content: e.target.value,
                              });
                            }}
                            rows={5}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter essay content in Markdown format"
                            onFocus={(e) => e.stopPropagation()}
                            onBlur={(e) => e.stopPropagation()}
                            ref={(el) =>
                              registerInputRef(
                                `material-${index}-${materialIndex}-content`,
                                el
                              )
                            }
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
      <div className="flex flex-col justify-center items-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading class content...</p>
      </div>
    );
  }
  // Loading state with improved message
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading class content...</p>
      </div>
    );
  }

  // Error state with more details
  if (error || !classData) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="bg-red-100 p-4 rounded-md text-red-700 max-w-lg text-center">
          <p className="font-medium mb-2">
            {error || "Class data could not be loaded"}
          </p>
          <p className="text-sm">
            Please try again or{" "}
            <Link
              href={`/dashboard/admin/course/${courseSlug}`}
              className="text-purple-600 hover:underline"
            >
              return to the course
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Empty state for when no content is available despite loading properly
  if (formData.content.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center">
          <Link
            href={`/dashboard/admin/course/${courseSlug}`}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Class</h1>
            {course && (
              <p className="text-sm text-gray-500 mt-1">
                Course: {course.attributes.title}
              </p>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mb-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2 flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            No Content Sections Found
          </h3>
          <p className="text-yellow-700 mb-4">
            This class exists but doesn't have any content sections defined yet.
            You can add content sections below.
          </p>
        </div>

        {/* Rest of your form will be here */}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Link
          href={`/dashboard/admin/course/${courseSlug}`}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Class</h1>
          {course && (
            <p className="text-sm text-gray-500 mt-1">
              Course: {course.attributes.title}
            </p>
          )}
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div
          ref={successRef}
          className="mb-6 p-4 bg-green-100 text-green-700 rounded-md"
        >
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
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6"
        noValidate
      >
        {/* Basic class info */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div ref={(el) => registerSectionRef("title", el)}>
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
                onFocus={(e) => e.stopPropagation()}
                onBlur={(e) => e.stopPropagation()}
                ref={(el) => registerInputRef("title", el)}
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
                onFocus={(e) => e.stopPropagation()}
                onBlur={(e) => e.stopPropagation()}
                ref={(el) => registerInputRef("orderIndex", el)}
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
              onFocus={(e) => e.stopPropagation()}
              onBlur={(e) => e.stopPropagation()}
              ref={(el) => registerInputRef("duration", el)}
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addContentSection("video");
                }}
                className={`inline-flex items-center px-3 py-2 rounded 
                  ${
                    existingSectionTypes.has("video")
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                disabled={existingSectionTypes.has("video")}
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                Add Video
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addContentSection("key-concepts");
                }}
                className={`inline-flex items-center px-3 py-2 rounded 
                  ${
                    existingSectionTypes.has("key-concepts")
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                disabled={existingSectionTypes.has("key-concepts")}
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Add Key Concepts
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addContentSection("writing-prompts");
                }}
                className={`inline-flex items-center px-3 py-2 rounded 
                  ${
                    existingSectionTypes.has("writing-prompts")
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                  }`}
                disabled={existingSectionTypes.has("writing-prompts")}
              >
                <BookOpenIcon className="h-5 w-5 mr-2" />
                Add Writing Prompts
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addContentSection("additional-materials");
                }}
                className={`inline-flex items-center px-3 py-2 rounded 
                  ${
                    existingSectionTypes.has("additional-materials")
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                  }`}
                disabled={existingSectionTypes.has("additional-materials")}
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addContentSection("video");
                }}
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
            href={`/dashboard/admin/course/${courseSlug}`}
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
                Updating...
              </>
            ) : (
              "Update Class"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditClassForm;
