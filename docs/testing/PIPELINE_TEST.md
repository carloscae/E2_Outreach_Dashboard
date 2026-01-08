# Pipeline Test Documentation

> End-to-end testing guide for the Market Intelligence pipeline: **Collect → Analyze → Report**

---

## Quick Start

1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/test`
3. Click **🔄 Run Full Pipeline** to execute all stages

---

## Pipeline Stages

### 1. 📡 Collection (`/api/collect`)

Collects market intelligence signals using the Collector Agent.

**What it does:**
- Searches NewsAPI for bookmaker/betting news
- Checks E2 partnership status via GraphQL
- Checks Google Trends for entity interest
- Stores discovered signals in database

**Expected output:**
- Signals Found: Number of raw signals discovered
- Signals Stored: Number stored (deduped)
- Token Usage: Claude API tokens consumed

**Edge cases:**
- No news results → 0 signals stored (expected)
- Rate limiting → Agent may truncate search

---

### 2. 🔍 Analysis (`/api/analyze`)

Scores signals using the 0-14 framework.

**Scoring breakdown:**
| Category | Points | What it measures |
|----------|--------|------------------|
| Market Entry Momentum | 0-4 | Expansion activity |
| E2 Partnership Fit | 0-4 | Target profile alignment |
| Actionability | 0-3 | Ease of outreach |
| Data Confidence | 0-3 | Source quality |

**Priority thresholds:**
- **HIGH:** ≥10 points
- **MEDIUM:** 7-9 points
- **LOW:** <7 points

**Expected output:**
- Signals Analyzed: Count of newly analyzed signals
- Priority Breakdown: HIGH/MEDIUM/LOW counts
- Token Usage: Claude API tokens consumed

**Edge cases:**
- Already analyzed signals → Skipped (no duplicate analysis)
- No unanalyzed signals → Quick return with 0 count

---

### 3. 📧 Report (`/api/report`)

Generates email-ready market intelligence reports.

**What it does:**
- Fetches analyzed signals from past 14 days
- Groups by priority level
- Generates HTML email template
- Optionally sends via Resend

**Expected output (preview mode):**
- Total Signals: Signals included in report
- HIGH/MEDIUM/LOW: Priority breakdown
- HTML Preview: Rendered email preview

**Full send mode:**
- Report stored in database
- Email sent to configured recipients

---

## Test Console Features

### Individual Stage Buttons
- **Collect**: Run only collection
- **Analyze**: Run only analysis
- **Report**: Generate report preview

### Dashboard Button
- Fetches current signals from database
- Shows priority distribution
- Displays signal details table

### Pipeline Status Indicator
Shows real-time progress:
```
✅ Collect → ⏳ Analyze → ⏸️ Report
```

### Console Log
- Full execution log with timestamps
- Token usage tracking
- Error messages if any

---

## API Endpoints

### POST `/api/collect`
```json
{
  "geo": "br",
  "daysBack": 7
}
```

### POST `/api/analyze`
```json
{
  "signalIds": ["uuid-1", "uuid-2"]  // Optional, empty = all unanalyzed
}
```

### POST `/api/report`
```json
{
  "preview": true,           // Generate without storing/sending
  "sendEmail": false,        // Actually send email
  "cycleStart": "2025-01-01", // Optional date range
  "cycleEnd": "2025-01-14"
}
```

### GET `/api/dashboard`
```
?geo=br&limit=50&priority=HIGH
```

---

## Common Issues

### No signals collected
- **Cause:** NewsAPI may have no relevant results
- **Solution:** Try different geo or wait for news cycle

### Analysis returns 0
- **Cause:** All signals already analyzed
- **Solution:** Collect new signals first

### Report shows old data
- **Cause:** Report pulls from last 14 days
- **Solution:** Adjust cycleStart/cycleEnd parameters

### Email not sent
- **Cause:** Missing RESEND_API_KEY or REPORT_RECIPIENT_EMAIL
- **Solution:** Configure env variables

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API for agents |
| `NEWS_API_KEY` | NewsAPI access |
| `RESEND_API_KEY` | Email sending |
| `REPORT_RECIPIENT_EMAIL` | Default email recipient |
| `SUPABASE_URL` | Database connection |
| `SUPABASE_ANON_KEY` | Database auth |

---

## Verification Checklist

- [ ] Collection finds and stores signals
- [ ] Analysis scores signals correctly (0-14 scale)
- [ ] Priority classification works (HIGH ≥10, MEDIUM 7-9, LOW <7)
- [ ] Report preview generates HTML
- [ ] Report email sends successfully
- [ ] Dashboard displays signals with scores
- [ ] Console logs show full execution trace

---

## Last Verified

- **Date:** 2026-01-08
- **Agent:** Sentinel-QA
- **Result:** ✅ All stages passing
