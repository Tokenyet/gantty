<!--
SYNC IMPACT REPORT
==================
Version: 1.0.1 (UI Layer Clarification)
Ratification Date: 2025-11-28
Last Amendment: 2025-11-28

PRINCIPLES DEFINED:
- I. Clean Architecture (NEW)
- II. Feature-Based Modularity (NEW)
- III. Dependency Flow Enforcement (NEW)
- IV. Type Safety & Contracts (NEW)
- V. Testability First (NEW)

SECTIONS ADDED:
- Core Principles (5 principles)
- Technology Stack (Next.js specific constraints)
- Development Workflow (implementation and review standards)
- Governance (versioning and compliance)

TEMPLATES REQUIRING VALIDATION:
✅ plan-template.md - Updated with Clean Arch structure
✅ spec-template.md - Reviewed (User story approach aligns)
✅ tasks-template.md - Updated with Clean Arch layer examples
⚠ checklist-template.md - PENDING: Add architecture compliance checks
⚠ agent-file-template.md - PENDING: Ensure Clean Arch structure guidance

AMENDMENTS IN v1.0.1:
- Clarified UI layer location: lib/<feature>/ui (not app/)
- app/ is Next.js routing layer only, calls presenters/use cases
- Updated layer descriptions for accuracy

FOLLOW-UP TODOS:
- Consider adding architecture diagram to documentation
- Define specific testing requirements per layer (unit/integration)
- Clarify external dependency management (API clients, storage adapters)

VERSION RATIONALE:
- 1.0.1 - PATCH: Clarified UI layer location and app/ directory role
-->

# Gantty Constitution

## Core Principles

### I. Clean Architecture (NON-NEGOTIABLE)

All code MUST follow Clean Architecture with strict layer separation:

- **UI Layer** (`lib/<feature>/ui/`): React components and UI logic - presentation only
- **Presenter Layer** (`lib/<feature>/presenter/`): Zustand stores managing UI state
- **Use Case Layer** (`lib/<feature>/usecase/`): Business logic and application workflows
- **Repository Layer** (`lib/<feature>/repository/`): Abstract interfaces and implementations
- **External Layer** (`lib/<feature>/external/`): Third-party integrations, APIs, storage
- **Routing Layer** (`app/`): Next.js App Router pages - delegates to presenters or use cases

**Rationale**: Clean Architecture ensures testability, maintainability, and clear separation of concerns. Each layer can evolve independently without cascading changes across the codebase.

### II. Feature-Based Modularity

Every feature MUST be self-contained within its own module under `lib/<feature>/`:

- Each feature directory contains ALL layers for that feature
- Cross-feature dependencies MUST go through well-defined interfaces
- Shared utilities live in `lib/shared/` with explicit public contracts
- Feature modules MUST be independently testable

**Rationale**: Feature-based organization makes the codebase navigable, enables parallel development, and supports incremental testing and deployment.

### III. Dependency Flow Enforcement

Dependencies MUST flow in ONE direction only:

**UI → Presenter → Use Case → Repository → External**

- Upper layers MAY depend on lower layers
- Lower layers MUST NOT depend on upper layers
- Dependencies on abstractions (interfaces) are preferred over concrete implementations
- Violations MUST be justified in complexity tracking and approved

**Rationale**: Unidirectional flow prevents circular dependencies, makes the system easier to reason about, and enables independent testing of each layer through mocking.

### IV. Type Safety & Contracts

All layer boundaries MUST have explicit TypeScript interfaces:

- Repository interfaces define data contracts
- Use case interfaces define business operation contracts
- API service contracts specify external communication shape
- NO `any` types at layer boundaries without documented justification
- Prefer discriminated unions and branded types for domain modeling

**Rationale**: Explicit contracts at boundaries serve as documentation, enable compile-time verification, and make refactoring safer. Type safety prevents entire classes of runtime errors.

### V. Testability First

Code MUST be written with testing as a primary concern:

- Each layer MUST be testable in isolation
- Use cases MUST accept repository interfaces (dependency injection)
- External implementations MUST be mockable
- Integration tests MUST verify layer interactions
- Test files co-located with implementation when beneficial

