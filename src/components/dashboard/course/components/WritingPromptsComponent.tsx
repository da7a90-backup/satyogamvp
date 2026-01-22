'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { CourseComponent } from '@/types/course';
import { updateComponentProgress } from '@/lib/courses-api';
import { PenTool, CheckCircle } from 'lucide-react';

interface WritingPromptsComponentProps {
  component: CourseComponent;
  courseSlug: string;
  onProgressUpdate: () => void;
}

export default function WritingPromptsComponent({
  component,
  courseSlug,
  onProgressUpdate,
}: WritingPromptsComponentProps) {
  const [isCompleted, setIsCompleted] = useState(component.progress?.completed || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMarkAsComplete = async () => {
    try {
      setIsSubmitting(true);
      await updateComponentProgress(component.id, 100, true);
      setIsCompleted(true);
      onProgressUpdate();
    } catch (err) {
      console.error('Failed to mark as complete:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden m-4 md:m-6">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <PenTool className="w-6 h-6 text-[#942017]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#414651]">{component.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Reflect on these questions and deepen your understanding
              </p>
            </div>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 px-8 py-6 overflow-y-auto">
        <div className="prose prose-gray prose-lg max-w-none">
          <ReactMarkdown>{component.content || 'No prompts available.'}</ReactMarkdown>
        </div>
        <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Notes</h3>
          <p className="text-sm text-gray-600 mb-4">
            Use this space to write down your thoughts and reflections.
          </p>
          <textarea
            placeholder="Write your reflections here..."
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#942017] focus:border-transparent resize-none"
            defaultValue={
              typeof window !== 'undefined'
                ? localStorage.getItem(`writing_prompts_${component.id}`) || ''
                : ''
            }
            onChange={(e) => {
              if (typeof window !== 'undefined') {
                localStorage.setItem(`writing_prompts_${component.id}`, e.target.value);
              }
            }}
          />
        </div>
      </div>
      {!isCompleted && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleMarkAsComplete}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#942017] text-white rounded hover:bg-[#7a1a13] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Mark as Complete'}
          </button>
        </div>
      )}
    </div>
  );
}
