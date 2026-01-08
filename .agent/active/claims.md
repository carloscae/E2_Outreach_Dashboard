# Task Claims Ledger

## Active Claims

| Task ID | Agent | Role | Claimed At | Status |
|---------|-------|------|------------|--------|

---

## Completed Claims

| Task ID | Agent | Role | Claimed At | Completed At |
|---------|-------|------|------------|--------------|

---

## Rules

1. **Check before claiming** — Verify task isn't already claimed
2. **One task at a time** — Complete current task before claiming another
3. **Update status** — Change to "Completed" when done
4. **Dependencies** — Don't claim tasks with unmet dependencies
5. **Handoff notes** — If blocked, leave clear notes for next agent
