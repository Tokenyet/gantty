# Tasks: Gantt Chart Planning Tool

**Input**: Design documents from `/specs/001-gantt-chart/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification, so test tasks are excluded.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **- [ ]**: Markdown checkbox (REQUIRED for all tasks)
- **[ID]**: Sequential task number (T001, T002, T003...)
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3) - REQUIRED for user story phases only
- Include exact file paths in descriptions

## Path Conventions

This project uses Next.js Clean Architecture:
- `app/` - Next.js App Router pages
- `lib/<feature>/[ui|presenter|usecase|repository|external]/` - Feature modules with layer separation
- `lib/shared/` - Shared utilities and types

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Next.js 14 project with TypeScript and App Router at repository root
- [X] T002 Install core dependencies: zustand, immer, date-fns, tailwind CSS
- [X] T003 [P] Configure TypeScript with strict mode in tsconfig.json
- [X] T004 [P] Configure Tailwind CSS in tailwind.config.js with custom colors for groups
- [X] T005 [P] Setup ESLint and Prettier configuration files
- [X] T006 Create feature directory structure at lib/gantt-chart/ with ui/, presenter/, usecase/, repository/, external/ folders

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Define core domain types (Event, Group, Version, VersionSnapshot, DisplaySettings, FocusPeriod) in lib/gantt-chart/usecase/types.ts
- [X] T008 [P] Define error classes (ValidationError, NotFoundError, QuotaExceededError, StorageUnavailableError, BusinessRuleViolationError) in lib/gantt-chart/usecase/errors.ts
- [X] T009 [P] Create shared date utilities (differenceInDays, eachDayOfInterval, format, isWithinInterval) in lib/shared/utils/date.ts
- [X] T010 [P] Create shared validation utilities (validateDateRange, validateHexColor, validateNonEmpty) in lib/shared/utils/validation.ts
- [X] T011 Define EventRepository interface with getAll, getById, create, update, delete, getByGroupId methods in lib/gantt-chart/usecase/event_repository.ts
- [X] T012 [P] Define GroupRepository interface with getAll, getById, create, update, delete, setVisibility, initializeDefaults methods in lib/gantt-chart/usecase/group_repository.ts
- [X] T013 [P] Define VersionRepository interface with getAll, getById, getByNumber, create, delete, getNextVersionNumber methods in lib/gantt-chart/usecase/version_repository.ts
- [X] T014 [P] Define StorageService interface with get, set, remove, clear, isAvailable, getUsage methods in lib/gantt-chart/repository/storage_service.ts
- [X] T015 Implement LocalStorageService implementing StorageService interface in lib/gantt-chart/external/local_storage_service.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and View Basic Gantt Chart (Priority: P1) 🎯 MVP

**Goal**: Users can create events with dates and visualize them on a timeline to understand project scheduling at a glance

**Independent Test**: Create several events with different start/end dates and groups, verify they display correctly on the timeline with proper colors and positioning

### Implementation for User Story 1

- [X] T016 [P] [US1] Implement EventRepositoryImpl with localStorage persistence in lib/gantt-chart/repository/event_repository_impl.ts
- [X] T017 [P] [US1] Implement GroupRepositoryImpl with localStorage persistence and default groups (Frontend, Backend, Design) in lib/gantt-chart/repository/group_repository_impl.ts
- [X] T018 [US1] Implement CreateEventUsecase with validation (endDate >= startDate, groupId exists, name not empty) in lib/gantt-chart/usecase/create_event_usecase.ts
- [X] T019 [P] [US1] Implement UpdateEventUsecase with validation in lib/gantt-chart/usecase/update_event_usecase.ts
- [X] T020 [P] [US1] Implement DeleteEventUsecase in lib/gantt-chart/usecase/delete_event_usecase.ts
- [X] T021 [US1] Implement CalculateTimelineUsecase to compute date range from events (earliest start - buffer, latest end + buffer) in lib/gantt-chart/usecase/calculate_timeline_usecase.ts
- [X] T022 [US1] Create event_store with Zustand: state (events, selectedEvent, isLoading, error), actions (loadEvents, createEvent, updateEvent, deleteEvent, selectEvent) in lib/gantt-chart/presenter/event_store.ts
- [X] T023 [P] [US1] Create group_store with Zustand: state (groups, isLoading), actions (loadGroups, createGroup, updateGroup, deleteGroup) in lib/gantt-chart/presenter/group_store.ts
- [X] T024 [P] [US1] Create timeline_store with Zustand: state (visibleStart, visibleEnd, totalDays), actions (setTimelineRange, calculateFromEvents, panTimeline) in lib/gantt-chart/presenter/timeline_store.ts
- [X] T025 [US1] Build TimelineHeader component with sticky positioning (position: sticky; top: 0) displaying date columns using CSS Grid in lib/gantt-chart/ui/timeline-header.tsx
- [X] T026 [P] [US1] Build EventList component with sticky event names (position: sticky; left: 0) in lib/gantt-chart/ui/event-list.tsx
- [X] T027 [P] [US1] Build TimelineGrid component with CSS Grid (grid-template-columns: repeat(N, 1fr)) for day columns in lib/gantt-chart/ui/timeline-grid.tsx
- [X] T028 [US1] Build EventBar component positioned using grid-column: start/end based on date calculations in lib/gantt-chart/ui/event-bar.tsx
- [X] T029 [US1] Build EventForm component (modal) for create/edit with fields: name, group, startDate, endDate, description in lib/gantt-chart/ui/event-form.tsx
- [X] T030 [US1] Build main GanttChart component composing TimelineHeader, EventList, TimelineGrid, EventBar components in lib/gantt-chart/ui/gantt-chart.tsx
- [X] T031 [US1] Create Gantt chart page at app/gantt/page.tsx importing and rendering GanttChart component

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can create, edit, delete events and see them on a scrollable timeline

---

## Phase 4: User Story 2 - Filter and Search Events (Priority: P2)

**Goal**: Users can focus on specific types of work or find particular events quickly without being overwhelmed by all events

**Independent Test**: Create 20+ events across different groups, verify keyword search returns only matching events and group checkboxes correctly show/hide events by group

### Implementation for User Story 2

- [ ] T032 [P] [US2] Implement FilterEventsUsecase with keyword matching (name or description) and group visibility filtering in lib/gantt-chart/usecase/filter_events_usecase.ts
- [ ] T033 [US2] Create filter_store with Zustand: state (searchKeyword, visibleGroupIds Set, filteredEvents), actions (setSearchKeyword, toggleGroupVisibility, setAllGroupsVisibility, applyFilters) in lib/gantt-chart/presenter/filter_store.ts
- [ ] T034 [P] [US2] Build SearchBar component with debounced input (300ms) calling setSearchKeyword in lib/gantt-chart/ui/search-bar.tsx
- [ ] T035 [P] [US2] Build GroupFilter component with checkboxes for each group calling toggleGroupVisibility in lib/gantt-chart/ui/group-filter.tsx
- [ ] T036 [US2] Integrate FilterEventsUsecase into GanttChart component to display only filteredEvents on timeline in lib/gantt-chart/ui/gantt-chart.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can filter by group and search by keyword

---

## Phase 5: User Story 3 - Navigate Timeline with Sticky Headers (Priority: P2)

**Goal**: Users can scroll through large Gantt charts while always knowing which date and which event they're looking at

**Independent Test**: Create 50+ events spanning 60+ days, verify that when scrolling vertically date headers stay visible, and when scrolling horizontally event names stay visible

### Implementation for User Story 3

- [ ] T037 [US3] Add TimeControls component with pan left/right buttons and "Show All" button calling panTimeline action in lib/gantt-chart/ui/time-controls.tsx
- [ ] T038 [US3] Implement header corner cell (top-left) with sticky positioning in both directions (position: sticky; top: 0; left: 0; z-index: 30) in lib/gantt-chart/ui/gantt-chart.tsx
- [ ] T039 [US3] Add CSS containment (contain: layout style) to event rows for scroll performance optimization in lib/gantt-chart/ui/timeline-grid.tsx
- [ ] T040 [US3] Implement React.memo() on EventBar component to prevent unnecessary re-renders during scrolling in lib/gantt-chart/ui/event-bar.tsx
- [ ] T041 [US3] Add box-shadow to sticky TimelineHeader and EventList for visual depth in lib/gantt-chart/ui/timeline-header.tsx and lib/gantt-chart/ui/event-list.tsx

**Checkpoint**: All sticky header functionality complete - users can scroll large charts with persistent visual context

---

## Phase 6: User Story 4 - Visual Time Indicators (Priority: P3)

**Goal**: Users can quickly identify today's date and gauge time intervals without counting individual days

**Independent Test**: Verify a distinct vertical line appears at today's date, and lighter vertical lines appear every 5 days starting from the timeline's start date

### Implementation for User Story 4

- [ ] T042 [P] [US4] Add currentDateLine rendering logic: check if today is within visibleStart/visibleEnd, render vertical line at today's column in lib/gantt-chart/ui/timeline-grid.tsx
- [ ] T043 [P] [US4] Add 5-day guide lines rendering logic: calculate positions every 5 days from visibleStart, render lighter vertical lines in lib/gantt-chart/ui/timeline-grid.tsx
- [ ] T044 [US4] Style current date line with distinct color (e.g., red/orange) and full height (position: absolute; height: 100%) in lib/gantt-chart/ui/timeline-grid.tsx
- [ ] T045 [US4] Style 5-day guide lines with subtle appearance (gray, dashed, opacity 0.3) in lib/gantt-chart/ui/timeline-grid.tsx

**Checkpoint**: Visual time indicators help users orient themselves in the timeline

---

## Phase 7: User Story 5 - Highlight Focus Time Period (Priority: P3)

**Goal**: Users can visually emphasize a specific time period of interest while still seeing the full project context

**Independent Test**: Set a focus period (e.g., 2025-02-10 to 2025-02-20), verify that time range has distinct visual highlighting while all events remain visible

### Implementation for User Story 5

- [ ] T046 [US5] Add focusPeriod state (start, end dates or null) to timeline_store with setFocusPeriod and clearFocusPeriod actions in lib/gantt-chart/presenter/timeline_store.ts
- [ ] T047 [US5] Add focus period controls (start date picker, end date picker, Apply button, Clear button) to TimeControls component in lib/gantt-chart/ui/time-controls.tsx
- [ ] T048 [US5] Implement focus period validation (end >= start) in setFocusPeriod action in lib/gantt-chart/presenter/timeline_store.ts
- [ ] T049 [US5] Add focus period highlight rendering in TimelineGrid: semi-transparent overlay on non-focus areas or brighter background on focus area in lib/gantt-chart/ui/timeline-grid.tsx
- [ ] T050 [US5] Ensure all events remain visible (no filtering) when focus period is active, only visual highlighting changes in lib/gantt-chart/ui/gantt-chart.tsx

**Checkpoint**: Focus period feature complete - users can highlight specific time ranges

---

## Phase 8: User Story 6 - Version History and Comparison (Priority: P2)

**Goal**: Users can save snapshots of their planning and see what changed between versions to track decision history

**Independent Test**: Create a chart, save version V1, make changes (add/delete/modify events), save V2, compare and verify the diff report accurately shows all changes

### Implementation for User Story 6

- [ ] T051 [P] [US6] Implement VersionRepositoryImpl with localStorage persistence and auto-incrementing version numbers in lib/gantt-chart/repository/version_repository_impl.ts
- [ ] T052 [US6] Implement SaveVersionUsecase: capture current events, groups, settings as snapshot, create version with next number in lib/gantt-chart/usecase/save_version_usecase.ts
- [ ] T053 [US6] Implement CompareVersionsUsecase with Map-based comparison algorithm: identify added events (in V2 not V1), deleted events (in V1 not V2), modified events (in both but different) in lib/gantt-chart/usecase/compare_versions_usecase.ts
- [ ] T054 [US6] Add detectEventChanges helper function to identify which fields changed (name, description, startDate, endDate, groupId) with before/after values in lib/gantt-chart/usecase/compare_versions_usecase.ts
- [ ] T055 [US6] Add detectGroupChanges helper function to identify added, deleted, modified groups with field-level changes in lib/gantt-chart/usecase/compare_versions_usecase.ts
- [ ] T056 [US6] Create version_store with Zustand: state (versions, selectedVersionIds, diff, isComparing), actions (loadVersions, saveVersion, selectVersion, compareSelected, deleteVersion) in lib/gantt-chart/presenter/version_store.ts
- [ ] T057 [P] [US6] Build VersionList component displaying all versions with number, timestamp, note, and checkboxes for selection in lib/gantt-chart/ui/version-list.tsx
- [ ] T058 [P] [US6] Build VersionDiff component displaying comparison results: added events section, deleted events section, modified events section with before/after tables, group changes section in lib/gantt-chart/ui/version-diff.tsx
- [ ] T059 [US6] Add "Save Version" button to GanttChart with modal for entering version note in lib/gantt-chart/ui/gantt-chart.tsx
- [ ] T060 [US6] Add "Compare Versions" button enabled only when exactly 2 versions selected, opening VersionDiff modal in lib/gantt-chart/ui/version-list.tsx

**Checkpoint**: Version history and comparison complete - users can track schedule evolution over time

---

## Phase 9: User Story 7 - Manage Groups (Priority: P3)

**Goal**: Users can organize events into categories that make sense for their project structure, beyond the default groups

**Independent Test**: Add a new group "QA Testing" with a specific color, create events in that group, verify they display with the correct color and can be filtered

### Implementation for User Story 7

- [ ] T061 [US7] Implement CreateGroupUsecase with validation (name unique, color valid hex format) in lib/gantt-chart/usecase/create_group_usecase.ts
- [ ] T062 [P] [US7] Implement UpdateGroupUsecase with validation (name unique if changed) in lib/gantt-chart/usecase/update_group_usecase.ts
- [ ] T063 [P] [US7] Implement DeleteGroupUsecase with business rule: prevent deletion if group has events, require reassignment first in lib/gantt-chart/usecase/delete_group_usecase.ts
- [ ] T064 [US7] Update group_store to integrate CreateGroupUsecase, UpdateGroupUsecase, DeleteGroupUsecase in lib/gantt-chart/presenter/group_store.ts
- [ ] T065 [US7] Build GroupManager component (modal) with group list showing all groups, Add Group button, Edit/Delete buttons per group in lib/gantt-chart/ui/group-manager.tsx
- [ ] T066 [US7] Build Add/Edit Group form with fields: name (text input), color (color picker), order (number input), validation errors display in lib/gantt-chart/ui/group-manager.tsx
- [ ] T067 [US7] Implement delete confirmation dialog that checks for associated events and displays appropriate error message in lib/gantt-chart/ui/group-manager.tsx
- [ ] T068 [US7] Add "Manage Groups" button to GanttChart opening GroupManager modal in lib/gantt-chart/ui/gantt-chart.tsx
- [ ] T069 [US7] Update EventBar to reactively update color when group color changes using React.memo with group dependency in lib/gantt-chart/ui/event-bar.tsx

**Checkpoint**: All user stories complete - full feature functionality achieved

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T070 [P] Add loading states (spinners/skeletons) for all async operations in event_store, group_store, version_store presenters
- [X] T071 [P] Add comprehensive error handling with user-friendly error messages for ValidationError, NotFoundError, QuotaExceededError in all UI components
- [X] T072 [P] Add toast notifications for successful operations (event created, version saved, etc.) using a notification library or custom component
- [X] T073 Implement localStorage quota detection and warning when approaching limit (>80% usage) in LocalStorageService
- [X] T074 Add empty state illustrations/messages for: no events, no versions, no search results in respective UI components
- [X] T075 [P] Add keyboard shortcuts (Esc to close modals, Ctrl+S to save version, etc.) in main GanttChart component
- [X] T076 [P] Optimize bundle size: ensure date-fns uses tree-shaking, lazy load version comparison modal
- [X] T077 Add data export functionality: export current chart or version snapshot to JSON file for backup
- [X] T078 Add data import functionality: import JSON file to restore chart state
- [X] T079 Run all quickstart.md validation scenarios to ensure complete feature compliance
- [X] T080 [P] Add README.md with feature overview, architecture diagram, and development setup instructions at repository root
- [X] T081 [P] Code cleanup: remove console.logs, unused imports, add JSDoc comments to all public functions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - MVP foundation
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) AND integrates with US1 components
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) AND builds on US1 UI components
- **User Story 4 (Phase 6)**: Depends on Foundational (Phase 2) AND US1 timeline rendering
- **User Story 5 (Phase 7)**: Depends on Foundational (Phase 2) AND US1 timeline rendering
- **User Story 6 (Phase 8)**: Depends on Foundational (Phase 2) - can be built independently
- **User Story 7 (Phase 9)**: Depends on Foundational (Phase 2) AND US1 group functionality
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Foundational (Phase 2) → BLOCKS ALL STORIES BELOW
    ↓
    ├─→ US1 (P1) - Create and View Basic Gantt Chart ← FOUNDATION FOR US2, US3, US4, US5, US7
    │       ├─→ US2 (P2) - Filter and Search (builds on US1 events/timeline)
    │       ├─→ US3 (P2) - Sticky Headers (enhances US1 scrolling)
    │       ├─→ US4 (P3) - Visual Indicators (adds to US1 timeline)
    │       ├─→ US5 (P3) - Focus Period (adds to US1 timeline)
    │       └─→ US7 (P3) - Manage Groups (extends US1 groups)
    │
    └─→ US6 (P2) - Version History ← INDEPENDENT (only depends on Foundational)
```

