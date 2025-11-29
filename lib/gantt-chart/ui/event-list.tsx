'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Event } from '../usecase/types';

interface EventListProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
  onReorder: (activeId: string, overId: string) => void;
  selectedEventId: string | null;
}

export default function EventList({
  events,
  onSelectEvent,
  onReorder,
  selectedEventId
}: EventListProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const startYRef = useRef(0);
  const activeIdRef = useRef<string | null>(null);
  const overIdRef = useRef<string | null>(null);

  const clearLongPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const endDrag = useCallback(() => {
    clearLongPress();
    activeIdRef.current = null;
    overIdRef.current = null;
    setDraggingId(null);
    setDragOverId(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const updateOverTarget = useCallback((pointerY: number) => {
    let closestId: string | null = null;
    let closestDistance = Number.POSITIVE_INFINITY;

    itemRefs.current.forEach((node, id) => {
      const rect = node.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const distance = Math.abs(pointerY - centerY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestId = id;
      }
    });

    if (closestId && closestId !== overIdRef.current) {
      overIdRef.current = closestId;
      setDragOverId(closestId);
    }
  }, []);

  const startDrag = useCallback((eventId: string) => {
    activeIdRef.current = eventId;
    overIdRef.current = eventId;
    setDraggingId(eventId);
    setDragOverId(eventId);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, []);

  const handlePointerDown = (eventId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();

    clearLongPress();
    startYRef.current = e.clientY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!activeIdRef.current) {
        if (Math.abs(moveEvent.clientY - startYRef.current) > 6) {
          clearLongPress();
        }
        return;
      }

      moveEvent.preventDefault();
      updateOverTarget(moveEvent.clientY);
    };

    const handlePointerUp = () => {
      clearLongPress();
      if (activeIdRef.current && overIdRef.current && activeIdRef.current !== overIdRef.current) {
        onReorder(activeIdRef.current, overIdRef.current);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      endDrag();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    longPressTimer.current = window.setTimeout(() => startDrag(eventId), 180);
  };

  return (
    <div className="flex flex-col bg-white">
      {events.map((event) => {
        const isSelected = selectedEventId === event.id;
        const isDragging = draggingId === event.id;
        const isDragOver = dragOverId === event.id && draggingId !== event.id;

        return (
          <div
            key={event.id}
            ref={(node) => {
              if (node) {
                itemRefs.current.set(event.id, node);
              } else {
                itemRefs.current.delete(event.id);
              }
            }}
            className={`w-48 h-14 border-r-2 border-b border-gray-200 px-3 cursor-pointer transition-all flex items-center ${
              isSelected
                ? 'bg-blue-50 border-r-blue-500'
                : 'bg-white hover:bg-gray-50'
            } ${isDragging ? 'opacity-60' : ''} ${isDragOver ? 'ring-2 ring-blue-300' : ''}`}
            onClick={() => onSelectEvent(event)}
          >
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                className="p-2 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 active:bg-gray-100"
                aria-label="Long press to reorder"
                onPointerDown={(pointerEvent) => handlePointerDown(event.id, pointerEvent)}
                onClick={(clickEvent) => clickEvent.preventDefault()}
              >
                <span className="block h-3 w-4 relative">
                  <span className="absolute inset-x-0 top-0 h-0.5 bg-gray-500 rounded-sm" />
                  <span className="absolute inset-x-0 top-1.5 h-0.5 bg-gray-500 rounded-sm" />
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-500 rounded-sm" />
                </span>
              </button>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{event.name}</div>
                {event.description && (
                  <div className="text-xs text-gray-500 truncate mt-1">{event.description}</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {events.length === 0 && (
        <div className="w-48 border-r-2 border-gray-200 bg-white px-4 py-8 text-center text-gray-400 text-sm">
          No events
        </div>
      )}
    </div>
  );
}
