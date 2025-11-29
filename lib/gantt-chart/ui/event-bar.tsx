'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Event } from '../usecase/types';

interface EventBarProps {
  event: Event;
  color: string;
  startOffset: number;
  duration: number;
  onClick: () => void;
  dayWidth: number;
}

const EventBar = React.memo(function EventBar({
  event,
  color,
  startOffset,
  duration,
  onClick,
  dayWidth
}: EventBarProps) {
  const left = startOffset * dayWidth;
  const width = duration * dayWidth;
  const barRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [hasPosition, setHasPosition] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const updateTooltipPosition = useCallback(() => {
    const barEl = barRef.current;
    const tooltipEl = tooltipRef.current;
    if (!barEl || !tooltipEl) return;

    const barRect = barEl.getBoundingClientRect();
    const tooltipRect = tooltipEl.getBoundingClientRect();

    const margin = 10;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default placement: above and to the right of the bar
    let top = barRect.top - tooltipRect.height - margin;
    let left = barRect.right + margin;

    // If overflowing on the right, try left side
    if (left + tooltipRect.width > viewportWidth - margin) {
      left = barRect.left - tooltipRect.width - margin;
    }

    // Clamp horizontally inside viewport
    left = Math.max(margin, Math.min(left, viewportWidth - tooltipRect.width - margin));

    // If above placement is out of view, move below the bar
    if (top < margin) {
      top = barRect.bottom + margin;
    }

    // Clamp vertically inside viewport
    if (top + tooltipRect.height > viewportHeight - margin) {
      top = Math.max(margin, viewportHeight - tooltipRect.height - margin);
    }

    setTooltipPosition({ top, left });
    setHasPosition(true);
  }, []);

  useLayoutEffect(() => {
    if (!isTooltipVisible) return;

    updateTooltipPosition();

    const handleReposition = () => updateTooltipPosition();
    window.addEventListener('resize', handleReposition);
    document.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      document.removeEventListener('scroll', handleReposition, true);
    };
  }, [isTooltipVisible, updateTooltipPosition]);

  return (
    <>
      <div
        ref={barRef}
        className="absolute top-1 bottom-1 rounded-lg px-3 py-1.5 cursor-pointer hover:opacity-90 transition-all hover:shadow-lg border border-opacity-20 border-black"
        style={{
          left: `${left}px`,
          width: `${width}px`,
          backgroundColor: color,
          minWidth: `${dayWidth}px`
        }}
        onClick={onClick}
        onMouseEnter={() => {
          setIsTooltipVisible(true);
          setHasPosition(false);
        }}
        onMouseLeave={() => {
          setIsTooltipVisible(false);
          setHasPosition(false);
        }}
        onMouseMove={() => {
          if (isTooltipVisible) {
            updateTooltipPosition();
          }
        }}
      >
        <div className="text-white text-xs font-semibold truncate drop-shadow-sm">
          {event.name}
        </div>
      </div>

      {isTooltipVisible && (
        <div
          ref={tooltipRef}
          className="fixed bg-gray-900 text-white text-xs rounded-xl shadow-2xl px-4 py-3 max-w-xs border border-gray-700/70 pointer-events-none transition-opacity duration-150"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            opacity: hasPosition ? 1 : 0,
            zIndex: 60
          }}
        >
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="text-sm">📌</span>
              <div className="leading-5">
                <div className="text-gray-300 uppercase text-[10px] tracking-wide">event</div>
                <div className="font-semibold break-words">{event.name}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm">📅</span>
              <div className="leading-5">
                <div className="text-gray-300 uppercase text-[10px] tracking-wide">start</div>
                <div className="font-medium">{event.startDate}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm">🏁</span>
              <div className="leading-5">
                <div className="text-gray-300 uppercase text-[10px] tracking-wide">end</div>
                <div className="font-medium">{event.endDate}</div>
              </div>
            </div>
            {event.description && (
              <div className="flex items-start gap-2">
                <span className="text-sm">📝</span>
                <div className="leading-5">
                  <div className="text-gray-300 uppercase text-[10px] tracking-wide">desc</div>
                  <div className="font-medium break-words whitespace-pre-wrap">
                    {event.description}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

export default EventBar;
