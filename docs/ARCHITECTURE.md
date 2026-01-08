# Architecture: AI Market Intelligence Agent

**Version:** 1.0
**Last Updated:** 2025-01-08

---

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                       DATA SOURCES                            │
│  [NewsAPI]  [Google Trends]  [Reddit]  [E2 GraphQL]         │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────┐
│                    AGENTIC AI SYSTEM                          │
│                                                               │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐        │
│  │ Collector  │ →  │  Analyzer  │ →  │  Reporter  │        │
│  │   Agent    │    │   Agent    │    │   Agent    │        │
│  └────────────┘    └────────────┘    └────────────┘        │
│                                                               │
│  Learning Loop: Feedback → Improved scoring                  │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────┐
│                   USER INTERFACE                              │
│  📧 Email Reports  │  📊 Dashboard  │  🔄 Feedback Loop     │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Runtime** | Node.js | 20.x | Server runtime |
| **Framework** | Next.js | 14.x | App Router, API routes, SSR |
| **Language** | TypeScript | 5.x | Type safety |
| **UI Components** | shadcn/ui | Latest | **REQUIRED** - Only approved UI library |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS (via shadcn) |
| **AI** | Claude Sonnet 4 | Latest | Agentic reasoning |
| **Database** | Supabase (PostgreSQL) | - | Data persistence |
| **Hosting** | Vercel | - | Serverless deployment |
| **Email** | Resend | - | Transactional email |
| **Cron** | Vercel Cron | - | Scheduled execution |

---

## Directory Structure

```
/E2_Outreach_Dashboard
├── docs/
│   ├── ONBOARDING.md           # Quick agent reference
│   ├── ARCHITECTURE.md         # This file
│   └── sprints/
│       ├── ROADMAP.md          # Sprint timeline
│       └── SPRINT_1.md         # Active sprint
│
├── .agent/
│   ├── workflows/
│   │   ├── onboard.md          # Agent onboarding
│   │   ├── onboard-product-lead.md
│   │   └── checkout.md         # Task completion
│   ├── active/
│   │   ├── claims.md           # Task claims ledger
│   │   ├── roster.md           # Active agents
│   │   └── project_state.md    # Current state
│   └── stats/
│       └── time_log.md         # Time tracking
│
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Main dashboard
│   │   └── api/
│   │       ├── cron/
│   │       │   └── weekly/route.ts
│   │       ├── collect/route.ts
│   │       ├── analyze/route.ts
│   │       ├── report/route.ts
│   │       ├── feedback/route.ts
│   │       └── dashboard/route.ts
│   │
│   ├── lib/
│   │   ├── agents/
│   │   │   ├── collector.ts    # Collector Agent
│   │   │   ├── analyzer.ts     # Analyzer Agent
│   │   │   ├── reporter.ts     # Reporter Agent
│   │   │   └── types.ts        # Agent type definitions
│   │   │
│   │   ├── tools/
│   │   │   ├── news.ts         # NewsAPI integration
│   │   │   ├── trends.ts       # Google Trends
│   │   │   ├── reddit.ts       # Reddit API
│   │   │   ├── e2-graphql.ts   # E2 MCP integration
│   │   │   └── storage.ts      # Supabase helpers
│   │   │
│   │   ├── db/
│   │   │   ├── client.ts       # Supabase client
│   │   │   ├── signals.ts      # Signal queries
│   │   │   ├── reports.ts      # Report queries
│   │   │   └── feedback.ts     # Feedback queries
│   │   │
│   │   └── email/
│   │       ├── client.ts       # Resend client
│   │       └── templates/
│   │           └── report.tsx  # Email template
│   │
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── SignalCard.tsx      # Signal display
│   │   ├── FeedbackButtons.tsx # 👍/👎 buttons
│   │   └── ReportView.tsx      # Report display
│   │
│   └── types/
│       ├── signal.ts           # Signal types
│       ├── agent.ts            # Agent types
│       └── api.ts              # API types
│
├── supabase/
│   └── migrations/             # Database migrations
│
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── next.config.js
├── vercel.json                 # Cron configuration
└── .env.local                  # Environment variables
```

---

## Database Schema

### Core Tables (POC)

