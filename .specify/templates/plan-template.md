# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Architecture Compliance** (for Next.js projects):
- [ ] Feature structure follows `lib/<feature>/` convention
- [ ] Layer separation maintained: UI → Presenter → Use Case → Repository → External
- [ ] No upward dependencies (lower layers independent of upper layers)
- [ ] Type-safe interfaces defined at all layer boundaries
- [ ] External interactions isolated in external layer

**General Gates**:
- [ ] Feature is independently testable
- [ ] Dependencies are explicit and justified
- [ ] No violations of core principles (or documented if necessary)

[Additional gates determined based on constitution file and project type]

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
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]

# [REMOVE IF UNUSED] Option 4: Next.js with Clean Architecture
app/
└── <route>/
    └── page.tsx              # UI layer

lib/
└── <feature>/
    ├── ui/
    │   └── *.tsx             # Reusable UI components
    ├── presenter/
    │   └── *_store.ts        # Zustand stores (state management)
    ├── usecase/
    │   ├── *_repository.ts   # Repository interfaces
    │   └── <verb>_*_usecase.ts # Business logic
    ├── repository/
    │   ├── *_repository_impl.ts # Repository implementations
    │   ├── *_api_service.ts     # API service interfaces
    │   └── *_storage.ts         # Storage interfaces
    └── external/
        ├── *_api_service_impl.ts # External API implementations
        └── *_storage.ts          # Storage implementations

lib/shared/
└── [cross-feature utilities and types]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., Upward dependency from repository to use case] | [specific problem requiring this] | [why strict layering insufficient] |
| [e.g., Direct API call in use case layer] | [performance/technical constraint] | [why external layer abstraction insufficient] |
| [e.g., Business logic in presenter] | [current need] | [why use case layer insufficient] |
