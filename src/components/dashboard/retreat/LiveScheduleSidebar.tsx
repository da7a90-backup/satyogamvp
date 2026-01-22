'use client';

import { Retreat } from '@/types/retreat';
import HappeningNowCard from './HappeningNowCard';

interface LiveScheduleSidebarProps {
  retreat: Retreat;
}

export default function LiveScheduleSidebar({ retreat }: LiveScheduleSidebarProps) {
  if (!retreat.live_schedule || retreat.live_schedule.length === 0) {
    return null;
  }

  // Find any happening now sessions
  const happeningNowSession = retreat.live_schedule
    .flatMap(day => day.sessions)
    .find(session => session.is_happening_now);

  // Helper function to check if a session is currently live
  const isSessionLiveNow = (session: any, dayDate: string) => {
    if (!session.youtube_live_id || !session.time) return false;

    try {
      const now = new Date();
      // Parse the day date and session time
      // Assuming dayDate is in format like "May 23, 2025" and time is "3:00 PM - 4:30 PM"
      const timeRange = session.time.split('-')[0].trim(); // Get start time
      const sessionDate = new Date(`${dayDate} ${timeRange}`);

      // Session is live if it started within the last 2 hours and hasn't ended
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      return sessionDate >= twoHoursAgo && sessionDate <= twoHoursFromNow;
    } catch (error) {
      return false;
    }
  };

  // Check if any session in a day is live now
  const hasDayLiveSessions = (day: any) => {
    return day.sessions?.some((session: any) => isSessionLiveNow(session, day.date)) || false;
  };

  return (
    <div className="flex flex-col items-start w-[400px] h-screen sticky top-0 overflow-y-auto">
      <div className="flex flex-col items-start p-6 gap-6 self-stretch">
        {/* Happening Now Section */}
        {happeningNowSession && (
          <HappeningNowCard
            session={happeningNowSession}
            retreatTitle={retreat.title}
            variant="sidebar"
          />
        )}

        {/* Header */}
        <div className="flex flex-col items-start gap-4 self-stretch">
          <div className="flex flex-row items-start gap-4 self-stretch">
            <h2 className="flex-1 text-xl font-bold leading-[30px] text-black font-avenir">
              Live Schedule
            </h2>
          </div>
        </div>

        {/* Schedule Days */}
        {retreat.live_schedule.map((day, dayIndex) => (
          <div key={dayIndex} className="flex flex-row items-start gap-2 self-stretch">
            {/* Timeline Column */}
            <div className="flex flex-col justify-center items-center gap-2 self-stretch w-[19px]">
              {/* Dot */}
              <div className="flex flex-row justify-center items-center gap-2.5 w-2 h-7">
                <div className="w-2 h-2 bg-[#181D27] rounded-full flex-1" />
              </div>
              {/* Line */}
              <div className="flex-1 w-0 border-l border-[#A4A7AE]" />
            </div>

            {/* Content Column */}
            <div className="flex flex-col items-start gap-4 flex-1">
              {/* Date Header */}
              <div className="flex flex-row items-center gap-4 self-stretch">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold leading-7 text-[#252B37] font-avenir">
                    {day.date}
                  </h3>
                  {hasDayLiveSessions(day) && (
                    <div className="flex flex-row items-center px-1.5 py-0.5 gap-1 bg-[#EF4444] rounded-md mt-1 w-fit">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path fill="black" d="M9 8l7 4-7 4V8z" />
                      </svg>
                      <span className="text-xs font-medium leading-3 text-white font-[Inter]">
                        Live Now
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sessions */}
              {day.sessions.map((session, sessionIdx) => {
                // Determine the link based on whether it's YouTube Live or Zoom
                const sessionLink = session.youtube_live_id
                  ? `https://www.youtube.com/watch?v=${session.youtube_live_id}`
                  : session.zoom_link || '#';
                const hasLink = session.youtube_live_id || session.zoom_link;

                // Use placeholder if no thumbnail
                const thumbnailUrl = session.thumbnail_url || '/orbanner.png';

                return (
                  <div key={sessionIdx} className="flex flex-col items-start self-stretch">
                    {/* Frame 289416 - Session Card */}
                    <a
                      href={hasLink ? sessionLink : undefined}
                      target={hasLink ? "_blank" : undefined}
                      rel={hasLink ? "noopener noreferrer" : undefined}
                      className={`flex flex-col items-start p-0 w-full border border-[#D2D6DB] rounded-lg overflow-hidden ${
                        hasLink ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
                      }`}
                    >
                      {/* Video Player - 341px × 187px */}
                      <div className="relative w-full h-[187px] bg-gray-100 flex-none self-stretch">
                        {/* Thumbnail */}
                        <div className="absolute inset-0">
                          <img
                            src={thumbnailUrl}
                            alt={session.title}
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-black/15" />
                        </div>

                        {/* Group 1 - Play Button Group (128px × 102.4px) */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-[102.4px]">
                          {/* Shadow Vector (128px × 102.4px) */}
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-[102.4px] bg-black/15 rounded-full" />

                          {/* Play Button (64px × 64px) */}
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16">
                            <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
                              {/* White circle background */}
                              <circle cx="32" cy="32" r="32" fill="#FFFFFF" />
                              {/* Play triangle - black fill, positioned at 8.33% from edges (5.33px from each edge) */}
                              <path
                                d="M26.66 21.33L42.66 32L26.66 42.66V21.33Z"
                                fill="#000000"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* YouTube LIVE Badge - only show if session is actually live now */}
                        {session.youtube_live_id && isSessionLiveNow(session, day.date) && (
                          <div className="absolute top-2 right-2 flex flex-row items-center px-[5.39px] py-[1.35px] gap-[2.69px] bg-[#EF4444] rounded-[5.39px]">
                            <svg className="w-[16.17px] h-[16.17px]" viewBox="0 0 17 17" fill="none">
                              <circle cx="8.5" cy="8.5" r="8" fill="#EF4444" />
                              <path
                                d="M6.5 5.5L11.5 8.5L6.5 11.5V5.5Z"
                                fill="#FFFFFF"
                              />
                            </svg>
                            <span className="text-[10.78px] font-medium leading-3 text-white font-[Inter]">
                              Live
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card - Content Section (80px height) */}
                      <div className="flex flex-row items-start p-4 gap-6 w-full h-20 bg-white flex-none self-stretch">
                        {/* Label */}
                        <span className="w-20 h-6 text-base font-semibold leading-6 text-black font-avenir flex-none">
                          {session.time}
                        </span>

                        {/* Input/Description */}
                        <div className="flex flex-row items-start gap-6 flex-1 h-12">
                          <p className="flex-1 text-base font-normal leading-6 text-[#384250] font-avenir">
                            {session.title}
                          </p>
                        </div>
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Retreat Details Section */}
        {(retreat.retreat_style || retreat.location || retreat.duration || retreat.difficulty_level) && (
          <div className="flex flex-row items-start gap-2 self-stretch">
            {/* Timeline */}
            <div className="flex flex-col justify-center items-center gap-2 self-stretch w-[19px]">
              <div className="flex flex-row justify-center items-center gap-2.5 w-2 h-7">
                <div className="w-2 h-2 bg-[#181D27] rounded-full flex-1" />
              </div>
              <div className="flex-1 w-0 border-l border-[#A4A7AE]" />
            </div>

            {/* Content */}
            <div className="flex flex-col items-start gap-4 flex-1">
              <h3 className="text-lg font-semibold leading-7 text-[#252B37] font-avenir">
                Retreat Details
              </h3>

              {/* Detail Cards */}
              <div className="flex flex-col items-start gap-4 self-stretch">
                {retreat.retreat_style && (
                  <div className="flex flex-row items-start p-4 gap-6 self-stretch bg-white border border-[#D2D6DB] rounded-lg">
                    <span className="w-20 text-base font-semibold leading-6 text-[#111927] font-avenir">
                      Style
                    </span>
                    <p className="flex-1 text-base font-normal leading-6 text-[#384250] font-avenir">
                      {retreat.retreat_style}
                    </p>
                  </div>
                )}

                {retreat.location && (
                  <div className="flex flex-row items-start p-4 gap-6 self-stretch bg-white border border-[#D2D6DB] rounded-lg">
                    <span className="w-20 text-base font-semibold leading-6 text-[#111927] font-avenir">
                      Location
                    </span>
                    <p className="flex-1 text-base font-normal leading-6 text-[#384250] font-avenir">
                      {retreat.location}
                    </p>
                  </div>
                )}

                {retreat.duration && (
                  <div className="flex flex-row items-start p-4 gap-6 self-stretch bg-white border border-[#D2D6DB] rounded-lg">
                    <span className="w-20 text-base font-semibold leading-6 text-[#111927] font-avenir">
                      Duration
                    </span>
                    <p className="flex-1 text-base font-normal leading-6 text-[#384250] font-avenir">
                      {retreat.duration}
                    </p>
                  </div>
                )}

                {retreat.difficulty_level && (
                  <div className="flex flex-row items-start p-4 gap-6 self-stretch bg-white border border-[#D2D6DB] rounded-lg">
                    <span className="w-20 text-base font-semibold leading-6 text-[#111927] font-avenir">
                      Level
                    </span>
                    <p className="flex-1 text-base font-normal leading-6 text-[#384250] font-avenir">
                      {retreat.difficulty_level}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
