"use client";
import { useState, useEffect, useRef } from "react";
import { courseApi } from "@/lib/courseApi";
import courseProgressApi from "@/lib/courseProgressApi"; // Import progress API with default export
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";
import ReactMarkdown from "react-markdown";
import CourseCommentsComponent from "@/components/dashboard/course/user/CourseCommentsComponent";

interface ClassVideoComponentProps {
  slug: string;
  classIndex: number;
  onProgressUpdate?: (progress: number) => void; // Callback prop for progress updates
}

// Interface that matches the data structure we get from Strapi
interface CourseClass {
  id: number;
  attributes: {
    title: string;
    orderIndex: number;
    description?: string;
    duration?: string;
    content?: any; // Using any since the structure varies
  };
}

const ClassVideoComponent = ({
  slug,
  classIndex,
  onProgressUpdate,
}: ClassVideoComponentProps) => {
  const [courseClass, setCourseClass] = useState<CourseClass | null>(null);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "description" | "transcript" | "audio" | "comments"
  >("description");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [debug, setDebug] = useState(false);

  // Progress tracking state
  const [videoProgress, setVideoProgress] = useState(0);
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const progressDataRef = useRef<any>(null);

  // Progress update thresholds
  const progressThresholds = [0.1, 0.25, 0.5, 0.75, 0.9, 1.0];

  // State to store content data
  const [videoUrl, setVideoUrl] = useState("");
  const [videoMimeType, setVideoMimeType] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioMimeType, setAudioMimeType] = useState("");
  const [audioSize, setAudioSize] = useState<number | undefined>(undefined);
  const [videoDescription, setVideoDescription] = useState("");
  const [videoTranscript, setVideoTranscript] = useState("");

  // Helper functions
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper function to get URL with proper base
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

  // Update progress in the API
  const updateProgress = async (progress: number) => {
    if (!course || !courseClass || isUpdatingProgress) return;

    // Don't update progress if it's only slightly different from the last update
    // This prevents too many API calls
    if (
      Math.abs(progress - lastProgressUpdate) < 0.05 &&
      lastProgressUpdate > 0 &&
      progress < 0.95
    ) {
      return;
    }

    setIsUpdatingProgress(true);

    try {
      // Normalize progress to 0-1 range
      const normalizedProgress = Math.min(Math.max(progress, 0), 1);

      // Update local state
      setVideoProgress(normalizedProgress);
      setLastProgressUpdate(normalizedProgress);

      // Mark as completed if progress is >= 95%
      if (normalizedProgress >= 0.95 && !isCompleted) {
        setIsCompleted(true);
      }

      // Call parent component's update function if provided
      if (onProgressUpdate) {
        onProgressUpdate(normalizedProgress * 100);
      }

      // Update progress in API
      await courseProgressApi.updateComponentProgress(
        course.id.toString(),
        courseClass.id.toString(),
        "video",
        normalizedProgress
      );
    } catch (error) {
      console.error("Error updating video progress:", error);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setIsLoading(true);

        // First, get the course
        const courseData = await courseApi.getCourseBySlug(slug);
        if (!courseData) {
          setError(`Course ${slug} not found`);
          return;
        }
        setCourse(courseData);

        // Then get the specific class data
        const classData = await courseApi.getClassWithVideoContent(
          slug,
          classIndex
        );

        if (!classData) {
          setError(`Class ${classIndex} not found for course ${slug}`);
          return;
        }
        // Store the course class data
        setCourseClass(classData);

        // Extract video, audio and other content
        if (
          classData.attributes.content &&
          classData.attributes.content.video
        ) {
          // Extract video file if available
          if (
            classData.attributes.content.video.videoFile &&
            classData.attributes.content.video.videoFile.data
          ) {
            const fileData =
              classData.attributes.content.video.videoFile.data.attributes;
            setVideoUrl(getMediaUrl(fileData.url));
            setVideoMimeType(fileData.mime);
          }

          // Extract description if available
          if (classData.attributes.content.video.videoDescription) {
            setVideoDescription(
              classData.attributes.content.video.videoDescription
            );
          }

          // Extract transcript if available
          if (classData.attributes.content.video.videoTranscript) {
            setVideoTranscript(
              classData.attributes.content.video.videoTranscript
            );
          }

          // Extract audio file
          const audioField =
            classData.attributes.content.video.AudioFile ||
            classData.attributes.content.video.audioFile ||
            classData.attributes.content.video.audio;
          if (audioField?.data) {
            setAudioUrl(getMediaUrl(audioField.data.attributes.url));
            setAudioMimeType(audioField.data.attributes.mime || "audio/mp3");
            setAudioSize(audioField.data.attributes.size);
          }
        }

        // Fetch existing progress if course and class are available
        if (courseData.id && classData.id) {
          try {
            const progressData = await courseProgressApi.getUserCourseProgress(
              courseData.id.toString()
            );

            // Store the full progress data for reference
            progressDataRef.current = progressData;

            if (
              progressData &&
              progressData.attributes &&
              progressData.attributes.tracking
            ) {
              // Find this class in the tracking data
              const classTracking =
                progressData.attributes.tracking.classes.find(
                  (c) => c.classId === classData.id
                );

              if (classTracking) {
                // Get progress for the video component
                const componentProgress = classTracking.video || 0;

                // Set progress as percentage
                setVideoProgress(componentProgress);
                setLastProgressUpdate(componentProgress);

                // Set completion status based on progress
                setIsCompleted(componentProgress >= 0.95);

                // If progress is already 100%, we can consider updating the parent
                if (componentProgress === 1 && onProgressUpdate) {
                  onProgressUpdate(100);
                }

                // If we have saved progress and there's a video, try to resume from the saved position
                if (
                  componentProgress > 0 &&
                  componentProgress < 0.95 &&
                  videoRef.current
                ) {
                  const estimatedTime =
                    componentProgress * videoRef.current.duration;
                  if (!isNaN(estimatedTime) && estimatedTime > 0) {
                    // Set the current time slightly before the saved position (5 seconds)
                    videoRef.current.currentTime = Math.max(
                      0,
                      estimatedTime - 5
                    );
                  }
                }
              }
            }
          } catch (progressError) {
            console.error("Error fetching progress:", progressError);
            // Non-fatal error, we'll just start with 0 progress
          }
        }
      } catch (error) {
        console.error("Error fetching class data:", error);
        setError("Failed to load video content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassData();
  }, [slug, classIndex, onProgressUpdate]);

  // Effect to handle video events for progress tracking
  useEffect(() => {
    if (!videoRef.current) return;

    // Event handlers for video
    const handleVideoPlay = () => {
      setIsPlaying(true);

      // If less than 10% progress, mark as started
      if (videoProgress < 0.1) {
        updateProgress(0.1);
      }
    };

    const handleVideoPause = () => {
      setIsPlaying(false);

      // Update progress when paused to capture current position
      if (videoRef.current && videoDuration) {
        const currentVideoTime = videoRef.current.currentTime;
        const percentage = currentVideoTime / videoDuration;
        updateProgress(percentage);
      }
    };

    const handleVideoEnded = () => {
      setIsPlaying(false);
      setIsCompleted(true);
      updateProgress(1.0); // Mark as 100% complete
    };

    const handleVideoTimeUpdate = () => {
      if (!videoRef.current || !videoDuration) return;

      const currentVideoTime = videoRef.current.currentTime;
      setCurrentTime(currentVideoTime);

      // Calculate percentage
      const percentage = currentVideoTime / videoRef.current.duration;

      // Update progress at thresholds (10%, 25%, 50%, 75%, 90%, 100%)
      for (const threshold of progressThresholds) {
        if (percentage >= threshold && videoProgress < threshold) {
          updateProgress(threshold);
          break;
        }
      }

      // Also update every 15 seconds to ensure we're tracking progress
      if (currentVideoTime % 15 < 1 && currentVideoTime > 0) {
        updateProgress(percentage);
      }
    };

    const handleVideoLoadedMetadata = () => {
      if (videoRef.current) {
        setVideoDuration(videoRef.current.duration);
      }
    };

    // Add event listeners
    const videoElement = videoRef.current;
    videoElement.addEventListener("play", handleVideoPlay);
    videoElement.addEventListener("pause", handleVideoPause);
    videoElement.addEventListener("ended", handleVideoEnded);
    videoElement.addEventListener("timeupdate", handleVideoTimeUpdate);
    videoElement.addEventListener("loadedmetadata", handleVideoLoadedMetadata);

    // Cleanup
    return () => {
      if (videoElement) {
        videoElement.removeEventListener("play", handleVideoPlay);
        videoElement.removeEventListener("pause", handleVideoPause);
        videoElement.removeEventListener("ended", handleVideoEnded);
        videoElement.removeEventListener("timeupdate", handleVideoTimeUpdate);
        videoElement.removeEventListener(
          "loadedmetadata",
          handleVideoLoadedMetadata
        );
      }
    };
  }, [videoRef.current, videoDuration, videoProgress, progressThresholds]);

  // Video player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Audio player controls
  const toggleAudioPlay = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
      if (!audioDuration && audioRef.current.duration) {
        setAudioDuration(audioRef.current.duration);
      }
    }
  };

  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setAudioCurrentTime(seekTime);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Component rendering
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !courseClass) {
    return (
      <div className="bg-red-100 p-4 rounded-md">
        <p className="text-red-700">{error || "Video content not found"}</p>
      </div>
    );
  }

  // Check if video and audio exist
  const hasVideo = !!videoUrl;
  const hasAudio = !!audioUrl;

  return (
    <div>
      {/* Debug toggle */}
      <div className="text-right mb-2">
        <button
          onClick={() => setDebug(!debug)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          {debug ? "Hide Debug Info" : "Show Debug Info"}
        </button>
      </div>

      {/* Debug Information */}
      {debug && (
        <div className="mb-4 p-4 bg-gray-100 rounded-md text-xs overflow-x-auto">
          <h3 className="font-bold mb-2">Debug Information</h3>
          <div className="mb-2">
            <strong>Video URL:</strong> {videoUrl || "None"}
          </div>
          <div className="mb-2">
            <strong>Audio URL:</strong> {audioUrl || "None"}
          </div>
          <div className="mb-2">
            <strong>Has Description:</strong> {videoDescription ? "Yes" : "No"}
          </div>
          <div className="mb-2">
            <strong>Has Transcript:</strong> {videoTranscript ? "Yes" : "No"}
          </div>
          <div className="mb-2">
            <strong>Video Progress:</strong> {(videoProgress * 100).toFixed(0)}%
          </div>
          <div className="mb-2">
            <strong>Current Time:</strong> {formatTime(currentTime)} /{" "}
            {formatTime(videoDuration)}
          </div>
          <div className="mb-2">
            <strong>Playback %:</strong>{" "}
            {videoDuration
              ? ((currentTime / videoDuration) * 100).toFixed(1)
              : 0}
            %
          </div>
          <div className="mb-2">
            <strong>Is Completed:</strong> {isCompleted ? "Yes" : "No"}
          </div>
        </div>
      )}

      {/* Video Player */}
      <div className="mb-8 bg-black rounded-lg overflow-hidden">
        <div className="aspect-video relative">
          {hasVideo ? (
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              poster="/video-placeholder.jpg"
            >
              <source src={videoUrl} type={videoMimeType} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-white text-center">
                <PlayIcon className="h-16 w-16 mx-auto mb-4 text-white opacity-50" />
                <p>Video not available</p>
              </div>
            </div>
          )}

          {!isPlaying && hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="w-16 h-16 bg-white bg-opacity-75 rounded-full flex items-center justify-center cursor-pointer"
              >
                <PlayIcon className="h-8 w-8 text-gray-800" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs for content sections */}
      <div className="mb-4 border-b border-gray-200">
        <div className="flex -mb-px">
          <button
            onClick={() => setActiveTab("description")}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === "description"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("transcript")}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === "transcript"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Transcription
          </button>
          <button
            onClick={() => setActiveTab("audio")}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === "audio"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Audio
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === "comments"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Comments
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="prose max-w-none">
        {activeTab === "description" && (
          <div>
            {videoDescription ? (
              <ReactMarkdown>{videoDescription}</ReactMarkdown>
            ) : (
              <p className="text-gray-500 italic">No description available.</p>
            )}
          </div>
        )}

        {activeTab === "transcript" && (
          <div>
            {videoTranscript ? (
              <ReactMarkdown>{videoTranscript}</ReactMarkdown>
            ) : (
              <p className="text-gray-500 italic">No transcript available.</p>
            )}
          </div>
        )}

        {activeTab === "audio" && (
          <div className="mt-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-center mb-4">
                The concepts of the wisdom and mystery school : Spiritual
                teachings with Shunyamurti
              </h3>

              {hasAudio ? (
                <>
                  <audio
                    ref={audioRef}
                    className="hidden"
                    onTimeUpdate={handleAudioTimeUpdate}
                    onPlay={() => setIsAudioPlaying(true)}
                    onPause={() => setIsAudioPlaying(false)}
                    onError={(e) => console.error("Audio playback error:", e)}
                    preload="metadata"
                  >
                    <source
                      src={audioUrl}
                      type={audioMimeType || "audio/mp3"}
                    />
                    Your browser does not support the audio element.
                  </audio>

                  <div className="flex justify-center space-x-4 mb-4">
                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-700"
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

                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-700"
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
                      onClick={toggleAudioPlay}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                    >
                      {isAudioPlaying ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </button>

                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-700"
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

                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="relative w-full bg-gray-300 h-1 rounded-full mb-2">
                    <input
                      type="range"
                      min="0"
                      max={audioDuration || 100}
                      value={audioCurrentTime}
                      onChange={handleAudioSeek}
                      className="absolute w-full h-1 opacity-0 cursor-pointer"
                    />
                    <div
                      className="absolute bg-purple-600 h-1 rounded-full"
                      style={{
                        width: `${
                          (audioCurrentTime / (audioDuration || 1)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{formatTime(audioCurrentTime)}</span>
                    <span>{formatTime(audioDuration)}</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Display placeholders for audio player */}
                  <div className="flex justify-center space-x-4 mb-4">
                    <button
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                      disabled
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
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

                    <button
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                      disabled
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
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
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                      disabled
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>

                    <button
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                      disabled
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
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

                    <button
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                      disabled
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="relative w-full bg-gray-300 h-1 rounded-full mb-2">
                    <div
                      className="absolute bg-gray-400 h-1 rounded-full"
                      style={{ width: "0%" }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-600">
                    <span>0:00</span>
                    <span>0:00</span>
                  </div>

                  <p className="text-center mt-4 text-gray-500 italic">
                    Audio not available for this class.
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center border border-gray-300 rounded-md p-3">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 bg-blue-500 flex items-center justify-center text-white rounded-md">
                  <span className="font-bold">MP3</span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="font-medium">Audio</div>
                <div className="text-sm text-gray-500">
                  {audioSize
                    ? `${Math.round(audioSize / (1024 * 1024))} MB`
                    : "16 MB"}
                </div>
              </div>
              {hasAudio ? (
                <a
                  href={audioUrl}
                  download
                  className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                >
                  Download
                </a>
              ) : (
                <button
                  className="text-gray-400 font-medium text-sm cursor-not-allowed"
                  disabled
                >
                  Download
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === "comments" && (
          <div>
            {course && courseClass && (
              <CourseCommentsComponent
                courseId={course.id.toString()}
                classIndex={classIndex}
                sectionType="video"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassVideoComponent;
