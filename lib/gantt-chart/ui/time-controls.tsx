'use client';

import { useState } from 'react';
import { useTimelineStore } from '../presenter/timeline_store';
import { useEventStore } from '../presenter/event_store';

export default function TimeControls() {
  const { panTimeline, showAll, focusPeriod, setFocusPeriod } = useTimelineStore();
  const { events } = useEventStore();
  
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [focusStart, setFocusStart] = useState('');
  const [focusEnd, setFocusEnd] = useState('');
  const [focusError, setFocusError] = useState('');

  const handlePanLeft = () => {
    panTimeline(-7); // Pan 7 days left
  };

  const handlePanRight = () => {
    panTimeline(7); // Pan 7 days right
  };

  const handleShowAll = () => {
    showAll(events);
  };

  const handleOpenFocusModal = () => {
    if (focusPeriod) {
      setFocusStart(focusPeriod.start);
      setFocusEnd(focusPeriod.end);
    } else {
      setFocusStart('');
      setFocusEnd('');
    }
    setFocusError('');
    setShowFocusModal(true);
  };

  const handleApplyFocus = () => {
    if (!focusStart || !focusEnd) {
      setFocusError('Both start and end dates are required');
      return;
    }

    if (focusEnd < focusStart) {
      setFocusError('End date must be greater than or equal to start date');
      return;
    }

    setFocusPeriod({ start: focusStart, end: focusEnd });
    setShowFocusModal(false);
  };

  const handleClearFocus = () => {
    setFocusPeriod(null);
    setShowFocusModal(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handlePanLeft}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium flex items-center gap-1"
          title="Pan left 7 days"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Earlier
        </button>
        
        <button
          onClick={handleShowAll}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
          title="Show all events"
        >
          Show All
        </button>
        
        <button
          onClick={handlePanRight}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium flex items-center gap-1"
          title="Pan right 7 days"
        >
          Later
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          onClick={handleOpenFocusModal}
          className={`px-3 py-1.5 border rounded text-sm font-medium ${
            focusPeriod
              ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
              : 'bg-white border-gray-300 hover:bg-gray-50'
          }`}
          title="Set focus period"
        >
          {focusPeriod ? 'Focus Period Active' : 'Set Focus Period'}
        </button>

        {focusPeriod && (
          <button
            onClick={handleClearFocus}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium text-gray-600"
            title="Clear focus period"
          >
            Clear Focus
          </button>
        )}
      </div>

      {/* Focus Period Modal */}
      {showFocusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Set Focus Period</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={focusStart}
                  onChange={(e) => setFocusStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={focusEnd}
                  onChange={(e) => setFocusEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {focusError && (
                <div className="text-sm text-red-600">
                  {focusError}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleApplyFocus}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                Apply
              </button>
              <button
                onClick={() => setShowFocusModal(false)}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
