# Multi-Agent Project Bootstrap

**Purpose:** Set up a multi-agent development system for a new project.  
**Usage:** Give this document + a project brief to an agent to scaffold the complete system.

---

## Overview

This system enables multiple AI agents to work on a project in parallel with:
- Clear task ownership (claims ledger)
- Role-based work assignment
- Sprint-based planning
- Self-service onboarding
- Standardized checkout process

---

## Step 1: Create Directory Structure

```
/project-root
├── docs/
│   ├── [PROJECT_NAME]_product_spec.md   # Full product specification
│   ├── [PROJECT_NAME]_brief.md          # Quick reference for agents
│   ├── ONBOARDING.md                     # Agent quick-start guide
│   ├── ARCHITECTURE.md                   # Technical architecture doc
│   └── sprints/
│       ├── ROADMAP.md                    # Sprint timeline overview
│       └── SPRINT_1.md                   # Active sprint tasks
│
├── .agent/
│   ├── workflows/
│   │   ├── onboard.md                    # Agent onboarding workflow
│   │   ├── onboard-product-lead.md       # Product Lead onboarding
│   │   └── checkout.md                   # Task completion workflow
│   ├── active/
│   │   ├── claims.md                     # Task claims ledger
│   │   ├── roster.md                     # Active agents list
│   │   └── project_state.md              # Current state summary
│   └── stats/
│       └── time_log.md                   # Time investment tracking
│
└── src/                                  # Application source code
```

---

## Step 2: Create Core Documents

### 2.1 ONBOARDING.md (docs/)

Quick reference for agents. Include:
- One-sentence project summary
- Core philosophy / non-negotiables
- Tech stack table
- Data model / key interfaces
- Key screens / flows
- File structure overview
- Quick commands

> **Keep this under 200 lines.** Agents read it on every onboard.

### 2.2 ARCHITECTURE.md (docs/)

Technical deep-dive. Include:
- Full tech stack with versions
- Directory structure (detailed)
- State management patterns
- Navigation structure
- Build & deploy workflow
- Key design decisions

> Update this whenever architecture changes.

### 2.3 ROADMAP.md (docs/sprints/)

Sprint timeline. Include:
- All sprints (numbered, dated)
- Sprint goals (one sentence each)
- Key deliverables per sprint
- Success criteria per sprint
- Post-MVP backlog

---

## Step 3: Create Sprint Files

### SPRINT_X.md Template

```markdown
# Sprint X: [Sprint Title]

**Start Date:** YYYY-MM-DD  
**Target Duration:** ~X days  
**Goal:** [One sentence goal]

---

## Role Summary

| Role | Tasks |
|------|-------|
| **UI Developer** | SX-01, SX-02 |
| **State Engineer** | SX-03 |
| **Platform Specialist** | SX-04 |

---

## Tasks

### SX-01: [Task Title]
**Role:** [Role Name]  
**Status:** `[ ]` Not Started  
**Dependencies:** [Task IDs or "None"]  
**Estimated:** X hours

**Deliverables:**
- [ ] Deliverable 1
- [ ] Deliverable 2

**Files:**
- `path/to/file.tsx`

---

## Success Criteria

- [ ] Criterion 1
- [ ] Criterion 2

---

## Blockers & Notes

*Add blockers during sprint.*

---

## Completed Tasks

*Move completed tasks here with agent details.*
```

---

## Step 4: Create Agent Workflows

### 4.1 onboard.md (.agent/workflows/)

Key sections:
1. **Choose Identity** — Name suggestions, identity format
2. **Read Core Docs** — ONBOARDING.md, ARCHITECTURE.md
3. **Find Active Sprint** — List dir, read highest sprint number
4. **Check Claims** — Verify task isn't claimed
5. **Select Task** — Priority: Blockers > Dependencies met > First available
6. **Claim Task** — Update claims ledger + sprint file
7. **Execute Task** — Role-specific guidance
8. **Complete Task** — Run /checkout workflow

### 4.2 onboard-product-lead.md (.agent/workflows/)

