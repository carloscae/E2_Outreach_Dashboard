# Sprint 4: Signal Transparency & Agent Intelligence

**Start Date:** 2025-01-09
**Target Duration:** ~3 days
**Goal:** Make signals useful by surfacing evidence and improving agent quality

---

## Role Summary

| Role | Tasks |
|------|-------|
| **UI Developer** | S4-01, S4-02 |
| **State Engineer** | S4-03, S4-04 |
| **QA Agent** | S4-05 |

---

## Tasks

### S4-01: Expand Dashboard Query with Evidence
**Role:** UI Developer
**Status:** `[x]` Complete
**Completed By:** Canvas-UI
**Completed At:** 2026-01-08T23:20:00
**Dependencies:** S3-01
**Estimated:** 2 hours

**Deliverables:**
- [x] Update `getDashboardSignals` to include evidence, source_urls
- [x] Include score_breakdown, ai_reasoning, risk_flags from analyzed_signals
- [x] Expand DashboardSignal type with new fields
- [x] Update API response with full signal data

**Files:**
- `src/lib/db/signals.ts` (UPDATE)
- `src/types/database.ts` (UPDATE)
- `src/app/api/dashboard/route.ts` (UPDATE)

---

### S4-02: Evidence & Reasoning UI
**Role:** UI Developer
**Status:** `[x]` Complete
**Completed By:** Canvas-UI
**Completed At:** 2026-01-08T23:35:00
**Dependencies:** S4-01
**Estimated:** 3 hours

**Deliverables:**
- [x] Show evidence links (clickable headlines with source)
- [x] Display score breakdown (Momentum, Fit, Actionability, Confidence)
- [x] Show AI reasoning in expandable panel
- [x] Display risk flags with visual indicators
- [x] Add recommended actions section

**Files:**
- `src/components/signals/signal-card.tsx` (UPDATE)
- `src/components/signals/signals-table.tsx` (UPDATE)
- `src/components/signals/evidence-panel.tsx` (NEW)
- `src/components/signals/score-breakdown.tsx` (NEW)

---

### S4-03: Collector Agent Intelligence
**Role:** State Engineer
**Status:** `[x]` Complete
**Completed By:** Schema-State
**Completed At:** 2026-01-08T23:35:00
**Dependencies:** None
**Estimated:** 3 hours

**Deliverables:**
- [x] Add verbose logging to see Claude's decision-making
- [x] Improve collector prompt to require reasoning for each signal
- [x] Force multiple search iterations (min 3 queries)
- [x] Require source diversification (5 signal categories)
- [x] Store detailed evidence with each signal

**Files:**
- `src/lib/agents/collector.ts` (UPDATE)
- `src/lib/agents/types.ts` (UPDATE)

---

### S4-04: Analyzer Agent Intelligence
**Role:** State Engineer
**Status:** `[x]` Complete
**Completed By:** Schema-State
**Completed At:** 2026-01-08T23:40:00
**Dependencies:** S4-03
**Estimated:** 2 hours

**Deliverables:**
- [x] Require detailed ai_reasoning for each score component
- [x] Generate specific recommended_actions
- [x] Detect and explain risk_flags
- [x] Improve score calibration (12+ scores rare)

**Files:**
- `src/lib/agents/analyzer.ts` (UPDATE)
- `src/lib/agents/types.ts` (UPDATE)

---

### S4-05: Pipeline Verification
**Role:** QA Agent
**Status:** `[x]` Complete
**Completed By:** Sentinel-QA
**Completed At:** 2026-01-08T23:50:00
**Dependencies:** S4-01, S4-02, S4-03, S4-04
**Estimated:** 2 hours

**Deliverables:**
- [x] Run full pipeline: Collect → Analyze → Dashboard
- [x] Verify evidence appears in UI
- [x] Verify score breakdown visible
- [x] Verify AI reasoning visible
- [x] Document signal quality improvements
- [x] Compare before/after signal quality

**Files:**
- `docs/testing/SIGNAL_QUALITY.md` (NEW)

---

## Success Criteria

- [x] Evidence (headlines, URLs) visible on signal cards
- [x] Score breakdown shows all 4 components
- [x] AI reasoning explains why each signal was scored
- [x] Collector generates signals with detailed evidence
- [x] Analyzer produces varied scores (not all 6)
- [x] Full pipeline produces usable, sellable output

---

## Blockers & Notes

*Add blockers during sprint.*

---

## Completed Tasks

| Task ID | Agent | Completed At | Notes |
|---------|-------|--------------|-------|
| S4-01 | Canvas-UI | 2026-01-08T23:20:00 | Expanded DashboardSignal type and query with evidence, score_breakdown, ai_reasoning, risk_flags |
| S4-02 | Canvas-UI | 2026-01-08T23:35:00 | Created score-breakdown.tsx and evidence-panel.tsx, expandable table rows |
| S4-03 | Schema-State | 2026-01-08T23:35:00 | Enhanced prompt with 5 signal categories, verbose logging, min 3 queries |
| S4-04 | Schema-State | 2026-01-08T23:40:00 | Per-criterion reasoning, score calibration, specific action templates |
| S4-05 | Sentinel-QA | 2026-01-08T23:50:00 | Pipeline verification, signal quality documentation, all features working |
