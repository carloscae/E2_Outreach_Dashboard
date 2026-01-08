# AI Market Intelligence Agent - Quick Start

> **One-liner:** Automated system that discovers, scores, and tracks sales opportunities for E2's Sales/BD teams.

---

## Philosophy (Non-Negotiables)

1. **Agentic AI** — Claude decides strategy, adapts based on findings (not hardcoded rules)
2. **POC First** — Prove value in 4 weeks with Brazil bookmakers only
3. **Time Savings** — Replace 4-8 hours of manual research with 30-min report review
4. **Learning System** — Feedback loop improves prioritization over time
5. **Discovery > Tracking** — AI finds leads FOR you (not just tracks what you find)
6. **shadcn/ui Only** — Use https://ui.shadcn.com components exclusively. No custom components without Product Lead approval.

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | Next.js 14 | Full-stack app (App Router) |
| **UI** | **shadcn/ui** | **Component library (REQUIRED)** |
| Hosting | Vercel | Deployment + Cron jobs |
| AI | Claude Sonnet 4 | Agentic reasoning + tool use |
| Database | Supabase | PostgreSQL + real-time |
| Email | Resend | Bi-weekly reports |
| News | NewsAPI | News signal collection |
| Trends | google-trends-api | Search interest tracking |
| Community | Reddit API | Sentiment analysis |
| E2 Data | E2 GraphQL MCP | Partnership status checks |

---

## Core Data Model

```
signals              → Raw collected opportunities
analyzed_signals     → AI-scored with priority (HIGH/MEDIUM/LOW)
reports              → Bi-weekly email content
feedback             → User 👍/👎 for learning loop
agent_runs           → Execution logs and debugging
```

**Entity Types:** bookmaker (POC), publisher, app, channel (MVP)

**Scoring:** 0-14 total
- Market Entry Momentum (0-4)
- E2 Partnership Fit (0-4)
- Actionability (0-3)
- Data Confidence (0-3)

---

## Key Flows

### Weekly Collection Cycle
```
Cron (Mon 9AM) → Collector Agent → Analyzer Agent → Reporter Agent → Email
                      ↓                  ↓                ↓
                  signals          analyzed_signals    reports
```

### Feedback Loop
```
User reviews dashboard → 👍/👎 feedback → Agent learns → Better scoring
```

---

## File Structure

```
/src
├── app/                  # Next.js App Router pages
│   ├── api/              # API routes
│   │   ├── cron/         # Scheduled jobs
│   │   ├── collect/      # Manual collection trigger
│   │   ├── analyze/      # Analyzer endpoint
│   │   ├── report/       # Report generation
│   │   └── feedback/     # User feedback
│   └── dashboard/        # UI pages
├── lib/
│   ├── agents/           # Claude agent implementations
│   │   ├── collector.ts
│   │   ├── analyzer.ts
│   │   └── reporter.ts
│   ├── tools/            # Agent tool functions
│   │   ├── news.ts
│   │   ├── trends.ts
│   │   ├── reddit.ts
│   │   └── e2-graphql.ts
│   ├── db/               # Supabase client + queries
│   └── email/            # Resend templates
└── types/                # TypeScript interfaces
```

---

## Quick Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Deploy to Vercel
vercel deploy

# Manual collection trigger (dev)
curl -X POST http://localhost:3000/api/collect

# Check agent logs
npx supabase db logs
```

---

## POC Scope (4 Weeks)

**IN:** Brazil bookmakers, bi-weekly emails, basic dashboard, feedback
**OUT:** Lead tracking, multi-geo, publishers/apps/channels

---

## Sprint Files

- **Active Sprint:** `docs/sprints/SPRINT_1.md`
- **Roadmap:** `docs/sprints/ROADMAP.md`
- **Claims Ledger:** `.agent/active/claims.md`

---

## Getting Help

- **Product Brief:** `product-brief-ai-market-intelligence-agent.md`
- **Architecture:** `docs/ARCHITECTURE.md`
- **Agent Workflows:** `.agent/workflows/`
