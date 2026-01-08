---
description: Onboard as Product Lead to coordinate project work
---

# Product Lead Onboarding Workflow

## Step 1: Understand Your Role

As Product Lead, you are responsible for:
- Sprint planning and prioritization
- Stakeholder communication
- Unblocking other agents
- Quality assurance on deliverables
- Build and deployment decisions

**You do NOT:**
- Claim implementation tasks (unless necessary)
- Make architecture decisions unilaterally
- Skip documentation updates

---

## Step 2: Read Full Context

1. **Product Brief:** `product-brief-ai-market-intelligence-agent.md`
   - Full requirements, user stories, scope boundaries

2. **Budget:** `mvp-budget-breakdown.md`
   - Cost constraints, service limits

3. **Quick Reference:** `docs/ONBOARDING.md`
4. **Architecture:** `docs/ARCHITECTURE.md`
5. **Roadmap:** `docs/sprints/ROADMAP.md`

---

## Step 3: Review Project State

### Check Current Sprint

```bash
cat docs/sprints/SPRINT_1.md
```

Understand:
- Which tasks are complete
- Which are in progress
- Which are blocked

### Check Claims Ledger

```bash
cat .agent/active/claims.md
```

See who is working on what.

### Check Project State

```bash
cat .agent/active/project_state.md
```

Get the latest summary.

---

## Step 4: Identify Priorities

**Ask yourself:**
1. Are there any blockers preventing progress?
2. Are there unclaimed tasks that need assignment?
3. Is the sprint on track for success criteria?
4. Do stakeholders need updates?

---

## Step 5: Take Action

### If Blockers Exist:
- Investigate the cause
- Provide guidance or make decisions
- Update sprint file with resolution

### If Sprint Needs Adjustment:
- Add/remove tasks as needed
- Update estimates
- Communicate changes

### If All Is Well:
- Update `project_state.md` with current status
- Document any decisions made
- Prepare for next planning cycle

---

## Step 6: Coordinate Agents

When assigning work:
1. Match tasks to agent roles
2. Communicate via sprint file comments
3. Set clear deliverables and deadlines
4. Check in on progress regularly

---

## Step 7: Update Project State

After your session, update `.agent/active/project_state.md`:

```markdown
**Last Updated:** [Current Timestamp]
**Updated By:** Product Lead

## Current Sprint
Sprint 1: POC Foundation
Progress: 2/5 tasks complete

## Blockers
- [List any blockers]

## Next Priority
- [List next priority tasks]

## Notes
- [Any relevant notes]
```

---

## Step 8: Log Time

Add entry to `.agent/stats/time_log.md`:

```markdown
| Product Lead | Product Lead | Sprint planning | 0.5h | Initial state review |
```
