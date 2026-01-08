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
**Status:** `[ ]` Not Started
**Dependencies:** S3-01
**Estimated:** 2 hours

**Deliverables:**
- [ ] Update `getDashboardSignals` to include evidence, source_urls
- [ ] Include score_breakdown, ai_reasoning, risk_flags from analyzed_signals
- [ ] Expand DashboardSignal type with new fields
- [ ] Update API response with full signal data

**Files:**
- `src/lib/db/signals.ts` (UPDATE)
- `src/types/database.ts` (UPDATE)
- `src/app/api/dashboard/route.ts` (UPDATE)

---

### S4-02: Evidence & Reasoning UI
**Role:** UI Developer
**Status:** `[ ]` Not Started
**Dependencies:** S4-01
**Estimated:** 3 hours

**Deliverables:**
- [ ] Show evidence links (clickable headlines with source)
- [ ] Display score breakdown (Momentum, Fit, Actionability, Confidence)
- [ ] Show AI reasoning in expandable panel
- [ ] Display risk flags with visual indicators
- [ ] Add recommended actions section

**Files:**
- `src/components/signals/signal-card.tsx` (UPDATE)
- `src/components/signals/signals-table.tsx` (UPDATE)
- `src/components/signals/evidence-panel.tsx` (NEW)
- `src/components/signals/score-breakdown.tsx` (NEW)

---

### S4-03: Collector Agent Intelligence
**Role:** State Engineer
**Status:** `[ ]` Not Started
**Dependencies:** None
**Estimated:** 3 hours

**Deliverables:**
- [ ] Add verbose logging to see Claude's decision-making
- [ ] Improve collector prompt to require reasoning for each signal
- [ ] Force multiple search iterations (min 3 queries)
- [ ] Require source diversification
- [ ] Store detailed evidence with each signal

**Files:**
- `src/lib/agents/collector.ts` (UPDATE)
- `src/lib/agents/types.ts` (UPDATE)

---

### S4-04: Analyzer Agent Intelligence
**Role:** State Engineer
**Status:** `[ ]` Not Started
**Dependencies:** S4-03
**Estimated:** 2 hours

**Deliverables:**
- [ ] Require detailed ai_reasoning for each score component
- [ ] Generate specific recommended_actions
- [ ] Detect and explain risk_flags
- [ ] Improve score calibration (avoid all scores being 6)

**Files:**
- `src/lib/agents/analyzer.ts` (UPDATE)
- `src/lib/agents/types.ts` (UPDATE)

---

### S4-05: Pipeline Verification
**Role:** QA Agent
**Status:** `[ ]` Not Started
**Dependencies:** S4-01, S4-02, S4-03, S4-04
**Estimated:** 2 hours

**Deliverables:**
- [ ] Run full pipeline: Collect → Analyze → Dashboard
- [ ] Verify evidence appears in UI
- [ ] Verify score breakdown visible
- [ ] Verify AI reasoning visible
- [ ] Document signal quality improvements
- [ ] Compare before/after signal quality

**Files:**
- `docs/testing/SIGNAL_QUALITY.md` (NEW)

---

## Success Criteria

- [ ] Evidence (headlines, URLs) visible on signal cards
- [ ] Score breakdown shows all 4 components
- [ ] AI reasoning explains why each signal was scored
- [ ] Collector generates signals with detailed evidence
- [ ] Analyzer produces varied scores (not all 6)
- [ ] Full pipeline produces usable, sellable output

---

## Blockers & Notes

*Add blockers during sprint.*

---

## Completed Tasks

| Task ID | Agent | Completed At | Notes |
|---------|-------|--------------|-------|
