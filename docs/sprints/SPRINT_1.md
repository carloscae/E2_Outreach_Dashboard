# Sprint 1: POC Foundation

**Start Date:** 2025-01-08
**Target Duration:** ~5 days
**Goal:** Project setup and core agent infrastructure

---

## Role Summary

| Role | Tasks |
|------|-------|
| **Platform Specialist** | S1-01, S1-02 |
| **State Engineer** | S1-03, S1-04 |
| **UI Developer** | S1-05 |

---

## Tasks

### S1-01: Next.js Application Setup
**Role:** Platform Specialist
**Status:** `[x]` Completed - Nexus-Platform
**Dependencies:** None
**Estimated:** 2 hours

**Deliverables:**
- [ ] Next.js 14 project initialized with App Router
- [ ] TypeScript + Tailwind CSS configured
- [ ] **shadcn/ui initialized** (https://ui.shadcn.com)
- [ ] Environment variables structure defined
- [ ] Vercel project linked

**Files:**
- `package.json`
- `tsconfig.json`
- `next.config.js`
- `components.json` (shadcn config)
- `.env.local.example`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/components/ui/` (shadcn components)

---

### S1-02: External Service Configuration
**Role:** Platform Specialist
**Status:** `[x]` Completed - Nexus-Platform  
**Dependencies:** S1-01
**Estimated:** 2 hours

**Deliverables:**
- [ ] Supabase project created
- [ ] Resend account configured
- [ ] NewsAPI key obtained
- [ ] Claude API key configured
- [ ] Reddit API credentials (optional)

**Files:**
- `.env.local`
- `src/lib/db/client.ts`
- `src/lib/email/client.ts`

---

### S1-03: Database Schema Implementation
**Role:** State Engineer
**Status:** `[x]` Complete
**Completed By:** Schema-State
**Completed At:** 2026-01-08T15:30:00
**Dependencies:** S1-02
**Estimated:** 3 hours

**Deliverables:**
- [x] Core tables created (signals, analyzed_signals, reports, feedback, agent_runs)
- [x] Indexes for common queries
- [x] Row-level security policies (if needed) - N/A for POC
- [x] TypeScript types & query files

**Files:**
- `supabase/migrations/001_initial_schema.sql`
- `src/types/database.ts`
- `src/lib/db/signals.ts`
- `src/lib/db/reports.ts`
- `src/lib/db/feedback.ts`
- `src/lib/db/agent-runs.ts`
- `src/lib/db/index.ts`

---

### S1-04: Collector Agent - NewsAPI Tool
**Role:** State Engineer
**Status:** `[x]` Complete
**Completed By:** Schema-State
**Completed At:** 2026-01-08T15:45:00
**Dependencies:** S1-03
**Estimated:** 4 hours

**Deliverables:**
- [x] NewsAPI integration with rate limiting
- [x] `search_news()` tool function
- [x] Collector Agent system prompt
- [x] Manual collection API route
- [x] Basic signal storage

**Files:**
- `src/lib/tools/news.ts` (enhanced with rate limiting)
- `src/lib/agents/types.ts` (new)
- `src/lib/agents/collector.ts` (new)
- `src/app/api/collect/route.ts` (new)

---

### S1-05: Basic API Routes & Testing UI
**Role:** UI Developer
**Status:** `[x]` Complete
**Completed By:** Canvas-UI
**Completed At:** 2026-01-08T16:21:00
**Dependencies:** S1-04
**Estimated:** 3 hours

**Deliverables:**
- [x] GET `/api/dashboard` - List signals with stats
- [x] POST `/api/collect` - Trigger collection (already existed, verified)
- [x] Test page at `/test` with collection trigger + signals viewer
- [x] Console logging for debugging

**Files:**
- `src/app/api/dashboard/route.ts` (NEW)
- `src/app/test/page.tsx` (NEW)

---

## Success Criteria ✅ All Complete

- [x] `npm run dev` starts without errors
- [x] Can POST to `/api/collect` and see NewsAPI being called
- [x] Signals are stored in Supabase (verified: Br4Bet, Bet da Sorte)
- [x] Can GET `/api/dashboard` and see stored signals with stats
- [x] All environment variables documented

---

## Blockers & Notes

*Add blockers during sprint.*

---

## Completed Tasks

*Move completed tasks here with agent details.*

| Task ID | Agent | Completed At | Notes |
|---------|-------|--------------|-------|
| S1-03 | Schema-State | 2026-01-08T15:30:00 | 5 tables, 11 indexes, 5 query files |
| S1-04 | Schema-State | 2026-01-08T15:45:00 | NewsAPI + rate limiting, collector agent |
| S1-05 | Canvas-UI | 2026-01-08T16:21:00 | Dashboard API, test page with signals viewer |
