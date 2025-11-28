# Data Model: Gantt Chart Planning Tool

**Feature**: Gantt Chart Planning Tool  
**Date**: 2025-11-29  
**Purpose**: Define entities, relationships, and validation rules for implementation

## Core Entities

### 1. Event

Represents a task or work item displayed on the Gantt chart timeline.

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | Yes | UUID v4 | Unique identifier |
| `name` | string | Yes | 1-200 chars, not empty | Event display name |
| `description` | string | No | 0-1000 chars | Optional details |
| `startDate` | string | Yes | ISO 8601 date (YYYY-MM-DD) | Event start date |
| `endDate` | string | Yes | ISO 8601, >= startDate | Event end date (inclusive) |
| `groupId` | string | Yes | Must reference existing Group | Associated group |
| `createdAt` | string | Yes | ISO 8601 timestamp | Creation timestamp |
| `updatedAt` | string | Yes | ISO 8601 timestamp | Last update timestamp |

**Validation Rules**:
1. `endDate` must be >= `startDate` (same day allowed for single-day events)
2. `groupId` must reference an existing group
3. `name` cannot be empty string or only whitespace
4. All dates in UTC to avoid timezone issues

**Example**:
```typescript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Build Login API",
  description: "Implement JWT authentication endpoint",
  startDate: "2025-12-01",
  endDate: "2025-12-05",
  groupId: "group-backend",
  createdAt: "2025-11-29T10:30:00Z",
  updatedAt: "2025-11-29T10:30:00Z"
}
```

---

### 2. Group

