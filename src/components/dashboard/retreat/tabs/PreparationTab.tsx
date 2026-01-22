'use client';

import { Retreat } from '@/types/retreat';
import PreparationCard from './PreparationCard';
import LiveScheduleCard from './LiveScheduleCard';

interface PreparationTabProps {
  retreat: Retreat;
}

export default function PreparationTab({ retreat }: PreparationTabProps) {
  const hasContent = (retreat.preparation_instructions && retreat.preparation_instructions.length > 0) ||
                     (retreat.live_schedule && retreat.live_schedule.length > 0);

  if (!hasContent) {
    return (
      <div className="max-w-[720px] min-h-full">
        <div className="bg-gray-50 border border-[#D2D6DB] rounded-lg p-8 text-center">
          <p className="text-[#717680] font-avenir">
            Preparation instructions will be available soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4 max-w-[720px] min-h-full">
      {/* Live Schedule Card (show first if available) */}
      {retreat.live_schedule && retreat.live_schedule.length > 0 && (
        <LiveScheduleCard liveSchedule={retreat.live_schedule} />
      )}

      {/* Preparation Cards */}
      {retreat.preparation_instructions && retreat.preparation_instructions.map((instruction, index) => (
        <PreparationCard key={index} instruction={instruction} />
      ))}
    </div>
  );
}
