"use client";

import { useState, useEffect, useRef } from "react";
import { courseApi } from "@/lib/courseApi";
import courseProgressApi from "@/lib/courseProgressApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CheckCircleIcon, PencilIcon } from "@heroicons/react/24/outline";

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
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [activePrompt, setActivePrompt] = useState<number | null>(null);
  const [promptsCompleted, setPromptsCompleted] = useState<number[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Extract prompts from markdown content
  const extractPrompts = (
    content: string
  ): { title: string; text: string }[] => {
    const result: { title: string; text: string }[] = [];
    const lines = content.split("\n");

    let currentTitle = "";
    let currentText = "";
    let isInPrompt = false;

    lines.forEach((line) => {
      // Check for header patterns that likely indicate prompt titles
      if (line.startsWith("## ") || line.startsWith("### ")) {
        // If we were already in a prompt, save the previous one
        if (isInPrompt && currentTitle) {
          result.push({ title: currentTitle, text: currentText.trim() });
          currentText = "";
        }

        currentTitle = line.replace(/^#+\s+/, "");
        isInPrompt = true;
      }
      // Regular content lines - add to current prompt text
      else if (isInPrompt) {
        currentText += line + "\n";
      }
    });

    // Add the last prompt if there is one
    if (isInPrompt && currentTitle) {
      result.push({ title: currentTitle, text: currentText.trim() });
    }

    // If we couldn't extract structured prompts, create a single prompt from entire content
    if (result.length === 0 && content.trim()) {
      result.push({ title: "Reflection Prompt", text: content.trim() });
    }

    return result;
  };

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

        // Get the current progress for this class
        if (courseData.id) {
          const progressData = await courseProgressApi.getUserCourseProgress(
            courseData.id.toString()
          );
          if (
            progressData &&
            progressData.attributes.tracking &&
            progressData.attributes.tracking.classes
          ) {
            const classProgress = progressData.attributes.tracking.classes.find(
              (c: any) => c.classId === classData.id
            );
            if (classProgress) {
              const writingPrompts = classProgress.writingPrompts || 0;
              setIsCompleted(writingPrompts >= 0.99);
            }
          }
        }

        // Initialize first prompt as active if not completed
        if (!isCompleted) {
          setActivePrompt(0);
        }

        // Load saved responses from localStorage
        const savedResponses = localStorage.getItem(
          `writing_responses_${courseData.id}_${classData.id}`
        );
        if (savedResponses) {
          try {
            setResponses(JSON.parse(savedResponses));
          } catch (e) {
            console.error("Error parsing saved responses:", e);
          }
        }
      } catch (err) {
        console.error("Error fetching writing prompts data:", err);
        setError("Failed to load writing prompts data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug, classIndex]);

  // Focus on textarea when active prompt changes
  useEffect(() => {
    if (activePrompt !== null && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activePrompt]);

  // Check if all prompts have responses and save to localStorage
  useEffect(() => {
    if (courseClass && !isCompleted && course) {
      const content =
        courseClass.attributes?.content?.writingPrompts?.content ||
        (typeof courseClass.attributes?.content?.writingPrompts === "string"
          ? courseClass.attributes.content.writingPrompts
          : "");

      const prompts = extractPrompts(content);

      // Consider a prompt completed if it has a response with at least 20 characters
      const newPromptsCompleted = Object.entries(responses)
        .filter(([_, text]) => text.trim().length >= 20)
        .map(([index]) => parseInt(index));

      setPromptsCompleted(newPromptsCompleted);

      // Save responses to localStorage
      localStorage.setItem(
        `writing_responses_${course.id}_${courseClass.id}`,
        JSON.stringify(responses)
      );

      // If all prompts have responses, auto-complete
      if (
        newPromptsCompleted.length === prompts.length &&
        prompts.length > 0 &&
        !isCompleted
      ) {
        handleMarkComplete();
      }
    }
  }, [responses, courseClass, isCompleted, course]);

  // Handle response changes
  const handleResponseChange = (promptIndex: number, text: string) => {
    setResponses((prev) => ({
      ...prev,
      [promptIndex]: text,
    }));
  };

  // Handle manual completion
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

  if (error || !courseClass) {
    return (
      <div className="bg-red-100 p-4 rounded-md">
        <p className="text-red-700">
          {error || "Writing prompts content not available"}
        </p>
      </div>
    );
  }

  // Extract writing prompts content from the class data
  const content =
    courseClass.attributes?.content?.writingPrompts?.content ||
    (typeof courseClass.attributes?.content?.writingPrompts === "string"
      ? courseClass.attributes.content.writingPrompts
      : null);

  if (!content) {
    return <div>No writing prompts content found.</div>;
  }

  const prompts = extractPrompts(content);

  return (
    <div>
      {/* Introduction text */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Writing Prompts & Reflection
        </h2>
        <p className="text-gray-600">
          Use these prompts to deepen your understanding through personal
          reflection. Your responses are private and saved only in your browser.
        </p>
      </div>

      {/* Prompts and responses */}
      <div className="space-y-8 mb-8">
        {prompts.map((prompt, index) => (
          <div
            key={index}
            className={`border rounded-lg overflow-hidden ${
              activePrompt === index
                ? "border-purple-300 shadow-sm"
                : "border-gray-200"
            }`}
          >
            {/* Prompt header */}
            <div
              className={`p-4 ${
                promptsCompleted.includes(index)
                  ? "bg-green-50"
                  : activePrompt === index
                  ? "bg-purple-50"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium">
                  {prompt.title || `Prompt ${index + 1}`}
                </h3>
                {promptsCompleted.includes(index) && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Prompt content */}
            <div className="p-4 bg-white">
              <div className="prose prose-sm max-w-none mb-4">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {prompt.text}
                </ReactMarkdown>
              </div>

              {/* Response textarea */}
              <div className="mt-4">
                <label
                  htmlFor={`response-${index}`}
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Response
                </label>
                <textarea
                  id={`response-${index}`}
                  ref={activePrompt === index ? textareaRef : null}
                  value={responses[index] || ""}
                  onChange={(e) => handleResponseChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={6}
                  placeholder="Write your thoughts here..."
                  disabled={isCompleted}
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">
                  {responses[index]?.length || 0}/500 characters
                  {responses[index]?.length >= 20 && (
                    <span className="text-green-600 ml-2">✓ Complete</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation between prompts */}
      {prompts.length > 1 && !isCompleted && (
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() =>
              setActivePrompt((prev) => Math.max(0, (prev || 0) - 1))
            }
            disabled={activePrompt === 0}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous Prompt
          </button>
          <div className="text-sm text-gray-500">
            {activePrompt !== null ? activePrompt + 1 : 0} of {prompts.length}
          </div>
          <button
            onClick={() =>
              setActivePrompt((prev) =>
                Math.min(prompts.length - 1, (prev || 0) + 1)
              )
            }
            disabled={activePrompt === prompts.length - 1}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Prompt
          </button>
        </div>
      )}

      {/* Tip section */}
      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">Reflection Tip</h3>
        <p className="text-blue-700">
          Take your time with these prompts. The most valuable insights often
          emerge when you revisit and refine your initial thoughts.
        </p>
      </div>

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
                Writing prompts completed!
              </h3>
              <p className="text-green-700">
                You've completed all the writing prompts for this class. Your
                responses have been saved locally.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassWritingPromptsComponent;
