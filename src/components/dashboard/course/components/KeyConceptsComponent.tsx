'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { CourseComponent } from '@/types/course';
import { updateComponentProgress } from '@/lib/courses-api';
import { Book, CheckCircle } from 'lucide-react';

interface KeyConceptsComponentProps {
  component: CourseComponent;
  courseSlug: string;
  onProgressUpdate: () => void;
}

export default function KeyConceptsComponent({
  component,
  courseSlug,
  onProgressUpdate,
}: KeyConceptsComponentProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(component.progress?.completed || false);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastProgressUpdateRef = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;

      if (scrollHeight > 0) {
        const progress = (scrollTop / scrollHeight) * 100;
        setScrollProgress(Math.min(progress, 100));

        // Update progress in backend every 10% change
        const progressPercentage = Math.floor(progress);
        if (Math.abs(progressPercentage - lastProgressUpdateRef.current) >= 10) {
          lastProgressUpdateRef.current = progressPercentage;
          updateProgress(progressPercentage, progress >= 95);
        }
      }
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const updateProgress = async (progressPercentage: number, completed: boolean) => {
    try {
      await updateComponentProgress(component.id, progressPercentage, completed);

      if (completed && !isCompleted) {
        setIsCompleted(true);
        onProgressUpdate();
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleMarkAsComplete = async () => {
    try {
      await updateComponentProgress(component.id, 100, true);
      setIsCompleted(true);
      onProgressUpdate();
    } catch (err) {
      console.error('Failed to mark as complete:', err);
    }
  };

  // Calculate reading time estimate (average 200 words per minute)
  const getReadingTime = () => {
    if (!component.content) return 0;
    const wordCount = component.content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  };

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden m-4 md:m-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Book className="w-6 h-6 text-[#942017]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#414651]">{component.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {getReadingTime()} min read
              </p>
            </div>
          </div>

          {!isCompleted && scrollProgress > 0 && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">{Math.floor(scrollProgress)}% read</p>
                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-[#942017] transition-all duration-300"
                    style={{ width: `${scrollProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Content - Scrollable and flexible height */}
      <div
        ref={contentRef}
        className="flex-1 px-8 py-6 overflow-y-auto prose prose-gray prose-lg max-w-none"
      >
        <ReactMarkdown>{component.content || 'No content available.'}</ReactMarkdown>
      </div>

      {/* Footer with Mark as Complete */}
      {!isCompleted && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleMarkAsComplete}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#942017] text-white rounded hover:bg-[#7a1a13] transition font-medium"
          >
            Mark as Complete
          </button>
          <p className="text-xs text-gray-500 mt-2">
            You can also complete this by scrolling to the bottom
          </p>
        </div>
      )}
    </div>
  );
}
