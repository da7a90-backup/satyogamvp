'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getComponentById, getComponentNavigation } from '@/lib/courses-api';
import { CourseComponent, ComponentCategory, ComponentNavigation } from '@/types/course';
import VideoLessonComponent from './VideoLessonComponent';
import KeyConceptsComponent from './KeyConceptsComponent';
import WritingPromptsComponent from './WritingPromptsComponent';
import AdditionalMaterialsComponent from './AdditionalMaterialsComponent';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ComponentViewerProps {
  courseSlug: string;
  componentId: string;
}

export default function ComponentViewer({ courseSlug, componentId }: ComponentViewerProps) {
  const router = useRouter();
  const [component, setComponent] = useState<CourseComponent | null>(null);
  const [navigation, setNavigation] = useState<ComponentNavigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComponent();
    loadNavigation();
  }, [componentId]);

  const loadComponent = async () => {
    try {
      setLoading(true);
      const data = await getComponentById(componentId);
      setComponent(data);
    } catch (err) {
      console.error('Failed to load component:', err);
      setError(err instanceof Error ? err.message : 'Failed to load component');
    } finally {
      setLoading(false);
    }
  };

  const loadNavigation = async () => {
    try {
      const nav = await getComponentNavigation(courseSlug, componentId);
      setNavigation(nav);
    } catch (err) {
      console.error('Failed to load navigation:', err);
    }
  };

  const handleNavigate = (targetComponentId: string | null) => {
    if (targetComponentId) {
      router.push(`/dashboard/user/courses/${courseSlug}/component/${targetComponentId}`);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/user/courses/${courseSlug}/overview`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f7f4]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#942017] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading component...</p>
        </div>
      </div>
    );
  }

  if (error || !component) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f7f4]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load component</h2>
          <p className="text-gray-600 mb-4">{error || 'Component not found'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-[#942017] text-white rounded hover:bg-[#7a1a13]"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const renderComponent = () => {
    switch (component.component_category) {
      case ComponentCategory.VIDEO_LESSON:
      case ComponentCategory.INTRODUCTION:
        return (
          <VideoLessonComponent
            component={component}
            courseSlug={courseSlug}
            onProgressUpdate={loadComponent}
          />
        );
      case ComponentCategory.KEY_CONCEPTS:
        return (
          <KeyConceptsComponent
            component={component}
            courseSlug={courseSlug}
            onProgressUpdate={loadComponent}
          />
        );
      case ComponentCategory.WRITING_PROMPTS:
        return (
          <WritingPromptsComponent
            component={component}
            courseSlug={courseSlug}
            onProgressUpdate={loadComponent}
          />
        );
      case ComponentCategory.ADDITIONAL_MATERIALS:
      case ComponentCategory.ADDENDUM:
        return (
          <AdditionalMaterialsComponent
            component={component}
            courseSlug={courseSlug}
            onProgressUpdate={loadComponent}
          />
        );
      default:
        return <div>Unknown component type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col">
      {/* Back Button Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-[#7D1A13] text-sm font-semibold hover:text-[#942017] transition"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Course Overview
          </button>
        </div>
      </div>

      {/* Component Content - Flexible height */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
        {renderComponent()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {navigation?.previous ? (
              <button
                onClick={() => handleNavigate(navigation.previous.id)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
              >
                <ChevronLeft className="w-5 h-5" />
                <div className="text-left">
                  <p className="text-xs text-gray-500">Previous</p>
                  <p className="text-sm font-medium">{navigation.previous.title}</p>
                </div>
              </button>
            ) : (
              <div />
            )}

            {navigation?.next ? (
              <button
                onClick={() => handleNavigate(navigation.next.id)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition"
              >
                <div className="text-right">
                  <p className="text-xs text-gray-500">Next</p>
                  <p className="text-sm font-medium">{navigation.next.title}</p>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