### Recommended Implementation Order

**MVP First (Minimum Viable Product)**:
1. Complete Phase 1: Setup → Project initialized
2. Complete Phase 2: Foundational → All layers/interfaces ready
3. Complete Phase 3: User Story 1 → **MVP COMPLETE** (basic Gantt chart works)
4. **STOP and VALIDATE**: Run quickstart scenario 1, deploy/demo if ready

**Incremental Delivery (Priority Order)**:
1. Phase 1 + Phase 2 → Foundation ready
2. Add Phase 3 (US1 - P1) → **MVP deployed**
3. Add Phase 4 (US2 - P2) → Filtering capability added
4. Add Phase 8 (US6 - P2) → Version tracking added
5. Add Phase 5 (US3 - P2) → Improved navigation
6. Add Phase 6 (US4 - P3) → Visual polish
7. Add Phase 7 (US5 - P3) → Focus feature
8. Add Phase 9 (US7 - P3) → Custom groups
9. Phase 10 → Final polish

**Parallel Team Strategy** (if multiple developers):

After Phase 2 completes, can run in parallel:
- **Developer A**: Phase 3 (US1) - Core Gantt chart
- **Developer B**: Phase 8 (US6) - Version history (independent path)

After Phase 3 (US1) completes, additional parallel work:
- **Developer A**: Phase 4 (US2) - Filtering
- **Developer B**: Phase 5 (US3) - Sticky headers
- **Developer C**: Phase 6 (US4) - Visual indicators

