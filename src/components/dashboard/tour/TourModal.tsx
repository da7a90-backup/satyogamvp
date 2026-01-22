'use client';

import { Play, X } from 'lucide-react';
import Image from 'next/image';
import { TourStep } from './tourSteps';

interface TourModalProps {
  step: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onClose: () => void;
  position: { top?: number; left?: number; right?: number; bottom?: number };
}

export default function TourModal({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onClose,
  position,
}: TourModalProps) {
  const isFirstStep = currentStepIndex === 1;
  const isLastStep = currentStepIndex === totalSteps;

  return (
    <div
      className="absolute z-[9999] flex flex-col items-start p-0 w-[567px] bg-white border border-[#E9EAEB] rounded-2xl"
      style={{
        ...position,
        boxShadow: '0px 12px 16px -4px rgba(10, 13, 18, 0.08), 0px 4px 6px -2px rgba(10, 13, 18, 0.03), 0px 2px 2px -1px rgba(10, 13, 18, 0.04)',
      }}
    >
      {/* Content Section with Gray Background */}
      {step.mediaType !== 'none' && step.mediaUrl && (
        <div className="flex flex-col items-start p-2 pb-4 gap-4 w-full bg-[#FAFAFA] rounded-t-2xl">
          {/* Image/Video Wrap */}
          <div className="relative w-full h-[297px] rounded-[13px] overflow-hidden bg-gray-200">
            {step.mediaType === 'image' && (
              <Image
                src={step.mediaUrl}
                alt={step.title}
                fill
                className="object-cover"
              />
            )}
            {step.mediaType === 'video' && (
              <>
                <video
                  src={step.mediaUrl}
                  className="w-full h-full object-cover"
                  poster={step.mediaUrl.replace('.mp4', '-poster.jpg')}
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-[103px] h-[103px] rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center shadow-[inset_0px_2.15px_2.15px_rgba(255,255,255,0.2)] hover:bg-white/40 transition-colors">
                    <div className="w-full h-full rounded-full bg-black/5 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Text Content Section */}
      <div className="flex flex-col justify-center items-center p-2 gap-0.5 w-full">
        <div className="flex flex-col items-center p-3 gap-8 w-full">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close tour"
          >
            <X className="w-5 h-5 text-[#A4A7AE]" />
          </button>

          {/* Text Content */}
          <div className="flex flex-col items-start p-0 gap-2 w-full">
            {/* Title and Badge */}
            <div className="flex flex-row items-center p-0 gap-2 w-full">
              <h3 className="text-base font-semibold text-[#181D27] flex-grow" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                {step.title}
              </h3>
              {/* Step Counter Badge */}
              <div className="px-2 py-0.5 bg-white border border-[#D5D7DA] rounded-md">
                <span className="text-sm font-medium text-[#535862]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  {currentStepIndex} of {totalSteps}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-[#535862] leading-5" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              {step.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row justify-end items-center p-0 gap-3 w-full">
            {/* Skip Button (only show on first steps) */}
            {!isLastStep && (
              <button
                onClick={onSkip}
                className="flex flex-row justify-center items-center px-3 py-2 gap-1 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-[#414651]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Skip Tour
                </span>
              </button>
            )}

            {/* Previous Button (show when not first step) */}
            {!isFirstStep && (
              <button
                onClick={onPrevious}
                className="flex flex-row justify-center items-center px-3 py-2 gap-1 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-[#414651]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Previous
                </span>
              </button>
            )}

            {/* Next/Complete Button */}
            <button
              onClick={onNext}
              className="flex flex-row justify-center items-center px-3 py-2 gap-1 bg-[#7D1A13] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] hover:bg-[#942017] transition-colors"
            >
              <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                {isLastStep ? 'Complete Tour' : 'Next'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pointer Arrow (positioned based on step.position) */}
      {step.position === 'left' && (
        <div className="absolute right-[-12px] top-1/2 transform -translate-y-1/2">
          <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[12px] border-l-white border-b-[12px] border-b-transparent" />
        </div>
      )}
      {step.position === 'right' && (
        <div className="absolute left-[-12px] top-1/2 transform -translate-y-1/2">
          <div className="w-0 h-0 border-t-[12px] border-t-transparent border-r-[12px] border-r-white border-b-[12px] border-b-transparent" />
        </div>
      )}
      {step.position === 'top' && (
        <div className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-t-[12px] border-t-white border-r-[12px] border-r-transparent" />
        </div>
      )}
      {step.position === 'bottom' && (
        <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-b-[12px] border-b-white border-r-[12px] border-r-transparent" />
        </div>
      )}
    </div>
  );
}
