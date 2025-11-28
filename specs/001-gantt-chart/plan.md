# Implementation Plan: Gantt Chart Planning Tool

**Branch**: `001-gantt-chart` | **Date**: 2025-11-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-gantt-chart/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a local browser-based Gantt chart tool for project planning and schedule tracking. Users create events (tasks) with dates and groups (Frontend/Backend/Design), visualize them on a timeline with day-level granularity, filter by group/keyword, and save version snapshots to track planning changes over time. Key differentiator: version comparison showing detailed diffs of schedule modifications.

**Technical Approach**: Next.js app with Clean Architecture, Zustand for state management, Tailwind CSS for styling, localStorage for all data persistence. Feature implemented as self-contained module under `lib/gantt-chart/` with full layer separation.

## Technical Context

**Language/Version**: TypeScript (latest), Next.js 14+ (App Router)  
**Primary Dependencies**: 
- Next.js 14+ (App Router for routing)
- React 18+ (UI rendering)
- Zustand 4+ (state management in presenter layer)
- Immer (if needed for immutable state updates)
- Tailwind CSS (styling)
- date-fns or Day.js (date manipulation utilities)

**Storage**: localStorage (browser-based persistence for events, groups, versions, settings)  
**Testing**: Vitest or Jest for unit tests, React Testing Library for component tests  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) - 100% offline-capable  
**Project Type**: Next.js web application with Clean Architecture  
**Performance Goals**: 
- Chart render/update <1s for 200 events
- Smooth scrolling 30+ fps with 100+ events
- Filter/search results <0.5s for 500 events

**Constraints**: 
- 100% offline operation (no server dependencies)
- localStorage size limits (~5-10MB depending on browser)
- Must work without network connectivity
- Responsive design for desktop (mobile optional for MVP)

**Scale/Scope**: 
- Support 500+ events per chart
- Unlimited version history (limited by localStorage size)
- Single-user local tool (no collaboration features)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Architecture Compliance** (for Next.js projects):
- [x] Feature structure follows `lib/<feature>/` convention → `lib/gantt-chart/`
- [x] Layer separation maintained: UI → Presenter → Use Case → Repository → External
- [x] No upward dependencies (lower layers independent of upper layers)
- [x] Type-safe interfaces defined at all layer boundaries (see contracts/)
- [x] External interactions isolated in external layer (localStorage only)

**General Gates**:
- [x] Feature is independently testable (7 user stories with independent test scenarios)
- [x] Dependencies are explicit and justified (Next.js, Zustand, Tailwind, localStorage)
- [x] No violations of core principles

**Post-Design Re-Evaluation**:
- [x] Data model defined with clear entity relationships (data-model.md)
- [x] Repository interfaces defined at use case layer (contracts/repository-interfaces.md)
- [x] Use cases accept repository interfaces (dependency injection supported)
- [x] Zustand stores in presenter layer call use cases (no business logic in stores)
- [x] UI components call presenters only (no direct use case or repository access)
- [x] External layer implements StorageService interface (localStorage abstraction)
- [x] Error handling defined with domain-specific errors
- [x] All layer boundaries have TypeScript contracts

**Status**: ✅ PASSES - Design maintains Clean Architecture compliance. All layers properly separated with explicit interfaces.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
└── gantt/
    └── page.tsx              # Main Gantt chart page (routing layer)

lib/
└── gantt-chart/
    ├── ui/
    │   ├── gantt-chart.tsx          # Main chart component
    │   ├── event-list.tsx           # Event name column (sticky left)
    │   ├── timeline-header.tsx      # Date header row (sticky top)
    │   ├── timeline-grid.tsx        # Timeline canvas with events
    │   ├── event-bar.tsx            # Individual event bar
    │   ├── event-form.tsx           # Create/edit event modal
    │   ├── group-filter.tsx         # Group checkbox list
    │   ├── search-bar.tsx           # Keyword search input
    │   ├── version-list.tsx         # Version history list
    │   ├── version-diff.tsx         # Version comparison view
    │   ├── group-manager.tsx        # Manage groups modal
    │   └── time-controls.tsx        # Timeline navigation controls
    ├── presenter/
    │   ├── gantt_store.ts           # Main Zustand store
    │   ├── event_store.ts           # Event CRUD operations
    │   ├── group_store.ts           # Group management
    │   ├── filter_store.ts          # Search & filter state
    │   ├── timeline_store.ts        # Timeline view state
    │   └── version_store.ts         # Version history & diff
    ├── usecase/
    │   ├── types.ts                 # Shared domain types (Event, Group, Version, etc.)
    │   ├── event_repository.ts      # Event repository interface
    │   ├── group_repository.ts      # Group repository interface
    │   ├── version_repository.ts    # Version repository interface
    │   ├── create_event_usecase.ts
    │   ├── update_event_usecase.ts
    │   ├── delete_event_usecase.ts
    │   ├── filter_events_usecase.ts
    │   ├── calculate_timeline_usecase.ts
    │   ├── save_version_usecase.ts
    │   └── compare_versions_usecase.ts
    ├── repository/
    │   ├── event_repository_impl.ts
    │   ├── group_repository_impl.ts
    │   ├── version_repository_impl.ts
    │   └── storage_service.ts       # Storage service interface
    └── external/
        └── local_storage_service.ts # localStorage implementation

lib/shared/
├── types/
│   └── common.ts                    # Shared utility types
└── utils/
    ├── date.ts                      # Date manipulation helpers
    └── validation.ts                # Common validation functions

__tests__/
└── gantt-chart/
    ├── usecase/                     # Use case unit tests
    ├── presenter/                   # Store integration tests
    └── ui/                          # Component tests (optional)
```

**Structure Decision**: Using Next.js Clean Architecture (Option 4) with feature-based modularity. The `gantt-chart` feature is self-contained in `lib/gantt-chart/` with complete layer separation. Main route at `app/gantt/page.tsx` imports and composes UI components from the feature module.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., Upward dependency from repository to use case] | [specific problem requiring this] | [why strict layering insufficient] |
| [e.g., Direct API call in use case layer] | [performance/technical constraint] | [why external layer abstraction insufficient] |
| [e.g., Business logic in presenter] | [current need] | [why use case layer insufficient] |
