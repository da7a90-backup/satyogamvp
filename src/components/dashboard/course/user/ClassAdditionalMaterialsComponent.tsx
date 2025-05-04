"use client";

import { useState, useEffect, useRef } from "react";
import { courseApi } from "@/lib/courseApi";
import courseProgressApi from "@/lib/courseProgressApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import {
  CheckCircleIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";

interface ClassAdditionalMaterialsComponentProps {
  slug: string;
  classIndex: number;
}

type Tab = "video" | "essay" | "guidedMeditation" | "comments";

interface Comment {
  id: number;
  author: string;
  time: string;
  content: string;
}

const ClassAdditionalMaterialsComponent = ({
  slug,
  classIndex,
}: ClassAdditionalMaterialsComponentProps) => {
  const [courseClass, setCourseClass] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("video");
  const [availableTabs, setAvailableTabs] = useState<Tab[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Mock comments for the Comments tab
  const mockComments: Comment[] = [
    {
      id: 1,
      author: "Name Lastname",
      time: "2 min ago",
      content:
        "Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur.Lorem ipsum dolor sit amet consectetur.Lorem ipsum dolor sit amet consectetur.",
    },
    {
      id: 2,
      author: "Name Lastname",
      time: "2 min ago",
      content:
        "Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur.Lorem ipsum dolor sit amet consectetur.Lorem ipsum dolor sit amet consectetur.",
    },
    {
      id: 3,
      author: "Name Lastname",
      time: "2 min ago",
      content:
        "Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur.Lorem ipsum dolor sit amet consectetur.Lorem ipsum dolor sit amet consectetur.",
    },
    {
      id: 4,
      author: "Name Lastname",
      time: "2 min ago",
      content:
        "Lorem ipsum dolor sit amet consectetur. Lorem ipsum dolor sit amet consectetur.Lorem ipsum dolor sit amet consectetur.Lorem ipsum dolor sit amet consectetur.",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get course data
        const courseData = await courseApi.getCourseBySlug(slug);
        if (!courseData) {
          setError("Course not found");
          return;
        }
        setCourse(courseData);

        // Use the specialized API function that populates additional materials
        const classData = await courseApi.getClassWithAdditionalMaterials(
          slug,
          classIndex
        );

        if (!classData) {
          setError("Class not found");
          return;
        }

        setCourseClass(classData);

        // Log the data structure for debugging
        console.log(
          "Additional materials data:",
          classData?.attributes?.content?.additionalMaterials
        );

        // Determine which tabs are available based on content
        const tabs: Tab[] = [];
        const additionalMaterials =
          classData?.attributes?.content?.additionalMaterials;

        if (additionalMaterials?.video?.data) {
          tabs.push("video");
        }

        if (additionalMaterials?.essay) {
          tabs.push("essay");
        }

        if (additionalMaterials?.guidedMeditation?.data) {
          tabs.push("guidedMeditation");
        }

        // Always add comments tab
        tabs.push("comments");

        setAvailableTabs(tabs);

        // Set initial active tab to first available
        if (tabs.length > 0 && !tabs.includes(activeTab)) {
          setActiveTab(tabs[0]);
        }

        // Get the current progress for this class
        if (courseData.id && classData.id) {
          const progressData = await courseProgressApi.getUserCourseProgress(
            courseData.id.toString()
          );
          if (progressData && progressData.attributes.tracking?.classes) {
            const classProgress = progressData.attributes.tracking.classes.find(
              (c: any) => c.classId === classData.id
            );
            if (classProgress) {
              const additionalMaterials =
                classProgress.additionalMaterials || 0;
              setIsCompleted(additionalMaterials >= 0.99);
            }
          }
        }

        // Start tracking time spent
        setStartTime(Date.now());
      } catch (err) {
        console.error("Error fetching additional materials:", err);
        setError("Failed to load additional materials");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Setup timer for auto-completion
    const timer = setInterval(() => {
      if (startTime && !isCompleted) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimeSpent(elapsed);

        // Auto-complete after 2 minutes (120 seconds)
        if (elapsed >= 120) {
          handleMarkComplete();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [slug, classIndex, isCompleted]);

  // Handle audio events
  useEffect(() => {
    if (!audioRef.current) return;

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setAudioCurrentTime(audioRef.current.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setAudioDuration(audioRef.current.duration);
      }
    };

    const handleAudioEnd = () => {
      setIsAudioPlaying(false);
    };

    const audio = audioRef.current;
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleAudioEnd);

    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("ended", handleAudioEnd);
      }
    };
  }, [audioRef.current]);

  const getMediaUrl = (url?: string) => {
    if (!url) return "";

    // Check if it's already a full URL
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Otherwise, it's a relative URL, so prepend the base URL
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "";
    return `${baseUrl}${url}`;
  };

  const getTabLabel = (tab: Tab): string => {
    switch (tab) {
      case "video":
        return "Video";
      case "essay":
        return "Essay";
      case "guidedMeditation":
        return "Guided meditation";
      case "comments":
        return "Comments";
    }
  };

  const getFileSize = (size?: number): string => {
    if (!size) return "16 MB"; // Default fallback

    const mbSize = Math.round(size / (1024 * 1024));
    return `${mbSize} MB`;
  };

  // Toggle audio playback
  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;

    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play();
      setIsAudioPlaying(true);
    }
  };

  // Handle seeking in the audio timeline
  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;

    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setAudioCurrentTime(newTime);
  };

  // Toggle video playback
  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;

    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  // Handle manual completion
  const handleMarkComplete = async () => {
    if (isCompleted || !course || !courseClass) return;

    try {
      setIsCompleted(true);

      await courseProgressApi.markComponentComplete(
        course.id.toString(),
        courseClass.id.toString(),
        "additionalMaterials"
      );
    } catch (err) {
      console.error("Error marking additional materials as completed:", err);
      setIsCompleted(false);
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const renderTabContent = () => {
    if (!courseClass) return null;

    const additionalMaterials =
      courseClass.attributes?.content?.additionalMaterials;

    switch (activeTab) {
      case "video":
        const videoData = additionalMaterials?.video?.data?.attributes;
        return (
          <div>
            {/* Video player with placeholder or actual video */}
            <div className="bg-gray-700 aspect-video relative flex items-center justify-center rounded-md mb-4">
              {videoData?.url ? (
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-full"
                  src={getMediaUrl(videoData.url)}
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-white">
                  <button className="bg-white bg-opacity-20 rounded-full p-4">
                    <PlayIcon className="h-8 w-8 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* Video description */}
            <p className="text-gray-700">
              {additionalMaterials?.videoDescription ||
                "Shunyamurti elaborates on the 7 Realms of Knowledge, expressing the capacities of each type of knowledge and their relationship to intelligence development, and reminding us that surrender to supreme knowledge, the equivalent of facing ego-death, is required for consciousness to expand into infinity."}
            </p>
          </div>
        );

      case "essay":
        const essayContent = additionalMaterials?.essay || "";
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">
              The Marriage of Logic and Mysticism
            </h2>
            <div className="prose prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-xl prose-h2:text-lg prose-p:text-gray-700 prose-li:my-0 prose-ol:list-decimal prose-ul:list-disc max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-xl font-bold mt-4 mb-2" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-lg font-bold mt-4 mb-2" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-md font-bold mt-3 mb-1" {...props} />
                  ),
                  p: ({ node, ...props }) => <p className="my-2" {...props} />,
                  ul: ({ node, ...props }) => (
                    <ul className="pl-6 list-disc my-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="pl-6 list-decimal my-2" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="ml-2 py-1" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="pl-4 italic border-l-4 border-gray-300 my-3"
                      {...props}
                    />
                  ),
                }}
              >
                {essayContent}
              </ReactMarkdown>
            </div>
          </div>
        );

      case "guidedMeditation":
        const meditationData =
          additionalMaterials?.guidedMeditation?.data?.attributes;
        const audioUrl = meditationData?.url || "";
        const audioSize = meditationData?.size;

        return (
          <div>
            <h2 className="text-xl font-bold mb-4">
              Abide as the Shining Self
            </h2>

            <p className="text-gray-700 mb-4">
              Enter deeply into the stillness of thought-free presence, the
              silence of pure consciousness. Surrender and dissolve into the
              luminous Self that shines from the center of Being and transmits
              beyond infinity. (23:07)
            </p>

            {/* Audio player - now properly showing audio controls */}
            <div className="bg-gray-700 rounded-md p-4 mb-4">
              <div className="text-white mb-2">
                Abide as the Shining Self: Spiritual teachings with Shunyamurti
              </div>

              {/* Hidden audio element to control playback */}
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={getMediaUrl(audioUrl)}
                  className="hidden"
                  preload="metadata"
                />
              )}

              <div className="flex justify-center items-center space-x-4 mb-2">
                <button className="text-white p-1" disabled={!audioUrl}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
                <button className="text-white p-1" disabled={!audioUrl}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  className={`${
                    audioUrl ? "bg-white" : "bg-gray-500"
                  } rounded-full p-1`}
                  onClick={toggleAudioPlayback}
                  disabled={!audioUrl}
                >
                  {isAudioPlaying ? (
                    <PauseIcon className="h-6 w-6 text-gray-700" />
                  ) : (
                    <PlayIcon className="h-6 w-6 text-gray-700" />
                  )}
                </button>
                <button className="text-white p-1" disabled={!audioUrl}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <button className="text-white p-1" disabled={!audioUrl}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>

              {/* Audio timeline */}
              <div className="relative w-full h-1 bg-gray-600 rounded-full mb-1">
                <input
                  type="range"
                  min="0"
                  max={audioDuration || 100}
                  value={audioCurrentTime}
                  onChange={handleAudioSeek}
                  className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                  disabled={!audioUrl}
                />
                <div
                  className="absolute bg-white h-1 rounded-full"
                  style={{
                    width: `${
                      audioDuration
                        ? (audioCurrentTime / audioDuration) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between text-white text-xs">
                <span>{formatTime(audioCurrentTime)}</span>
                <span>{formatTime(audioDuration)}</span>
              </div>
            </div>

            {/* Audio download info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-600 text-white text-xs font-bold p-2 rounded mr-2">
                  Audio
                  <br />
                  {getFileSize(audioSize)}
                </div>
                <div>
                  Audio
                  <br />
                  {getFileSize(audioSize)}
                </div>
              </div>

              {audioUrl && (
                <a
                  href={getMediaUrl(audioUrl)}
                  download
                  className="text-purple-600 hover:text-purple-800 flex items-center"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Download
                </a>
              )}
            </div>
          </div>
        );

      case "comments":
        return (
          <div>
            {/* Comments list */}
            <div className="space-y-4 mb-6">
              {mockComments.map((comment) => (
                <div key={comment.id} className="border-t border-gray-100 pt-4">
                  <div className="flex items-start">
                    <div className="h-8 w-8 bg-gray-200 rounded-full mr-3 flex-shrink-0 flex items-center justify-center text-gray-400">
                      {comment.author.charAt(0)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <span className="font-medium">{comment.author}</span>
                        <span className="text-xs text-gray-500">
                          {comment.time}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment input */}
            <div className="border rounded-md p-3">
              <textarea
                placeholder="Write a post"
                className="w-full border-none resize-none focus:outline-none text-sm"
                rows={3}
              ></textarea>
              <div className="flex justify-between items-center mt-2 pt-2 border-t">
                <div className="flex space-x-2">
                  <button className="text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                  </button>
                  <button className="text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                  <button className="text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                      />
                    </svg>
                  </button>
                </div>
                <button className="bg-purple-600 text-white px-4 py-1 rounded-md text-sm">
                  Send
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a tab to view content</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !courseClass) {
    return <div>No additional materials found</div>;
  }

  return (
    <div>
      {/* Reading time indicator */}
      <div className="text-sm text-gray-500 mb-4 flex justify-between items-center">
        <span>Time spent: {formatTime(timeSpent)}</span>
        {!isCompleted && timeSpent < 120 && (
          <span>Auto-completes in {formatTime(120 - timeSpent)}</span>
        )}
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px space-x-8">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content for the active tab */}
      {renderTabContent()}

      {/* Social sharing buttons - only show for non-comments tab */}
      {activeTab !== "comments" && (
        <div className="flex justify-end mt-6 space-x-3">
          <button className="p-2 rounded-full border border-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
          </button>
          <button className="p-2 rounded-full border border-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
              <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1z" />
            </svg>
          </button>
          <button className="p-2 rounded-full border border-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
          <button className="p-2 rounded-full border border-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleMarkComplete}
          disabled={isCompleted}
          className={`px-4 py-2 rounded-md flex items-center ${
            isCompleted
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Completed
            </>
          ) : (
            "Mark as completed"
          )}
        </button>
      </div>

      {/* Completion message */}
      {isCompleted && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-800 mb-2">
                Additional materials completed!
              </h3>
              <p className="text-green-700">
                You've completed this section. You can continue to the next
                class or revisit any section.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassAdditionalMaterialsComponent;
