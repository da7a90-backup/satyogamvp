'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { CourseComponent } from '@/types/course';
import { updateComponentProgress } from '@/lib/courses-api';
import CommentsSection from './CommentsSection';
import { FileStack, CheckCircle, Download } from 'lucide-react';

interface AdditionalMaterialsComponentProps {
  component: CourseComponent;
  courseSlug: string;
  onProgressUpdate: () => void;
}

type TabId = 'video' | 'essay' | 'audio' | 'comments';

export default function AdditionalMaterialsComponent({
  component,
  courseSlug,
  onProgressUpdate,
}: AdditionalMaterialsComponentProps) {
  const [activeTab, setActiveTab] = useState<TabId>('video');
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

  // Get video source URL
  const getVideoUrl = () => {
    if (component.cloudflare_stream_uid) {
      return `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_CODE}.cloudflarestream.com/${component.cloudflare_stream_uid}/manifest/video.m3u8`;
    }
    return component.video_url || '';
  };

  const tabs: { id: TabId; label: string; hasContent: boolean }[] = [
    { id: 'video', label: 'Video', hasContent: !!(component.video_url || component.cloudflare_stream_uid) },
    { id: 'essay', label: 'Essay', hasContent: !!component.essay_content },
    { id: 'audio', label: 'Guided meditation', hasContent: !!component.audio_url },
    { id: 'comments', label: 'Comments', hasContent: true },
  ].filter((tab) => tab.hasContent);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'video':
        if (!component.video_url && !component.cloudflare_stream_uid) {
          return (
            <div className="text-center py-12 text-gray-500">
              No video available for this section.
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="relative bg-black aspect-video rounded-lg overflow-hidden">
              <video className="w-full h-full" controls playsInline>
                <source src={getVideoUrl()} type="application/x-mpegURL" />
                <source src={component.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            {component.description && (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700">{component.description}</p>
              </div>
            )}
          </div>
        );

      case 'essay':
        return (
          <div className="prose prose-gray prose-lg max-w-none">
            <ReactMarkdown>{component.essay_content || 'No essay content available.'}</ReactMarkdown>
          </div>
        );

      case 'audio':
        if (!component.audio_url) {
          return (
            <div className="text-center py-12 text-gray-500">
              No audio available for this section.
            </div>
          );
        }
        return (
          <div className="max-w-xl mx-auto py-8">
            <div className="bg-gradient-to-br from-[#942017] to-[#7a1a13] rounded-lg p-8 text-white mb-6">
              <h3 className="text-xl font-semibold mb-2">Guided Meditation</h3>
              <p className="text-sm opacity-90">
                Find a quiet space and allow yourself to be guided through this meditation practice.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <audio controls className="w-full mb-4">
                <source src={component.audio_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900">
                    {component.duration
                      ? `${Math.floor(component.duration / 60)}:${String(component.duration % 60).padStart(2, '0')}`
                      : 'Unknown'}
                  </p>
                </div>

                <a
                  href={component.audio_url}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#942017] text-white rounded hover:bg-[#7a1a13] transition"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          </div>
        );

      case 'comments':
        return <CommentsSection componentId={component.id} />;

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden m-4 md:m-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <FileStack className="w-6 h-6 text-[#942017]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#414651]">{component.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Explore additional teachings and materials
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

      {/* Tabs */}
      <div className="border-b border-gray-200 flex-shrink-0">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 px-6 py-3 text-sm font-medium transition
                ${
                  activeTab === tab.id
                    ? 'text-[#942017] border-b-2 border-[#942017] bg-gray-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto">{renderTabContent()}</div>

      {/* Footer with Mark as Complete */}
      {!isCompleted && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleMarkAsComplete}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#942017] text-white rounded hover:bg-[#7a1a13] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Mark as Complete'}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Mark this section as complete when you've explored all the materials
          </p>
        </div>
      )}
    </div>
  );
}
