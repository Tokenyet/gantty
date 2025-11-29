import { EventRepository } from '../usecase/event_repository';
import { Event, CreateEventData, UpdateEventData } from '../usecase/types';
import { StorageService } from './storage_service';
import { NotFoundError, ValidationError } from '../usecase/errors';
import { validateDateRange, validateNonEmpty, validateLength, validateISODate } from '@/lib/shared/utils/validation';

// Simple UUID v4 generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const EVENTS_KEY = 'events_v1';

interface StoredEvents {
  version: string;
  lastUpdated: string;
  data: Event[];
}

export class EventRepositoryImpl implements EventRepository {
  constructor(
    private storage: StorageService,
    private getGroupById: (id: string) => Promise<boolean> // Function to check if group exists
  ) {}

  async getAll(): Promise<Event[]> {
    const stored = await this.storage.get<StoredEvents>(EVENTS_KEY);
    return stored?.data || [];
  }

  async getById(id: string): Promise<Event | null> {
    const events = await this.getAll();
    return events.find(e => e.id === id) || null;
  }

  async create(data: CreateEventData): Promise<Event> {
    // Validate input
    validateNonEmpty(data.name, 'name');
    validateLength(data.name, 'name', 1, 200);
    validateLength(data.description, 'description', 0, 1000);
    validateISODate(data.startDate, 'startDate');
    validateISODate(data.endDate, 'endDate');
    validateDateRange(data.startDate, data.endDate);

    // Check if group exists
    const groupExists = await this.getGroupById(data.groupId);
    if (!groupExists) {
      throw new ValidationError(
        `Group with id ${data.groupId} not found`,
        'groupId',
        'exists'
      );
    }

    const now = new Date().toISOString();
    const event: Event = {
      id: generateUUID(),
      name: data.name.trim(),
      description: data.description.trim(),
      startDate: data.startDate,
      endDate: data.endDate,
      groupId: data.groupId,
      createdAt: now,
      updatedAt: now
    };

    const events = await this.getAll();
    events.push(event);
    await this.saveEvents(events);

    return event;
  }

  async update(id: string, data: UpdateEventData): Promise<Event> {
    const events = await this.getAll();
    const index = events.findIndex(e => e.id === id);

    if (index === -1) {
      throw new NotFoundError('Event', id);
    }

    const existingEvent = events[index];
    const updated: Event = { ...existingEvent };

    // Apply updates
    if (data.name !== undefined) {
      validateNonEmpty(data.name, 'name');
      validateLength(data.name, 'name', 1, 200);
      updated.name = data.name.trim();
    }

    if (data.description !== undefined) {
      validateLength(data.description, 'description', 0, 1000);
      updated.description = data.description.trim();
    }

    if (data.startDate !== undefined) {
      validateISODate(data.startDate, 'startDate');
      updated.startDate = data.startDate;
    }

    if (data.endDate !== undefined) {
      validateISODate(data.endDate, 'endDate');
      updated.endDate = data.endDate;
    }

    if (data.groupId !== undefined) {
      const groupExists = await this.getGroupById(data.groupId);
      if (!groupExists) {
        throw new ValidationError(
          `Group with id ${data.groupId} not found`,
          'groupId',
          'exists'
        );
      }
      updated.groupId = data.groupId;
    }

    // Validate date range after potential updates
    validateDateRange(updated.startDate, updated.endDate);

    updated.updatedAt = new Date().toISOString();
    events[index] = updated;

    await this.saveEvents(events);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const events = await this.getAll();
    const filtered = events.filter(e => e.id !== id);

    if (filtered.length === events.length) {
      return false; // Event not found
    }

    await this.saveEvents(filtered);
    return true;
  }

  async getByGroupId(groupId: string): Promise<Event[]> {
    const events = await this.getAll();
    return events.filter(e => e.groupId === groupId);
  }

  async reorder(orderedEvents: Event[]): Promise<void> {
    const existing = await this.getAll();

    if (orderedEvents.length !== existing.length) {
      throw new ValidationError('Event order payload is invalid', 'order', 'length_mismatch');
    }

    const existingIds = new Set(existing.map((e) => e.id));
    const seen = new Set<string>();

    for (const event of orderedEvents) {
      if (!existingIds.has(event.id) || seen.has(event.id)) {
        throw new ValidationError('Event order payload is invalid', 'order', 'invalid_id');
      }
      seen.add(event.id);
    }

    await this.saveEvents(orderedEvents);
  }

  async replaceAll(events: Event[]): Promise<void> {
    const seen = new Set<string>();

    for (const event of events) {
      if (seen.has(event.id)) {
        throw new ValidationError('Event snapshot contains duplicate ids', 'events', 'duplicate_id');
      }
      seen.add(event.id);
    }

    await this.saveEvents(events);
  }

  private async saveEvents(events: Event[]): Promise<void> {
    const stored: StoredEvents = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      data: events
    };
    await this.storage.set(EVENTS_KEY, stored);
  }
}
