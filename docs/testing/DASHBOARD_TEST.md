# Dashboard Integration Test Documentation

> Testing guide for the Market Intelligence Dashboard UI (Sprint 3)

---

## Quick Start

1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/dashboard`
3. Browse signals at: `http://localhost:3000/dashboard/signals`
4. View reports at: `http://localhost:3000/dashboard/reports`

---

## Test Results Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard Page | ✅ | Loads with stats cards |
| Signal Cards | ✅ | Entity, type, score, priority badges |
| Priority Filters | ✅ | Tabs update display + URL params |
| Type/Geo/Sort Filters | ✅ | Dropdown filters work |
| Feedback Buttons | ✅ | Thumbs up/down, visual state change |
| Reports Page | ✅ | Lists archived reports |
| Mobile Responsive | ✅ | Collapsible sidebar |

---

## Dashboard Page (`/dashboard`)

### Stats Cards
- High Priority (red) - signals requiring immediate attention
- Medium Priority (yellow) - worth monitoring
- Low Priority (gray) - for reference

### Quick Actions
- Browse All Signals → `/dashboard/signals`
- View Reports → `/dashboard/reports`

---

## Signals Page (`/dashboard/signals`)

### Signal Table Columns
| Column | Description |
|--------|-------------|
| Entity | Company/operator name |
| Type | Badge: bookmaker, publisher, app, channel |
| Region | Full country name (e.g., "Brazil") |
| Score | X/14 format with priority scoring |
| Priority | Badge: HIGH (red), MEDIUM (yellow), LOW (gray) |
| Signal Type | Type of market signal detected |
| Date | When analyzed |
| Feedback | Thumbs up/down buttons |

### Filtering
- **Priority Tabs**: All, High, Medium, Low
- **Type Dropdown**: All Types, Bookmaker, Publisher, etc.
- **Region Dropdown**: All Regions, Brazil, Mexico, etc.
- **Sort Dropdown**: Score, Date, Name

### URL Parameters
Filters persist in URL for shareability:
```
/dashboard/signals?priority=HIGH&sort=score
```

---

## Feedback System

### UI Components
- Thumbs up (👍) - Green when selected
- Thumbs down (👎) - Red when selected
- Toggle behavior: Click again to deselect

### API Endpoint
`POST /api/feedback`
```json
{
  "signalId": "uuid",
  "isUseful": true
}
```

---

## Reports Page (`/dashboard/reports`)

- Lists all generated reports
- Shows date range and stats
- Expandable report cards
- Stats: HIGH/MEDIUM/LOW priority counts

---

## Mobile Responsiveness

- Sidebar collapses to icons only
- Main content adapts to viewport
- Touch-friendly button sizing
- Readable text at all sizes

---

## Known Issues & Fixes Applied

### Issue: Feedback API 500 Error
**Problem**: FeedbackButtons received `analyzed_signal.id` instead of `signal.id`  
**Fix**: Updated `signals-table.tsx` to pass `signal_id` to FeedbackButtons

---

## Verification Checklist

- [x] Dashboard loads at `/dashboard`
- [x] Stats cards show priority counts
- [x] Quick actions link correctly
- [x] Signals table shows all columns
- [x] Priority tabs filter signals
- [x] URL params update with filters
- [x] Feedback buttons are visible
- [x] Feedback submission works
- [x] Button state changes on click
- [x] Reports page loads
- [x] Mobile sidebar collapses

---

## Last Verified

- **Date:** 2026-01-08
- **Agent:** Sentinel-QA
- **Status:** ✅ All tests passing
