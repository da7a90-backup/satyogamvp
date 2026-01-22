'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PrepInstruction } from '@/types/retreat';

interface PreparationCardProps {
  instruction: PrepInstruction;
}

export default function PreparationCard({ instruction }: PreparationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert content to array of paragraphs if it's a string
  const contentArray = Array.isArray(instruction.content)
    ? instruction.content
    : [instruction.content];

  // Determine if content should be truncated
  const shouldTruncate = instruction.expandable && !isExpanded;
  const displayContent = shouldTruncate && instruction.contentPreview
    ? [instruction.contentPreview]
    : contentArray;

  // Convert images to array
  const images = instruction.image
    ? Array.isArray(instruction.image)
      ? instruction.image
      : [instruction.image]
    : [];

  const imageCaptions = instruction.imageCaption
    ? Array.isArray(instruction.imageCaption)
      ? instruction.imageCaption
      : [instruction.imageCaption]
    : [];

  // Determine card layout based on content
  const hasMedia = images.length > 0 || instruction.videoUrl;
  const hasLargeContent = contentArray.join('').length > 500;

  return (
    <div className="flex flex-col items-start p-6 gap-4 bg-white border border-[#D2D6DB] rounded-lg">
      {/* Title */}
      <h3 className="text-2xl font-semibold text-black font-avenir">
        {instruction.title}
      </h3>

      {/* Content */}
      <div className="flex flex-col items-start gap-4 self-stretch">
        {/* Text Content */}
        <div className="flex flex-col items-start gap-4 self-stretch">
          {displayContent.map((paragraph, index) => (
            <p
              key={index}
              className="text-lg font-normal leading-7 text-[#414651] font-avenir self-stretch"
            >
              {paragraph}
            </p>
          ))}

          {/* Bullet Points */}
          {instruction.bullets && instruction.bullets.length > 0 && (isExpanded || !instruction.expandable) && (
            <ul className="list-disc list-inside space-y-2 self-stretch">
              {instruction.bullets.map((bullet, index) => (
                <li
                  key={index}
                  className="text-lg font-normal leading-7 text-[#414651] font-avenir"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Images */}
        {images.length > 0 && (isExpanded || !instruction.expandable) && (
          <div className={`flex ${images.length > 1 ? 'flex-col gap-4' : 'flex-row'} items-start self-stretch`}>
            {images.map((imageUrl, index) => (
              <div key={index} className="relative w-full rounded-lg overflow-hidden">
                <div className="relative w-full h-[282px]">
                  <Image
                    src={imageUrl}
                    alt={imageCaptions[index] || instruction.title}
                    fill
                    className="object-cover"
                  />
                </div>
                {imageCaptions[index] && (
                  <p className="mt-2 text-sm text-[#717680] font-avenir">
                    {imageCaptions[index]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Video Embed */}
        {instruction.videoUrl && (isExpanded || !instruction.expandable) && (
          <div className="w-full">
            <VideoEmbed
              url={instruction.videoUrl}
              type={instruction.videoType || 'direct'}
              teachingId={instruction.teachingId}
            />
          </div>
        )}

        {/* View More Button */}
        {instruction.expandable && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-row justify-end items-center pt-2 gap-1.5 self-stretch"
          >
            <span className="text-sm font-semibold leading-5 text-[#7D1A13] font-avenir">
              {isExpanded ? 'View less' : 'View more'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

// Video Embed Component
interface VideoEmbedProps {
  url: string;
  type: 'youtube' | 'cloudflare' | 'teaching' | 'direct';
  teachingId?: string;
}

function VideoEmbed({ url, type, teachingId }: VideoEmbedProps) {
  const getEmbedUrl = () => {
    switch (type) {
      case 'youtube':
        // Extract video ID from various YouTube URL formats
        const youtubeMatch = url.match(
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        );
        const videoId = youtubeMatch ? youtubeMatch[1] : url;
        return `https://www.youtube.com/embed/${videoId}`;

      case 'cloudflare':
        // Cloudflare Stream embed URL format
        return url.includes('iframe') ? url : `https://iframe.videodelivery.net/${url}`;

      case 'teaching':
        // For internal teaching videos, we'll use the teaching ID
        // This would need to be implemented based on your teaching video infrastructure
        return `/api/teachings/${teachingId}/embed`;

      case 'direct':
      default:
        return url;
    }
  };

  if (type === 'direct') {
    return (
      <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
        <video
          controls
          className="w-full h-full"
          src={url}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={getEmbedUrl()}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
