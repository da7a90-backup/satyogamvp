'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeaturedBookGroup as FeaturedBookGroupType } from '@/types/book-group';
import { addCalendarReminder } from '@/lib/book-groups-api';
import { Calendar } from 'lucide-react';

interface FeaturedBookGroupProps {
  bookGroup: FeaturedBookGroupType;
}

export default function FeaturedBookGroup({ bookGroup }: FeaturedBookGroupProps) {
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [reminderAdded, setReminderAdded] = useState(false);

  // Format date for display (e.g., "Nov 26th, 2024")
  const formatDate = () => {
    if (!bookGroup.start_date) return '';
    const date = new Date(bookGroup.start_date);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();

    const suffix = day === 1 || day === 21 || day === 31 ? 'st'
                  : day === 2 || day === 22 ? 'nd'
                  : day === 3 || day === 23 ? 'rd'
                  : 'th';

    return `${month} ${day}${suffix}, ${year}`;
  };

  // Get days until message
  const getDaysUntilMessage = () => {
    if (bookGroup.days_until_next_session === null || bookGroup.days_until_next_session === undefined) {
      return null;
    }
    const days = bookGroup.days_until_next_session;
    if (days === 0) return 'Today';
    if (days === 1) return 'In 1 day';
    return `In ${days} days`;
  };

  const handleAddReminder = async () => {
    try {
      setIsAddingReminder(true);
      await addCalendarReminder(bookGroup.slug, {});
      setReminderAdded(true);
      setTimeout(() => setReminderAdded(false), 3000);
    } catch (error) {
      console.error('Failed to add reminder:', error);
    } finally {
      setIsAddingReminder(false);
    }
  };

  const canJoinZoom = bookGroup.zoom_enabled && bookGroup.days_until_next_session !== null && bookGroup.days_until_next_session <= 7;
  const daysUntilMessage = getDaysUntilMessage();

  return (
    <div className="w-[1120px] h-[330.91px] bg-white border border-[#D1D1D1] rounded-lg flex overflow-hidden">
      {/* Image Section - Left */}
      <div className="relative w-[560px] h-full flex-shrink-0">
        {bookGroup.hero_image ? (
          <Image
            src={bookGroup.hero_image}
            alt={bookGroup.title}
            fill
            className="object-cover"
            unoptimized={true}
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}

      </div>

      {/* Content Section - Right */}
      <div className="w-[560px] p-6 flex flex-col justify-between">
        {/* Top Section */}
        <div className="flex flex-col gap-4">
          {/* Date and Days Until Row */}
          <div className="flex items-start justify-between">
            <span className="text-sm text-[#7D1A13] font-semibold" style={{ fontFamily: 'Avenir Next' }}>
              {formatDate()}
            </span>
            {daysUntilMessage && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#535862]" />
                <span className="text-sm text-[#535862]" style={{ fontFamily: 'Avenir Next' }}>
                  {daysUntilMessage}
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-black leading-tight" style={{ fontFamily: 'Avenir Next' }}>
            {bookGroup.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-[#535862] leading-relaxed" style={{ fontFamily: 'Inter' }}>
            {bookGroup.description || bookGroup.short_description}
          </p>
        </div>

        {/* Bottom Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddReminder}
            disabled={isAddingReminder || reminderAdded}
            className="px-4 py-2 bg-white border border-[#D1D1D1] rounded-lg text-sm font-medium text-[#535862] hover:bg-gray-50 transition-colors disabled:opacity-50"
            style={{ fontFamily: 'Avenir Next' }}
          >
            {reminderAdded ? 'Reminder sent!' : 'Send a reminder'}
          </button>

          {canJoinZoom && (
            <Link
              href={`/dashboard/user/book-groups/${bookGroup.slug}`}
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors flex items-center gap-2"
              style={{ fontFamily: 'Avenir Next' }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 3.5C2 2.67157 2.67157 2 3.5 2H16.5C17.3284 2 18 2.67157 18 3.5V16.5C18 17.3284 17.3284 18 16.5 18H3.5C2.67157 18 2 17.3284 2 16.5V3.5Z" fill="currentColor"/>
                <path d="M12 7L16 5V15L12 13V7Z" fill="white"/>
                <path d="M4 7H12V13H4V7Z" fill="white"/>
              </svg>
              Join zoom
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
