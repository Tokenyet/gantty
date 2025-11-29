'use client';

import { useEffect, useState } from 'react';
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

  // Load data on mount
  useEffect(() => {
    loadGroups();
    loadEvents();
    loadVersions();
  }, [loadGroups, loadEvents, loadVersions]);

  // Initialize all groups as visible when groups load
  useEffect(() => {
    if (groups.length > 0 && visibleGroupIds.size === 0) {
      setAllGroupsVisibility(true, groups.map(g => g.id));
    }
  }, [groups, visibleGroupIds.size, setAllGroupsVisibility]);

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
  const displayEvents = filteredEvents.length > 0 || searchKeyword || visibleGroupIds.size < groups.length
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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gantt Chart</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsGroupManagerOpen(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
          >
            Manage Groups
          </button>
          <button
            onClick={() => setIsVersionListOpen(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium"
          >
            Version History
          </button>
          <button
            onClick={() => setIsSaveVersionOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
          >
            Save Version
          </button>
          <button
            onClick={handleCreateEvent}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            Add Event
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-50 border-b border-gray-300 px-6 py-4">
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
      <div className="flex-1 overflow-auto">
        {visibleStart && visibleEnd && (
          <div className="min-w-full">
            <TimelineHeader startDate={visibleStart} endDate={visibleEnd} />
            
            <div className="flex">
              <EventList
                events={displayEvents}
                onSelectEvent={handleEditEvent}
                selectedEventId={selectedEvent?.id || null}
              />
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Save Version</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Version Note
              </label>
              <textarea
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                placeholder="Describe the changes in this version..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveVersion}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsSaveVersionOpen(false);
                  setVersionNote('');
                }}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 font-medium"
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
