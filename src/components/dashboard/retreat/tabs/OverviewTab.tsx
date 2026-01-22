'use client';

import { useState } from 'react';
import { Retreat } from '@/types/retreat';
import YouTubePlayer from '@/components/teachings/YouTubePlayer';
import RetreatSummarySection from './RetreatSummarySection';

interface OverviewTabProps {
  retreat: Retreat;
}

export default function OverviewTab({ retreat }: OverviewTabProps) {
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(false);
  const [expandedAbout, setExpandedAbout] = useState(false);
  const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(new Set());

  const toggleFAQ = (index: number) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFAQs(newExpanded);
  };

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const invitationVideoId = retreat.invitation_video_url
    ? getYouTubeId(retreat.invitation_video_url)
    : null;

  return (
    <div className="flex flex-col items-start gap-6 max-w-[720px]">
      {/* Announcement Section */}
      {retreat.announcement && (
        <div className="flex flex-col items-start gap-4 self-stretch">
          {/* Section Header */}
          <div className="flex flex-col items-start gap-5 self-stretch">
            <div className="flex flex-row items-start gap-4 self-stretch">
              <h2 className="flex-1 text-xl font-bold leading-[30px] text-[#181D27] font-avenir">
                Announcement
              </h2>
            </div>
          </div>

          {/* Card */}
          <div className="flex flex-row items-start self-stretch bg-white border border-[#D2D6DB] rounded-lg overflow-hidden">
            <div className="flex flex-col items-start p-6 gap-2 flex-1">
              <div className="flex flex-col items-start gap-2 self-stretch">
                <h3 className="text-xl font-semibold leading-[30px] text-[#111927] font-avenir self-stretch">
                  Important Information
                </h3>
              </div>
              <div
                className={`text-base leading-6 text-[#384250] font-normal font-avenir self-stretch ${
                  !expandedAnnouncement && 'line-clamp-3'
                }`}
              >
                {retreat.announcement}
              </div>
              {retreat.announcement.length > 200 && (
                <div className="flex flex-row justify-end items-center pt-2 gap-1.5 self-stretch">
                  <button
                    onClick={() => setExpandedAnnouncement(!expandedAnnouncement)}
                    className="text-sm font-semibold leading-5 text-[#7D1A13] hover:opacity-80 font-avenir"
                  >
                    {expandedAnnouncement ? 'View less' : 'View more'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invitation Message Video */}
      {invitationVideoId && (
        <div className="flex flex-col items-start gap-4 self-stretch">
          {/* Section Header */}
          <div className="flex flex-col items-start gap-5 self-stretch">
            <div className="flex flex-row items-start gap-4 self-stretch">
              <h2 className="flex-1 text-xl font-bold leading-[30px] text-[#181D27] font-avenir">
                Invitation message
              </h2>
            </div>
          </div>

          {/* Video Player */}
          <div className="w-full h-96 bg-black/50 rounded-lg overflow-hidden self-stretch">
            <YouTubePlayer
              videoId={invitationVideoId}
              title="Invitation from Shunyamurti"
              isLoggedIn={true}
              isPreviewMode={false}
              previewDuration={0}
              onPreviewEnd={() => {}}
              isDashboard={true}
            />
          </div>
        </div>
      )}

      {/* Retreat Summary Sections */}
      {retreat.about_content && (
        <RetreatSummarySection
          image={retreat.about_image_url}
          content={retreat.about_content}
        />
      )}

      {/* Additional Overview Sections (if defined) */}
      {retreat.overview_sections && retreat.overview_sections.map((section: any, index: number) => (
        <RetreatSummarySection
          key={index}
          image={section.image_url}
          content={section.content}
        />
      ))}

      {/* FAQ Section */}
      {retreat.faq_data && retreat.faq_data.length > 0 && (
        <div className="flex flex-col items-center pb-8 gap-4 self-stretch">
          {/* Header */}
          <div className="flex flex-row items-center gap-4 self-stretch">
            <h2 className="text-xl font-semibold leading-6 text-black font-[Inter]">
              FAQ's
            </h2>
          </div>

          {/* FAQ Container */}
          <div className="flex flex-col items-center gap-20 self-stretch bg-white border border-[#D2D6DB] rounded-lg overflow-hidden">
            {/* Accordion List */}
            <div className="flex flex-col items-start px-6 self-stretch">
              {retreat.faq_data.map((faq, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-start self-stretch ${
                    index > 0 ? 'border-t border-[#D2D6DB]' : ''
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex flex-row items-center py-5 gap-6 self-stretch text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex-1 text-lg font-semibold leading-7 text-black font-avenir">
                      {faq.question}
                    </span>
                    <svg
                      className={`w-8 h-8 text-black transition-transform ${
                        expandedFAQs.has(index) ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  {expandedFAQs.has(index) && (
                    <div className="pb-5 text-base leading-6 text-[#384250] font-normal font-avenir self-stretch">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
