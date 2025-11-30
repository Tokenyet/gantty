'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useEventStore } from '../presenter/event_store';
import { useGroupStore } from '../presenter/group_store';
import { useTimelineStore } from '../presenter/timeline_store';
import { useFilterStore } from '../presenter/filter_store';
import { useVersionStore } from '../presenter/version_store';
import { Event, CreateEventData, UpdateEventData } from '../usecase/types';
import { differenceInDays } from '@/lib/shared/utils/date';
import TimelineHeader from './timeline-header';
import EventList from './event-list';
import TimelineGrid from './timeline-grid';
import EventForm from './event-form';
import SearchBar from './search-bar';
import GroupFilter from './group-filter';
import TimeControls from './time-controls';
import VersionList from './version-list';
import GroupManager from './group-manager';
import { useProjectStore } from '@/lib/projects/presenter/project_store';
import { eventRepository, groupRepository } from '../repository';

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
    selectEvent,
    reorderEvents
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
    calculateFromEvents,
    viewMode,
    dayWidth,
    focusPeriod
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

  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVersionListOpen, setIsVersionListOpen] = useState(false);
  const [isSaveVersionOpen, setIsSaveVersionOpen] = useState(false);
  const [isGroupManagerOpen, setIsGroupManagerOpen] = useState(false);
  const [isGroupFilterOpen, setIsGroupFilterOpen] = useState(false);
  const [versionNote, setVersionNote] = useState('');
  const activeProjectId = useProjectStore((state) => state.activeProjectId);
  const activeProject = useProjectStore((state) =>
    state.projects.find((p) => p.id === state.activeProjectId) || null
  );

  // Track if groups have been initialized to prevent re-initialization
  const groupsInitialized = useRef(false);
  const timelineSignatureRef = useRef('');
  const groupFilterRef = useRef<HTMLDivElement>(null);

  // Drag-to-pan state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const scrollStartPos = useRef({ left: 0, top: 0 });

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    selectEvent(null);
  }, [selectEvent]);

  // Load data when the active project changes (or on first mount once it is set)
  useEffect(() => {
    if (!activeProjectId) {
      return;
    }

    groupsInitialized.current = false;
    timelineSignatureRef.current = '';

    loadGroups();
    loadEvents();
    loadVersions();
  }, [activeProjectId, loadGroups, loadEvents, loadVersions]);

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
        } else if (isGroupFilterOpen) {
          setIsGroupFilterOpen(false);
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
  }, [isFormOpen, isSaveVersionOpen, isVersionListOpen, isGroupManagerOpen, isGroupFilterOpen, handleCloseForm]);

  // Close group filter popover when clicking outside
  useEffect(() => {
    if (!isGroupFilterOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!groupFilterRef.current) return;
      const target = event.target as Node | null;
      if (target && !groupFilterRef.current.contains(target)) {
        setIsGroupFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isGroupFilterOpen]);

  // Initialize all groups as visible when groups first load (only once)
  useEffect(() => {
    if (groups.length === 0) return;

    // Ensure groups are visible when first loaded or after a project switch.
    if (!groupsInitialized.current || visibleGroupIds.size === 0) {
      setAllGroupsVisibility(true, groups.map(g => g.id));
      groupsInitialized.current = true;
    }
  }, [groups, visibleGroupIds.size, setAllGroupsVisibility]);

  // Apply filters when events, search keyword, or visible groups change
  useEffect(() => {
    applyFilters(events);
  }, [events, searchKeyword, visibleGroupIds, applyFilters]);

  // Determine which events to display
  // If no groups are selected (size === 0), show empty list
  // If some groups are filtered (size < groups.length) or search is active, show filtered results
  // Otherwise show all events
  const displayEvents = useMemo(() => {
    if (visibleGroupIds.size === 0) {
      return [];
    }

    if (searchKeyword || visibleGroupIds.size < groups.length) {
      return filteredEvents;
    }

    return events;
  }, [visibleGroupIds, searchKeyword, groups.length, filteredEvents, events]);

  // Calculate timeline when events change
  useEffect(() => {
    const signature = (displayEvents.length === 0)
      ? 'empty'
      : displayEvents.map((e) => `${e.id}-${e.startDate}-${e.endDate}`).join('|');

    if (signature === timelineSignatureRef.current) return;
    timelineSignatureRef.current = signature;

    calculateFromEvents(displayEvents);
  }, [displayEvents, calculateFromEvents]);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag with primary button (usually left click)
    if (!e.isPrimary || e.button !== 0) return;

    const target = e.target as HTMLElement;

    // Don't start panning when interacting with non-pan zones (e.g. event list)
    if (target.closest('[data-prevent-pan="true"]')) {
      return;
    }

    // Don't drag if clicking on form elements
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.closest('button') // Check for nested elements in buttons
    ) {
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) return;

    isDragging.current = true;
    hasDragged.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    scrollStartPos.current = { left: container.scrollLeft, top: container.scrollTop };

    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';

    // Capture pointer to track movement even outside container
    container.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const dx = dragStartPos.current.x - e.clientX;
    const dy = dragStartPos.current.y - e.clientY;

    // Mark as dragged if moved more than 3 pixels
    if (!hasDragged.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      hasDragged.current = true;
    }

    if (hasDragged.current) {
      // Manually update scroll position for immediate feedback
      // We can still use RAF if we want, but direct update is often fine for scroll
      // Let's stick to RAF for smoothness if possible, but we need to be careful with React events
      // Actually, direct assignment is usually fine for scrollLeft/Top
      container.scrollLeft = scrollStartPos.current.left + dx;
      container.scrollTop = scrollStartPos.current.top + dy;

      e.preventDefault();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      const container = scrollContainerRef.current;
      if (container) {
        container.releasePointerCapture(e.pointerId);
        container.style.cursor = 'grab';
        container.style.userSelect = '';
      }
    }

    isDragging.current = false;
    // Note: hasDragged is reset in onClickCapture or next down
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    // Prevent clicks if we just finished dragging
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDragged.current = false;
    }
  };


  const handleFocusEvent = (event: Event) => {
    selectEvent(event);

    if (scrollContainerRef.current) {
      const startOffset = differenceInDays(event.startDate, visibleStart);
      const left = startOffset * dayWidth;
      const containerWidth = scrollContainerRef.current.clientWidth;

      // Scroll to center the event start
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, left - containerWidth / 2 + 100),
        behavior: 'smooth'
      });
    }
  };

  const handleCreateEvent = () => {
    selectEvent(null);
    setIsFormOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    selectEvent(event);
    setIsFormOpen(true);
  };

  const handleSaveEvent = async (data: CreateEventData | UpdateEventData) => {
    if (selectedEvent) {
      await updateEvent(selectedEvent.id, data);
    } else {
      const createData = data as CreateEventData;
      await createEvent({
        name: createData.name,
        description: createData.description,
        startDate: createData.startDate,
        endDate: createData.endDate,
        groupId: createData.groupId
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id);
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

        // Replace stored data directly, then refresh UI state
        await groupRepository.replaceAll(data.groups);
        await eventRepository.replaceAll(data.events);
        await loadGroups();
        await loadEvents();

        // Ensure all imported groups start as visible
        setAllGroupsVisibility(true, data.groups.map((g: { id: string }) => g.id));

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

  const handleBack = () => {
    const confirmed = window.confirm('Please ensure your changes are saved before returning to the project list. Are you sure you want to leave?');
    if (confirmed) {
      router.push('/');
    }
  };

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
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 rounded-full border border-gray-300 bg-white p-2 text-gray-700 shadow-sm transition hover:border-gray-400 hover:text-gray-900"
            title="Back to projects"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeProject ? `${activeProject.name} — Gantt` : 'Gantt Chart'}
            </h1>
            <p className="text-sm text-gray-500">
              {activeProject
                ? 'Changes are stored in this project only.'
                : 'Pick a project to start planning.'}
            </p>
          </div>
        </div>
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
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[260px] max-w-xl">
            <SearchBar onSearch={handleFilterChange} />
          </div>
          <div ref={groupFilterRef} className="relative">
            <button
              onClick={() => setIsGroupFilterOpen((open) => !open)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-gray-400 hover:bg-gray-50"
            >
              <span>Groups</span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                {visibleGroupIds.size}/{groups.length || 0}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className={`h-4 w-4 transition-transform ${isGroupFilterOpen ? 'rotate-180' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {isGroupFilterOpen && (
              <div className="absolute right-0 z-30 mt-2 w-72 max-w-sm">
                <GroupFilter
                  groups={groups}
                  onFilterChange={handleFilterChange}
                  className="w-full max-h-[60vh]"
                />
              </div>
            )}
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
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto relative"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
        style={{ touchAction: 'none', cursor: 'grab' }}
      >
        {visibleStart && visibleEnd && (
          <div className="min-w-full w-max">
            <TimelineHeader
              startDate={visibleStart}
              endDate={visibleEnd}
              viewMode={viewMode}
              dayWidth={dayWidth}
            />

            <div className="flex relative">
              <div
                className="sticky left-0 z-20 bg-white flex-shrink-0"
                data-prevent-pan="true"
              >
                <EventList
                  events={displayEvents}
                  onSelectEvent={handleFocusEvent}
                  onReorder={reorderEvents}
                  selectedEventId={selectedEvent?.id || null}
                />
              </div>
              <TimelineGrid
                events={displayEvents}
                groups={groups}
                startDate={visibleStart}
                totalDays={totalDays}
                onSelectEvent={handleEditEvent}
                viewMode={viewMode}
                dayWidth={dayWidth}
                focusPeriod={focusPeriod}
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
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Version Note
              </label>
              <textarea
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                placeholder="Describe the changes in this version..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500 font-medium"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveVersion}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsSaveVersionOpen(false);
                  setVersionNote('');
                }}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
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
