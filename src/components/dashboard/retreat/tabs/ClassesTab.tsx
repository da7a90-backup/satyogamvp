'use client';

import { useState, useEffect } from 'react';
import { Retreat } from '@/types/retreat';
import ClassSessionCard from './ClassSessionCard';

interface ClassesTabProps {
  retreat: Retreat;
}

export default function ClassesTab({ retreat }: ClassesTabProps) {
  const [selectedDay, setSelectedDay] = useState(1);

  // Extract days from portal content with debugging
  const getDays = () => {
    console.log('[ClassesTab] Checking portal data:', {
      hasPortals: !!retreat.portals,
      portalsLength: retreat.portals?.length,
      firstPortal: retreat.portals?.[0],
      hasPortalMedia: !!retreat.portal_media,
      portalMediaLength: retreat.portal_media?.length,
      isPastRetreat: retreat.is_past_retreat,
      isRegistered: retreat.is_registered,
      canAccess: retreat.can_access,
    });

    // For past retreats, group by media type (Videos and Audio) instead of by day
    if (retreat.is_past_retreat && retreat.portal_media && Array.isArray(retreat.portal_media)) {
      console.log('[ClassesTab] Grouping past retreat media by type (Videos/Audio)');

      // Separate videos and audio
      const videoSessions: any[] = [];
      const audioSessions: any[] = [];

      retreat.portal_media.forEach((item: any, idx: number) => {
        // Check for video in multiple possible fields
        const hasVideo = !!(item.video_url || item.youtube_url || item.cloudflare_url || item.vimeo_url);
        const hasAudio = !!(item.audio_url || item.mp3_url || item.podbean_url);

        const session = {
          session_title: item.title || `Session ${idx + 1}`,
          description: item.description || item.subtitle || '',
          date: null,
          time: '10:00 AM', // Default time for grouping
          duration: null,
          type: hasVideo ? 'video' : 'audio',
          has_audio: hasAudio,
          has_video: hasVideo,
          teaching_id: null,
          youtube_live_id: null,
          // Separate video and audio URLs properly
          video_url: hasVideo ? (item.video_url || item.youtube_url || item.cloudflare_url || item.vimeo_url) : null,
          audio_url: hasAudio ? (item.audio_url || item.mp3_url || item.podbean_url) : null,
          thumbnail_url: item.thumbnail_url || null,
          zoom_link: item.zoom_link || null,
          is_text: false,
        };

        if (hasVideo) {
          videoSessions.push(session);
        } else if (hasAudio) {
          audioSessions.push(session);
        }
      });

      const days = [];

      // Add Video section if there are videos
      if (videoSessions.length > 0) {
        days.push({
          title: 'Videos',
          day_number: 1,
          date: null,
          day_label: 'Videos',
          sessions: videoSessions,
        });
      }

      // Add Audio section if there are audios
      if (audioSessions.length > 0) {
        days.push({
          title: 'Audio',
          day_number: 2,
          date: null,
          day_label: 'Audio',
          sessions: audioSessions,
        });
      }

      console.log('[ClassesTab] Created sections:', { videos: videoSessions.length, audio: audioSessions.length });
      return days;
    }

    // For regular retreats, use portal.content.days structure
    if (!retreat.portals || retreat.portals.length === 0) {
      console.log('[ClassesTab] No portals found');
      return [];
    }

    // Assuming first portal has the day schedule
    const portal = retreat.portals[0];

    if (!portal.content) {
      console.log('[ClassesTab] Portal has no content');
      return [];
    }

    if (!portal.content.days) {
      console.log('[ClassesTab] Portal content has no days array');
      return [];
    }

    console.log('[ClassesTab] Found days:', portal.content.days.length);
    return portal.content.days;
  };

  const days = getDays();

  // Determine what message to show when no classes are available
  const getEmptyMessage = () => {
    if (!retreat.is_registered) {
      return {
        icon: '🔒',
        title: 'Registration Required',
        message: 'Please register for this retreat to view the class schedule.',
      };
    }

    if (!retreat.can_access) {
      return {
        icon: '⏰',
        title: 'Access Pending',
        message: 'Your access to retreat classes is pending. This may be because payment is being processed or access has not been granted yet.',
      };
    }

    if (!retreat.portals || retreat.portals.length === 0) {
      return {
        icon: '📅',
        title: 'Schedule Coming Soon',
        message: 'The class schedule for this retreat has not been published yet. Check back soon!',
      };
    }

    // Has portals but no content.days
    return {
      icon: '🔧',
      title: 'Content Being Prepared',
      message: 'The retreat class schedule is currently being prepared by the administrators. It will be available soon.',
    };
  };

  if (days.length === 0) {
    const emptyState = getEmptyMessage();

    return (
      <div className="max-w-4xl min-h-full">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">{emptyState.icon}</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 font-avenir">
            {emptyState.title}
          </h3>
          <p className="text-gray-600 font-avenir">
            {emptyState.message}
          </p>
        </div>
      </div>
    );
  }

  const currentDay = days.find((d) => d.day_number === selectedDay) || days[0];

  // Safety check for sessions
  if (!currentDay || !currentDay.sessions || !Array.isArray(currentDay.sessions)) {
    console.error('[ClassesTab] Invalid day data:', currentDay);
    return (
      <div className="max-w-4xl min-h-full">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-yellow-900 mb-2 font-avenir">
            Data Error
          </h3>
          <p className="text-yellow-700 font-avenir">
            There was an issue loading the class data. Please contact support if this persists.
          </p>
        </div>
      </div>
    );
  }

  // Group sessions by time
  const sessionsByTime = currentDay.sessions.reduce((acc, session) => {
    const time = session.time;
    if (!acc[time]) {
      acc[time] = [];
    }
    acc[time].push(session);
    return acc;
  }, {} as Record<string, typeof currentDay.sessions>);

  return (
    <div className="max-w-6xl space-y-6 min-h-full">
      {/* Day/Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => (
          <button
            key={day.day_number}
            onClick={() => setSelectedDay(day.day_number)}
            className={`
              px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors
              ${
                selectedDay === day.day_number
                  ? 'bg-[#7D1A13] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            {day.title}
          </button>
        ))}
      </div>

      {/* Sessions by Time */}
      {sessionsByTime && Object.entries(sessionsByTime).map(([time, sessions]) => (
        <div key={time}>
          {/* Time Heading */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-[#7D1A13] rounded-full" />
            <h3
              className="text-lg font-semibold text-black"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              {time} · {sessions[0].session_title.split(' ')[0]}
            </h3>
          </div>

          {/* Session Cards */}
          {sessions.length === 1 ? (
            // Single large card
            <div className="max-w-md">
              <ClassSessionCard session={sessions[0]} isLarge={true} />
            </div>
          ) : (
            // Grid of 3 cards
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sessions.map((session, idx) => (
                <ClassSessionCard
                  key={idx}
                  session={session}
                  isLarge={false}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Add to Calendar Button - Only show for upcoming/live retreats */}
      {!retreat.is_past_retreat && (
        <div className="border-t border-gray-200 pt-6">
          <button
            className="
              px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg
              font-semibold hover:bg-gray-50 transition-colors
              flex items-center gap-2
            "
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
            onClick={() => {
              // TODO: Integrate with calendar API
              alert('Add to calendar functionality coming soon!');
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Add {currentDay.title} to Calendar
          </button>
        </div>
      )}
    </div>
  );
}
