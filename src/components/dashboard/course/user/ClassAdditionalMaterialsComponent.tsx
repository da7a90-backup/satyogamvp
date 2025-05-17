"use client";

import { useState, useEffect, useRef } from "react";
import { courseApi } from "@/lib/courseApi";
import courseProgressApi from "@/lib/courseProgressApi";
import courseCommentApi from "@/lib/courseCommentApi";
import CourseCommentsComponent from "@/components/dashboard/course/user/CourseCommentsComponent";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";
import {
  PlayIcon,
  PauseIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  BackwardIcon,
  ForwardIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

interface ClassAdditionalMaterialsComponentProps {
  slug: string;
  classIndex: number;
}

const ClassAdditionalMaterialsComponent = ({
  slug,
  classIndex,
}: ClassAdditionalMaterialsComponentProps) => {
  const [courseClass, setCourseClass] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "video" | "essay" | "guidedMeditation" | "comments"
  >("video");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showPlaybackOptions, setShowPlaybackOptions] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showClipboardNotification, setShowClipboardNotification] =
    useState(false);

  // Video player state
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // Additional content state
  const [guidedMeditationTitle, setGuidedMeditationTitle] = useState("");
  const [guidedMeditationDescription, setGuidedMeditationDescription] =
    useState("");
  const [audioMimeType, setAudioMimeType] = useState("");
  const [audioSize, setAudioSize] = useState<number | undefined>(undefined);
  const [audioFileExtension, setAudioFileExtension] = useState("MP3");

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

        // Use the specialized function to get class data with additional materials
        const classData = await courseApi.getClassWithAdditionalMaterials(
          slug,
          classIndex
        );
        if (!classData) {
          setError("Class not found");
          return;
        }
        setCourseClass(classData);

        // Extract guided meditation title if it exists
        if (
          classData.attributes?.content?.additionalMaterials
            ?.guidedMeditationTitle
        ) {
          setGuidedMeditationTitle(
            classData.attributes.content.additionalMaterials
              .guidedMeditationTitle
          );
        }

        // Extract guided meditation description if it exists
        if (
          classData.attributes?.content?.additionalMaterials
            ?.guidedMeditationDescription
        ) {
          setGuidedMeditationDescription(
            classData.attributes.content.additionalMaterials
              .guidedMeditationDescription
          );
        }

        // Extract audio file information if it exists
        const meditationData =
          classData.attributes?.content?.additionalMaterials?.guidedMeditation
            ?.data?.attributes;
        if (meditationData) {
          setAudioMimeType(meditationData.mime || "audio/mp3");
          setAudioSize(meditationData.size);

          // Extract file extension from mime type or url
          const mimeToExt: Record<string, string> = {
            "audio/mpeg": "MP3",
            "audio/mp3": "MP3",
            "audio/mp4": "M4A",
            "audio/wav": "WAV",
            "audio/ogg": "OGG",
            "audio/flac": "FLAC",
          };

          // Try to get extension from mime type
          if (meditationData.mime && mimeToExt[meditationData.mime]) {
            setAudioFileExtension(mimeToExt[meditationData.mime]);
          }
          // Fallback to getting extension from URL
          else if (meditationData.url) {
            const urlParts = meditationData.url.split(".");
            if (urlParts.length > 1) {
              const ext = urlParts[urlParts.length - 1].toUpperCase();
              setAudioFileExtension(ext);
            }
          }
        }

        // Get the current progress for this class
        if (courseData.id && classData.id) {
          try {
            const progressData = await courseProgressApi.getUserCourseProgress(
              courseData.id.toString()
            );
            if (progressData && progressData.attributes?.tracking?.classes) {
              const classProgress =
                progressData.attributes.tracking.classes.find(
                  (c: any) => c.classId === classData.id
                );
              if (classProgress) {
                const additionalMaterials =
                  classProgress.additionalMaterials || 0;
                setIsCompleted(additionalMaterials >= 0.99);
              }
            }
          } catch (progressError) {
            console.error("Error fetching progress:", progressError);
          }
        }

        // Set default active tab based on available content
        determineDefaultActiveTab(classData);

        // Fetch comments and user data
      } catch (err) {
        console.error("Error fetching additional materials:", err);
        setError("Failed to load additional materials");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug, classIndex]);

  // Determine default active tab based on available content
  const determineDefaultActiveTab = (classData: any) => {
    const additionalMaterials =
      classData.attributes?.content?.additionalMaterials;
    if (!additionalMaterials) return;

    if (additionalMaterials.video?.data) {
      setActiveTab("video");
    } else if (additionalMaterials.essay) {
      setActiveTab("essay");
    } else if (additionalMaterials.guidedMeditation?.data) {
      setActiveTab("guidedMeditation");
    } else {
      setActiveTab("comments");
    }
  };

  // Refs for seeking
  const fastSeekingRef = useRef<{
    active: boolean;
    direction: "forward" | "backward" | null;
  }>({
    active: false,
    direction: null,
  });
  const seekingIntervalRef = useRef<number | null>(null);

  // Handle audio events
  useEffect(() => {
    if (!audioRef.current) return;

    const handleTimeUpdate = () => {
      if (audioRef.current && !isSeeking && !fastSeekingRef.current.active) {
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

    const handleAudioPlay = () => {
      setIsAudioPlaying(true);
    };

    const handleAudioPause = () => {
      setIsAudioPlaying(false);
    };

    const audio = audioRef.current;
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleAudioEnd);
    audio.addEventListener("play", handleAudioPlay);
    audio.addEventListener("pause", handleAudioPause);

    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("ended", handleAudioEnd);
        audio.removeEventListener("play", handleAudioPlay);
        audio.removeEventListener("pause", handleAudioPause);
      }
    };
  }, [audioRef.current, isSeeking]);

  // Update audio playback rate when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const getMediaUrl = (url?: string) => {
    if (!url) return "";

    // Check if it's an absolute URL
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Otherwise, it's a relative URL, so prepend the base URL
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "";
    return `${baseUrl}${url}`;
  };

  // Toggle audio playback
  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;

    if (isAudioPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  };

  // Skip forward 30 seconds
  const skipForward = () => {
    if (!audioRef.current) return;

    const newTime = Math.min(
      audioRef.current.currentTime + 30,
      audioRef.current.duration || 0
    );
    audioRef.current.currentTime = newTime;
    setAudioCurrentTime(newTime);
  };

  // Skip backward 30 seconds
  const skipBackward = () => {
    if (!audioRef.current) return;

    const newTime = Math.max(audioRef.current.currentTime - 30, 0);
    audioRef.current.currentTime = newTime;
    setAudioCurrentTime(newTime);
  };

  // Start fast forward/rewind
  const startFastSeeking = (direction: "forward" | "backward") => {
    if (!audioRef.current) return;

    fastSeekingRef.current = { active: true, direction };

    // Clear any existing interval
    if (seekingIntervalRef.current !== null) {
      window.clearInterval(seekingIntervalRef.current);
    }

    // Start a new seeking interval
    seekingIntervalRef.current = window.setInterval(() => {
      if (!audioRef.current || !fastSeekingRef.current.active) return;

      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 0;
      const seekAmount = 1; // Seek 1 second per interval

      if (direction === "forward") {
        const newTime = Math.min(currentTime + seekAmount, duration);
        audioRef.current.currentTime = newTime;
        setAudioCurrentTime(newTime);
      } else {
        const newTime = Math.max(currentTime - seekAmount, 0);
        audioRef.current.currentTime = newTime;
        setAudioCurrentTime(newTime);
      }
    }, 100); // Update every 100ms for smooth seeking
  };

  // Stop fast seeking
  const stopFastSeeking = () => {
    fastSeekingRef.current = { active: false, direction: null };

    if (seekingIntervalRef.current !== null) {
      window.clearInterval(seekingIntervalRef.current);
      seekingIntervalRef.current = null;
    }
  };

  // Clean up seeking interval on unmount
  useEffect(() => {
    return () => {
      if (seekingIntervalRef.current !== null) {
        window.clearInterval(seekingIntervalRef.current);
      }
    };
  }, []);

  // Change playback speed
  const changePlaybackSpeed = (speed: number) => {
    setPlaybackRate(speed);
    setShowPlaybackOptions(false);
  };

  // Toggle video playback
  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;

    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
  };

  // Handle video time updates
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle video metadata loaded
  const handleVideoMetadataLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  // Handle seeking in the audio timeline
  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;

    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setAudioCurrentTime(newTime);
  };

  // Handle seeking start
  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  // Handle seeking end
  const handleSeekEnd = () => {
    setIsSeeking(false);
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
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Get file size with proper formatting
  const getFileSize = (size?: number): string => {
    if (!size) return "0 MB"; // Default fallback

    const mbSize = Math.round(size / (1024 * 1024));
    return `${mbSize} MB`;
  };

  // Get title for header display (first part before colon)
  const getDisplayTitle = (fullTitle: string): string => {
    if (!fullTitle) return "";
    const parts = fullTitle.split(":");
    return parts[0].trim();
  };

  // Handle social sharing functionality
  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          // Show notification
          setShowClipboardNotification(true);
          // Hide notification after 2 seconds
          setTimeout(() => {
            setShowClipboardNotification(false);
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy link:", err);
        });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      // Show notification
      setShowClipboardNotification(true);
      // Hide notification after 2 seconds
      setTimeout(() => {
        setShowClipboardNotification(false);
      }, 2000);
    }
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(
      "7 Realms of Knowledge - Shunyamurti Teaching"
    );
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`,
      "_blank"
    );
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      "Learning about the 7 Realms of Knowledge from Shunyamurti"
    );
    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      "_blank"
    );
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank"
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "video":
        return (
          <div>
            {/* Video player with centered play button */}
            <div className="bg-gray-700 aspect-video relative flex items-center justify-center rounded-md mb-4">
              {videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    src={videoUrl}
                    onClick={toggleVideoPlayback}
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onLoadedMetadata={handleVideoMetadataLoaded}
                  >
                    Your browser does not support the video tag.
                  </video>
                  {!isVideoPlaying && (
                    <div
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      onClick={toggleVideoPlayback}
                    >
                      <div className="bg-white bg-opacity-20 rounded-full p-4">
                        <PlayIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Video timeline display */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center text-xs text-white bg-black bg-opacity-60 px-3 py-1 rounded">
                    <span>{formatTime(currentTime)}</span>
                    <div className="mx-2 flex-grow h-1 bg-gray-600 rounded-full">
                      <div
                        className="h-1 bg-white rounded-full"
                        style={{
                          width: `${
                            videoDuration
                              ? (currentTime / videoDuration) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span>{formatTime(videoDuration)}</span>
                  </div>
                </>
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
              {videoDescription ||
                "Shunyamurti elaborates on the 7 Realms of Knowledge, expressing the capacities of each type of knowledge and their relationship to intelligence development, and reminding us that surrender to supreme knowledge, the equivalent of facing ego-death, is required for consciousness to expand into infinity."}
            </p>
          </div>
        );

      case "essay":
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
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">
              {getDisplayTitle(guidedMeditationTitle) ||
                "Abide as the Shining Self"}
            </h2>

            <p className="text-gray-700 mb-4">
              {guidedMeditationDescription ||
                "Enter deeply into the stillness of thought-free presence, the silence of pure consciousness. Surrender and dissolve into the luminous Self that shines from the center of Being and transmits beyond infinity."}
              {audioDuration > 0 && ` (${formatTime(audioDuration)})`}
            </p>

            {/* Audio player */}
            <div className="bg-gray-700 rounded-md p-4 mb-4">
              <div className="text-white mb-3 text-center">
                {guidedMeditationTitle ||
                  "Abide as the Shining Self: Spiritual teachings with Shunyamurti"}
              </div>

              {/* Hidden audio element to control playback */}
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  className="hidden"
                  preload="metadata"
                />
              )}

              <div className="flex justify-center items-center space-x-6 mb-4">
                {/* Playback speed button */}
                <div className="relative">
                  <button
                    className="text-white bg-transparent border border-white px-3 py-1 rounded text-xs"
                    onClick={() => setShowPlaybackOptions(!showPlaybackOptions)}
                  >
                    x{playbackRate}
                  </button>

                  {/* Playback speed options dropdown */}
                  {showPlaybackOptions && (
                    <div className="absolute -left-4 bottom-8 bg-gray-800 rounded p-1 z-10">
                      <div className="flex flex-col">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                          <button
                            key={speed}
                            className={`px-4 py-1 text-xs ${
                              playbackRate === speed
                                ? "bg-purple-600 text-white"
                                : "text-white hover:bg-gray-700"
                            }`}
                            onClick={() => changePlaybackSpeed(speed)}
                          >
                            x{speed}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Skip backward 30s */}
                <button
                  className="text-white p-1 hover:bg-gray-600"
                  onClick={skipBackward}
                  disabled={!audioUrl}
                  aria-label="Skip backward 30 seconds"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 5V1L7 6L12 11V7C15.31 7 18 9.69 18 13C18 16.31 15.31 19 12 19C8.69 19 6 16.31 6 13H4C4 17.42 7.58 21 12 21C16.42 21 20 17.42 20 13C20 8.58 16.42 5 12 5Z"
                      fill="white"
                    />
                    <text
                      x="8.5"
                      y="16"
                      fontSize="7"
                      fill="white"
                      fontWeight="bold"
                    >
                      30
                    </text>
                  </svg>
                </button>

                {/* Play/Pause */}
                <button
                  className="bg-white rounded-full w-12 h-12 flex items-center justify-center focus:outline-none"
                  onClick={toggleAudioPlayback}
                  disabled={!audioUrl}
                  aria-label={isAudioPlaying ? "Pause" : "Play"}
                >
                  {isAudioPlaying ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z"
                        fill="#374151"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 5V19L19 12L8 5Z" fill="#374151" />
                    </svg>
                  )}
                </button>

                {/* Skip forward 30s */}
                <button
                  className="text-white p-1 hover:bg-gray-600"
                  onClick={skipForward}
                  disabled={!audioUrl}
                  aria-label="Skip forward 30 seconds"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 13C4 17.42 7.58 21 12 21C16.42 21 20 17.42 20 13H18C18 16.31 15.31 19 12 19C8.69 19 6 16.31 6 13C6 9.69 8.69 7 12 7V11L17 6L12 1V5C7.58 5 4 8.58 4 13Z"
                      fill="white"
                    />
                    <text
                      x="8.5"
                      y="16"
                      fontSize="7"
                      fill="white"
                      fontWeight="bold"
                    >
                      30
                    </text>
                  </svg>
                </button>

                {/* Download button */}
                {audioUrl && (
                  <a
                    href={audioUrl}
                    download
                    className="text-white"
                    title="Download audio"
                    aria-label="Download audio"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z"
                        fill="white"
                      />
                    </svg>
                  </a>
                )}
              </div>

              {/* Audio timeline */}
              <div className="relative w-full h-2 bg-gray-600 rounded-full mb-1">
                <input
                  type="range"
                  min="0"
                  max={audioDuration || 100}
                  value={audioCurrentTime}
                  onChange={handleAudioSeek}
                  onMouseDown={handleSeekStart}
                  onMouseUp={handleSeekEnd}
                  onTouchStart={handleSeekStart}
                  onTouchEnd={handleSeekEnd}
                  className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
                  disabled={!audioUrl}
                />
                <div
                  className="absolute h-2 rounded-full bg-white"
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
            <div className="flex items-center justify-between bg-white p-3 border border-gray-200 rounded-md">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-md mr-3 text-xs font-bold">
                  {audioFileExtension}
                </div>
                <div>
                  <div className="font-medium">Audio</div>
                  <div className="text-sm text-gray-500">
                    {getFileSize(audioSize)}
                  </div>
                </div>
              </div>

              {audioUrl && (
                <a
                  href={audioUrl}
                  download
                  className="text-purple-600 hover:text-purple-800 flex items-center"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 20H19V18H5V20ZM19 9H15V3H9V9H5L12 16L19 9Z"
                      fill="#9333EA"
                    />
                  </svg>
                  <span className="ml-1">Download</span>
                </a>
              )}
            </div>
          </div>
        );

      case "comments":
        return (
          <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-6">
            {course && courseClass && (
              <CourseCommentsComponent
                courseId={course.id.toString()}
                classIndex={classIndex}
                sectionType="additionalMaterials"
              />
            )}
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
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        {error || "No additional materials found"}
      </div>
    );
  }

  // Get the actual data from the API response
  const additionalMaterials =
    courseClass.attributes?.content?.additionalMaterials || {};
  const videoData = additionalMaterials.video?.data?.attributes;
  const videoUrl = videoData ? getMediaUrl(videoData.url) : "";
  const videoDescription = additionalMaterials.videoDescription || "";
  const essayContent = additionalMaterials.essay || "";
  const meditationData = additionalMaterials.guidedMeditation?.data?.attributes;
  const audioUrl = meditationData ? getMediaUrl(meditationData.url) : "";

  return (
    <div className="relative">
      {/* Custom styles for animation */}
      <style jsx>{`
        @keyframes fadeInOut {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          10% {
            opacity: 1;
            transform: translateY(0);
          }
          90% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        .animate-fade-in-out {
          animation: fadeInOut 2s ease-in-out;
        }
      `}</style>

      {/* Clipboard notification */}
      {showClipboardNotification && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 text-white px-4 py-2 rounded shadow-lg text-sm animate-fade-in-out flex items-center">
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Link copied to clipboard
        </div>
      )}

      {/* Header with tabs navigation and social sharing buttons */}
      <div className="flex justify-between items-center mb-6">
        {/* Tabs navigation */}
        <div className="border-b border-gray-200 flex-grow">
          <nav className="flex -mb-px space-x-8">
            {videoUrl && (
              <button
                onClick={() => setActiveTab("video")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "video"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Video
              </button>
            )}
            {essayContent && (
              <button
                onClick={() => setActiveTab("essay")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "essay"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Essay
              </button>
            )}
            {audioUrl && (
              <button
                onClick={() => setActiveTab("guidedMeditation")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "guidedMeditation"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Guided meditation
              </button>
            )}
            <button
              onClick={() => setActiveTab("comments")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "comments"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Comments
            </button>
          </nav>
        </div>

        {/* Social sharing buttons - only show for video tab */}
        {activeTab === "video" && (
          <div className="flex space-x-2 ml-4">
            {/* Copy Link Button */}
            <button
              onClick={handleShareLink}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Copy link"
            >
              <LinkIcon className="h-5 w-5 text-gray-600" />
            </button>

            {/* LinkedIn Button */}
            <button
              onClick={handleShareLinkedIn}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Share on LinkedIn"
            >
              <svg
                className="h-5 w-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </button>

            {/* Twitter/X Button */}
            <button
              onClick={handleShareTwitter}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Share on X (Twitter)"
            >
              <svg
                className="h-5 w-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>

            {/* Facebook Button */}
            <button
              onClick={handleShareFacebook}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Share on Facebook"
            >
              <svg
                className="h-5 w-5 text-gray-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content for the active tab */}
      {renderTabContent()}

      {/* Mark as completed button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleMarkComplete}
          disabled={isCompleted}
          className={`px-6 py-3 rounded-md flex items-center ${
            isCompleted
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {isCompleted ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Completed
            </>
          ) : (
            "Mark as completed"
          )}
        </button>
      </div>
    </div>
  );
};

export default ClassAdditionalMaterialsComponent;