### Within Each Phase - Parallel Opportunities

**Phase 1 (Setup)** - All tasks except T006 can run in parallel after T001-T002:
```
T001, T002 (sequential)
  ↓
T003, T004, T005 (parallel) → T006
```

**Phase 2 (Foundational)** - Many parallel opportunities:
```
T007 (types first)
  ↓
T008, T009, T010, T011, T012, T013, T014 (parallel)
  ↓
T015 (after T014)
```

**Phase 3 (User Story 1)** - Parallel by layer:
```
Repositories: T016, T017 (parallel)
  ↓
Use Cases: T018, T019, T020 (parallel after repositories)
  ↓
T021 (calculate timeline)
  ↓
Stores: T022, T023, T024 (parallel)
  ↓
UI Components: T025, T026, T027 (parallel)
  ↓
T028, T029 (after T027, parallel)
  ↓
T030 (composition)
  ↓
T031 (page)
```

**Phase 4 (User Story 2)**:
```
T032 (use case)
  ↓
T033 (store)
  ↓
T034, T035 (parallel components)
  ↓
T036 (integration)
```

**Phase 6 (User Story 4)** - High parallelism:
```
T042, T043 (parallel logic)
  ↓
T044, T045 (parallel styling)
```

**Phase 8 (User Story 6)**:
```
T051 (repository)
  ↓
T052, T053, T054, T055 (parallel use cases)
  ↓
T056 (store)
  ↓
T057, T058 (parallel UI)
  ↓
T059, T060 (parallel integration)
```

