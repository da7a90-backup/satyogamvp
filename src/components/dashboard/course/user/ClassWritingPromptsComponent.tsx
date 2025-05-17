"use client";

import { useState, useEffect, useRef } from "react";
import { courseApi } from "@/lib/courseApi";
import courseProgressApi from "@/lib/courseProgressApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface ClassWritingPromptsComponentProps {
  slug: string;
  classIndex: number;
}

const ClassWritingPromptsComponent = ({
  slug,
  classIndex,
}: ClassWritingPromptsComponentProps) => {
  const [courseClass, setCourseClass] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [writingPromptsContent, setWritingPromptsContent] =
    useState<string>("");

  // Prevent infinite re-renders by using refs
  const hasFetchedData = useRef(false);

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

        // Use the specialized function to get class data with writing prompts
        const classData = await courseApi.getClassWithWritingPrompts(
          slug,
          classIndex
        );
        if (!classData) {
          setError("Class not found");
          return;
        }
        setCourseClass(classData);

        // Extract writing prompts content
        let content = "";
        if (classData.attributes?.content?.writingPrompts) {
          if (typeof classData.attributes.content.writingPrompts === "string") {
            // Handle the case where writingPrompts is directly a string
            content = classData.attributes.content.writingPrompts;
          } else if (classData.attributes.content.writingPrompts.content) {
            // Handle the case where writingPrompts has a content property
            content = classData.attributes.content.writingPrompts.content;
          } else if (
            typeof classData.attributes.content.writingPrompts === "object"
          ) {
            // Try to convert object to readable text if it's an object
            try {
              content = JSON.stringify(
                classData.attributes.content.writingPrompts,
                null,
                2
              );
            } catch (err) {
              console.error("Error converting writingPrompts to string:", err);
            }
          }
        }

        setWritingPromptsContent(content);

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
                const writingPrompts = classProgress.writingPrompts || 0;
                setIsCompleted(writingPrompts >= 0.99);
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
        console.error("Error fetching writing prompts data:", err);
        setError("Failed to load writing prompts data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug, classIndex]); // Minimal dependency array to prevent loops

  // Handle completion
  const handleMarkComplete = async () => {
    if (isCompleted || !course || !courseClass) return;

    try {
      setIsCompleted(true);

      await courseProgressApi.markComponentComplete(
        course.id.toString(),
        courseClass.id.toString(),
        "writingPrompts"
      );
    } catch (err) {
      console.error("Error marking writing prompts as completed:", err);
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
    <div className="p-6 bg-white rounded-lg">
      {/* Writing prompts content */}
      <div className="prose prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-xl prose-h2:text-lg prose-p:text-gray-700 prose-li:my-3 prose-ol:list-decimal prose-ul:list-disc max-w-none">
        {writingPromptsContent ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-xl font-bold mb-6" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-lg font-bold mt-8 mb-4" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-md font-bold mt-6 mb-2" {...props} />
              ),
              p: ({ node, ...props }) => <p className="my-2" {...props} />,
              ul: ({ node, ...props }) => (
                <ul className="pl-6 list-disc my-4" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  className="pl-6 list-decimal space-y-4 mb-6 mt-4"
                  {...props}
                />
              ),
              li: ({ node, ...props }) => (
                <li className="mb-2 text-gray-700" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="p-6 my-6 bg-gray-50 rounded-xl border border-gray-100"
                  {...props}
                />
              ),
            }}
          >
            {writingPromptsContent}
          </ReactMarkdown>
        ) : (
          <p className="text-gray-500 italic">
            No writing prompts available for this class.
          </p>
        )}
      </div>
    </div>
  );
};

export default ClassWritingPromptsComponent;