Additional PL sections:
- Read full product spec
- Understand project state
- Review claims and blockers
- Plan next sprint if needed
- Coordinate agents

### 4.3 checkout.md (.agent/workflows/)

Key sections:
1. **Self-Verification** — Code compiles, feature works, no regressions
2. **Update Documentation** — ARCHITECTURE.md if relevant
3. **Update Sprint File** — Mark task complete with details
4. **Update Claims Ledger** — Mark as completed
5. **Update Roster** — Move to hall of fame or update current task
6. **Log Time** — Add entry to time_log.md
7. **Check Follow-ups** — Note unblocked tasks
8. **Final Report** — Summary for Product Lead

---

## Step 5: Create Agent State Files

### 5.1 claims.md (.agent/active/)

```markdown
# Task Claims Ledger

## Active Claims

| Task ID | Agent | Role | Claimed At | Status |
|---------|-------|------|------------|--------|

---

## Rules

- Check before claiming
- One task at a time per agent
- Update status when done
```

### 5.2 roster.md (.agent/active/)

```markdown
# Agent Roster

## Active Agents

| Name | Role | Current Task | Since |
|------|------|--------------|-------|

---

## Hall of Fame

| Name | Role | Tasks Completed | Total Time |
|------|------|-----------------|------------|
```

### 5.3 project_state.md (.agent/active/)

```markdown
# Project State

**Last Updated:** YYYY-MM-DDTHH:MM:SS  
**Updated By:** [Agent Name]

## Current Sprint

Sprint X: [Title]  
Progress: X/Y tasks complete

## Blockers

- [List blockers]

## Next Priority

- [List priority tasks]
```

### 5.4 time_log.md (.agent/stats/)

```markdown
# Time Investment Log

## Summary

| Role | Total Hours | Sessions |
|------|-------------|----------|
| Product Lead | 0h | 0 |
| UI Developer | 0h | 0 |
| State Engineer | 0h | 0 |
| Platform Specialist | 0h | 0 |
| QA Agent | 0h | 0 |
| **Total** | **0h** | **0** |

---

## Time Log

### YYYY-MM-DD

| Agent | Role | Task | Hours | Notes |
|-------|------|------|-------|-------|
```

---

## Step 6: Define Agent Roles

| Role | Responsibilities |
|------|-----------------|
| **Product Lead** | Planning, coordination, sprint management |
| **UI Developer** | Components, screens, animations, styling |
| **State Engineer** | Store, state, business logic, data flow |
| **Platform Specialist** | Native modules, notifications, platform APIs |
| **QA Agent** | Testing, verification, bug hunting |

---

## Step 7: Key Principles

1. **One Task at a Time** — Claim one, complete it, then claim another
2. **Update Claims Before Starting** — Prevents duplicate work
3. **Blockers First** — Priority order for task selection
4. **Document Changes** — Update ARCHITECTURE.md when relevant
5. **Log Time** — All agents log time for estimation
6. **Product Lead Handles Builds** — Only PL triggers builds
7. **Handoff If Blocked** — Leave clear handoff notes

---

## Step 8: Initial Setup Checklist

```markdown
- [ ] Create docs/ directory structure
- [ ] Write product spec from user brief
- [ ] Write ONBOARDING.md (quick reference)
- [ ] Write ARCHITECTURE.md (tech decisions)
- [ ] Create ROADMAP.md (sprint timeline)
- [ ] Create SPRINT_1.md with first tasks
- [ ] Create .agent/workflows/ (onboard, checkout)
- [ ] Create .agent/active/ (claims, roster, project_state)
- [ ] Create .agent/stats/time_log.md
- [ ] Initialize git repo
- [ ] Run first onboard to claim a task
```

---

## Usage Example

**User Input:**
```
Here's my project brief: [paste brief]

Please use the Multi-Agent Project Bootstrap system to:
1. Create the directory structure
2. Write the core documentation
3. Plan Sprint 1 with specific tasks
4. Set up the agent workflows

Then onboard yourself as Product Lead and begin work.
```
