'use client';

import { create } from 'zustand';
import { Event, CreateEventData, UpdateEventData } from '../usecase/types';
import { CreateEventUsecase } from '../usecase/create_event_usecase';
import { UpdateEventUsecase } from '../usecase/update_event_usecase';
import { DeleteEventUsecase } from '../usecase/delete_event_usecase';
import { eventRepository } from '../repository';
import { tryGetActiveProjectId } from '../repository/project_scope';

// Use cases
const createEventUsecase = new CreateEventUsecase(eventRepository);
const updateEventUsecase = new UpdateEventUsecase(eventRepository);
const deleteEventUsecase = new DeleteEventUsecase(eventRepository);

interface EventStoreState {
  // State
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadEvents: () => Promise<void>;
  createEvent: (data: CreateEventData) => Promise<void>;
  updateEvent: (id: string, data: UpdateEventData) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  selectEvent: (event: Event | null) => void;
  reorderEvents: (activeId: string, overId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useEventStore = create<EventStoreState>((set, get) => ({
  // Initial state
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,

  // Actions
  loadEvents: async () => {
    const projectId = tryGetActiveProjectId();
    if (!projectId) {
      set({
        events: [],
        selectedEvent: null,
        isLoading: false,
        error: 'Please select a project'
      });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const events = await eventRepository.getAll();
      set({ events, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createEvent: async (data: CreateEventData) => {
    set({ isLoading: true, error: null });
    try {
      const event = await createEventUsecase.execute(data);
      set((state) => ({
        events: [...state.events, event],
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateEvent: async (id: string, data: UpdateEventData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateEventUsecase.execute(id, data);
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? updated : e)),
        selectedEvent: state.selectedEvent?.id === id ? updated : state.selectedEvent,
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteEvent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteEventUsecase.execute(id);
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
        selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
        isLoading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  selectEvent: (event: Event | null) => {
    set({ selectedEvent: event });
  },

  reorderEvents: async (activeId: string, overId: string) => {
    const currentEvents = get().events;
    const fromIndex = currentEvents.findIndex((e) => e.id === activeId);
    const toIndex = currentEvents.findIndex((e) => e.id === overId);

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return;
    }

    const reordered = [...currentEvents];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    set({ events: reordered });

    try {
      await eventRepository.reorder(reordered);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      events: [],
      selectedEvent: null,
      isLoading: false,
      error: null
    });
  }
}));
