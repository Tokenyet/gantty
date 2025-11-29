'use client';

import { Event } from '../usecase/types';

interface EventListProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  selectedEventId: string | null;
}

export default function EventList({ events, onSelectEvent, selectedEventId }: EventListProps) {
  return (
    <div className="flex flex-col" style={{ contain: 'layout style' }}>
      {events.map((event) => (
        <div
          key={event.id}
          className={`sticky left-0 z-10 w-48 border-r border-b border-gray-200 bg-white px-4 py-3 cursor-pointer hover:bg-gray-50 shadow-sm ${
            selectedEventId === event.id ? 'bg-blue-50' : ''
          }`}
          style={{ minHeight: '48px' }}
          onClick={() => onSelectEvent(event)}
        >
          <div className="text-sm font-medium truncate">{event.name}</div>
          {event.description && (
            <div className="text-xs text-gray-500 truncate">{event.description}</div>
          )}
        </div>
      ))}
      
      {events.length === 0 && (
        <div className="sticky left-0 z-10 w-48 border-r border-gray-200 bg-white px-4 py-8 text-center text-gray-400 text-sm">
          No events
        </div>
      )}
    </div>
  );
}
