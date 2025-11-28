# Research: Gantt Chart Planning Tool

**Feature**: Gantt Chart Planning Tool  
**Date**: 2025-11-29  
**Purpose**: Resolve technical unknowns and document architectural decisions for Phase 1 design

## Research Questions & Decisions

### 1. Gantt Chart Rendering Approach

**Question**: How to efficiently render a scrollable Gantt chart with sticky headers for 200+ events?

**Decision**: Use CSS Grid with `position: sticky` for headers

**Rationale**:
- CSS Grid natively supports equal-width columns for each day
- `position: sticky` on table headers is well-supported and performant
- Avoids complexity of canvas-based rendering
- Easier to integrate with React component model
- Accessibility: semantic HTML elements (table structure) over canvas

**Alternatives Considered**:
- **HTML5 Canvas**: Rejected - harder to maintain, poor accessibility, requires manual event handling
- **SVG**: Rejected - can become slow with 200+ event bars, harder to implement sticky headers
- **Third-party library (e.g., dhtmlxGantt, Frappe Gantt)**: Rejected - adds dependency, may not fit Clean Architecture, harder to customize for version diff feature

**Implementation Notes**:
- Use `display: grid` with `grid-template-columns: repeat(N, 1fr)` where N = number of days
- Date header: `position: sticky; top: 0; z-index: 10`
- Event names column: `position: sticky; left: 0; z-index: 10`
- Event bars positioned using `grid-column: start / end` based on date calculations

---

### 2. State Management Strategy with Zustand

**Question**: How to structure Zustand stores for Clean Architecture compliance?

**Decision**: Multiple focused stores in presenter layer, each managing specific domain concerns

**Rationale**:
- Aligns with Clean Architecture: presenters call use cases, use cases call repositories
- Zustand supports multiple stores without provider hell
- Each store has single responsibility (events, groups, filters, timeline, versions)
- Stores can be tested independently

**Store Structure**:
```typescript
// lib/gantt-chart/presenter/event_store.ts
export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  selectedEvent: null,
  
  createEvent: async (data) => {
    const usecase = new CreateEventUsecase(eventRepository);
    const event = await usecase.execute(data);
    set((state) => ({ events: [...state.events, event] }));
  },
  // ...
}));
```

**Alternatives Considered**:
- **Single monolithic store**: Rejected - violates single responsibility, harder to test
- **Redux**: Rejected - overkill for this app, more boilerplate, steeper learning curve
- **Context API only**: Rejected - performance issues with frequent updates, no middleware support

**Implementation Notes**:
- Use Immer middleware for immutable updates if needed: `create(immer((set) => ...))`
- Stores import and instantiate use cases
- Use cases receive repository instances via dependency injection
- Consider using `devtools` middleware for debugging

---

### 3. localStorage Data Persistence Strategy

**Question**: How to structure localStorage data to support versioning and efficient queries?

**Decision**: Separate keys for events, groups, versions, and settings with JSON serialization

**Rationale**:
- Simple read/write operations
- Easy to implement version snapshots (clone entire data structure)
- Can optimize by only loading necessary data
- localStorage size limit (~5-10MB) sufficient for 500+ events

**Storage Schema**:
```typescript
// Keys
const STORAGE_KEYS = {
  EVENTS: 'gantt_events',
  GROUPS: 'gantt_groups',
  VERSIONS: 'gantt_versions',
  SETTINGS: 'gantt_settings',
};

// Example data structure
interface StoredEvents {
  version: '1.0',
  events: Event[],
  lastUpdated: string,
}
```

**Alternatives Considered**:
- **IndexedDB**: Rejected - overkill for this use case, more complex API, not needed for small datasets
- **Single mega-object**: Rejected - inefficient (must parse everything on every read)
- **Browser File System API**: Rejected - limited browser support, requires permissions

**Implementation Notes**:
- Implement try-catch for quota errors and notify users
- Add data versioning for future schema migrations
- Consider compression for version snapshots (e.g., LZ-string) if size becomes issue
- Implement debouncing for auto-save to avoid excessive writes

---

### 4. Date Manipulation Library

**Question**: Which library for date calculations (day ranges, differences, formatting)?

**Decision**: date-fns (or Day.js as lightweight alternative)

**Rationale**:
- Tree-shakeable (only import needed functions)
- Immutable by default (aligns with functional programming)
- TypeScript support out of the box
- Comprehensive date manipulation functions
- Active maintenance and community

**Key Functions Needed**:
- `differenceInDays(endDate, startDate)` - calculate event duration
- `eachDayOfInterval({ start, end })` - generate day columns
- `format(date, 'yyyy-MM-dd')` - date display
- `isWithinInterval(date, { start, end })` - focus period check
- `addDays(date, n)`, `subDays(date, n)` - timeline navigation

**Alternatives Considered**:
- **Moment.js**: Rejected - not tree-shakeable, large bundle size, maintenance mode
- **Luxon**: Rejected - similar to date-fns but less adoption
- **Native Date**: Rejected - lacks convenient helper methods, timezone edge cases

---

### 5. Version Diff Algorithm

**Question**: How to efficiently compute differences between two version snapshots?

**Decision**: Simple array comparison with unique ID matching

