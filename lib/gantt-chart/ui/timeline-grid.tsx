'use client';

import React from 'react';
import { Event, Group, FocusPeriod } from '../usecase/types';
import { differenceInDays } from '@/lib/shared/utils/date';
import EventBar from './event-bar';

import { ViewMode } from '../presenter/timeline_store';

interface TimelineGridProps {
  events: Event[];
  groups: Group[];
  startDate: string;
  endDate: string;
  totalDays: number;
  onSelectEvent: (event: Event) => void;
  viewMode: ViewMode;
  dayWidth: number;
  focusPeriod?: FocusPeriod | null;
}

export default function TimelineGrid({
  events,
  groups,
  startDate,
  endDate,
  totalDays,
  onSelectEvent,
  viewMode,
  dayWidth,
  focusPeriod
}: TimelineGridProps) {
  // Create a map of groups for quick lookup
  const groupMap = new Map(groups.map(g => [g.id, g]));

  // Calculate today's position
  const today = new Date().toISOString().split('T')[0];
  const todayOffset = differenceInDays(today, startDate);
  const isTodayVisible = todayOffset >= 0 && todayOffset < totalDays;

  // Calculate guide line positions based on viewMode
  const guideLinePositions: number[] = [];

  if (viewMode === 'day') {
    // Every 5 days
    for (let i = 5; i < totalDays; i += 5) {
      guideLinePositions.push(i);
    }
  } else if (viewMode === 'week') {
    // Every week (Monday)
    const start = new Date(startDate);
    for (let i = 0; i < totalDays; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      if (current.getDay() === 1) { // Monday
        guideLinePositions.push(i);
      }
    }
  } else if (viewMode === 'month') {
    // Every month (1st)
    const start = new Date(startDate);
    for (let i = 0; i < totalDays; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      if (current.getDate() === 1) { // 1st of month
        guideLinePositions.push(i);
      }
    }
  }

  // Calculate focus period overlay
  let focusOverlay: { left: number; width: number } | null = null;
  if (focusPeriod) {
    const focusStartOffset = differenceInDays(focusPeriod.start, startDate);
    const focusEndOffset = differenceInDays(focusPeriod.end, startDate);
    const focusStartDay = Math.max(0, focusStartOffset);
    const focusEndDay = Math.min(totalDays - 1, focusEndOffset);

    if (focusEndDay >= 0 && focusStartDay < totalDays) {
      focusOverlay = {
        left: focusStartDay * dayWidth,
        width: (focusEndDay - focusStartDay + 1) * dayWidth
      };
    }
  }

  return (
    <div
      className="flex flex-col relative bg-white"
      style={{ minWidth: `${totalDays * dayWidth}px` }}
    >
      {/* Focus period highlight */}
      {focusOverlay && (
        <div
          className="absolute top-0 bottom-0 bg-blue-50 opacity-30 z-5 pointer-events-none"
          style={{
            left: `${focusOverlay.left}px`,
            width: `${focusOverlay.width}px`
          }}
        />
      )}

      {/* Today line - spans entire height */}
      {isTodayVisible && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-15 pointer-events-none"
          style={{ left: `${todayOffset * dayWidth}px` }}
        />
      )}

      {/* Guide lines - spans entire height */}
      {guideLinePositions.map((position) => (
        <div
          key={position}
          className="absolute top-0 bottom-0 w-px bg-gray-300 opacity-30 z-5 pointer-events-none"
          style={{
            left: `${position * dayWidth}px`,
            borderLeft: '1px dashed #9CA3AF'
          }}
        />
      ))}

      {events.map((event) => {
        const group = groupMap.get(event.groupId);
        const color = group?.color || '#9CA3AF';

        // Calculate grid position
        const startOffset = differenceInDays(event.startDate, startDate);
        const duration = differenceInDays(event.endDate, event.startDate) + 1;

        return (
          <div
            key={event.id}
            className="relative border-b border-gray-200"
            style={{ minHeight: '48px' }}
          >
            {/* Day grid cells */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: totalDays }, (_, i) => (
                <div
                  key={i}
                  className={`border-r border-gray-100 box-border ${viewMode === 'month' ? 'border-r-0' : ''
                    }`}
                  style={{
                    width: `${dayWidth}px`,
                    minWidth: `${dayWidth}px`,
                    borderRightWidth: viewMode === 'month' ? '0px' : '1px'
                  }}
                />
              ))}
            </div>

            {/* Event bar */}
            <EventBar
              event={event}
              color={color}
              startOffset={startOffset}
              duration={duration}
              onClick={() => onSelectEvent(event)}
              dayWidth={dayWidth}
            />
          </div>
        );
      })}

      {events.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          No events to display
        </div>
      )}
    </div>
  );
}
