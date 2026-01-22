'use client';

import { useState } from 'react';
import Image from 'next/image';

interface RetreatSummarySectionProps {
  image?: string | null;
  content: string;
}

export default function RetreatSummarySection({ image, content }: RetreatSummarySectionProps) {
  const [expanded, setExpanded] = useState(false);

  // Check if content is long enough to need expansion
  const needsExpansion = content.length > 200;

  return (
    <div className="flex flex-col items-start gap-4 self-stretch">
      {/* Section Header */}
      <div className="flex flex-col items-start gap-5 self-stretch">
        <div className="flex flex-row items-start gap-4 self-stretch">
          <h2 className="flex-1 text-xl font-bold leading-[30px] text-[#181D27] font-avenir">
            Retreat summary
          </h2>
        </div>
      </div>

      {/* Card with Image and Content */}
      <div className="flex flex-row items-start self-stretch bg-white border border-[#D2D6DB] rounded-lg overflow-hidden">
        {/* Image on Left (if provided) */}
        {image && (
          <div className="relative w-[170px] h-[200px] flex-shrink-0">
            <Image
              src={image}
              alt="Retreat summary"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content on Right */}
        <div className="flex flex-col items-start p-6 gap-2 flex-1">
          <div
            className={`text-base leading-6 text-[#384250] font-normal font-avenir self-stretch whitespace-pre-wrap ${
              !expanded && needsExpansion ? 'line-clamp-3' : ''
            }`}
          >
            {content}
          </div>
          {needsExpansion && (
            <div className="flex flex-row justify-end items-center pt-2 gap-1.5 self-stretch">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm font-semibold leading-5 text-[#7D1A13] hover:opacity-80 font-avenir"
              >
                {expanded ? 'View less' : 'View more'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
