'use client';

import { format, eachDayOfInterval } from '@/lib/shared/utils/date';

interface TimelineHeaderProps {
  startDate: string;
  endDate: string;
}

export default function TimelineHeader({ startDate, endDate }: TimelineHeaderProps) {
  const days = eachDayOfInterval(startDate, endDate);

  return (
    <div className="sticky top-0 z-20 flex bg-white border-b border-gray-300 shadow-md">
      {/* Corner cell */}
      <div className="sticky left-0 z-30 w-48 border-r border-gray-300 bg-gray-50 px-4 py-2 font-semibold shadow-sm">
        Event
      </div>

      {/* Date columns */}
      <div className="flex">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayLabel = format(day, 'MMM d');
          const dayOfWeek = format(day, 'EEE');
          
          return (
            <div
              key={dateStr}
              className="flex flex-col items-center justify-center border-r border-gray-200 px-2 py-1 min-w-[80px]"
            >
              <div className="text-xs text-gray-500">{dayOfWeek}</div>
              <div className="text-sm font-medium">{dayLabel}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
