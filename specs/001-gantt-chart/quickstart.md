# Quickstart: Gantt Chart Planning Tool

**Feature**: Gantt Chart Planning Tool  
**Date**: 2025-11-29  
**Purpose**: Validate implementation completeness with end-to-end scenarios

This document provides step-by-step validation scenarios to verify all features work correctly together. Execute these scenarios after implementation to ensure the feature meets all acceptance criteria.

---

## Prerequisites

1. Next.js project initialized with Tailwind CSS
2. Dependencies installed:
   ```bash
   npm install zustand immer date-fns
   ```
3. Feature implemented in `lib/gantt-chart/` following Clean Architecture
4. Main page created at `app/gantt/page.tsx`
5. localStorage available in browser

---

## Validation Scenario 1: First-Time User Experience (US1 - P1)

**Goal**: Verify default initialization and basic event creation

### Steps

1. **Open Application**
   ```
   Navigate to: http://localhost:3000/gantt
   ```

2. **Verify Initial State**
   - [ ] Page loads without errors
   - [ ] Gantt chart displays with empty event list
   - [ ] Three default groups visible: Frontend, Backend, Design
   - [ ] All groups checked in filter
   - [ ] Timeline shows today ±7 days
   - [ ] Date header row visible at top
   - [ ] Event name column visible at left
   - [ ] "Today" vertical line visible (if today is within range)

