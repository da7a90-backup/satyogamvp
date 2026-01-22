'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { CourseComponent } from '@/types/course';
import { updateComponentProgress, saveVideoTimestamp } from '@/lib/courses-api';
import CommentsSection from './CommentsSection';

interface VideoLessonComponentProps {
  component: CourseComponent;
  courseSlug: string;
  onProgressUpdate: () => void;
  previousComponent?: CourseComponent;
  nextComponent?: CourseComponent;
}

type TabId = 'description' | 'transcription' | 'audio' | 'comments';

export default function VideoLessonComponent({
  component,
  courseSlug,
  onProgressUpdate,
  previousComponent,
  nextComponent,
}: VideoLessonComponentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('description');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastSavedTimeRef = useRef<number>(0);

  // Track video progress via Cloudflare Stream messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://iframe.videodelivery.net') return;

      // Listen for currentTime updates from Cloudflare
      if (event.data.__privateUnstableMessageType === 'propertyChange') {
        if (event.data.property === 'currentTime' && component.duration) {
          const currentTime = event.data.value;
          const duration = component.duration;
          const progressPercentage = (currentTime / duration) * 100;

          // Save progress every 10 seconds
          if (currentTime - lastSavedTimeRef.current >= 10) {
            lastSavedTimeRef.current = currentTime;

            saveVideoTimestamp(component.id, currentTime).catch(console.error);
            updateComponentProgress(
              component.id,
              Math.floor(progressPercentage),
              progressPercentage >= 95
            ).then(() => {
              // Always call onProgressUpdate to refresh component data
              onProgressUpdate();
            }).catch(console.error);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [component, onProgressUpdate]);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'description', label: 'Description' },
    { id: 'transcription', label: 'Transcription' },
    { id: 'audio', label: 'Audio' },
    { id: 'comments', label: 'Comments' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="text-base leading-relaxed text-[#384250] font-['Avenir_Next']">
            {component.description || 'No description available.'}
          </div>
        );

      case 'transcription':
        return (
          <div className="text-base leading-relaxed text-[#384250] font-['Avenir_Next']">
            {component.transcription || 'No transcription available.'}
          </div>
        );

      case 'audio':
        return (
          <div className="py-6">
            {component.audio_url ? (
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-center mb-4">
                  <h3 className="font-medium text-lg text-white">{component.title}</h3>
                  <p className="text-gray-400 text-sm">Shunyamurti</p>
                </div>
                <iframe
                  src={component.audio_url}
                  title={component.title}
                  className="w-full border-0 rounded"
                  style={{ height: '160px' }}
                  allow="autoplay"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No audio available for this lesson.</p>
              </div>
            )}
          </div>
        );

      case 'comments':
        return <CommentsSection componentId={component.id} />;

      default:
        return null;
    }
  };

  // Get Cloudflare Stream video ID
  const videoId = component.cloudflare_stream_uid || '';
  const cloudflareUrl = videoId ? `https://iframe.videodelivery.net/${videoId}?autoplay=false` : '';

  return (
    <div className="flex-1 flex flex-col bg-[#FAF8F1] m-4 md:m-6">
      {/* Page Header with Title and Navigation */}
      <div className="px-8 pb-6 border-b border-[#E5E7EB] flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* Title */}
          <h1 className="text-2xl font-bold text-[#181D27] font-['Optima'] text-center flex-1">
            {component.class?.order_index !== undefined && component.component_index_in_class !== undefined
              ? `Class ${component.class.order_index + 1}.${component.component_index_in_class}: `
              : ''}{component.title}
          </h1>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {previousComponent ? (
              <button
                onClick={() => router.push(`/dashboard/user/courses/${courseSlug}/component/${previousComponent.id}`)}
                className="flex items-center gap-3 px-3 py-2 bg-white border border-[#D5D7DA] text-[#414651] text-sm font-semibold rounded-lg hover:bg-gray-50 transition shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)]"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
            ) : (
              <div className="w-[107px]"></div>
            )}

            {nextComponent ? (
              <button
                onClick={() => router.push(`/dashboard/user/courses/${courseSlug}/component/${nextComponent.id}`)}
                className="flex items-center gap-3 px-3 py-2 bg-[#7D1A13] text-white text-sm font-semibold rounded-lg hover:bg-[#942017] transition shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)]"
              >
                Next Lesson
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-[118px]"></div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 px-8 py-6 overflow-y-auto">
        <div className="max-w-full">
          {/* Video Player */}
          {cloudflareUrl ? (
            <div className="mb-6">
              <div
                className="relative bg-black rounded-lg overflow-hidden"
                style={{ paddingTop: '56.25%' }}
              >
                <iframe
                  ref={iframeRef}
                  src={cloudflareUrl}
                  title={component.title}
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
              <p className="text-white">No video available</p>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-[#E9EAEB] mb-6">
            <div className="flex gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 px-1 border-b-2 transition-colors text-sm font-semibold ${
                    activeTab === tab.id
                      ? 'border-[#7D1A13] text-[#7D1A13]'
                      : 'border-transparent text-[#717680] hover:text-[#7D1A13]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#181D27] font-['Avenir_Next']">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
          </div>

          {/* Tab Content */}
          <div className="mb-12">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
