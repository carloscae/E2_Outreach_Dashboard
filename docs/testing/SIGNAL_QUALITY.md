# Signal Quality Documentation

> Testing guide for Sprint 4 - Signal Transparency & Agent Intelligence

---

## Quick Summary

Sprint 4 enhanced signal transparency by adding:
- **Evidence Sources** - News headlines with links
- **Score Breakdown** - Visual 4-component breakdown
- **AI Reasoning** - Detailed explanation of scores
- **Recommended Actions** - Specific next steps

---

## Verification Results

| Feature | Status | Notes |
|---------|--------|-------|
| Evidence Sources | ✅ | Clickable headlines visible |
| Score Breakdown | ✅ | 4 progress bars displayed |
| Recommended Actions | ✅ | 3 action items per signal |
| AI Reasoning | ✅ | Expandable section |
| Expandable Rows | ✅ | Chevron toggle working |

---

## Score Breakdown Components

| Component | Max | Description |
|-----------|-----|-------------|
| Market Entry Momentum | 4 | Expansion activity signals |
| E2 Partnership Fit | 4 | Alignment with target profile |
| Actionability | 3 | Ease of taking action |
| Data Confidence | 3 | Source quality & recency |

**Total:** 0-14 scale

---

## Signal Quality Before/After

| Aspect | Before (Sprint 3) | After (Sprint 4) |
|--------|-------------------|------------------|
| Evidence | Not visible | Headlines + links |
| Score | Single number | 4-component breakdown |
| Reasoning | None | Detailed AI explanation |
| Actions | None | 3 specific recommendations |
| UI | Static rows | Expandable details |

---

## Pipeline Performance

### Collection Stage
- Tokens used: ~8,682
- Min 3 search queries enforced
- 5 signal categories required

### Analysis Stage
- Per-criterion reasoning
- Score calibration (12+ rare)
- Risk flag detection

---

## UI Components Added

### Score Breakdown (`score-breakdown.tsx`)
- Progress bars for each criterion
- Color-coded by value
- Numeric labels (X/Y format)

### Evidence Panel (`evidence-panel.tsx`)
- Evidence sources with links
- Recommended actions list
- AI reasoning (collapsible)
- Risk flags with indicators

### Expandable Table Rows
- Chevron toggle
- Collapsible content
- Smooth animation

---

## Verification Checklist

- [x] Pipeline executes (Collect → Analyze)
- [x] Evidence headlines display
- [x] Source URLs are clickable
- [x] Score breakdown shows 4 bars
- [x] Progress values are correct
- [x] Recommended actions listed
- [x] AI reasoning expandable
- [x] Chevron toggle works
- [x] Row expansion smooth

---

## Last Verified

- **Date:** 2026-01-08
- **Agent:** Sentinel-QA
- **Status:** ✅ All features verified
