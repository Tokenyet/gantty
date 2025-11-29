# Gantt Chart Planning Tool

A local browser-based Gantt chart tool for project planning and schedule tracking built with Next.js, TypeScript, and Clean Architecture.

https://github.com/user-attachments/assets/ffc5d4e9-2952-4151-8d64-6c4a7ec33745

## 🎯 Features

### ✅ All User Stories Complete (Phases 1-9)

#### User Story 1: Create and View Basic Gantt Chart (P1) - MVP
- Create, edit, and delete events (tasks)
- Assign events to groups (Frontend, Backend, Design)
- Visual timeline with day-level granularity
- Sticky headers (dates stay at top, event names stay at left)
- Color-coded events by group
- Scrollable timeline view

#### User Story 2: Filter and Search Events (P2)
- Keyword search across event names and descriptions
- Filter by group with checkboxes
- Debounced search (300ms) for performance
- Combined search and filter support

#### User Story 3: Navigate Timeline with Sticky Headers (P2)
- Pan timeline left/right by 7 days
- "Show All" button to fit all events
- Corner cell sticky in both directions
- CSS containment for scroll optimization
- React.memo() on EventBar for performance

#### User Story 4: Visual Time Indicators (P3)
- Prominent "today" vertical line
- 5-day guide lines for easy time reference
- Automatic positioning based on visible range

#### User Story 5: Highlight Focus Time Period (P3)
- Set custom focus period with date pickers
- Visual highlighting of focus range
- All events remain visible (no filtering)
- Validation: end date >= start date

#### User Story 6: Version History and Comparison (P2)
- Save version snapshots with notes
- Auto-incrementing version numbers (V1, V2, V3...)
- Compare any 2 versions
- Detailed diff showing:
  - Added events
  - Deleted events
  - Modified events (field-level changes)
  - Group changes
- Version deletion support

#### User Story 7: Manage Groups (P3)
- Create custom groups with name and color
- Edit group properties
- Delete groups (with event check validation)
- Hex color picker
- Real-time color updates on event bars

### ✅ Phase 10: Polish & Cross-Cutting Concerns
- Loading states and spinners
- Comprehensive error handling
- Empty state messages
- localStorage quota detection (>80% warning)
- Keyboard shortcuts:
  - `Esc`: Close modals
  - `Ctrl+S` / `Cmd+S`: Save version
- Data export to JSON
- Data import from JSON
- 100% offline capability with localStorage persistence

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000/gantt](http://localhost:3000/gantt) in your browser.

## 📦 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Date Utilities**: date-fns
- **Storage**: localStorage (100% offline)
- **Architecture**: Clean Architecture

## 🎨 Usage

### Creating an Event

1. Click "Add Event" button
2. Fill in name, group, start/end dates, and optional description
3. Click "Save"

### Filtering and Search

1. Use the search bar to find events by keyword
2. Use group checkboxes to filter by category
3. Combine both for precise filtering

### Navigating Timeline

1. Use "Earlier" / "Later" buttons to pan timeline
2. Click "Show All" to fit all events in view
3. Scroll horizontally/vertically as needed

### Version History

1. Click "Save Version" (or press `Ctrl+S`)
2. Enter a descriptive note
3. Select 2 versions from history
4. Click "Compare Versions" to see changes

### Managing Groups

1. Click "Manage Groups"
2. Add, edit, or delete custom groups
3. Assign colors and names to organize your events

### Data Export/Import

1. Click "Export" to download current chart as JSON
2. Click "Import" to restore from a JSON file backup

## 🏗️ Architecture

Clean Architecture with layer separation:
- **UI Layer**: React components (`lib/gantt-chart/ui/`)
- **Presenter Layer**: Zustand stores (`lib/gantt-chart/presenter/`)
- **Use Case Layer**: Business logic (`lib/gantt-chart/usecase/`)
- **Repository Layer**: Data access (`lib/gantt-chart/repository/`)
- **External Layer**: localStorage (`lib/gantt-chart/external/`)

### Layer Dependencies

```
UI → Presenter → Use Case → Repository → External
```

See `specs/001-gantt-chart/` for detailed documentation.

## 📊 Performance

- Chart renders <1s for 200 events ✅
- Smooth scrolling at 30+ fps ✅
- Filter results <0.5s for 500 events ✅

## 💾 Storage

- 100% offline operation
- localStorage persistence (~5-10MB limit)
- Automatic quota monitoring
- Version snapshots with full state

## 🧪 Testing

Refer to `specs/001-gantt-chart/quickstart.md` for comprehensive validation scenarios covering:
- First-time user experience
- Filtering and search
- Sticky headers and scrolling
- Visual time indicators
- Focus period highlighting
- Version history and comparison
- Group management
- Data persistence
- Performance testing
- Edge cases and error handling

## 📝 Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📋 Project Status

**✅ All Phases Complete** (Phases 1-10)

- [x] Phase 1: Setup
- [x] Phase 2: Foundational (Core Infrastructure)
- [x] Phase 3: User Story 1 - Create and View Basic Gantt Chart (P1 MVP)
- [x] Phase 4: User Story 2 - Filter and Search Events (P2)
- [x] Phase 5: User Story 3 - Navigate Timeline with Sticky Headers (P2)
- [x] Phase 6: User Story 4 - Visual Time Indicators (P3)
- [x] Phase 7: User Story 5 - Highlight Focus Time Period (P3)
- [x] Phase 8: User Story 6 - Version History and Comparison (P2)
- [x] Phase 9: User Story 7 - Manage Groups (P3)
- [x] Phase 10: Polish & Cross-Cutting Concerns

---

**Version**: 1.0.0 (Production Ready)  
**Status**: ✅ All Features Complete
