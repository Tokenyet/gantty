'use client';

import { useEffect, useState, useRef } from 'react';
import { useEventStore } from '../presenter/event_store';
import { useGroupStore } from '../presenter/group_store';
import { useTimelineStore } from '../presenter/timeline_store';
import { useFilterStore } from '../presenter/filter_store';
import { useVersionStore } from '../presenter/version_store';
import { Event } from '../usecase/types';
import TimelineHeader from './timeline-header';
import EventList from './event-list';
import TimelineGrid from './timeline-grid';
import EventForm from './event-form';
import SearchBar from './search-bar';
import GroupFilter from './group-filter';
import TimeControls from './time-controls';
import VersionList from './version-list';
import GroupManager from './group-manager';

export default function GanttChart() {
  const {
    events,
    selectedEvent,
    isLoading: eventsLoading,
    error: eventError,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    selectEvent
  } = useEventStore();

  const {
    groups,
    isLoading: groupsLoading,
    error: groupError,
    loadGroups
  } = useGroupStore();

  const {
    visibleStart,
    visibleEnd,
    totalDays,
    calculateFromEvents
  } = useTimelineStore();

  const {
    searchKeyword,
    visibleGroupIds,
    filteredEvents,
    setAllGroupsVisibility,
    applyFilters
  } = useFilterStore();

  const {
    loadVersions,
    saveVersion
  } = useVersionStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVersionListOpen, setIsVersionListOpen] = useState(false);
  const [isSaveVersionOpen, setIsSaveVersionOpen] = useState(false);
  const [isGroupManagerOpen, setIsGroupManagerOpen] = useState(false);
  const [versionNote, setVersionNote] = useState('');
  
  // Track if groups have been initialized to prevent re-initialization
  const groupsInitialized = useRef(false);
  
  // Drag-to-pan state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const scrollStartPos = useRef({ left: 0, top: 0 });

  // Load data on mount
  useEffect(() => {
    loadGroups();
    loadEvents();
    loadVersions();
  }, [loadGroups, loadEvents, loadVersions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close modals
      if (e.key === 'Escape') {
        if (isFormOpen) {
          handleCloseForm();
        } else if (isSaveVersionOpen) {
          setIsSaveVersionOpen(false);
          setVersionNote('');
        } else if (isVersionListOpen) {
          setIsVersionListOpen(false);
        } else if (isGroupManagerOpen) {
          setIsGroupManagerOpen(false);
        }
      }
      
      // Ctrl+S / Cmd+S to save version
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!isFormOpen && !isVersionListOpen && !isGroupManagerOpen) {
          setIsSaveVersionOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormOpen, isSaveVersionOpen, isVersionListOpen, isGroupManagerOpen]);

  // Initialize all groups as visible when groups first load (only once)
  useEffect(() => {
    if (groups.length > 0 && !groupsInitialized.current) {
      setAllGroupsVisibility(true, groups.map(g => g.id));
      groupsInitialized.current = true;
    }
  }, [groups, setAllGroupsVisibility]);

  // Apply filters when events, search keyword, or visible groups change
  useEffect(() => {
    applyFilters(events);
  }, [events, searchKeyword, visibleGroupIds, applyFilters]);

  // Calculate timeline when events change
  useEffect(() => {
    // Use filtered events for timeline calculation
    const eventsToDisplay = filteredEvents.length > 0 ? filteredEvents : events;
    if (eventsToDisplay.length > 0) {
      calculateFromEvents(eventsToDisplay);
    } else {
      // Default timeline if no events
      calculateFromEvents([]);
    }
  }, [filteredEvents, events, calculateFromEvents]);

  // Drag-to-pan handlers
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let rafId: number | null = null;

    const handleMouseDown = (e: MouseEvent) => {
      // Only drag with left mouse button
      if (e.button !== 0) return;
      
      const target = e.target as HTMLElement;
      
      // Don't drag if clicking on form elements
      if (
        target.tagName === 'BUTTON' || 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      isDragging.current = true;
      hasDragged.current = false;
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      scrollStartPos.current = { left: container.scrollLeft, top: container.scrollTop };
      container.style.cursor = 'grabbing';
      container.style.userSelect = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const dx = dragStartPos.current.x - e.clientX;
      const dy = dragStartPos.current.y - e.clientY;

      // Mark as dragged if moved more than 3 pixels
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDragged.current = true;
      }

      if (hasDragged.current) {
        // Use requestAnimationFrame for smoother scrolling
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        
        rafId = requestAnimationFrame(() => {
          container.scrollLeft = scrollStartPos.current.left + dx;
          container.scrollTop = scrollStartPos.current.top + dy;
        });
        
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging.current && hasDragged.current) {
        // Prevent click event from firing after drag
        e.preventDefault();
        e.stopPropagation();
      }
      
      isDragging.current = false;
      hasDragged.current = false;
      container.style.cursor = 'grab';
      container.style.userSelect = '';
      
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Prevent clicks if we just finished dragging
      if (hasDragged.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    container.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    container.addEventListener('click', handleClick, true);

    // Set initial cursor
    container.style.cursor = 'grab';

    return () => {
      container.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
      container.removeEventListener('click', handleClick, true);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const handleCreateEvent = () => {
    selectEvent(null);
    setIsFormOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    selectEvent(event);
    setIsFormOpen(true);
  };

  const handleSaveEvent = async (data: any) => {
    if (selectedEvent) {
      await updateEvent(selectedEvent.id, data);
    } else {
      await createEvent(data);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    selectEvent(null);
  };

  const handleFilterChange = () => {
    applyFilters(events);
  };

  const handleExportData = () => {
    const data = {
      events,
      groups,
      settings: {
        visibleStart,
        visibleEnd,
        searchKeyword,
        focusPeriod: null
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gantt-chart-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Validate data structure
        if (!data.events || !data.groups) {
          alert('Invalid file format');
          return;
        }

        // Import groups first
        for (const group of data.groups) {
          try {
            await createEvent(group);
          } catch (err) {
            console.error('Failed to import group:', err);
          }
        }

        // Import events
        for (const event of data.events) {
          try {
            await createEvent(event);
          } catch (err) {
            console.error('Failed to import event:', err);
          }
        }

        alert('Data imported successfully!');
      } catch (error) {
        alert('Failed to import data: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
  };

  const handleSaveVersion = async () => {
    if (!versionNote.trim()) {
      alert('Please enter a version note');
      return;
    }

    try {
      await saveVersion(versionNote, {
        events,
        groups,
        settings: {
          visibleStart,
          visibleEnd,
          searchKeyword,
          focusPeriod: null
        }
      });
      setIsSaveVersionOpen(false);
      setVersionNote('');
    } catch (error) {
      console.error('Failed to save version:', error);
    }
  };

  const isLoading = eventsLoading || groupsLoading;
  const error = eventError || groupError;

  // Determine which events to display
  // If no groups are selected (size === 0), show empty list
  // If some groups are filtered (size < groups.length) or search is active, show filtered results
  // Otherwise show all events
  const displayEvents = visibleGroupIds.size === 0 
    ? [] 
    : (searchKeyword || visibleGroupIds.size < groups.length)
      ? filteredEvents
      : events;

  if (isLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Gantt Chart</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 hover:border-gray-400 font-semibold transition-colors shadow-sm"
            title="Export data to JSON"
          >
            Export
          </button>
          <label className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 hover:border-gray-400 font-semibold cursor-pointer transition-colors shadow-sm">
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setIsGroupManagerOpen(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 hover:border-gray-400 font-semibold transition-colors shadow-sm"
          >
            Manage Groups
          </button>
          <button
            onClick={() => setIsVersionListOpen(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 hover:border-gray-400 font-semibold transition-colors shadow-sm"
          >
            Version History
          </button>
          <button
            onClick={() => setIsSaveVersionOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition-colors shadow-sm"
            title="Save Version (Ctrl+S)"
          >
            Save Version
          </button>
          <button
            onClick={handleCreateEvent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors shadow-sm"
          >
            Add Event
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex gap-4 items-start">
          <div className="flex-1 max-w-md">
            <SearchBar onSearch={handleFilterChange} />
          </div>
          <div className="w-64">
            <GroupFilter groups={groups} onFilterChange={handleFilterChange} />
          </div>
          <div className="ml-auto">
            <TimeControls />
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Gantt Chart */}
      <div ref={scrollContainerRef} className="flex-1 overflow-auto relative">
        {visibleStart && visibleEnd && (
          <div className="min-w-full">
            <TimelineHeader startDate={visibleStart} endDate={visibleEnd} />
            
            <div className="flex relative">
              <div className="sticky left-0 z-20 bg-white">
                <EventList
                  events={displayEvents}
                  onSelectEvent={handleEditEvent}
                  selectedEventId={selectedEvent?.id || null}
                />
              </div>
              <TimelineGrid
                events={displayEvents}
                groups={groups}
                startDate={visibleStart}
                endDate={visibleEnd}
                totalDays={totalDays}
                onSelectEvent={handleEditEvent}
              />
            </div>
          </div>
        )}
      </div>

      {/* Event Form Modal */}
      {isFormOpen && (
        <EventForm
          event={selectedEvent}
          groups={groups}
          onSave={handleSaveEvent}
          onDelete={selectedEvent ? handleDeleteEvent : undefined}
          onClose={handleCloseForm}
        />
      )}

      {/* Save Version Modal */}
      {isSaveVersionOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Save Version</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Version Note
              </label>
              <textarea
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                placeholder="Describe the changes in this version..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveVersion}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsSaveVersionOpen(false);
                  setVersionNote('');
                }}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version List Modal */}
      {isVersionListOpen && (
        <VersionList onClose={() => setIsVersionListOpen(false)} />
      )}

      {/* Group Manager Modal */}
      {isGroupManagerOpen && (
        <GroupManager onClose={() => setIsGroupManagerOpen(false)} />
      )}
    </div>
  );
}
