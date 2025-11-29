'use client';

import { Event } from '../usecase/types';

interface EventListProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  selectedEventId: string | null;
}

export default function EventList({ events, onSelectEvent, selectedEventId }: EventListProps) {
  return (
    <div className="flex flex-col bg-white">
      {events.map((event) => (
        <div
          key={event.id}
          className={`w-48 border-r-2 border-b border-gray-200 px-4 py-3 cursor-pointer transition-colors ${
            selectedEventId === event.id 
              ? 'bg-blue-50 border-r-blue-500' 
              : 'bg-white hover:bg-gray-50'
          }`}
          style={{ minHeight: '48px' }}
          onClick={() => onSelectEvent(event)}
        >
          <div className="text-sm font-medium text-gray-900 truncate">{event.name}</div>
          {event.description && (
            <div className="text-xs text-gray-500 truncate mt-1">{event.description}</div>
          )}
        </div>
      ))}
      
      {events.length === 0 && (
        <div className="w-48 border-r-2 border-gray-200 bg-white px-4 py-8 text-center text-gray-400 text-sm">
          No events
        </div>
      )}
    </div>
  );
}
