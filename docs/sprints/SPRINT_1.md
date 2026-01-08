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
**Status:** `[ ]` Not Started
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
**Status:** `[ ]` Not Started  
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
**Status:** `[ ]` Not Started
**Dependencies:** S1-02
**Estimated:** 3 hours

**Deliverables:**
- [ ] Core tables created (signals, analyzed_signals, reports, feedback, agent_runs)
- [ ] Indexes for common queries
- [ ] Row-level security policies (if needed)
- [ ] Seed data for testing

**Files:**
- `supabase/migrations/001_initial_schema.sql`
- `src/lib/db/signals.ts`
- `src/lib/db/reports.ts`
- `src/lib/db/feedback.ts`

---

### S1-04: Collector Agent - NewsAPI Tool
**Role:** State Engineer
**Status:** `[ ]` Not Started
**Dependencies:** S1-03
**Estimated:** 4 hours

**Deliverables:**
- [ ] NewsAPI integration with rate limiting
- [ ] `search_news()` tool function
- [ ] Collector Agent system prompt
- [ ] Manual collection API route
- [ ] Basic signal storage

**Files:**
- `src/lib/tools/news.ts`
- `src/lib/agents/collector.ts`
- `src/app/api/collect/route.ts`

---

### S1-05: Basic API Routes & Testing UI
**Role:** UI Developer
**Status:** `[ ]` Not Started
**Dependencies:** S1-04
**Estimated:** 3 hours

**Deliverables:**
- [ ] GET `/api/dashboard` - List signals
- [ ] POST `/api/collect` - Trigger collection (dev)
- [ ] Simple test page to trigger collection
- [ ] Console logging for debugging

**Files:**
- `src/app/api/dashboard/route.ts`
- `src/app/test/page.tsx`

---

## Success Criteria

- [ ] `npm run dev` starts without errors
- [ ] Can POST to `/api/collect` and see NewsAPI being called
- [ ] Signals are stored in Supabase
- [ ] Can GET `/api/dashboard` and see stored signals
- [ ] All environment variables documented

---

## Blockers & Notes

*Add blockers during sprint.*

---

## Completed Tasks

*Move completed tasks here with agent details.*

| Task ID | Agent | Completed At | Notes |
|---------|-------|--------------|-------|
