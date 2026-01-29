# Sprint 5: Scaling Architecture

**Start Date:** 2026-01-29
**Target Duration:** ~4 days
**Goal:** Enable publisher discovery and fix data quality issues

---

## Budget Impact

| Service | Monthly Cost | Purpose |
|---------|-------------|---------|
| Serper.dev | €0 (FREE) | Google Search + autocomplete |
| Firecrawl API | ~€15 ($16 Hobby) | Publisher site crawling |
| **Total Additional** | **~€15** | Well within €200-300 budget |

---

## Role Summary

| Role | Tasks |
|------|-------|
| **Platform Engineer** | S5-01, S5-02, S5-06 |
| **State Engineer** | S5-03, S5-04 |
| **UI Developer** | S5-05 |
| **QA Agent** | S5-07 |

---

## Tasks

### S5-01: Serper.dev Integration
**Role:** Platform Engineer
**Status:** `[x]` Complete
**Completed By:** Product Lead
**Completed At:** 2026-01-29T13:40:00
**Dependencies:** None
**Estimated:** 2 hours

**Deliverables:**
- [x] Create `src/lib/tools/serper.ts` with Google Search API
- [x] Add `getAutocomplete()` for trend signal detection
- [x] Add `discoverBrazilianPublishers()` helper
- [x] Add `checkSearchPresence()` for entity buzz scoring

**Files:**
- `src/lib/tools/serper.ts` (NEW)

---

### S5-02: Firecrawl Integration
**Role:** Platform Engineer
**Status:** `[x]` Complete
**Completed By:** Product Lead
**Completed At:** 2026-01-29T13:40:00
**Dependencies:** None
**Estimated:** 3 hours

**Deliverables:**
- [x] Create `src/lib/tools/firecrawl.ts` with web crawling
- [x] Add `analyzePublisherForBetting()` with AI detection
- [x] Betting detection prompt for any odds widget
- [x] Add `batchAnalyzePublishers()` for bulk processing

**Files:**
- `src/lib/tools/firecrawl.ts` (NEW)

---

### S5-03: Publisher Collector Agent
**Role:** State Engineer
**Status:** `[x]` Complete
**Completed By:** Product Lead
**Completed At:** 2026-01-29T13:40:00
**Dependencies:** S5-01, S5-02
**Estimated:** 3 hours

**Deliverables:**
- [x] Create `src/lib/agents/publisher-collector.ts`
- [x] Discovery → Crawl → Analyze → Store flow
- [x] Entity type = 'publisher' for all signals
- [x] Scoring based on traffic + no betting detection

**Files:**
- `src/lib/agents/publisher-collector.ts` (NEW)
- `src/app/api/collect-publishers/route.ts` (NEW)

---

### S5-04: Signal Expiration System
**Role:** State Engineer
**Status:** `[x]` Complete
**Completed By:** Product Lead
**Completed At:** 2026-01-29T13:40:00
**Dependencies:** None
**Estimated:** 2 hours

**Deliverables:**
- [x] Add expiration columns to signals table
- [x] Create DB trigger for auto-expiration by signal type
- [x] Update TypeScript types with SignalCategory
- [x] Update signals query to filter expired by default

**Files:**
- `supabase/migrations/20260129_add_signal_expiration.sql` (NEW)
- `src/types/database.ts` (UPDATE)
- `src/lib/db/signals.ts` (UPDATE)

---

### S5-05: Dashboard Entity Filtering
**Role:** UI Developer
**Status:** `[x]` Complete
**Completed By:** Product Lead
**Completed At:** 2026-01-29T13:40:00
**Dependencies:** S5-04
**Estimated:** 2 hours

**Deliverables:**
- [x] Add entity type filter tabs (All / Bookmakers / Publishers)
- [x] Add expiration badge for time-sensitive signals
- [x] Show archived/expired signals with visual indicator
- [x] Support `showArchived` prop for archive view

**Files:**
- `src/components/signals/signals-table.tsx` (UPDATE)

---

### S5-06: Environment Configuration
**Role:** Platform Engineer
**Status:** `[x]` Complete
**Completed By:** Product Lead
**Completed At:** 2026-01-29T13:40:00
**Dependencies:** None
**Estimated:** 0.5 hours

**Deliverables:**
- [x] Add SERPER_API_KEY to .env.local
- [x] Add FIRECRAWL_API_KEY to .env.local

**Files:**
- `.env.local` (UPDATE)

---

### S5-07: Integration Verification
**Role:** QA Agent
**Status:** `[ ]` Not Started
**Dependencies:** S5-01 through S5-06
**Estimated:** 2 hours

**Deliverables:**
- [ ] Run database migration
- [ ] Verify build succeeds
- [ ] Test publisher collector endpoint
- [ ] Verify dashboard shows entity filters
- [ ] Document results in testing file

**Files:**
- `docs/testing/SPRINT_5_VERIFICATION.md` (NEW)

---

## Success Criteria

- [x] Serper.dev integrated and working
- [x] Firecrawl integrated with AI betting detection
- [x] Publisher collector agent discovers and scores publishers
- [x] Signal expiration system auto-calculates TTL
- [x] Dashboard shows entity type filtering
- [ ] Migration applied to Supabase
- [ ] Full pipeline tested with real publishers

---

## Blockers & Notes

*None currently*

---

## Completed Tasks

| Task ID | Agent | Completed At | Notes |
|---------|-------|--------------|-------|
| S5-01 | Product Lead | 2026-01-29T13:40:00 | Serper.dev integration with search, autocomplete, publisher discovery |
| S5-02 | Product Lead | 2026-01-29T13:40:00 | Firecrawl integration with AI betting detection |
| S5-03 | Product Lead | 2026-01-29T13:40:00 | Publisher collector agent with full discovery flow |
| S5-04 | Product Lead | 2026-01-29T13:40:00 | Signal expiration system with TTL by type |
| S5-05 | Product Lead | 2026-01-29T13:40:00 | Dashboard entity filtering with tabs and badges |
| S5-06 | Product Lead | 2026-01-29T13:40:00 | Environment variables configured |