**Rationale**: Testable code is maintainable code. Layer isolation enables fast unit tests, while integration tests verify real-world scenarios without requiring full system deployment.

## Technology Stack

**Framework**: Next.js (App Router)  
**State Management**: Zustand (presenter layer stores)  
**Language**: TypeScript (strict mode enabled)  
**Structure Convention**:

```text
app/
  └── <route>/
      └── page.tsx              # Routing layer (delegates to presenters/use cases)

lib/
  └── <feature>/
      ├── ui/
      │   └── *.tsx             # UI layer: React components
      ├── presenter/
      │   └── *_store.ts        # Presenter layer: Zustand stores
      ├── usecase/
      │   ├── *_repository.ts   # Use case layer: Repository interfaces
      │   └── <verb>_*_usecase.ts # Use case layer: Business logic
      ├── repository/
      │   ├── *_repository_impl.ts # Repository layer: Implementations
      │   ├── *_api_service.ts     # Repository layer: API service interfaces
      │   └── *_storage.ts         # Repository layer: Storage interfaces
      └── external/
          ├── *_api_service_impl.ts # External layer: API implementations
          └── *_storage.ts          # External layer: Storage implementations
```

**Constraints**:

- UI components in `lib/<feature>/ui/` MUST only call presenters (Zustand stores)
- Pages in `app/` MUST only import and compose UI components or call presenters/use cases
- Presenters (Zustand stores) MUST only call use cases
- Use cases MUST only depend on repository interfaces
- NO direct fetch/database calls outside the external layer
- Shared types/utilities in `lib/shared/` for cross-feature needs

## Development Workflow

### Implementation Standards

1. **Feature Development**:
   - Start with repository interface definition
   - Implement use cases against interfaces
   - Create presenter (Zustand store) to orchestrate use cases
   - Build UI components in `lib/<feature>/ui/` consuming presenter
   - Create routing pages in `app/` that compose UI components
   - Implement external layer last

2. **File Naming**:
   - Repository interfaces: `<entity>_repository.ts`
   - Use cases: `<verb>_<entity>_usecase.ts` (e.g., `create_task_usecase.ts`)
   - Stores: `<entity>_store.ts`
   - External implementations: `<service>_impl.ts`

3. **Testing Requirements**:
   - Use cases MUST have unit tests with mocked repositories
   - Repository implementations MUST have integration tests
   - Presenters MUST have tests verifying use case orchestration
   - UI components MAY have tests (recommended for complex components)

### Code Review Standards

All code reviews MUST verify:

- [ ] Dependency flow is unidirectional (no upward dependencies)
- [ ] Layer boundaries have explicit TypeScript interfaces
- [ ] No business logic in UI or presenter layers
- [ ] No direct external calls from use cases
- [ ] Feature is self-contained within its directory
- [ ] Tests cover the implemented layers
- [ ] File naming follows conventions

### Complexity Justification

Any deviation from architecture principles MUST be documented in the feature's `plan.md` under "Complexity Tracking" with:

- What principle is being violated
- Why the violation is necessary
- What simpler alternative was rejected and why

## Governance

This constitution supersedes all other development practices and conventions. All feature specifications, implementation plans, and code reviews MUST verify compliance with these principles.

### Amendment Process

1. Proposed changes MUST be documented with rationale
2. Impact analysis MUST identify affected features and templates
3. Migration plan MUST be created for existing code (if applicable)
4. Version MUST be bumped according to semantic versioning:
   - **MAJOR**: Backward-incompatible architectural changes
   - **MINOR**: New principles or significant expansions
   - **PATCH**: Clarifications, wording, or non-semantic refinements

### Compliance Reviews

- All PRs MUST pass architecture review per "Code Review Standards"
- Quarterly architecture audits to verify ongoing compliance
- Templates (plan, spec, tasks) MUST align with these principles
- Use `.specify/templates/agent-file-template.md` for runtime development guidance

**Version**: 1.0.1 | **Ratified**: 2025-11-28 | **Last Amended**: 2025-11-28
