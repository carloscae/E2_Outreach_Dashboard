---
description: Complete a task and update all tracking files
---

# Task Checkout Workflow

## Step 1: Self-Verification

Before checking out, verify your work:

### Code Quality
- [ ] Code compiles without errors
- [ ] TypeScript types are correct
- [ ] No console errors in browser
- [ ] Feature works as described in deliverables

### Testing
```bash
# Run type check
npm run type-check

# Run linter (if configured)
npm run lint

# Run tests (if applicable)
npm test

# Start dev server and verify
npm run dev
```

### No Regressions
- [ ] Existing features still work
- [ ] No new console errors
- [ ] API routes return expected responses

---

## Step 2: Update Documentation

### If Architecture Changed:
Update `docs/ARCHITECTURE.md`:
- New files or directories
- New API endpoints
- Schema changes
- New dependencies

### If Environment Changed:
Update `.env.local.example`:
- New environment variables
- Updated comments

---

## Step 3: Update Sprint File

In `docs/sprints/SPRINT_X.md`:

### Mark Task Complete

Change status from `[/]` to `[x]`:

```markdown
**Status:** `[x]` Complete
**Completed By:** [Your Name]
**Completed At:** [Timestamp]
```

### Check Off Deliverables

```markdown
**Deliverables:**
- [x] Next.js 14 project initialized
- [x] TypeScript + Tailwind configured
- [x] Environment variables defined
```

### Move to Completed Section

Cut the task and paste it in "Completed Tasks" section:

```markdown
## Completed Tasks

| Task ID | Agent | Completed At | Notes |
|---------|-------|--------------|-------|
| S1-01 | Atlas-Platform | 2025-01-08T14:00:00 | Clean setup, no issues |
```

---

## Step 4: Update Claims Ledger

In `.agent/active/claims.md`:

Change status to `Completed`:

```markdown
| S1-01 | Atlas-Platform | Platform Specialist | 2025-01-08T10:00:00 | Completed |
```

---

## Step 5: Update Roster

In `.agent/active/roster.md`:

Remove from Active Agents, add to Hall of Fame:

```markdown
## Hall of Fame

| Name | Role | Tasks Completed | Total Time |
|------|------|-----------------|------------|
| Atlas-Platform | Platform Specialist | 1 | 2h |
```

---

## Step 6: Log Time

In `.agent/stats/time_log.md`:

Add entry:

```markdown
### 2025-01-08

| Agent | Role | Task | Hours | Notes |
|-------|------|------|-------|-------|
| Atlas-Platform | Platform Specialist | S1-01 | 2h | Next.js setup complete |
```

Update Summary table totals.

---

## Step 7: Check Follow-ups

Review sprint file for:
- Tasks that were blocked by yours (now unblocked)
- Dependencies that are now met
- Follow-up work needed

Note any unblocked tasks in your final report.

---

## Step 8: Final Report

Provide a brief summary for the Product Lead:

```markdown
## Checkout Report - [Task ID]

**Agent:** [Your Name]
**Task:** [Task Title]
**Duration:** [Hours spent]

### What Was Done
- [Bullet points of deliverables]

### Files Changed
- `path/to/file.ts` - [What was added/changed]

### Notes
- [Any important observations]
- [Technical debt incurred]
- [Suggestions for future]

### Unblocked
- [Task IDs that are now unblocked]
```