**Phase 10 (Polish)** - Most tasks can run in parallel:
```
T070, T071, T072, T073, T074, T075, T076, T077, T078, T080, T081 (parallel)
  ↓
T079 (validation - must be last)
```

---

## Implementation Strategy Summary

### MVP Scope (User Story 1 Only)
**Tasks**: T001-T031 (31 tasks)
**Delivers**: Basic Gantt chart with create, edit, delete events, timeline visualization, sticky headers, default groups
**Timeline**: ~2-3 weeks for 1 developer
**Value**: Functional project planning tool

### Complete Feature Scope (All User Stories)
**Tasks**: T001-T081 (81 tasks)
**Delivers**: Full-featured Gantt chart with filtering, search, version history, comparison, custom groups, visual indicators
**Timeline**: ~6-8 weeks for 1 developer, ~4-5 weeks with parallel team
**Value**: Production-ready planning tool with unique version diff capability

### Parallel Execution Benefits
- Phase 1: ~40% time savings (T003-T005 parallel)
- Phase 2: ~50% time savings (T008-T014 parallel)
- Phase 3: ~35% time savings (layer parallelism)
- Overall: With 3 developers, can reduce timeline from 6-8 weeks to 4-5 weeks

---

## Notes

- **[P] marker**: Indicates tasks that can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story] label**: Maps task to specific user story for traceability (e.g., [US1], [US2])
- **Tests**: Not included as they were not explicitly requested in the specification
- **Architecture**: All tasks follow Next.js Clean Architecture with proper layer separation (UI → Presenter → Use Case → Repository → External)
- **Validation**: Each task includes specific file path for clarity
- **Checkpoints**: Each user story phase ends with a checkpoint to validate independent functionality
- **MVP Definition**: User Story 1 (Phase 3) represents the minimum viable product
- **Storage Limit**: localStorage typically has 5-10MB limit; monitor usage in Phase 10
- **Performance Targets**: Chart <1s render for 200 events, 30+ fps scrolling, <0.5s filter for 500 events
- **Browser Support**: Chrome, Firefox, Safari, Edge (modern browsers with localStorage support)
- **Offline Capability**: 100% offline - all data in localStorage, no network dependencies

---

## Task Count Summary

- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 9 tasks (CRITICAL - blocks all stories)
- **Phase 3 (US1 - P1 MVP)**: 16 tasks
- **Phase 4 (US2 - P2)**: 5 tasks
- **Phase 5 (US3 - P2)**: 5 tasks
- **Phase 6 (US4 - P3)**: 4 tasks
- **Phase 7 (US5 - P3)**: 5 tasks
- **Phase 8 (US6 - P2)**: 10 tasks
- **Phase 9 (US7 - P3)**: 9 tasks
- **Phase 10 (Polish)**: 12 tasks

**Total**: 81 tasks

**MVP (Phases 1-3)**: 31 tasks
**All User Stories (Phases 1-9)**: 69 tasks
**Production Ready (All Phases)**: 81 tasks

**Tasks by Priority**:
- **P1 (MVP Critical)**: 31 tasks (Setup + Foundational + US1)
- **P2 (High Value)**: 29 tasks (US2 + US3 + US6)
- **P3 (Nice to Have)**: 18 tasks (US4 + US5 + US7)
- **Polish (Cross-cutting)**: 12 tasks

**Parallel Opportunities**: 42 tasks marked with [P] can be executed in parallel with proper team coordination