Represents a category for organizing events (e.g., Frontend, Backend, Design).

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | Yes | UUID v4 or slug | Unique identifier |
| `name` | string | Yes | 1-50 chars, not empty | Group display name |
| `color` | string | Yes | Hex color (#RRGGBB) | Visual identifier |
| `visible` | boolean | Yes | - | Filter visibility state |
| `order` | number | Yes | >= 0 | Display order in UI |
| `isDefault` | boolean | Yes | - | Whether this is a default group |

**Validation Rules**:
1. `name` must be unique across all groups
2. `color` must be valid hex format (#RRGGBB)
3. Default groups (Frontend, Backend, Design) have `isDefault: true`
4. Cannot delete groups with associated events

**Default Groups**:
```typescript
[
  { id: "group-frontend", name: "Frontend", color: "#3B82F6", visible: true, order: 0, isDefault: true },
  { id: "group-backend", name: "Backend", color: "#10B981", visible: true, order: 1, isDefault: true },
  { id: "group-design", name: "Design", color: "#F59E0B", visible: true, order: 2, isDefault: true }
]
```

---

### 3. Version

Represents a snapshot of the entire chart state at a specific point in time.

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | Yes | UUID v4 | Unique identifier |
| `number` | number | Yes | Auto-increment from 1 | Human-readable version (V1, V2, ...) |
| `createdAt` | string | Yes | ISO 8601 timestamp | Snapshot creation time |
| `note` | string | No | 0-500 chars | User-provided description |
| `snapshot` | object | Yes | Valid snapshot structure | Complete chart state |

**Snapshot Structure**:
```typescript
{
  events: Event[],           // All events at snapshot time
  groups: Group[],           // All groups at snapshot time
  settings?: {               // Optional: view settings
    visibleStart: string,    // ISO date
    visibleEnd: string,      // ISO date
    focusPeriod?: {
      start: string,
      end: string
    }
  }
}
```

**Validation Rules**:
1. `number` must be unique and sequential
2. `snapshot.events` and `snapshot.groups` must be valid arrays (can be empty)
3. Cannot modify versions after creation (immutable)

**Example**:
```typescript
{
  id: "ver-001",
  number: 1,
  createdAt: "2025-11-29T14:00:00Z",
  note: "Initial project schedule",
  snapshot: {
    events: [ /* array of Event objects */ ],
    groups: [ /* array of Group objects */ ],
    settings: {
      visibleStart: "2025-12-01",
      visibleEnd: "2025-12-31"
    }
  }
}
```

---

### 4. DisplaySettings

Represents the current user's view configuration (not versioned separately, but can be included in version snapshots).

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `visibleStart` | string | Yes | ISO 8601 date | Timeline start date |
| `visibleEnd` | string | Yes | ISO 8601 date, > visibleStart | Timeline end date |
| `searchKeyword` | string | No | 0-100 chars | Current search filter |
| `focusPeriod` | object \| null | No | Valid period or null | Highlighted time range |
| `zoom Level` | number | No | 1-3 (day/week/month) | Future: zoom granularity |

**Focus Period Structure**:
```typescript
{
  start: string,  // ISO date
  end: string     // ISO date, >= start
}
```

**Validation Rules**:
1. `visibleEnd` must be > `visibleStart`
2. If `focusPeriod` is set, both `start` and `end` required
3. `focusPeriod.end` >= `focusPeriod.start`

---

### 5. VersionDiff (Computed)

Represents the comparison result between two versions. Not stored, computed on-demand.

**Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `addedEvents` | Event[] | Events in newer version not in older |
| `deletedEvents` | Event[] | Events in older version not in newer |
| `modifiedEvents` | ModifiedEvent[] | Events present in both but with changes |
| `groupChanges` | GroupChange[] | Changes to groups |

**ModifiedEvent Structure**:
```typescript
{
  eventId: string,
  oldValue: Event,
  newValue: Event,
  changes: {
    name?: { old: string, new: string },
    description?: { old: string, new: string },
    startDate?: { old: string, new: string },
    endDate?: { old: string, new: string },
    groupId?: { old: string, new: string }
  }
}
```

**GroupChange Structure**:
```typescript
{
  type: 'added' | 'deleted' | 'modified',
  groupId: string,
  oldValue?: Group,
  newValue?: Group,
  changes?: {
    name?: { old: string, new: string },
    color?: { old: string, new: string }
  }
}
```

---

## Entity Relationships

```
Group (1) ──< has many >── Event (*)
  │
  └─ Default groups: Frontend, Backend, Design (isDefault: true)

Version (1) ──< contains snapshot of >── Event (*), Group (*)
  │
  └─ Immutable snapshots, sequential numbering

Event (1) ──< belongs to >── Group (1)
  │
  └─ Validated: groupId must exist

VersionDiff
  └─ Computed from: Version (old) + Version (new)
```

**Cascading Rules**:
- Deleting a Group: PREVENT if events exist, require reassignment
- Deleting an Event: Allowed, no cascades
- Creating Version: CLONE all current events and groups
- Deleting Version: Allowed (does not affect current state)

---

## State Transitions

### Event Lifecycle

```
[Not Exists]
    │
    ├─ Create Event → [Active]
    │                    │
    │                    ├─ Edit Event → [Active] (updated)
    │                    │
    │                    └─ Delete Event → [Deleted]
    │
    └─ (Events persist in version snapshots even after deletion)
```

**State Rules**:
- Events can be created, updated, or deleted
- Deleted events remain in historical version snapshots
- No "archived" or "completed" states in MVP (binary: exists or doesn't)

### Version Lifecycle

```
[No Versions]
    │
    └─ Save Version → [Version V1 Created] (immutable)
                           │
                           ├─ (Make changes to chart)
                           │
                           └─ Save Version → [Version V2 Created] (immutable)
                                                 │
                                                 ├─ Compare V1 vs V2 → [VersionDiff] (computed)
                                                 │
                                                 └─ (Versions remain forever, unless explicitly deleted)
```

**State Rules**:
- Versions are immutable once created
- Version numbers auto-increment
- Cannot edit version snapshots (create new version instead)
- Versions can be deleted but do not affect current chart state

---

## Validation Summary

### Cross-Entity Validations

1. **Event → Group Reference**:
   - `event.groupId` must match an existing `group.id`
   - Enforced on create and update

2. **Date Consistency**:
   - `event.endDate` >= `event.startDate`
   - `settings.visibleEnd` > `settings.visibleStart`
   - `focusPeriod.end` >= `focusPeriod.start`

3. **Group Uniqueness**:
   - `group.name` must be unique across all groups
   - Enforced on create and update

4. **Version Integrity**:
   - `version.number` must be sequential (no gaps)
   - `version.snapshot` must be valid JSON structure

### Data Constraints

- **Max Events**: Soft limit 500 (localStorage ~5MB)
- **Max Versions**: Soft limit 50 (to manage storage)
- **Max Groups**: Practical limit 20
- **Date Range**: No hard limit, but UI optimized for 1-365 days visible
- **Search/Filter**: No pagination needed for MVP (<500 events)

---

## Storage Format (localStorage)

### Keys and Structure

```typescript
// Storage keys
const KEYS = {
  EVENTS: 'gantt_events_v1',
  GROUPS: 'gantt_groups_v1',
  VERSIONS: 'gantt_versions_v1',
  SETTINGS: 'gantt_settings_v1',
  METADATA: 'gantt_metadata_v1'
};

// Stored structures
localStorage.setItem(KEYS.EVENTS, JSON.stringify({
  version: '1.0',
  lastUpdated: '2025-11-29T10:00:00Z',
  data: Event[]
}));

localStorage.setItem(KEYS.GROUPS, JSON.stringify({
  version: '1.0',
  lastUpdated: '2025-11-29T10:00:00Z',
  data: Group[]
}));

localStorage.setItem(KEYS.VERSIONS, JSON.stringify({
  version: '1.0',
  lastUpdated: '2025-11-29T10:00:00Z',
  data: Version[]
}));

localStorage.setItem(KEYS.SETTINGS, JSON.stringify({
  version: '1.0',
  data: DisplaySettings
}));

localStorage.setItem(KEYS.METADATA, JSON.stringify({
  version: '1.0',
  nextVersionNumber: 3,  // Track for auto-increment
  initialized: true
}));
```

### Versioning Strategy

- Include `version` field in all stored objects for future migrations
- Current version: `1.0`
- If schema changes: bump version, implement migration logic

---

## Type Definitions (TypeScript)

```typescript
// lib/gantt-chart/usecase/types.ts

export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO 8601 date
  endDate: string;   // ISO 8601 date
  groupId: string;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

export interface Group {
  id: string;
  name: string;
  color: string; // hex #RRGGBB
  visible: boolean;
  order: number;
  isDefault: boolean;
}

export interface Version {
  id: string;
  number: number;
  createdAt: string;
  note: string;
  snapshot: VersionSnapshot;
}

export interface VersionSnapshot {
  events: Event[];
  groups: Group[];
  settings?: DisplaySettings;
}

export interface DisplaySettings {
  visibleStart: string;
  visibleEnd: string;
  searchKeyword: string;
  focusPeriod: FocusPeriod | null;
}

export interface FocusPeriod {
  start: string;
  end: string;
}

export interface VersionDiff {
  addedEvents: Event[];
  deletedEvents: Event[];
  modifiedEvents: ModifiedEvent[];
  groupChanges: GroupChange[];
}

export interface ModifiedEvent {
  eventId: string;
  oldValue: Event;
  newValue: Event;
  changes: EventChanges;
}

export interface EventChanges {
  name?: FieldChange<string>;
  description?: FieldChange<string>;
  startDate?: FieldChange<string>;
  endDate?: FieldChange<string>;
  groupId?: FieldChange<string>;
}

export interface FieldChange<T> {
  old: T;
  new: T;
}

export interface GroupChange {
  type: 'added' | 'deleted' | 'modified';
  groupId: string;
  oldValue?: Group;
  newValue?: Group;
  changes?: {
    name?: FieldChange<string>;
    color?: FieldChange<string>;
  };
}
```

---

## Derived Data / Computed Properties

These are not stored but computed at runtime:

### 1. Timeline Date Range
- **Input**: All events' `startDate` and `endDate`
- **Output**: `{ minDate: string, maxDate: string }`
- **Logic**: Find earliest `startDate` and latest `endDate`, add buffer days

### 2. Filtered Events
- **Input**: All events, `searchKeyword`, group `visible` flags
- **Output**: Event[] (filtered)
- **Logic**: 
  1. Filter by group visibility: `event.groupId in visibleGroups`
  2. Filter by keyword: `event.name` or `event.description` contains keyword
  3. Return intersection

### 3. Event Position on Timeline
- **Input**: Event `startDate`, `endDate`, timeline `visibleStart`
- **Output**: `{ gridColumnStart: number, gridColumnEnd: number }`
- **Logic**: Calculate day offset from `visibleStart`

### 4. Version Diff
- **Input**: Two Version snapshots
- **Output**: VersionDiff
- **Logic**: See research.md (Map-based comparison)

---

## Migration Strategy

**Current Version**: 1.0 (MVP)

**Future Migrations**:
If data model changes in future versions:

1. Check stored `version` field
2. Run migration function if needed
3. Update `version` to new value
4. Save migrated data

Example:
```typescript
function migrateIfNeeded(data: any): Event[] {
  if (data.version === '1.0') {
    // Already current version
    return data.data;
  }
  if (data.version === '0.9') {
    // Migrate from 0.9 to 1.0
    const migrated = data.data.map(event => ({
      ...event,
      createdAt: event.createdAt || new Date().toISOString(),
      updatedAt: event.updatedAt || new Date().toISOString()
    }));
    return migrated;
  }
  throw new Error(`Unknown data version: ${data.version}`);
}
```
