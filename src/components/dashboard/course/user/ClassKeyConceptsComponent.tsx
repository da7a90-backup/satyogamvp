"use client";

import { useState, useEffect, useRef } from "react";
import { courseApi } from "@/lib/courseApi";
import courseProgressApi from "@/lib/courseProgressApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface ClassKeyConceptsComponentProps {
  slug: string;
  classIndex: number;
}

const ClassKeyConceptsComponent = ({
  slug,
  classIndex,
}: ClassKeyConceptsComponentProps) => {
  const [courseClass, setCourseClass] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progressMarked, setProgressMarked] = useState(false);
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [keyConceptsContent, setKeyConceptsContent] = useState<string>("");

  // Prevent infinite re-renders by using refs
  const hasFetchedData = useRef(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Only fetch data once to prevent infinite loops
    if (hasFetchedData.current) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        hasFetchedData.current = true;

        // Get course data
        const courseData = await courseApi.getCourseBySlug(slug);
        if (!courseData) {
          setError("Course not found");
          return;
        }
        setCourse(courseData);

        // Use the specialized function to get class data with key concepts
        const classData = await courseApi.getClassWithKeyConcepts(
          slug,
          classIndex
        );
        if (!classData) {
          setError("Class not found");
          return;
        }
        setCourseClass(classData);

        // Extract key concepts content
        let content = "";
        if (classData.attributes?.content?.keyConcepts) {
          if (typeof classData.attributes.content.keyConcepts === "string") {
            // Handle the case where keyConcepts is directly a string
            content = classData.attributes.content.keyConcepts;
          } else if (classData.attributes.content.keyConcepts.content) {
            // Handle the case where keyConcepts has a content property
            content = classData.attributes.content.keyConcepts.content;
          } else if (
            typeof classData.attributes.content.keyConcepts === "object"
          ) {
            // Try to convert object to readable text if it's an object
            try {
              content = JSON.stringify(
                classData.attributes.content.keyConcepts,
                null,
                2
              );
            } catch (err) {
              console.error("Error converting keyConcepts to string:", err);
            }
          }
        }

        // Add some sample content if empty (for testing purposes)
        if (!content) {
          content = `# Key Concepts for Class ${classIndex}

## The Seven Realms of Knowledge

1. **Material Realm**: Understanding the physical world and its properties
2. **Vital Realm**: The energetic dimension of reality
3. **Mental Realm**: Understanding concepts, ideas, and mental constructs
4. **Wisdom Realm**: Integration of knowledge into wisdom
5. **Mystery Realm**: The transcendent aspects beyond ordinary cognition
6. **Ego Realm**: Understanding of the self and identity
7. **Supreme Realm**: Ultimate reality and consciousness

These seven realms form the foundation of the wisdom school tradition.`;
        }

        setKeyConceptsContent(content);

        // Get the current progress for this class
        if (courseData.id) {
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
                const keyConcepts = classProgress.keyConcepts || 0;
                setIsCompleted(keyConcepts >= 0.99);
              }
            }
          } catch (progressError) {
            console.error("Error fetching progress:", progressError);
          }
        }

        // Set the reading start time
        setReadingStartTime(Date.now());
      } catch (err) {
        console.error("Error fetching key concepts data:", err);
        setError("Failed to load key concepts data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      // Clean up timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [slug, classIndex]); // Minimal dependency array to prevent loops

  // Separate effect for time tracking to avoid coupling with data fetching
  useEffect(() => {
    if (!readingStartTime || isCompleted || !courseClass) return;

    // Start tracking time spent on the page
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - readingStartTime) / 1000);
      setTimeSpent(elapsed);

      // Auto-mark as complete after 3 minutes (180 seconds) of reading
      if (
        elapsed >= 180 &&
        !isCompleted &&
        !progressMarked &&
        course &&
        courseClass
      ) {
        handleMarkComplete();
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [readingStartTime, isCompleted, progressMarked, course, courseClass]);

  // Handle manual completion
  const handleMarkComplete = async () => {
    if (isCompleted || !course || !courseClass) return;

    try {
      setIsCompleted(true);
      setProgressMarked(true);

      await courseProgressApi.markComponentComplete(
        course.id.toString(),
        courseClass.id.toString(),
        "keyConcepts"
      );
    } catch (err) {
      console.error("Error marking key concepts as completed:", err);
      setIsCompleted(false);
      setProgressMarked(false);
    }
  };

  // Format time spent for display
  const formatTimeSpent = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Reading time tracker */}
      <div className="text-sm text-gray-500 mb-4 flex justify-between items-center">
        <span>Time spent reading: {formatTimeSpent(timeSpent)}</span>
        {!isCompleted && timeSpent < 180 && (
          <span>Auto-completes in {formatTimeSpent(180 - timeSpent)}</span>
        )}
      </div>

      {/* Key concepts content */}
      <div className="prose prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-xl prose-h2:text-lg prose-p:text-gray-700 prose-li:my-0 prose-ol:list-decimal prose-ul:list-disc max-w-none">
        {keyConceptsContent ? (
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
            {keyConceptsContent}
          </ReactMarkdown>
        ) : (
          <p className="text-gray-500 italic">
            No key concepts content available for this class.
          </p>
        )}
      </div>

      {/* Study tip */}
      <div className="mt-8 p-4 bg-purple-50 border-l-4 border-purple-600 rounded-md">
        <h3 className="font-medium text-purple-800 mb-2">Study Tip</h3>
        <p className="text-purple-700">
          Consider taking notes on these key concepts. Research has shown that
          writing ideas in your own words significantly improves retention and
          understanding.
        </p>
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
                Key concepts completed!
              </h3>
              <p className="text-green-700">
                You've completed this section. Continue to the writing prompts
                to deepen your understanding.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassKeyConceptsComponent;
