'use client';

import { useEffect, useState } from 'react';

interface TourSpotlightProps {
  targetSelector: string;
  padding?: number;
  onElementFound?: (rect: DOMRect) => void;
}

export default function TourSpotlight({
  targetSelector,
  padding = 16,
  onElementFound
}: TourSpotlightProps) {
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    // Find the target element
    const findAndHighlightElement = () => {
      const element = document.querySelector(targetSelector);

      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightRect(rect);

        // Scroll element into view if not visible
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });

        // Call callback with element position
        if (onElementFound) {
          onElementFound(rect);
        }
      } else {
        console.warn(`Tour target element not found: ${targetSelector}`);
      }
    };

    // Give DOM time to render
    const timeout = setTimeout(findAndHighlightElement, 100);

    // Update on window resize or scroll
    const handleResize = () => {
      findAndHighlightElement();
    };

    const handleScroll = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightRect(rect);
        if (onElementFound) {
          onElementFound(rect);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true); // Use capture to catch all scroll events

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [targetSelector, onElementFound]);

  if (!spotlightRect) return null;

  // Get scroll position
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  // Calculate spotlight dimensions with padding (absolute position including scroll)
  const spotlightStyle = {
    top: spotlightRect.top + scrollY - padding,
    left: spotlightRect.left + scrollX - padding,
    width: spotlightRect.width + padding * 2,
    height: spotlightRect.height + padding * 2,
  };

  return (
    <>
      {/* Dark Backdrop with cutout - using absolute positioning to account for scroll */}
      <div
        className="absolute z-[9998] pointer-events-none"
        style={{
          top: 0,
          left: 0,
          width: '100%',
          height: Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight,
            document.documentElement.clientHeight
          ),
        }}
      >
        {/* SVG with mask to create spotlight effect */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
          }}
        >
          <defs>
            <mask id="spotlight-mask">
              {/* White background */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black cutout for highlighted element */}
              <rect
                x={spotlightStyle.left}
                y={spotlightStyle.top}
                width={spotlightStyle.width}
                height={spotlightStyle.height}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          {/* Dark overlay with mask applied */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.6)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Highlighted border around element */}
        <div
          className="absolute rounded-xl border-2 border-[#7D1A13] shadow-lg"
          style={{
            top: `${spotlightStyle.top}px`,
            left: `${spotlightStyle.left}px`,
            width: `${spotlightStyle.width}px`,
            height: `${spotlightStyle.height}px`,
            boxShadow: '0 0 0 4px rgba(125, 26, 19, 0.2), 0 0 20px rgba(125, 26, 19, 0.3)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
}
