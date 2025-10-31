'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Clock } from 'lucide-react';

interface HistoryTeaching {
  id: string;
  slug: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  content_type: string;
  duration?: number;
  published_date: string;
  accessed_at: string;
  access_type: string;
}

interface HistoryClientProps {
  history: HistoryTeaching[];
}

export default function HistoryClient({ history: initialHistory }: HistoryClientProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'text'>('video');
  const [history, setHistory] = useState(initialHistory);

  // Filter teachings by content type
  const filteredTeachings = history.filter(teaching => {
    if (activeTab === 'video') return teaching.content_type === 'video';
    if (activeTab === 'audio') return teaching.content_type === 'audio';
    if (activeTab === 'text') return teaching.content_type === 'essay';
    return true;
  });

  // Group by date
  const groupedByDate: { [key: string]: HistoryTeaching[] } = {};
  filteredTeachings.forEach(teaching => {
    const accessDate = new Date(teaching.accessed_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateLabel: string;
    if (accessDate.toDateString() === today.toDateString()) {
      dateLabel = 'Today';
    } else if (accessDate.toDateString() === yesterday.toDateString()) {
      dateLabel = 'Yesterday';
    } else {
      dateLabel = accessDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: accessDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }

    if (!groupedByDate[dateLabel]) {
      groupedByDate[dateLabel] = [];
    }
    groupedByDate[dateLabel].push(teaching);
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes`;
  };

  const getContentTypeLabel = (contentType: string) => {
    return contentType.charAt(0).toUpperCase() + contentType.slice(1);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F1] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#000000] mb-2" style={{ fontFamily: 'Optima, serif' }}>
            History
          </h1>
          <p className="text-[#717680]">
            Track your spiritual journey and revisit teachings that have resonated with you.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-[#E5E7EB] mb-6">
          <button
            onClick={() => setActiveTab('video')}
            className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
              activeTab === 'video'
                ? 'border-[#7D1A13] text-[#7D1A13]'
                : 'border-transparent text-[#717680] hover:text-[#000000]'
            }`}
          >
            Video
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
              activeTab === 'audio'
                ? 'border-[#7D1A13] text-[#7D1A13]'
                : 'border-transparent text-[#717680] hover:text-[#000000]'
            }`}
          >
            Audio
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
              activeTab === 'text'
                ? 'border-[#7D1A13] text-[#7D1A13]'
                : 'border-transparent text-[#717680] hover:text-[#000000]'
            }`}
          >
            Text
          </button>
        </div>

        {/* Content */}
        {filteredTeachings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Clock size={32} className="text-[#717680]" />
            </div>
            <h2 className="text-2xl font-bold text-[#000000] mb-2">No history yet</h2>
            <p className="text-[#717680] text-center max-w-md mb-8">
              Start watching teachings to build your spiritual journey history.
            </p>
            <Link
              href="/dashboard/user/library"
              className="px-6 py-3 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Go to The Library
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-[#717680]">
                {filteredTeachings.length} {filteredTeachings.length === 1 ? 'item' : 'items'}
              </p>
              <div className="flex gap-4 items-center">
                <span className="text-sm text-[#717680]">Sort by</span>
                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm hover:bg-gray-50">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M4 9H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M6 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Grouped History */}
            <div className="space-y-8">
              {Object.entries(groupedByDate).map(([dateLabel, teachings]) => (
                <div key={dateLabel}>
                  <h2 className="text-lg font-bold text-[#000000] mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#7D1A13] rounded-full"></span>
                    {dateLabel}
                  </h2>
                  <div className="space-y-4">
                    {teachings.map((teaching) => (
                      <Link
                        key={`${teaching.id}-${teaching.accessed_at}`}
                        href={`/dashboard/user/teachings/${teaching.slug}`}
                        className="flex gap-4 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group p-4"
                      >
                        <div className="relative w-64 h-36 bg-gray-200 rounded flex-shrink-0">
                          {teaching.thumbnail_url ? (
                            <Image
                              src={teaching.thumbnail_url}
                              alt={teaching.title}
                              fill
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No image
                            </div>
                          )}
                          {teaching.content_type && (
                            <div className="absolute bottom-2 left-2">
                              <span className="px-2 py-1 bg-black/80 text-white text-xs font-semibold rounded">
                                {getContentTypeLabel(teaching.content_type)}
                              </span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                              <Heart size={16} className="text-[#717680]" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm text-[#717680]">
                                {new Date(teaching.published_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              {teaching.duration && (
                                <span className="flex items-center gap-1 text-sm text-[#717680]">
                                  <Clock size={14} />
                                  {formatDuration(teaching.duration)}
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-lg text-[#000000] mb-2 group-hover:text-[#7D1A13] transition-colors">
                              {teaching.title}
                            </h3>
                            {teaching.description && (
                              <p className="text-sm text-[#717680] line-clamp-2">
                                {teaching.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