```sql
-- Raw signals from collection
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('bookmaker', 'publisher', 'app', 'channel')),
  geo TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  evidence JSONB NOT NULL,
  preliminary_score INTEGER CHECK (preliminary_score BETWEEN 0 AND 10),
  source_urls TEXT[],
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  agent_run_id UUID REFERENCES agent_runs(id)
);

-- AI-analyzed signals with scores
CREATE TABLE analyzed_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  final_score INTEGER CHECK (final_score BETWEEN 0 AND 14),
  score_breakdown JSONB NOT NULL,
  priority TEXT CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  risk_flags JSONB,
  recommended_actions TEXT[],
  ai_reasoning TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_start DATE NOT NULL,
  cycle_end DATE NOT NULL,
  content_markdown TEXT NOT NULL,
  content_html TEXT,
  summary_stats JSONB,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User feedback
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID REFERENCES signals(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  is_useful BOOLEAN NOT NULL,
  action_taken TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent execution logs
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL CHECK (agent_type IN ('collector', 'analyzer', 'reporter')),
  input_params JSONB,
  output_summary JSONB,
  token_usage JSONB,
  duration_ms INTEGER,
  error TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

---

## Agent Architecture

### Collector Agent

**Goal:** Find new/growing bookmakers in target geo

**Available Tools:**
1. `search_news(query, country, days_back)` — NewsAPI
2. `check_google_trends(keywords, geo)` — Search trends
3. `search_reddit(subreddit, query)` — Community buzz
4. `query_e2_bookmakers(name)` — Partnership status
5. `store_signal(...)` — Save to database

**Decision Pattern:**
```
1. Search news for bookmaker announcements
2. For each finding: check trends → check E2 status → check Reddit
3. Only store high-quality signals with multiple evidence points
```

### Analyzer Agent

**Goal:** Score signals and prioritize opportunities

**Scoring Framework:**
| Criterion | Points | Factors |
|-----------|--------|---------|
| Market Entry Momentum | 0-4 | News, trends, app ranking, sponsorships |
| E2 Partnership Fit | 0-4 | Not in E2, target markets, verticals |
| Actionability | 0-3 | Contact info, decision maker, timing |
| Data Confidence | 0-3 | Multiple sources, recent data |

**Priority Levels:**
- HIGH: 10-14 points
- MEDIUM: 7-9 points
- LOW: 0-6 points

### Reporter Agent

**Goal:** Generate readable email reports

**Report Structure:**
1. 🔥 Top Opportunities (HIGH priority)
2. 📊 Geographic Breakdown
3. 📰 Industry News Highlights
4. 🔧 Methodology

---

## API Design

### Collection & Analysis
```
POST /api/cron/weekly     # Automated trigger (Vercel Cron)
POST /api/collect         # Manual collection
POST /api/analyze         # Run analyzer
POST /api/report          # Generate report
```

### Dashboard & Feedback
```
GET  /api/dashboard       # Signals with filters
POST /api/feedback        # Submit user feedback
GET  /api/reports         # Historical reports
```

---

## Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=        # Claude API
SUPABASE_URL=             # Database URL
SUPABASE_ANON_KEY=        # Database key
CRON_SECRET=              # Secure cron trigger
NEWS_API_KEY=             # NewsAPI
RESEND_API_KEY=           # Email service
SALES_TEAM_EMAIL=         # Distribution list

# Optional
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
SENTRY_DSN=
```

---

## Deployment

### Vercel Configuration (`vercel.json`)

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

### Build & Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Deploy preview
vercel

# Deploy production
vercel --prod
```

---

## Key Design Decisions

1. **Agentic vs Rule-Based:** Claude decides search strategy and adapts based on findings
2. **Separate Agents:** Collector/Analyzer/Reporter separation for clear responsibilities
3. **Tool Use Pattern:** Agents call external APIs via tool functions
4. **Feedback Learning:** User input improves future scoring
5. **POC Constraints:** Zero-budget, single geo, 4-week proof
6. **shadcn/ui Exclusive:** All UI components must use shadcn/ui. Custom components require explicit Product Lead approval.

---

## Future Considerations (MVP)

- Lead tracking tables (`leads`, `lead_activities`, etc.)
- Apify integration for scraping ($49/month)
- Multi-geo support (US, EU)
- Multi-entity types (publishers, apps, channels)
