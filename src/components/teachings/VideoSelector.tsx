'use client';

import React from 'react';
import { Play, Youtube } from 'lucide-react';

export interface MediaItem {
  type: 'youtube' | 'cloudflare';
  id: string;
  label?: string;
}

interface VideoSelectorProps {
  videos: MediaItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const VideoSelector: React.FC<VideoSelectorProps> = ({
  videos,
  selectedIndex,
  onSelect,
}) => {
  if (videos.length <= 1) return null;

  // Use tabs for 2-5 videos, dropdown for 6+
  const useTabs = videos.length <= 5;

  if (useTabs) {
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {videos.map((video, index) => {
          const isSelected = index === selectedIndex;
          const label = video.label || `Part ${index + 1}`;

          return (
            <button
              key={`${video.type}-${video.id}`}
              onClick={() => onSelect(index)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${isSelected
                  ? 'bg-[#8B4513] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {video.type === 'youtube' ? (
                <Youtube className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown for many videos
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Video
      </label>
      <select
        value={selectedIndex}
        onChange={(e) => onSelect(parseInt(e.target.value))}
        className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
      >
        {videos.map((video, index) => {
          const label = video.label || `Part ${index + 1}`;
          const typeLabel = video.type === 'youtube' ? 'YouTube' : 'Video';

          return (
            <option key={`${video.type}-${video.id}`} value={index}>
              {label} ({typeLabel})
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default VideoSelector;
