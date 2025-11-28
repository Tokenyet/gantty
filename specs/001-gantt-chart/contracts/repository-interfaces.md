# Repository Contracts

**Feature**: Gantt Chart Planning Tool  
**Date**: 2025-11-29  
**Purpose**: Define repository interfaces for Clean Architecture layer boundaries

Since this is a local browser application without a backend API, these contracts define the interfaces between the use case layer and the repository layer for data persistence operations.

---

## EventRepository Interface

**Purpose**: Manage CRUD operations for events

```typescript
// lib/gantt-chart/usecase/event_repository.ts

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
}

export interface CreateEventData {
  name: string;
  description: string;
  startDate: string; // ISO 8601 date
  endDate: string;   // ISO 8601 date
  groupId: string;
}

export interface UpdateEventData {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  groupId?: string;
}
```

**Validation Rules** (enforced by repository implementation):
- `endDate` >= `startDate`
- `groupId` must reference existing group
- `name` not empty
- Dates in ISO 8601 format (YYYY-MM-DD)

---

## GroupRepository Interface

**Purpose**: Manage CRUD operations for groups

```typescript
// lib/gantt-chart/usecase/group_repository.ts

export interface GroupRepository {
  /**
   * Get all groups
   * @returns Promise resolving to array of all groups
   */
  getAll(): Promise<Group[]>;

  /**
   * Get group by ID
   * @param id - Group ID
   * @returns Promise resolving to group or null if not found
   */
  getById(id: string): Promise<Group | null>;

  /**
   * Create a new group
   * @param data - Group creation data
   * @returns Promise resolving to created group
   * @throws Error if name already exists or color invalid
   */
  create(data: CreateGroupData): Promise<Group>;

  /**
   * Update an existing group
   * @param id - Group ID to update
   * @param data - Partial group data to update
   * @returns Promise resolving to updated group
   * @throws Error if group not found or validation fails
   */
  update(id: string, data: UpdateGroupData): Promise<Group>;

  /**
   * Delete a group
   * @param id - Group ID to delete
   * @returns Promise resolving to true if deleted
   * @throws Error if group has associated events
   */
  delete(id: string): Promise<boolean>;

  /**
   * Update group visibility (for filtering)
   * @param id - Group ID
   * @param visible - Visibility state
   * @returns Promise resolving to updated group
   */
  setVisibility(id: string, visible: boolean): Promise<Group>;

  /**
   * Initialize default groups (Frontend, Backend, Design)
   * @returns Promise resolving to array of default groups
   */
  initializeDefaults(): Promise<Group[]>;
}

export interface CreateGroupData {
  name: string;
  color: string; // hex #RRGGBB
  order?: number;
}

export interface UpdateGroupData {
  name?: string;
  color?: string;
  order?: number;
}
```

