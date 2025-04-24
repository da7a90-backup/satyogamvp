"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckIcon,
  ExclamationCircleIcon,
  PlayIcon,
  DocumentTextIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  PaperClipIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

interface ClassContentEditorProps {
  courseId: string;
  classId: string;
}

interface ClassType {
  id: number;
  attributes: {
    title: string;
    content: any[];
    course: {
      data: {
        id: number;
        attributes: {
          title: string;
        };
      };
    };
  };
}

// Component to edit a class content
const ClassContentEditor = ({ courseId, classId }: ClassContentEditorProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [classData, setClassData] = useState<ClassType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("video");
  const [showPreview, setShowPreview] = useState(false);
  const markdownRef = useRef<HTMLTextAreaElement>(null);
  
  // Form state for each content type
  const [videoForm, setVideoForm] = useState({
    title: "",
    videoUrl: "",
    description: "",
    transcript: "",
    audioFile: null as File | null,
    duration: 0,
  });
  
  const [keyConcepts, setKeyConcepts] = useState("");
  const [writingPrompts, setWritingPrompts] = useState("");
  
  const [additionalMaterialsForm, setAdditionalMaterialsForm] = useState({
    videoTitle: "",
    videoUrl: "",
    essayTitle: "",
    essayContent: "",
    meditationTitle: "",
    meditationAudio: null as File | null,
    duration: 0,
  });

  // Current file URLs for editing
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentMeditationAudioUrl, setCurrentMeditationAudioUrl] = useState<string | null>(null);

  // Utility function for API requests
  const fetchAPI = async (endpoint: string, options = {}) => {
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://127.0.0.1:1337";
    const token = localStorage.getItem("jwt") || process.env.NEXT_PUBLIC_STRAPI_TOKEN;
    
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    
    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }
    
    return response.json();
  };

  // Fetch class data
  const fetchClassData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchAPI(`/api/classes/${classId}?populate=course,content`);
      setClassData(response.data);
      
      // Initialize form data from existing content if available
      const content = response.data.attributes.content || [];
      
      // Look for video content
      const videoContent = content.find(item => item.type === 'video');
      if (videoContent) {
        setVideoForm({
          title: videoContent.title || "",
          videoUrl: videoContent.videoUrl || "",
          description: videoContent.description || "",
          transcript: videoContent.transcript || "",
          audioFile: null,
          duration: videoContent.duration || 0,
        });
        
        if (videoContent.audioUrl) {
          setCurrentAudioUrl(`${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${videoContent.audioUrl}`);
        }
      }
      
      // Look for key concepts content
      const keyConceptsContent = content.find(item => item.type === 'key-concepts');
      if (keyConceptsContent) {
        setKeyConcepts(keyConceptsContent.content || "");
      }
      
      // Look for writing prompts content
      const writingPromptsContent = content.find(item => item.type === 'writing-prompts');
      if (writingPromptsContent) {
        setWritingPrompts(writingPromptsContent.content || "");
      }
      
      // Look for additional materials content
      const additionalContent = content.find(item => item.type === 'additional-materials');
      if (additionalContent) {
        setAdditionalMaterialsForm({
          videoTitle: additionalContent.videoTitle || "",
          videoUrl: additionalContent.videoUrl || "",
          essayTitle: additionalContent.essayTitle || "",
          essayContent: additionalContent.essayContent || "",
          meditationTitle: additionalContent.meditationTitle || "",
          meditationAudio: null,
          duration: additionalContent.duration || 0,
        });
        
        if (additionalContent.meditationAudioUrl) {
          setCurrentMeditationAudioUrl(`${process.env.NEXT_PUBLIC_STRAPI_URL || ""}${additionalContent.meditationAudioUrl}`);
        }
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load class data");
      console.error("Error fetching class:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load class data on mount
  useEffect(() => {
    fetchClassData();
  }, [classId]);

  // Handle file changes
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFunction: React.Dispatch<React.SetStateAction<any>>,
    fileField: string
  ) => {
    const file = e.target.files?.[0] || null;
    setFunction(prev => ({ ...prev, [fileField]: file }));
  };

  // Upload a file to Strapi
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("files", file);

    const uploadResult = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt") || process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      },
      body: formData,
    }).then(res => res.json());

    return uploadResult[0].url; // Return the URL of the uploaded file
  };

  // Markdown formatting helpers
  const formatMarkdown = (type: string, textareaRef: React.RefObject<HTMLTextAreaElement>, content: string, setContent: (value: string) => void) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = content;
    let cursorOffset = 0;
    
    switch (type) {
      case "bold":
        newText = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
        cursorOffset = 2;
        break;
      case "italic":
        newText = content.substring(0, start) + `*${selectedText}*` + content.substring(end);
        cursorOffset = 1;
        break;
      case "heading":
        const newLine = start > 0 && content[start - 1] !== '\n' ? '\n' : '';
        newText = content.substring(0, start) + `${newLine}## ${selectedText}` + content.substring(end);
        cursorOffset = newLine.length + 3;
        break;
      case "list":
        newText = content.substring(0, start) + `- ${selectedText}` + content.substring(end);
        cursorOffset = 2;
        break;
      case "link":
        newText = content.substring(0, start) + `[${selectedText || "Link text"}](https://example.com)` + content.substring(end);
        cursorOffset = selectedText ? 1 : 10;
        break;
    }
    
    setContent(newText);
    
    // Set cursor position after the operation
    setTimeout(() => {
      if (textareaRef.current) {
        if (start === end) {
          const cursorPos = start + cursorOffset;
          textareaRef.current.selectionStart = cursorPos;
          textareaRef.current.selectionEnd = cursorPos;
        } else {
          const cursorPos = end + (type === 'link' && !selectedText ? 10 : cursorOffset * 2);
          textareaRef.current.selectionStart = cursorPos;
          textareaRef.current.selectionEnd = cursorPos;
        }
        textareaRef.current.focus();
      }
    }, 0);
  };
  
  // Handler for text content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(e.target.value);
  };

  // Validation checks
  const validateVideoForm = () => {
    if (!videoForm.title.trim()) {
      setError("Video title is required");
      return false;
    }
    return true;
  };
  
  const validateAdditionalMaterials = () => {
    // Only validate fields that are filled in
    if (additionalMaterialsForm.videoUrl && !additionalMaterialsForm.videoTitle) {
      setError("Video title is required if you provide a video URL");
      return false;
    }
    
    if (additionalMaterialsForm.essayContent && !additionalMaterialsForm.essayTitle) {
      setError("Essay title is required if you provide essay content");
      return false;
    }
    
    if ((additionalMaterialsForm.meditationAudio || currentMeditationAudioUrl) && !additionalMaterialsForm.meditationTitle) {
      setError("Meditation title is required if you provide a meditation audio file");
      return false;
    }
    
    return true;
  };

  // Save the class content
  const saveClassContent = async () => {
    setError(null);
    setIsSaving(true);
    
    try {
      // Prepare content array
      const contentArray = [];
      
      // Process video content
      if (videoForm.title || videoForm.videoUrl || videoForm.description || videoForm.transcript) {
        let audioUrl = currentAudioUrl?.replace(process.env.NEXT_PUBLIC_STRAPI_URL || "", "") || null;
        
        // Upload audio file if provided
        if (videoForm.audioFile) {
          audioUrl = await uploadFile(videoForm.audioFile);
        }
        
        contentArray.push({
          type: 'video',
          title: videoForm.title,
          videoUrl: videoForm.videoUrl,
          description: videoForm.description,
          transcript: videoForm.transcript,
          audioUrl,
          duration: videoForm.duration,
        });
      }
      
      // Process key concepts
      if (keyConcepts.trim()) {
        contentArray.push({
          type: 'key-concepts',
          title: 'Key Concepts',
          content: keyConcepts,
          duration: 0, // Can be updated later
        });
      }
      
      // Process writing prompts
      if (writingPrompts.trim()) {
        contentArray.push({
          type: 'writing-prompts',
          title: 'Writing Prompts',
          content: writingPrompts,
          duration: 0, // Can be updated later
        });
      }
      
      // Process additional materials
      if (
        additionalMaterialsForm.videoTitle || 
        additionalMaterialsForm.videoUrl || 
        additionalMaterialsForm.essayTitle || 
        additionalMaterialsForm.essayContent || 
        additionalMaterialsForm.meditationTitle || 
        additionalMaterialsForm.meditationAudio ||
        currentMeditationAudioUrl
      ) {
        let meditationAudioUrl = currentMeditationAudioUrl?.replace(process.env.NEXT_PUBLIC_STRAPI_URL || "", "") || null;
        
        // Upload meditation audio if provided
        if (additionalMaterialsForm.meditationAudio) {
          meditationAudioUrl = await uploadFile(additionalMaterialsForm.meditationAudio);
        }
        
        contentArray.push({
          type: 'additional-materials',
          videoTitle: additionalMaterialsForm.videoTitle,
          videoUrl: additionalMaterialsForm.videoUrl,
          essayTitle: additionalMaterialsForm.essayTitle,
          essayContent: additionalMaterialsForm.essayContent,
          meditationTitle: additionalMaterialsForm.meditationTitle,
          meditationAudioUrl,
          duration: additionalMaterialsForm.duration,
        });
      }
      
      // Update class in API
      await fetchAPI(`/api/classes/${classId}`, {
        method: "PUT",
        body: JSON.stringify({
          data: {
            content: contentArray,
          }
        }),
      });
      
      setSuccessMessage("Class content saved successfully!");
      
      // Refresh to get the updated data
      fetchClassData();
      
      // Clear success message after a few seconds
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

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate based on active tab
    if (activeTab === 'video' && !validateVideoForm()) return;
    if (activeTab === 'additional-materials' && !validateAdditionalMaterials()) return;
    
    await saveClassContent();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ArrowPathIcon className="h-8 w-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  // Render the class content editor
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Link
          href={`/dashboard/admin/courses/${courseId}/classes`}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Class Content
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {classData?.attributes.course.data.attributes.title} - {classData?.attributes.title}
          </p>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md flex items-center">
          <CheckIcon className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Tabs for content sections */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'video'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('video')}
          >
            <div className="flex items-center">
              <VideoCameraIcon className="h-5 w-5 mr-2" />
              Video
            </div>
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'key-concepts'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('key-concepts')}
          >
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Key Concepts
            </div>
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'writing-prompts'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('writing-prompts')}
          >
            <div className="flex items-center">
              <PencilSquareIcon className="h-5 w-5 mr-2" />
              Writing Prompts
            </div>
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'additional-materials'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('additional-materials')}
          >
            <div className="flex items-center">
              <BookOpenIcon className="h-5 w-5 mr-2" />
              Additional Materials
            </div>
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Video Tab Content */}
            {activeTab === 'video' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Video Content</h2>
                
                <div className="mb-4">
                  <label
                    htmlFor="video-title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Video Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="video-title"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter video title"
                  />
                </div>
                
                <div className="mb-4">
                  <label
                    htmlFor="video-url"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Video URL
                  </label>
                  <input
                    type="text"
                    id="video-url"
                    value={videoForm.videoUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter video URL"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Use an embed URL for best compatibility (YouTube, Vimeo, etc.)
                  </p>
                </div>
                
                <div className="mb-4">
                  <label
                    htmlFor="video-description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="video-description"
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter video description"
                  />
                </div>
                
                <div className="mb-4">
                  <label
                    htmlFor="video-transcript"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Transcript
                  </label>
                  <textarea
                    id="video-transcript"
                    value={videoForm.transcript}
                    onChange={(e) => setVideoForm({ ...videoForm, transcript: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter video transcript"
                  />
                </div>
                
                <div className="mb-4">
                  <label
                    htmlFor="video-audio"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Audio File
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="file"
                      id="video-audio"
                      accept="audio/*"
                      onChange={(e) => handleFileChange(e, setVideoForm, 'audioFile')}
                      className="sr-only"
                    />
                    <label
                      htmlFor="video-audio"
                      className="relative cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <span>Choose file</span>
                    </label>
                    <p className="ml-3 text-sm text-gray-500">
                      {videoForm.audioFile ? videoForm.audioFile.name : "No file chosen"}
                    </p>
                  </div>
                  {currentAudioUrl && !videoForm.audioFile && (
                    <div className="mt-2 flex items-center">
                      <MusicalNoteIcon className="h-5 w-5 text-gray-500 mr-2" />
                      <a href={currentAudioUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline">
                        Current audio file
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label
                    htmlFor="video-duration"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="video-duration"
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm({ ...videoForm, duration: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {/* Form submission buttons */}
            <div className="mt-8 flex justify-end space-x-3">
              <Link
                href={`/dashboard/admin/courses/${courseId}/classes`}
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
                    Saving...
                  </>
                ) : (
                  "Save Content"
                )}
              </button>
            </div>
              </div>
            )}

            {/* Key Concepts Tab Content */}
            {activeTab === 'key-concepts' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Key Concepts</h2>
                
                <div className="border border-gray-300 rounded-md overflow-hidden mb-4">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Markdown Editor</span>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => formatMarkdown("bold", markdownRef, keyConcepts, setKeyConcepts)}
                        title="Bold"
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <strong className="text-xs">B</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => formatMarkdown("italic", markdownRef, keyConcepts, setKeyConcepts)}
                        title="Italic"
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <em className="text-xs">I</em>
                      </button>
                      <button
                        type="button"
                        onClick={() => formatMarkdown("heading", markdownRef, keyConcepts, setKeyConcepts)}
                        title="Heading"
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <span className="text-xs font-bold">H</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => formatMarkdown("list", markdownRef, keyConcepts, setKeyConcepts)}
                        title="List"
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <span className="text-xs">• List</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => formatMarkdown("link", markdownRef, keyConcepts, setKeyConcepts)}
                        title="Link"
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <span className="text-xs">🔗</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    {!showPreview ? (
                      <textarea
                        ref={markdownRef}
                        value={keyConcepts}
                        onChange={(e) => handleContentChange(e, setKeyConcepts)}
                        rows={15}
                        className="w-full px-4 py-2 border-0 focus:outline-none focus:ring-0"
                        placeholder="Write the key concepts here using Markdown..."
                      />
                    ) : (
                      <div className="prose max-w-none p-4 min-h-[300px] bg-white overflow-y-auto">
                        <ReactMarkdown>
                          {keyConcepts || "Nothing to preview yet"}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    {showPreview ? "Edit" : "Preview"}
                  </button>
                </div>
              </div>
            )}

            {/* Writing Prompts Tab Content */}
            {activeTab === 'writing-prompts' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Writing Prompts & Further Reflection</h2>
                
                <div className="border border-gray-300 rounded-md overflow-hidden mb-4">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Markdown Editor</span>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => formatMarkdown("bold", markdownRef, writingPrompts, setWritingPrompts)}
                        title="Bold"
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <strong className="text-xs">B</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => formatMarkdown("italic", markdownRef, writingPrompts, setWritingPrompts)}
                        title="Italic"
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <em className="text-xs">I</em>
                      </button>
                      <button
                        type="button"
                        onClick={() => formatMarkdown("heading", markdownRef, writingPrompts, setWritingPrompts)}
                        title="Heading"
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <span className="text-xs font-bold">H</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => formatMarkdown("list", markdownRef, writingPrompts, setWritingPrompts)}
                        title="List"
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <span className="text-xs">• List</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => formatMarkdown("link", markdownRef, writingPrompts, setWritingPrompts)}
                        title="Link"
                        className="p-1 rounded hover:bg-gray-200"
                      >
                        <span className="text-xs">🔗</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    {!showPreview ? (
                      <textarea
                        ref={markdownRef}
                        value={writingPrompts}
                        onChange={(e) => handleContentChange(e, setWritingPrompts)}
                        rows={15}
                        className="w-full px-4 py-2 border-0 focus:outline-none focus:ring-0"
                        placeholder="Write the prompts and reflection questions here..."
                      />
                    ) : (
                      <div className="prose max-w-none p-4 min-h-[300px] bg-white overflow-y-auto">
                        <ReactMarkdown>
                          {writingPrompts || "Nothing to preview yet"}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    {showPreview ? "Edit" : "Preview"}
                  </button>
                </div>
              </div>
            )}

            {/* Additional Materials Tab Content */}
            {activeTab === 'additional-materials' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Materials</h2>
                
                <div className="mb-6 border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <PlayIcon className="h-5 w-5 mr-2 text-purple-500" />
                    Additional Video
                  </h3>
                  
                  <div className="mb-4">
                    <label
                      htmlFor="additional-video-title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Video Title
                    </label>
                    <input
                      type="text"
                      id="additional-video-title"
                      value={additionalMaterialsForm.videoTitle}
                      onChange={(e) => setAdditionalMaterialsForm({
                        ...additionalMaterialsForm,
                        videoTitle: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter video title"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label
                      htmlFor="additional-video-url"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Video URL
                    </label>
                    <input
                      type="text"
                      id="additional-video-url"
                      value={additionalMaterialsForm.videoUrl}
                      onChange={(e) => setAdditionalMaterialsForm({
                        ...additionalMaterialsForm,
                        videoUrl: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter video URL"
                    />
                  </div>
                </div>
                
                <div className="mb-6 border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Essay
                  </h3>
                  
                  <div className="mb-4">
                    <label
                      htmlFor="essay-title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Essay Title
                    </label>
                    <input
                      type="text"
                      id="essay-title"
                      value={additionalMaterialsForm.essayTitle}
                      onChange={(e) => setAdditionalMaterialsForm({
                        ...additionalMaterialsForm,
                        essayTitle: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter essay title"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label
                      htmlFor="essay-content"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Essay Content
                    </label>
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                      <textarea
                        id="essay-content"
                        value={additionalMaterialsForm.essayContent}
                        onChange={(e) => setAdditionalMaterialsForm({
                          ...additionalMaterialsForm,
                          essayContent: e.target.value
                        })}
                        rows={10}
                        className="w-full px-4 py-2 border-0 focus:outline-none focus:ring-0"
                        placeholder="Write the essay content here..."
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mb-6 border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <MusicalNoteIcon className="h-5 w-5 mr-2 text-green-500" />
                    Guided Meditation
                  </h3>
                  
                  <div className="mb-4">
                    <label
                      htmlFor="meditation-title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Meditation Title
                    </label>
                    <input
                      type="text"
                      id="meditation-title"
                      value={additionalMaterialsForm.meditationTitle}
                      onChange={(e) => setAdditionalMaterialsForm({
                        ...additionalMaterialsForm,
                        meditationTitle: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter meditation title"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label
                      htmlFor="meditation-audio"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Meditation Audio File
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        id="meditation-audio"
                        accept="audio/*"
                        onChange={(e) => handleFileChange(e, setAdditionalMaterialsForm, 'meditationAudio')}
                        className="sr-only"
                      />
                      <label
                        htmlFor="meditation-audio"
                        className="relative cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <span>Choose file</span>
                      </label>
                      <p className="ml-3 text-sm text-gray-500">
                        {additionalMaterialsForm.meditationAudio ? additionalMaterialsForm.meditationAudio.name : "No file chosen"}
                      </p>
                    </div>
                    {currentMeditationAudioUrl && !additionalMaterialsForm.meditationAudio && (
                      <div className="mt-2 flex items-center">
                        <MusicalNoteIcon className="h-5 w-5 text-gray-500 mr-2" />
                        <a href={currentMeditationAudioUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline">
                          Current meditation audio file
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label
                    htmlFor="additional-duration"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Total Duration for Additional Materials (minutes)
                  </label>
                  <input
                    type="number"
                    id="additional-duration"
                    value={additionalMaterialsForm.duration}
                    onChange={(e) => setAdditionalMaterialsForm({
                      ...additionalMaterialsForm,
                      duration: parseInt(e.target.value) || 0
                    })}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>