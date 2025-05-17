"use client";

import { useState, useEffect, useRef } from "react";
import { courseApi } from "@/lib/courseApi";
import courseProgressApi from "@/lib/courseProgressApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

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

        // Auto-mark as complete after a delay (this will run silently in the background)
        setTimeout(() => {
          if (!isCompleted && course && courseClass) {
            handleMarkComplete();
          }
        }, 180000); // 3 minutes = 180,000 ms
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

  // Handle completion
  const handleMarkComplete = async () => {
    if (isCompleted || !course || !courseClass) return;

    try {
      setIsCompleted(true);

      await courseProgressApi.markComponentComplete(
        course.id.toString(),
        courseClass.id.toString(),
        "keyConcepts"
      );
    } catch (err) {
      console.error("Error marking key concepts as completed:", err);
      setIsCompleted(false);
    }
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
                  className="p-6 my-6 bg-gray-50 rounded-xl border border-gray-100"
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
    </div>
  );
};

export default ClassKeyConceptsComponent;
