'use client';

import { LiveScheduleDay } from '@/types/retreat';
import HappeningNowCard from '../HappeningNowCard';

interface LiveScheduleCardProps {
  liveSchedule: LiveScheduleDay[];
}

export default function LiveScheduleCard({ liveSchedule }: LiveScheduleCardProps) {
  if (!liveSchedule || liveSchedule.length === 0) {
    return null;
  }

  // Find any happening now sessions
  const happeningNowSession = liveSchedule
    .flatMap(day => day.sessions)
    .find(session => session.is_happening_now);

  return (
    <div className="flex flex-col items-start gap-4">
      {/* Happening Now Card */}
      {happeningNowSession && (
        <HappeningNowCard session={happeningNowSession} variant="default" />
      )}

      {/* Live Schedule Card */}
      <div className="flex flex-col items-start p-6 gap-6 bg-white border border-[#D2D6DB] rounded-lg self-stretch">
        {/* Card Title */}
        <h3 className="text-2xl font-semibold text-black font-avenir">
          Live Schedule
        </h3>

        {/* Schedule Days */}
        <div className="flex flex-col items-start gap-6 self-stretch">
          {liveSchedule.map((day, dayIndex) => (
          <div key={dayIndex} className="flex flex-col items-start gap-4 self-stretch">
            {/* Day Header */}
            <div className="flex flex-row items-center gap-2">
              {/* Dot indicator for live day */}
              {day.is_live && (
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              )}
              <h4 className="text-lg font-semibold text-black font-avenir">
                {day.date}, {day.day_label}
              </h4>
              {day.is_live && (
                <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded-full">
                  LIVE
                </span>
              )}
            </div>

            {/* Sessions */}
            <div className="flex flex-col items-start gap-3 self-stretch pl-4">
              {day.sessions.map((session, sessionIndex) => (
                <div
                  key={sessionIndex}
                  className="flex flex-row items-start gap-4 self-stretch"
                >
                  {/* Time */}
                  <div className="w-20 flex-shrink-0">
                    <span className="text-base font-semibold text-[#384250] font-avenir">
                      {session.time}
                    </span>
                  </div>

                  {/* Session Title */}
                  <div className="flex-1">
                    <p className="text-base font-normal text-[#384250] font-avenir leading-6">
                      {session.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
