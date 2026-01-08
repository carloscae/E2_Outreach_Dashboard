---
description: Onboard as a new agent to claim and work on tasks
---

# Agent Onboarding Workflow

## Step 1: Choose Your Identity

Pick a unique name that reflects your role:
- **Platform Specialist:** Nexus, Atlas, Forge
- **State Engineer:** Logic, Flux, Schema
- **UI Developer:** Pixel, Canvas, Frame
- **QA Agent:** Probe, Sentinel, Verify

**Identity Format:** `[Name]-[Role]` (e.g., "Atlas-Platform")

---

## Step 2: Read Core Documentation

1. **Quick Reference:** `docs/ONBOARDING.md`
   - Project overview, tech stack, file structure
   
2. **Technical Details:** `docs/ARCHITECTURE.md`
   - Database schema, agent patterns, API design

---

## Step 3: Find Active Sprint

```bash
ls docs/sprints/
```

Read the highest numbered sprint file (e.g., `SPRINT_1.md`).

---

## Step 4: Check Claims Ledger

Read `.agent/active/claims.md` to see which tasks are already claimed.

**Rules:**
- Do NOT claim an already-claimed task
- One task at a time per agent
- Blockers have priority

---

## Step 5: Select a Task

**Priority Order:**
1. Tasks marked as **blockers** for other tasks
2. Tasks with all **dependencies met**
3. First available unclaimed task matching your role

---

## Step 6: Claim Your Task

### Update Claims Ledger (`.agent/active/claims.md`)

Add your claim to the Active Claims table:

```markdown
| S1-03 | Schema-State | State Engineer | 2025-01-08T10:00:00 | In Progress |
```

### Update Sprint File

Change the task status from `[ ]` to `[/]`:

```markdown
**Status:** `[/]` In Progress - Claimed by Schema-State
```

### Update Roster (`.agent/active/roster.md`)

Add yourself to Active Agents:

```markdown
| Schema-State | State Engineer | S1-03 | 2025-01-08T10:00:00 |
```

---

## Step 7: Execute Your Task

Follow the task deliverables in the sprint file.

**Role Guidelines:**

**Platform Specialist:**
- Focus on infrastructure, deployment, external services
- Ensure configurations are documented
- Test in isolation before integration

**State Engineer:**
- Focus on database, business logic, data flow
- Write type-safe code
- Include error handling

**UI Developer:**
- Focus on components, styling, user experience
- Ensure responsive design
- Test interactions

---

## Step 8: Complete Your Task

When done, run the checkout workflow:

```
/checkout
```

Or follow `.agent/workflows/checkout.md` manually.