**Validation Rules**:
- Group `name` must be unique
- `color` must be valid hex (#RRGGBB)
- Cannot delete groups with associated events
- Default groups (isDefault: true) can be modified but not deleted

---

## VersionRepository Interface

**Purpose**: Manage version snapshots and history

```typescript
// lib/gantt-chart/usecase/version_repository.ts

export interface VersionRepository {
  /**
   * Get all versions
   * @returns Promise resolving to array of all versions, sorted by number descending
   */
  getAll(): Promise<Version[]>;

  /**
   * Get version by ID
   * @param id - Version ID
   * @returns Promise resolving to version or null if not found
   */
  getById(id: string): Promise<Version | null>;

  /**
   * Get version by number
   * @param number - Version number
   * @returns Promise resolving to version or null if not found
   */
  getByNumber(number: number): Promise<Version | null>;

  /**
   * Create a new version snapshot
   * @param data - Version creation data
   * @returns Promise resolving to created version
   */
  create(data: CreateVersionData): Promise<Version>;

  /**
   * Delete a version
   * @param id - Version ID to delete
   * @returns Promise resolving to true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Get next version number
   * @returns Promise resolving to next sequential version number
   */
  getNextVersionNumber(): Promise<number>;
}

export interface CreateVersionData {
  note: string;
  snapshot: VersionSnapshot;
}

export interface VersionSnapshot {
  events: Event[];
  groups: Group[];
  settings?: DisplaySettings;
}
```

**Validation Rules**:
- Version numbers auto-increment sequentially
- Versions are immutable after creation
- `snapshot` must contain valid event and group arrays

---

## StorageService Interface

**Purpose**: Abstract localStorage operations for external layer

```typescript
// lib/gantt-chart/repository/storage_service.ts

export interface StorageService {
  /**
   * Get item from storage
   * @param key - Storage key
   * @returns Promise resolving to parsed value or null if not found
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set item in storage
   * @param key - Storage key
   * @param value - Value to store (will be JSON stringified)
   * @returns Promise resolving when save completes
   * @throws Error if quota exceeded
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Remove item from storage
   * @param key - Storage key
   * @returns Promise resolving when removal completes
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all storage
   * @returns Promise resolving when clear completes
   */
  clear(): Promise<void>;

  /**
   * Check if storage is available
   * @returns Promise resolving to true if storage is accessible
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get approximate storage usage
   * @returns Promise resolving to usage info
   */
  getUsage(): Promise<StorageUsage>;
}

export interface StorageUsage {
  used: number;      // Bytes used
  available: number; // Bytes available (if known)
  percentage: number; // % of quota used (if known)
}
```

**Error Handling**:
- Throw `QuotaExceededError` when storage full
- Throw `StorageUnavailableError` if localStorage disabled/blocked
- Handle JSON parse errors gracefully

---

## Use Case Interfaces

These define the business operations exposed to the presenter layer.

### Event Use Cases

```typescript
// lib/gantt-chart/usecase/create_event_usecase.ts
export interface CreateEventUsecase {
  execute(data: CreateEventData): Promise<Event>;
}

// lib/gantt-chart/usecase/update_event_usecase.ts
export interface UpdateEventUsecase {
  execute(id: string, data: UpdateEventData): Promise<Event>;
}

// lib/gantt-chart/usecase/delete_event_usecase.ts
export interface DeleteEventUsecase {
  execute(id: string): Promise<boolean>;
}

// lib/gantt-chart/usecase/filter_events_usecase.ts
export interface FilterEventsUsecase {
  execute(filter: EventFilter): Promise<Event[]>;
}

export interface EventFilter {
  searchKeyword?: string;
  visibleGroupIds?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}
```

### Timeline Use Cases

```typescript
// lib/gantt-chart/usecase/calculate_timeline_usecase.ts
export interface CalculateTimelineUsecase {
  execute(events: Event[]): Promise<TimelineRange>;
}

export interface TimelineRange {
  startDate: string; // Earliest event start - buffer
  endDate: string;   // Latest event end + buffer
  totalDays: number;
}
```

### Version Use Cases

```typescript
// lib/gantt-chart/usecase/save_version_usecase.ts
export interface SaveVersionUsecase {
  execute(note: string): Promise<Version>;
}

// lib/gantt-chart/usecase/compare_versions_usecase.ts
export interface CompareVersionsUsecase {
  execute(versionId1: string, versionId2: string): Promise<VersionDiff>;
}

export interface VersionDiff {
  addedEvents: Event[];
  deletedEvents: Event[];
  modifiedEvents: ModifiedEvent[];
  groupChanges: GroupChange[];
}
```

---

## Presenter Layer Contracts (Zustand Store Signatures)

These are the public interfaces exposed by Zustand stores to UI components.

```typescript
// lib/gantt-chart/presenter/event_store.ts
export interface EventStoreState {
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
}

// lib/gantt-chart/presenter/filter_store.ts
export interface FilterStoreState {
  // State
  searchKeyword: string;
  visibleGroupIds: Set<string>;
  filteredEvents: Event[];

  // Actions
  setSearchKeyword: (keyword: string) => void;
  toggleGroupVisibility: (groupId: string) => void;
  setAllGroupsVisibility: (visible: boolean) => void;
  applyFilters: () => void;
}

// lib/gantt-chart/presenter/version_store.ts
export interface VersionStoreState {
  // State
  versions: Version[];
  selectedVersionIds: string[];
  diff: VersionDiff | null;
  isComparing: boolean;

  // Actions
  loadVersions: () => Promise<void>;
  saveVersion: (note: string) => Promise<void>;
  selectVersion: (id: string, isSelected: boolean) => void;
  compareSelected: () => Promise<void>;
  deleteVersion: (id: string) => Promise<void>;
}
```

---

## Error Contracts

Standard error types used across layers.

```typescript
// lib/gantt-chart/usecase/errors.ts

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public constraint: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(
    public entityType: string,
    public entityId: string
  ) {
    super(`${entityType} with id ${entityId} not found`);
    this.name = 'NotFoundError';
  }
}

export class QuotaExceededError extends Error {
  constructor() {
    super('Storage quota exceeded. Please delete some versions or events.');
    this.name = 'QuotaExceededError';
  }
}

export class StorageUnavailableError extends Error {
  constructor() {
    super('localStorage is not available. Please enable storage in your browser.');
    this.name = 'StorageUnavailableError';
  }
}

export class BusinessRuleViolationError extends Error {
  constructor(
    message: string,
    public rule: string
  ) {
    super(message);
    this.name = 'BusinessRuleViolationError';
  }
}
```

**Error Handling Strategy**:
- Use cases throw domain errors (ValidationError, NotFoundError, etc.)
- Repositories catch storage errors and rethrow as domain errors
- Presenters catch all errors and update error state
- UI displays errors to user in appropriate format

---

## Summary

These contracts define the interfaces at each layer boundary in the Clean Architecture:

1. **Repository Interfaces** (use case → repository): EventRepository, GroupRepository, VersionRepository
2. **Storage Service Interface** (repository → external): StorageService
3. **Use Case Interfaces** (presenter → use case): Individual use case execute methods
4. **Presenter Interfaces** (UI → presenter): Zustand store state and actions
5. **Error Contracts**: Standard error types for domain violations

All implementations must adhere to these contracts to maintain layer isolation and testability.