3. **Create First Event**
   - [ ] Click "Add Event" button
   - [ ] Modal/form opens
   - [ ] Fill in:
     - Name: "Build Login API"
     - Group: Backend
     - Start Date: (select today's date)
     - End Date: (select 5 days from today)
     - Description: "Implement JWT authentication"
   - [ ] Click "Save"
   - [ ] Modal closes
   - [ ] New event appears in event list (left column)
   - [ ] New event bar appears on timeline (green color for Backend)
   - [ ] Event bar spans correct date range (5 days)

4. **Create Multiple Events**
   - [ ] Add "Design Homepage UI" (Design group, 3 days)
   - [ ] Add "Frontend Login Form" (Frontend group, 4 days)
   - [ ] Add "API Documentation" (Backend group, 2 days)
   - [ ] Verify all 4 events display correctly
   - [ ] Verify different colors for different groups

5. **Edit an Event**
   - [ ] Click on "Build Login API" event (name or bar)
   - [ ] Edit form opens with pre-filled values
   - [ ] Change end date to +2 days
   - [ ] Click "Save"
   - [ ] Event bar updates to new length
   - [ ] Verify timeline reflects change

6. **Delete an Event**
   - [ ] Click on "API Documentation" event
   - [ ] Click "Delete" button in form
   - [ ] Confirmation prompt appears
   - [ ] Click "Confirm"
   - [ ] Event removed from list and timeline
   - [ ] Other events remain unchanged

**Expected Result**: ✅ Users can create, view, edit, and delete events with correct visual representation on the Gantt chart.

**Success Criteria Met**: SC-001 (create event <30 seconds), FR-001 to FR-005

---

## Validation Scenario 2: Filtering and Search (US2 - P2)

**Goal**: Verify event filtering by group and keyword search

### Prerequisites
- At least 10 events created across all 3 groups
- Events with names containing "API", "login", "design", etc.

### Steps

1. **Filter by Group**
   - [ ] Uncheck "Frontend" in group filter
   - [ ] Verify only Backend and Design events display
   - [ ] Frontend events disappear from list and timeline
   - [ ] Re-check "Frontend"
   - [ ] Verify all events reappear

2. **Keyword Search**
   - [ ] Type "API" in search box
   - [ ] Verify only events with "API" in name or description display
   - [ ] Timeline updates to show only matching events
   - [ ] Clear search box
   - [ ] Verify all events reappear

3. **Combined Filters**
   - [ ] Uncheck "Design" group
   - [ ] Type "login" in search
   - [ ] Verify only Frontend/Backend events with "login" display
   - [ ] This is the intersection of both filters

4. **Clear All Filters**
   - [ ] Clear search box
   - [ ] Check all groups
   - [ ] Verify all events visible again

**Expected Result**: ✅ Filtering by group and keyword works correctly, both independently and combined.

**Success Criteria Met**: SC-002 (find event <10 seconds), FR-012 to FR-015

---

## Validation Scenario 3: Sticky Headers and Scrolling (US3 - P2)

**Goal**: Verify sticky headers remain visible during scrolling

### Prerequisites
- Create 50+ events to enable vertical scrolling
- Events span 60+ days to enable horizontal scrolling

### Steps

1. **Vertical Scrolling**
   - [ ] Scroll down through event list
   - [ ] Verify date header remains fixed at top
   - [ ] Verify dates stay aligned with timeline grid
   - [ ] Scroll to bottom of list
   - [ ] Date header still visible

2. **Horizontal Scrolling**
   - [ ] Scroll right to view future dates
   - [ ] Verify event name column remains fixed at left
   - [ ] Verify event names stay aligned with their rows
   - [ ] Scroll far right
   - [ ] Event names still visible

3. **Combined Scrolling**
   - [ ] Scroll both vertically and horizontally
   - [ ] Both headers remain in position
   - [ ] Verify corner cell (top-left) is sticky in both directions

4. **Today Line Scrolling**
   - [ ] Scroll horizontally so "today" line moves
   - [ ] Verify line stays positioned at today's date
   - [ ] Line spans from top to bottom through all events

**Expected Result**: ✅ Headers remain sticky during all scroll operations, maintaining chart readability.

**Success Criteria Met**: SC-011 (sticky headers function correctly), FR-021 to FR-023

---

## Validation Scenario 4: Visual Time Indicators (US4 - P3)

**Goal**: Verify today line and 5-day guide lines display correctly

### Steps

1. **Today Line**
   - [ ] Verify prominent vertical line at today's date
   - [ ] Line spans from header to bottom of chart
   - [ ] Line is visually distinct (e.g., red/orange color)
   - [ ] Line position is accurate (aligned with today's column)

2. **5-Day Guide Lines**
   - [ ] Navigate to timeline start
   - [ ] Verify light vertical lines every 5 days
   - [ ] Lines span from header to bottom
   - [ ] Lines are subtle (e.g., gray, dashed)
   - [ ] Count intervals: day 5, 10, 15, 20, etc.

3. **Edge Case: Today Not Visible**
   - [ ] Pan timeline to future dates (exclude today)
   - [ ] Verify no error occurs
   - [ ] Today line not displayed (graceful handling)
   - [ ] 5-day guides still display correctly

**Expected Result**: ✅ Visual indicators help users orient themselves in time without manual counting.

**Success Criteria Met**: SC-012 (visual indicators display accurately), FR-024 to FR-025

---

## Validation Scenario 5: Focus Time Period (US5 - P3)

**Goal**: Verify focus period highlighting works with filters

### Steps

1. **Set Focus Period**
   - [ ] Click "Set Focus Period" control
   - [ ] Select start date: 10 days from now
   - [ ] Select end date: 20 days from now
   - [ ] Click "Apply"
   - [ ] Verify that 10-day range is visually highlighted
   - [ ] All events remain visible (no filtering)

2. **Combined with Filters**
   - [ ] Keep focus period active
   - [ ] Uncheck "Backend" group
   - [ ] Verify highlight remains, but Backend events hidden
   - [ ] Type "design" in search
   - [ ] Both focus highlight and event filter work together

3. **Clear Focus Period**
   - [ ] Click "Clear Focus" button
   - [ ] Verify highlight disappears
   - [ ] Timeline returns to normal appearance
   - [ ] Event filters remain active

**Expected Result**: ✅ Focus period visually emphasizes a time range while preserving full event visibility and filter functionality.

**Success Criteria Met**: FR-026 to FR-028

---

## Validation Scenario 6: Version History and Comparison (US6 - P2)

**Goal**: Verify version snapshots and diff comparison

### Steps

1. **Create Initial Version**
   - [ ] Create 5 events
   - [ ] Click "Save Version" button
   - [ ] Modal opens asking for note
   - [ ] Enter: "Initial project schedule"
   - [ ] Click "Save"
   - [ ] Version V1 created
   - [ ] Appears in version history list

2. **Make Changes and Save V2**
   - [ ] Add 2 new events
   - [ ] Delete 1 existing event
   - [ ] Edit 1 event (change dates)
   - [ ] Click "Save Version"
   - [ ] Enter note: "Added design tasks"
   - [ ] Version V2 created

3. **View Version List**
   - [ ] Open "Version History"
   - [ ] Verify V1 and V2 listed
   - [ ] Each shows: number, timestamp, note
   - [ ] V2 is newer (appears first in descending order)

4. **Compare Versions**
   - [ ] Select V1 and V2 for comparison
   - [ ] Click "Compare Versions"
   - [ ] Diff report displays showing:
     - [ ] 2 added events (with names, dates, groups)
     - [ ] 1 deleted event (with original details)
     - [ ] 1 modified event (with before/after values)
     - [ ] Specific changed fields highlighted

5. **Verify Diff Accuracy**
   - [ ] Review added events: match actual new events
   - [ ] Review deleted event: matches actual deleted event
   - [ ] Review modified event:
     - [ ] Old values match V1 snapshot
     - [ ] New values match V2 snapshot
     - [ ] Only changed fields listed (not unchanged fields)

6. **Create V3 with No Changes**
   - [ ] Without making changes, click "Save Version"
   - [ ] Enter note: "No changes test"
   - [ ] Version V3 created
   - [ ] Compare V2 vs V3
   - [ ] Diff report shows: "No changes detected"

**Expected Result**: ✅ Version history tracks schedule evolution, and diff comparison accurately identifies all changes.

**Success Criteria Met**: SC-003 (understand diff <60 seconds), SC-008, SC-009, FR-029 to FR-040

---

## Validation Scenario 7: Group Management (US7 - P3)

**Goal**: Verify custom group creation and management

### Steps

1. **Add Custom Group**
   - [ ] Click "Manage Groups"
   - [ ] Click "Add Group"
   - [ ] Enter name: "QA Testing"
   - [ ] Select color: #9333EA (purple)
   - [ ] Click "Save"
   - [ ] New group appears in filter list
   - [ ] Group is checked by default

2. **Create Event with Custom Group**
   - [ ] Create event: "Write Test Cases"
   - [ ] Select group: QA Testing
   - [ ] Verify event bar displays in purple

3. **Edit Group**
   - [ ] Open "Manage Groups"
   - [ ] Edit "QA Testing"
   - [ ] Change name to: "Quality Assurance"
   - [ ] Change color to: #8B5CF6
   - [ ] Save
   - [ ] Existing events update to new name/color

4. **Try to Delete Group with Events**
   - [ ] Try to delete "Quality Assurance" group
   - [ ] Error message displays: "Cannot delete group with events"
   - [ ] Deletion prevented

5. **Reassign and Delete**
   - [ ] Edit "Write Test Cases" event
   - [ ] Change group to "Backend"
   - [ ] Now delete "Quality Assurance" group
   - [ ] Deletion succeeds
   - [ ] Group removed from filter list

**Expected Result**: ✅ Users can create, edit, and delete custom groups with proper validation and cascading updates.

**Success Criteria Met**: FR-006 to FR-011

---

## Validation Scenario 8: Data Persistence (All Features)

**Goal**: Verify all data persists across browser sessions

### Steps

1. **Create Complete State**
   - [ ] Create 10 events across all groups
   - [ ] Set search keyword: "API"
   - [ ] Uncheck "Design" group
   - [ ] Set focus period
   - [ ] Save 2 versions
   - [ ] Pan timeline to specific date range

2. **Close and Reopen Browser**
   - [ ] Close browser tab/window completely
   - [ ] Reopen browser
   - [ ] Navigate to http://localhost:3000/gantt

3. **Verify State Restored**
   - [ ] All 10 events still exist
   - [ ] Search keyword "API" still active
   - [ ] "Design" group still unchecked
   - [ ] Focus period still set
   - [ ] 2 versions still in history
   - [ ] Timeline position maintained (or reset to default - acceptable)

4. **Verify Offline Capability**
   - [ ] Disconnect from internet
   - [ ] Refresh page
   - [ ] Verify app still works
   - [ ] Create new event
   - [ ] Save version
   - [ ] All operations succeed without network

**Expected Result**: ✅ All data persists in localStorage and app works 100% offline.

**Success Criteria Met**: SC-007 (zero data loss), SC-013, SC-014 (100% offline), FR-041 to FR-044

---

## Validation Scenario 9: Performance Testing

**Goal**: Verify performance meets success criteria

### Steps

1. **Large Dataset Test**
   - [ ] Create 200 events programmatically (or import if feature exists)
   - [ ] Measure initial chart render time
   - [ ] Expected: <1 second (SC-004)

2. **Scrolling Performance**
   - [ ] Create 100 events spanning 100 days
   - [ ] Scroll vertically through all events
   - [ ] Verify smooth 30+ fps (no janky scrolling)
   - [ ] Scroll horizontally across timeline
   - [ ] Verify smooth scrolling (SC-005)

3. **Filter Performance**
   - [ ] With 500 events loaded
   - [ ] Type search keyword
   - [ ] Measure filter response time
   - [ ] Expected: <0.5 seconds (SC-006)
   - [ ] Toggle group visibility
   - [ ] Expected: Instant update

4. **Version Comparison Performance**
   - [ ] Create version with 200 events
   - [ ] Modify 50 events
   - [ ] Create new version
   - [ ] Compare versions
   - [ ] Diff should compute quickly (<2 seconds)

**Expected Result**: ✅ App maintains performance targets even with large datasets.

**Success Criteria Met**: SC-004, SC-005, SC-006

---

## Validation Scenario 10: Edge Cases and Error Handling

**Goal**: Verify robust error handling

### Steps

1. **Date Validation**
   - [ ] Try to create event with endDate < startDate
   - [ ] Error message displays: "End date must be >= start date"
   - [ ] Event not created

2. **Empty Name Validation**
   - [ ] Try to create event with empty name
   - [ ] Error message displays: "Name is required"
   - [ ] Event not created

3. **Storage Quota (Simulated)**
   - [ ] Fill localStorage to near capacity (if possible)
   - [ ] Try to save large version
   - [ ] If quota exceeded: User-friendly error message
   - [ ] App doesn't crash

4. **Missing Group Reference**
   - [ ] Manually corrupt localStorage (delete a group)
   - [ ] Reload app
   - [ ] Events with missing group should:
     - [ ] Either show error or
     - [ ] Reassign to default group or
     - [ ] Be filtered out with warning

5. **Empty Chart Operations**
   - [ ] Delete all events
   - [ ] Verify timeline still displays (default range)
   - [ ] Save version with no events
   - [ ] Version creation succeeds (empty state valid)

**Expected Result**: ✅ App handles edge cases gracefully with clear error messages and no crashes.

---

## Completion Checklist

After running all scenarios:

- [ ] All user stories (US1-US7) validated
- [ ] All functional requirements (FR-001 to FR-044) tested
- [ ] All success criteria (SC-001 to SC-014) met
- [ ] Performance targets achieved
- [ ] Edge cases handled gracefully
- [ ] Data persistence verified
- [ ] Offline capability confirmed
- [ ] Clean Architecture maintained (verified via code review)

---

## Notes

- **Browser Compatibility**: Test in Chrome, Firefox, Safari, Edge
- **localStorage Limits**: Typical limit is 5-10MB; test varies by browser
- **Performance**: Actual performance may vary based on hardware; targets are guidelines
- **Accessibility**: Consider testing with screen readers and keyboard navigation (not covered in MVP scenarios)

---

## Next Steps After Validation

1. **If all scenarios pass**: Feature is complete and ready for user acceptance testing
2. **If scenarios fail**: Review implementation against contracts and data model
3. **Optional enhancements**: Consider drag-to-resize event bars, export/import, mobile responsive design

---

**Validation Complete**: ✅ Feature meets all acceptance criteria and is ready for production use.
