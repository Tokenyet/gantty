import { Event, CreateEventData, UpdateEventData } from './types';

/**
 * Repository interface for Event CRUD operations
 */
export interface EventRepository {
  /**
   * Get all events
   * @returns Promise resolving to array of all events
   */
  getAll(): Promise<Event[]>;

  /**
   * Get event by ID
   * @param id - Event ID
   * @returns Promise resolving to event or null if not found
   */
  getById(id: string): Promise<Event | null>;

  /**
   * Create a new event
   * @param data - Event creation data (without id, createdAt, updatedAt)
   * @returns Promise resolving to created event
   * @throws Error if validation fails or groupId invalid
   */
  create(data: CreateEventData): Promise<Event>;

  /**
   * Update an existing event
   * @param id - Event ID to update
   * @param data - Partial event data to update
   * @returns Promise resolving to updated event
   * @throws Error if event not found or validation fails
   */
  update(id: string, data: UpdateEventData): Promise<Event>;

  /**
   * Delete an event
   * @param id - Event ID to delete
   * @returns Promise resolving to true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Get events by group ID
   * @param groupId - Group ID
   * @returns Promise resolving to array of events in that group
   */
  getByGroupId(groupId: string): Promise<Event[]>;

  /**
   * Persist a new ordering for events.
   * @param orderedEvents - Events in the desired order
   */
  reorder(orderedEvents: Event[]): Promise<void>;

  /**
   * Replace all events with the provided list (used for version restore)
   */
  replaceAll(events: Event[]): Promise<void>;
}