**Rationale**:
- Straightforward implementation using object key comparison
- Performance acceptable for 500 events (O(n) with Map lookups)
- Easy to understand and maintain
- Covers all required diff types (added, deleted, modified)

**Algorithm Outline**:
```typescript
function compareVersions(v1: Version, v2: Version): VersionDiff {
  const v1Map = new Map(v1.events.map(e => [e.id, e]));
  const v2Map = new Map(v2.events.map(e => [e.id, e]));
  
  const added = v2.events.filter(e => !v1Map.has(e.id));
  const deleted = v1.events.filter(e => !v2Map.has(e.id));
  
  const modified = v2.events.filter(e => {
    if (!v1Map.has(e.id)) return false;
    return !deepEqual(e, v1Map.get(e.id));
  }).map(e => ({
    event: e,
    changes: detectChanges(v1Map.get(e.id)!, e),
  }));
  
  return { added, deleted, modified };
}
```

**Alternatives Considered**:
- **Deep diff library (e.g., deep-diff)**: Rejected - adds dependency, output format may not match UI needs
- **String-based diff (like git diff)**: Rejected - overkill, harder to present in UI

---

### 6. Sticky Header Implementation

**Question**: How to implement sticky date header and event name column simultaneously?

**Decision**: CSS sticky positioning with proper z-index layering

**Rationale**:
- Native browser support for `position: sticky`
- Performant (browser-optimized)
- Works with scrollable containers
- No JavaScript scroll listeners needed

**CSS Structure**:
```css
.timeline-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: white;
}

.event-name-cell {
  position: sticky;
  left: 0;
  z-index: 10;
  background: white;
}

.header-corner {
  /* Top-left cell that's both sticky top and left */
  position: sticky;
  top: 0;
  left: 0;
  z-index: 30;
}
```

**Alternatives Considered**:
- **JavaScript scroll listeners**: Rejected - performance issues, janky scrolling
- **Fixed positioning with manual scroll sync**: Rejected - complex, error-prone

**Implementation Notes**:
- Ensure proper background colors to prevent content showing through
- Test scroll performance with 100+ rows
- Add box-shadow to sticky elements for visual depth

---

### 7. Performance Optimization for Large Charts

**Question**: How to maintain 30+ fps with 100+ events?

**Decision**: React virtualization for event rows (optional), CSS containment, memoization

**Rationale**:
- Most charts won't exceed 100 events initially
- CSS `contain: layout` helps browser optimize rendering
- React.memo() prevents unnecessary re-renders
- Virtualization adds complexity, defer until needed

**Optimization Strategies**:
1. **Memoization**: Wrap event bar components in `React.memo()`
2. **CSS Containment**: `contain: layout style` on event rows
3. **Computed Properties**: Cache timeline calculations in Zustand store
4. **Debounce Filters**: Debounce search input (300ms) to reduce re-renders
5. **Virtualization (if needed)**: Use `react-window` or `react-virtual` for 200+ events

**Performance Targets** (from spec):
- Chart render <1s for 200 events ✓ (achievable with memoization)
- 30+ fps scrolling with 100+ events ✓ (sticky CSS + containment)
- Filter results <0.5s for 500 events ✓ (simple array filtering fast enough)

---

### 8. TypeScript Interface Design

**Question**: How to structure domain types to support Clean Architecture?

**Decision**: Define domain types in use case layer, use them across all layers

**Rationale**:
- Use case layer defines business concepts (events, groups, versions)
- All layers depend on these shared types
- Supports type safety at layer boundaries
- Prevents implementation details from leaking

**Type Structure**:
```typescript
// lib/gantt-chart/usecase/types.ts
export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO 8601
  endDate: string;   // ISO 8601
  groupId: string;
}

export interface Group {
  id: string;
  name: string;
  color: string; // hex color
  visible: boolean;
}

export interface Version {
  id: string;
  number: number;
  createdAt: string;
  note: string;
  snapshot: {
    events: Event[];
    groups: Group[];
    settings?: TimelineSettings;
  };
}

export interface VersionDiff {
  addedEvents: Event[];
  deletedEvents: Event[];
  modifiedEvents: ModifiedEvent[];
  groupChanges: GroupChange[];
}
```

---

## Technology Decisions Summary

| Decision Point | Choice | Rationale |
|---------------|--------|-----------|
| **Rendering** | CSS Grid + HTML | Performance, accessibility, maintainability |
| **State Management** | Zustand (multiple stores) | Clean Architecture fit, simplicity |
| **Data Persistence** | localStorage with JSON | Simple, sufficient size, offline-capable |
| **Date Library** | date-fns | Tree-shakeable, TypeScript support |
| **Diff Algorithm** | Map-based comparison | Simple, performant for scale |
| **Sticky Headers** | CSS `position: sticky` | Native, performant |
| **Performance** | Memoization + CSS containment | Meets targets without complexity |
| **Type System** | Domain types in use case layer | Clean Architecture compliance |

---

## Outstanding Questions

**None** - All technical decisions documented. Ready for Phase 1 design.

---

## References

- [CSS Grid Layout Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [date-fns Documentation](https://date-fns.org/docs/Getting-Started)
- [MDN: position sticky](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky)
- [Web Storage API (localStorage)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
