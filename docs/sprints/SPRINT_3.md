# Sprint 3: POC Dashboard

**Start Date:** 2025-01-08
**Target Duration:** ~4 days
**Goal:** User interface for reviewing signals and providing feedback

---

## Role Summary

| Role | Tasks |
|------|-------|
| **UI Developer** | S3-01, S3-02, S3-03 |
| **State Engineer** | S3-04 |
| **QA Agent** | S3-05 |

---

## Tasks

### S3-01: Dashboard Page with Signal Cards
**Role:** UI Developer
**Status:** `[ ]` Not Started
**Dependencies:** S2-01 (Analyzer Agent)
**Estimated:** 4 hours

**Deliverables:**
- [ ] Dashboard page at `/dashboard`
- [ ] Signal card component with shadcn/ui
  - Entity name + type badge
  - Priority badge (HIGH=red, MEDIUM=yellow, LOW=gray)
  - Score display (0-14)
  - Signal type + collected date
  - Evidence preview
- [ ] Responsive grid layout
- [ ] Loading and empty states

**Files:**
- `src/app/dashboard/page.tsx` (NEW)
- `src/components/signals/signal-card.tsx` (NEW)
- `src/components/signals/priority-badge.tsx` (NEW)

---

### S3-02: Filtering and Sorting
**Role:** UI Developer
**Status:** `[ ]` Not Started
**Dependencies:** S3-01
**Estimated:** 3 hours

**Deliverables:**
- [ ] Filter by priority (HIGH, MEDIUM, LOW, ALL)
- [ ] Filter by entity type (bookmaker, publisher, app, channel)
- [ ] Filter by geo (BR, US, EU)
- [ ] Sort by score, date, or name
- [ ] URL query params for shareable filters
- [ ] Filter UI using shadcn Select/Tabs

**Files:**
- `src/app/dashboard/page.tsx` (UPDATE)
- `src/components/signals/signal-filters.tsx` (NEW)

---

### S3-03: Feedback Mechanism
**Role:** UI Developer
**Status:** `[ ]` Not Started
**Dependencies:** S3-01
**Estimated:** 3 hours

**Deliverables:**
- [ ] Thumbs up/down buttons on signal cards
- [ ] POST `/api/feedback` endpoint
- [ ] Store feedback in `feedback` table
- [ ] Visual state change after feedback
- [ ] Optional: comment field for detailed feedback

**Files:**
- `src/components/signals/feedback-buttons.tsx` (NEW)
- `src/app/api/feedback/route.ts` (NEW or UPDATE)
- `src/lib/db/feedback.ts` (UPDATE)

---

### S3-04: Report Archive View
**Role:** State Engineer
**Status:** `[ ]` Not Started
**Dependencies:** S2-02 (Reporter Agent)
**Estimated:** 2 hours

**Deliverables:**
- [ ] Reports page at `/reports`
- [ ] List of generated reports with date
- [ ] View report content (expandable)
- [ ] Link to email preview
- [ ] GET `/api/reports` endpoint

**Files:**
- `src/app/reports/page.tsx` (NEW)
- `src/app/api/reports/route.ts` (NEW)
- `src/components/reports/report-card.tsx` (NEW)

---

### S3-05: Dashboard Integration Test
**Role:** QA Agent
**Status:** `[ ]` Not Started
**Dependencies:** S3-01, S3-02, S3-03, S3-04
**Estimated:** 2 hours

**Deliverables:**
- [ ] Test signal cards render correctly
- [ ] Test filters update display
- [ ] Test feedback submission works
- [ ] Test reports page loads
- [ ] Mobile responsiveness check
- [ ] Update test page with dashboard link

**Files:**
- `docs/testing/DASHBOARD_TEST.md` (NEW)
- `src/app/test/page.tsx` (UPDATE)

---

## Success Criteria

- [ ] Dashboard shows all analyzed signals
- [ ] Can filter by priority, type, and geo
- [ ] Can sort signals by score or date
- [ ] Feedback buttons submit to database
- [ ] Reports page shows archived reports
- [ ] Works on mobile devices

---

## Blockers & Notes

*Add blockers during sprint.*

---

## Completed Tasks

| Task ID | Agent | Completed At | Notes |
|---------|-------|--------------|-------|
