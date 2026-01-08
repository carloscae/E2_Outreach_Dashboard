# Product Brief: AI Market Intelligence Agent
## Zero-Budget POC → MVP Roadmap

**Version:** 1.0  
**Date:** January 7, 2025  
**Author:** Carlos  
**Status:** Ready for Product Lead Review

---

## 📋 Executive Summary

**Project:** Automated market intelligence system that discovers, scores, and tracks sales opportunities.

**Problem:** Sales/BD teams spend 4-8 hours/week manually researching new bookmakers, publishers, and apps. We're missing 3-5 opportunities per quarter worth $50-150K each.

**Solution:** AI agent autonomously searches multiple data sources, evaluates opportunities, generates bi-weekly reports, and learns from feedback. Evolves from intelligence radar (POC) → lead tracking (MVP) → full platform.

**Approach:** 
- **POC (4 weeks, $0):** Prove AI finds valuable opportunities in Brazil bookmaker market
- **MVP (8-12 weeks, $2-5K):** Add lead tracking + expand to 3 geos and all verticals
- **Platform (Year 1):** Complete lifecycle management with CRM integration

**Key Innovation:** Agentic AI that makes strategic decisions (not hardcoded rules). AI decides what to search, how to evaluate, and learns what Sales/BD finds valuable.

**Target Outcome:** 85% reduction in research time, systematic opportunity coverage, improved team coordination.

---

## 🏗️ High-Level Architecture

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
│  Collector: "Find new bookmakers in Brazil"                  │
│  • Searches news → finds BetXplosion partnership            │
│  • Checks trends → 65% search spike                         │
│  • Queries E2 API → checks if we have partnership           │
│  • Decides: Strong growth signals worth analyzing            │
│                                                               │
│  Analyzer: Evaluates signal quality                          │
│  • Market momentum: 4/4 (strong growth)                     │
│  • E2 fit: 3/4 (Brazil focus, scaling fast)                │
│  • Actionability: 3/3 (can reach out)                      │
│  • Final score: 12/14 → HIGH priority                       │
│                                                               │
│  Reporter: Generates insight                                 │
│  • "BetXplosion rapidly scaling in Brazil"                  │
│  • Evidence: Flamengo deal, app ranking, trends             │
│  • Action: BD outreach for E2 Ads                           │
│                                                               │
│  Learning Loop: Feedback improves future cycles              │
│  • Sales marks 👍 → Agent learns this pattern works         │
│  • Sales marks 👎 → Agent adjusts weighting                 │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ↓
┌──────────────────────────────────────────────────────────────┐
│                   USER INTERFACE                              │
│                                                               │
│  📧 Email (Bi-weekly):                                       │
│     "Top 3 Opportunities: BetXplosion (12/14), ..."         │
│                                                               │
│  📊 Dashboard:                                               │
│     • New Signals (review & claim)                           │
│     • My Active Leads (track progress)                       │
│     • Team Activity (coordination)                           │
│                                                               │
│  🔄 Feedback Loop:                                           │
│     👍 Useful / 👎 Not Useful → Agent learns                │
└──────────────────────────────────────────────────────────────┘
```

**Why "Agentic" Matters:**
- Traditional automation: Hardcoded "IF/THEN" rules
- Agentic AI: Given a goal, decides strategy and adapts based on findings
- Example: If agent finds sponsorship deal, it automatically checks related signals (trends, community buzz) without being told to

---

## 🎯 Problem Statement

### Current State

Sales and BD teams currently discover market opportunities through:
- Manual monitoring of industry news sites (SBC News, iGaming Business)
- Ad-hoc Google searches for new operators
- Word-of-mouth and trade show conversations
- Reactive responses to inbound inquiries

**Pain Points:**
1. **Time-Intensive:** 4-8 hours/week per person for manual research
2. **Inconsistent Coverage:** Dependent on individual effort and memory
3. **Missed Opportunities:** No systematic tracking of emerging operators
4. **Delayed Response:** Often discover opportunities weeks/months after they emerge
5. **No Historical Context:** Difficult to track operator growth trajectories over time
6. **Siloed Knowledge:** Research findings not shared systematically across teams

### Quantified Impact

- **Estimated missed opportunities:** 3-5 per quarter (based on stakeholder interviews)
- **Average deal value:** $50K-150K annually
- **Time cost:** ~$10K/quarter in research labor (at loaded rate)

### Target Outcome

- **Automated discovery:** Weekly collection of market signals without manual intervention
- **Prioritized intelligence:** AI-scored opportunities ranked by business fit
- **Actionable insights:** Each opportunity includes recommended next steps for Sales/BD
- **Learning system:** Agent improves over time based on feedback loop
- **Time savings:** Reduce research time from 4-8 hours to 30-minute review per cycle

---

## 💡 Solution Overview

### High-Level Concept

An **agentic AI system** that evolves from intelligence radar into a full lead management platform:

**Phase 1 - Intelligence Agent (POC):**
1. **Collector Agent** autonomously searches multiple data sources based on strategic goals
2. **Analyzer Agent** evaluates findings against business criteria and scores opportunities
3. **Reporter Agent** synthesizes insights into actionable bi-weekly reports
4. **Feedback Loop** learns from Sales/BD responses to improve prioritization

**Phase 2 - Lead Tracking (MVP):**
- Lead claiming and assignment
- Status pipeline (Discovery → Qualification → Opportunity)
- Team collaboration and visibility
- Activity tracking and reminders

**Phase 3 - Full Platform (Post-MVP):**
- Complete lifecycle management
- CRM integration (Salesforce/HubSpot)
- Predictive analytics and AI-suggested actions
- Mobile experience

### Why Agentic AI?

Traditional automation follows rigid if-then logic. Agentic AI:
- **Adapts strategy** based on what it finds (e.g., "found new bookmaker in news → check trends → verify against E2 system → check community sentiment")
- **Reasons about quality** rather than just collecting data
- **Learns patterns** from human feedback
- **Handles ambiguity** in real-world data

### Why Add Lead Tracking?

Most CRMs fail because they're pure data entry burden. This tool is different:
- **AI discovers leads FOR you** (not just tracks what you find)
- **Pre-qualifies opportunities** with scoring and evidence
- **Natural workflow integration** - tracking becomes the next logical step
- **Team coordination** - prevents duplicate effort and lost opportunities

### User Journey

**Week 1 (Setup):**
```
Sales Manager → Receives onboarding email
             → Reviews dashboard walkthrough
             → Sets notification preferences
```

**Week 2-3 (First Cycle - Intelligence Only):**
```
Monday 9:00 AM → Automated agent collection runs (background)
                → 50+ signals collected from news, trends, Reddit, E2 API
                → Analyzer scores and prioritizes top 5-10 opportunities
                → Reporter generates bi-weekly summary email

Monday 9:30 AM → Sales Team receives email:
                  "🔥 Top Opportunity: BetXplosion (Brazil) - Score 12/14"
                  
                → Click through to dashboard for full context
                → Review evidence: Google Trends spike, Flamengo sponsorship, etc.
                → Mark feedback: "👍 Useful - Will pursue"
```

**Week 4+ (With Lead Tracking - MVP):**
```
Monday 9:00 AM → Email arrives with new opportunities

Monday 9:15 AM → Carlos opens dashboard:
                  • My Active Leads (3)
                    - Sportingbet: Follow up today
                    - GlobalSports: Demo scheduled Jan 12
                  • New Signals (3)
                    - BetXplosion: 12/14 - HIGH
                    - LanceNews: 10/14 - HIGH
                    
                → Carlos reviews BetXplosion evidence
                → Clicks [Claim This Lead]
                → Status changes: 🟡 New → 🔵 Claimed by Carlos
                → Sets reminder: "Initial outreach by Jan 10"

Tuesday        → Carlos contacts BetXplosion via LinkedIn
                → Updates status: 🔵 Claimed → 🟣 Contacted
                → Logs note: "Mentioned Flamengo audience targeting"

Wednesday      → Maria sees Carlos's activity in team feed
                → Adds comment: "I have a Flamengo contact - can intro"
                → Team collaboration prevents duplicate effort

Friday         → BetXplosion responds - interested in demo
                → Carlos updates: 🟣 Contacted → 🟢 Engaged
                → Schedules demo for next week
```

**Month 3 (Full Platform Features):**
```
Dashboard shows:
• Pipeline visualization (Discovery → Qualification → Opportunity)
• Stalled lead alerts: "Sportingbet: No activity in 7 days"
• AI suggestions: "Based on similar leads, try following up via email"
• Team performance: Conversion rates, response times
• CRM integration: Push qualified leads to Salesforce with one click
```

### Core Value Propositions

**For Sales/BD:**
- Spend time selling, not researching
- Never miss emerging opportunities
- Data-backed prioritization (not gut feel)
- Historical tracking of operator growth

**For Leadership:**
- Visibility into market landscape
- Data-driven territory planning
- Quantified opportunity pipeline
- ROI tracking on research time

**For Product/Engineering:**
- Scalable system (add new geos/verticals easily)
- Learning system (improves over time)
- Integration-ready (can plug into CRM, Slack, etc.)

---

## 🏗️ Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL PLATFORM                         │
│                     (Free Tier: POC)                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              NEXT.JS 14 APPLICATION                   │  │
│  │              (App Router Pattern)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐│
│  │   Frontend UI   │  │   API Routes    │  │  Cron Jobs  ││
│  │                 │  │                 │  │             ││
│  │ • Dashboard     │  │ • /collect      │  │ • /weekly   ││
│  │ • Signal Cards  │  │ • /analyze      │  │   (Mon 9AM) ││
│  │ • Report View   │  │ • /report       │  │             ││
│  │ • Feedback UI   │  │ • /feedback     │  │             ││
│  └─────────────────┘  └─────────────────┘  └─────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 AGENT ORCHESTRATION                   │  │
│  │                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │  Collector   │→ │   Analyzer   │→ │  Reporter  │ │  │
│  │  │    Agent     │  │    Agent     │  │   Agent    │ │  │
│  │  │              │  │              │  │            │ │  │
│  │  │ • Strategy   │  │ • Scoring    │  │ • Summary  │ │  │
│  │  │ • Tool use   │  │ • Risk eval  │  │ • Email    │ │  │
│  │  │ • Adaptation │  │ • Priority   │  │ • Format   │ │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↕                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    TOOL LIBRARY                       │  │
│  │                                                        │  │
│  │  [News API] [Trends API] [Reddit API] [E2 GraphQL]  │  │
│  │  [Supabase] [Email Service] [Logging] [Analytics]    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                             ↕
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Anthropic │  │  Supabase  │  │   Resend   │           │
│  │   Claude   │  │ PostgreSQL │  │   Email    │           │
│  │  API (AI)  │  │  Database  │  │  Delivery  │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  NewsAPI   │  │   Google   │  │   Reddit   │           │
│  │  (news)    │  │   Trends   │  │    API     │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│                                                              │
│  ┌────────────────────────────────────────────┐            │
│  │        E2 GraphQL API (MCP Server)         │            │
│  │  • Bookmaker discovery                     │            │
│  │  • Integration status checks               │            │
│  │  • Market coverage data                    │            │
│  └────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Rationale

| Technology | Purpose | Why Chosen | Free Tier Limits |
|------------|---------|------------|------------------|
| **Next.js 14** | Full-stack framework | • App Router for modern patterns<br>• Built-in API routes<br>• Server components for performance<br>• Vercel-optimized | N/A (open source) |
| **Vercel** | Hosting + Cron | • Zero config deployment<br>• Native cron job support<br>• Edge functions for speed<br>• Git-based workflow | 100GB bandwidth<br>6000 serverless hours |
| **Claude Sonnet 4** | Agentic AI | • Best-in-class reasoning<br>• Tool use capabilities<br>• Large context window<br>• Fast response times | $5 free credit<br>(~5M tokens) |
| **Supabase** | Database | • Free PostgreSQL<br>• Real-time subscriptions<br>• Row-level security<br>• REST + GraphQL APIs | 500MB database<br>2GB bandwidth |
| **Resend** | Email delivery | • Developer-friendly<br>• React email templates<br>• Good deliverability<br>• Simple API | 100 emails/day<br>1 custom domain |
| **NewsAPI** | News search | • Simple REST API<br>• Good coverage<br>• Free tier available | 100 requests/day |
| **Google Trends** | Search trends | • Free (unofficial API)<br>• Via google-trends-api npm | Unlimited (rate-limited) |
| **Reddit API** | Community sentiment | • Free tier available<br>• Rich discussion data | 100 requests/min |
| **E2 GraphQL** | Bookmaker data | • Already integrated<br>• Carlos has expertise<br>• Live betting data | Per existing agreement |

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    WEEKLY CYCLE                          │
└─────────────────────────────────────────────────────────┘

Monday 9:00 AM (Vercel Cron Trigger)
    ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 1: COLLECTION (15-20 minutes)                     │
└─────────────────────────────────────────────────────────┘
    │
    ├→ Collector Agent starts with goal:
    │  "Find new/growing bookmakers in Brazil"
    │
    ├→ Agent decides strategy:
    │  1. Search NewsAPI for recent bookmaker news
    │  2. Check Google Trends for betting brands
    │  3. Query Reddit for community buzz
    │  4. Cross-reference against E2 GraphQL
    │
    ├→ For each tool call:
    │  • Claude requests tool use
    │  • System executes tool
    │  • Returns results to Claude
    │  • Claude decides next action
    │
    └→ Stores raw signals in Supabase:
       • Entity name, type, geo
       • Signal type (news, trend, community)
       • Evidence (JSON blob)
       • Preliminary score (0-10)
       • Timestamp

    ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 2: ANALYSIS (5-10 minutes)                        │
└─────────────────────────────────────────────────────────┘
    │
    ├→ Fetch all signals from past week
    │
    ├→ Analyzer Agent evaluates each:
    │  • Market Entry Momentum (0-4)
    │  • E2 Partnership Fit (0-4)
    │  • Actionability (0-3)
    │  • Data Confidence (0-3)
    │  = Total Score (0-14)
    │
    ├→ Risk assessment:
    │  • Grey market flags
    │  • Regulatory concerns
    │  • Reputational risks
    │
    ├→ Prioritization:
    │  • HIGH (score ≥ 10)
    │  • MEDIUM (score 7-9)
    │  • LOW (score < 7)
    │
    └→ Store analyzed_signals in Supabase

    ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 3: REPORTING (5 minutes)                          │
└─────────────────────────────────────────────────────────┘
    │
    ├→ Reporter Agent generates summary:
    │  • Top 3-5 opportunities (HIGH priority)
    │  • Geographic breakdown
    │  • Industry news highlights
    │  • Recommended actions
    │
    ├→ Store report in Supabase
    │
    └→ Send email via Resend:
       • To: Sales team distribution list
       • Subject: "Market Intelligence Radar - [Geo] - Week [Date]"
       • Body: Formatted report with dashboard link
       • Include feedback buttons

    ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 4: HUMAN FEEDBACK (Async)                         │
└─────────────────────────────────────────────────────────┘
    │
    ├→ Sales/BD reviews dashboard
    │
    ├→ Provides feedback:
    │  • 👍 Useful / 👎 Not useful
    │  • Action taken (contacted, monitoring, rejected)
    │  • Notes (optional)
    │
    └→ Store feedback in Supabase
       → Used in next cycle to improve scoring

    ↓
┌─────────────────────────────────────────────────────────┐
│ CONTINUOUS: LEARNING LOOP                               │
└─────────────────────────────────────────────────────────┘
    │
    └→ Analyzer Agent considers historical feedback:
       • Signals marked "useful" → increase weight of similar patterns
       • Signals marked "not useful" → decrease weight
       • Action taken → strongest positive signal
       • No action after 2 weeks → negative signal
```

### Agent Architecture

#### Collector Agent

**Responsibilities:**
- Strategically search for market signals
- Adapt search based on findings
- Cross-reference data across sources
- Store high-quality signals with context

**Available Tools:**
1. `search_news(query, country, days_back)` - Search NewsAPI for articles
2. `check_google_trends(keywords, geo)` - Get search interest trends
3. `search_reddit(subreddit, query, time_filter)` - Search Reddit posts/comments
4. `query_e2_bookmakers(bookmaker_name)` - Check E2 partnership status and context
5. `store_signal(entity_name, entity_type, geo, signal_type, evidence, score)` - Save opportunity to database

**Decision-Making Pattern:**
```
Agent receives goal: "Find new bookmakers in Brazil"

REASONING LOOP:
1. "I should start with recent news to find launches/announcements"
   → Uses search_news
   → Finds: "BetXplosion announces Flamengo partnership"
   
2. "BetXplosion is new to me. Let me check search interest"
   → Uses check_google_trends
   → Finds: 65% spike in searches over 2 weeks
   
3. "Strong growth signal. Let me check our E2 partnership status"
   → Uses query_e2_bookmakers
   → Finds: No active E2 Ads or CaaS partnership yet
   
4. "Let me check community sentiment on Reddit"
   → Uses search_reddit
   → Finds: 23 mentions, mostly positive sentiment
   
5. "This looks like a strong signal. Storing..."
   → Growth signals + no partnership yet = opportunity
   → Uses store_signal with preliminary_score: 8
     
6. "I've processed one strong signal. Let me continue with other news results..."
   → Repeats process for other findings
```

#### Analyzer Agent

**Responsibilities:**
- Evaluate signal quality and business fit
- Assign final scores with justification
- Flag risks and concerns
- Recommend actions for Sales/BD

**Scoring Framework:**

| Criterion | Weight | Factors Evaluated |
|-----------|--------|-------------------|
| **Market Entry Momentum** | 0-4 points | News mentions, trends growth, app ranking changes, sponsorship deals, community buzz |
| **E2 Partnership Fit** | 0-4 points | Not in E2 yet, target markets, betting verticals, tech maturity, brand reputation |
| **Actionability** | 0-3 points | Contact info available, decision maker known, timing appropriate |
| **Data Confidence** | 0-3 points | Multiple sources, recent data, quantitative metrics |

**Total Score:** 0-14
- **HIGH:** 10-14 (immediate action)
- **MEDIUM:** 7-9 (monitor closely)
- **LOW:** 0-6 (track passively)

**Risk Assessment Categories:**
- **Grey Market:** Operating without license, severity levels, recommendations
- **Regulatory:** Pending investigations, jurisdiction complexity
- **Reputational:** Negative coverage, fraud allegations, player complaints

#### Reporter Agent

**Responsibilities:**
- Synthesize analyzed signals into readable report
- Highlight top opportunities
- Provide geographic context
- Include actionable next steps

**Report Structure:**
```markdown
# Market Intelligence Radar - [Geographic Focus] - Week [Dates]

## 🔥 TOP OPPORTUNITIES
[Top 3-5 HIGH priority signals with evidence and recommendations]

## 📊 GEOGRAPHIC BREAKDOWN
[Summary by region: Brazil, US, EU]

## 📰 INDUSTRY NEWS HIGHLIGHTS
[Relevant regulation, sponsorships, M&A activity]

## 📈 FOLLOW-UP: PREVIOUS CYCLE OPPORTUNITIES
[Status updates on previously flagged entities]

## 🔧 METHODOLOGY
[Data sources, collection period, signal counts]
```

---

## 👥 User Stories & Requirements

### User Persona: Sales Representative

**Story 1: Discovery**
```
AS A sales representative
I WANT to receive weekly intelligence on new bookmakers entering my territory
SO THAT I can reach out before competitors do

ACCEPTANCE CRITERIA:
- Email delivered every Monday by 9:30 AM
- Top 3-5 opportunities clearly highlighted
- Each opportunity includes contact recommendation
- Evidence is specific and recent (< 7 days old)
- Dashboard link provided for deeper dive
```

**Story 2: Prioritization**
```
AS A sales representative  
I WANT opportunities ranked by business fit and momentum
SO THAT I can focus my limited time on the best prospects

ACCEPTANCE CRITERIA:
- Opportunities scored 0-14 with breakdown shown
- HIGH/MEDIUM/LOW priority clearly labeled
- Scoring rationale is transparent
- Can sort by different criteria in dashboard
```

**Story 3: Context**
```
AS A sales representative
I WANT to see what products/services fit each opportunity
SO THAT I can tailor my outreach message

ACCEPTANCE CRITERIA:
- Each signal includes "E2 Partnership Fit" explanation
- Recommended products mentioned (E2 Ads, CaaS, widgets)
- Geographic fit considerations noted
- Technical maturity assessed
```

**Story 4: Feedback**
```
AS A sales representative
I WANT to mark opportunities as useful or not useful
SO THAT future reports are more relevant to my needs

ACCEPTANCE CRITERIA:
- One-click 👍/👎 buttons in dashboard
- Optional text field for notes
- Can mark action taken ("Contacted", "Monitoring", "Rejected")
- Feedback submission confirmed with toast notification
```

### User Persona: BD Manager

**Story 5: Overview**
```
AS A BD manager
I WANT a dashboard showing all recent opportunities across territories
SO THAT I can allocate team resources effectively

ACCEPTANCE CRITERIA:
- Dashboard shows last 30 days of signals
- Can filter by geography, entity type, priority
- Visual indicators for action status
- Team activity visible (who contacted whom)
```

**Story 6: Historical Tracking**
```
AS A BD manager
I WANT to track how opportunities evolved over time
SO THAT I can understand market trends and operator trajectories

ACCEPTANCE CRITERIA:
- Entity detail page shows history (all signals for that entity)
- Graph of score changes over time
- Timeline of key events (sponsorships, launches, etc.)
- Comparison to similar entities
```

**Story 7: Reporting**
```
AS A BD manager
I WANT monthly summary reports of intelligence gathered
SO THAT I can report to leadership on market landscape

ACCEPTANCE CRITERIA:
- Monthly rollup generated automatically
- Includes: total signals, conversion rate, top opportunities pursued
- Geographic breakdown of activity
- Can export to PDF for presentations
```

---

### User Persona: Sales Representative (Lead Tracking - MVP Feature)

**Story 8: Lead Claiming**
```
AS A sales representative
I WANT to claim leads I'm pursuing
SO THAT team members know I'm working on them

ACCEPTANCE CRITERIA:
- One-click "Claim This Lead" button on each signal
- Status changes from 🟡 New → 🔵 Claimed by [name]
- Lead appears in "My Active Leads" section
- Other team members can see it's claimed
- Can add initial notes when claiming
```

**Story 9: Status Updates**
```
AS A sales representative
I WANT to track progress on my leads
SO THAT I don't lose track of where things stand

ACCEPTANCE CRITERIA:
- Can update lead status (Claimed → Contacted → Engaged → Qualified)
- Status updates via simple dropdown
- Can add notes with each status change
- Activity timeline shows all updates with timestamps
- Reminders for next actions
```

**Story 10: Activity Logging**
```
AS A sales representative
I WANT to log my interactions with leads quickly
SO THAT I can reference them later and keep team informed

ACCEPTANCE CRITERIA:
- Quick "Log Activity" button on each lead
- Common actions: "Sent email", "Had call", "Scheduled meeting"
- Free-form notes field for details
- Activity appears in lead timeline
- Team members can see activity in team feed
```

**Story 11: My Active Leads View**
```
AS A sales representative
I WANT a dedicated view of my active leads
SO THAT I can focus on what I'm working on

ACCEPTANCE CRITERIA:
- "My Active Leads" section shows only my claimed leads
- Sorted by last activity or next action date
- Shows lead status and next action reminder
- Quick access to update status or log activity
- Badge shows number of leads needing attention today
```

**Story 12: Team Collaboration**
```
AS A sales representative
I WANT to collaborate with team members on leads
SO THAT we can share context and help each other

ACCEPTANCE CRITERIA:
- Can @mention team members in lead comments
- Notifications when mentioned
- Can request intro/assistance from colleague
- See team members' recent activity on all leads
- Prevent duplicate outreach
```

---

### User Persona: BD Manager (Lead Management - MVP Feature)

**Story 13: Team Pipeline View**
```
AS A BD manager
I WANT to see all active leads across my team
SO THAT I can understand workload and spot bottlenecks

ACCEPTANCE CRITERIA:
- Pipeline view shows all leads by status stage
- Filter by team member, geography, entity type
- Visual counts per stage
- Click into any lead to see details
- Export capability for reporting
```

**Story 14: Stalled Lead Detection**
```
AS A BD manager
I WANT alerts for leads that haven't moved forward
SO THAT I can help unblock or reassign them

ACCEPTANCE CRITERIA:
- "Stalled Leads" section highlights leads with no activity in 7+ days
- Configurable threshold
- Shows who owns the lead and last action taken
- One-click reminder to assigned rep
- Option to reassign to another team member
```

**Story 15: Performance Metrics**
```
AS A BD manager
I WANT metrics on team performance with leads
SO THAT I can coach and improve conversion rates

ACCEPTANCE CRITERIA:
- Weekly/monthly dashboard showing:
  * New signals claimed vs. ignored
  * Average time to first contact
  * Conversion rate by stage
  * Activity volume per rep
- Identify top performers
- Spot training opportunities
```

**Story 16: Lead Assignment**
```
AS A BD manager
I WANT to manually assign leads to team members
SO THAT I can balance workload and match expertise

ACCEPTANCE CRITERIA:
- Can assign unclaimed signals to specific rep
- Can reassign claimed leads (with notification)
- Rep receives email/notification of assignment
- Dashboard shows assignment history
- Can set assignment rules (e.g., "Brazil leads → Carlos")
```

---

### User Persona: Influencer/Affiliate Manager (Channels - MVP Feature)

**Story 17: Channel Discovery**
```
AS AN influencer partnership manager
I WANT to discover high-engagement sports betting channels and influencers
SO THAT I can approach them for affiliate or promotional partnerships

ACCEPTANCE CRITERIA:
- Agent detects channels promoted on YouTube, Reddit
- Shows proxy metrics (follower counts, promotion frequency)
- Flags geography (Brazil priority for WhatsApp/Telegram)
- Indicates content type (betting tips, match analysis, odds comparison)
- Distinguishes from traditional publishers
```

**Story 18: Influencer Outreach Context**
```
AS AN influencer partnership manager
I WANT detailed context on each channel/influencer
SO THAT I can tailor my partnership pitch

ACCEPTANCE CRITERIA:
- See all promotion platforms (YouTube + Twitter + Reddit)
- Estimate reach based on social metrics
- View promotion frequency (weekly, daily)
- Identify content themes (team-specific, general betting, odds)
- Contact methods available (email, DM, business inquiry form)
```

**Story 19: Partnership Model Selection**
```
AS AN influencer partnership manager
I WANT to flag which partnership model suits each influencer
SO THAT I approach them with the right offer

ACCEPTANCE CRITERIA:
- Can tag partnership approach: rev share, paid promotion, bookmaker intermediation
- See similar successful partnerships (if any)
- Note influencer's existing bookmaker affiliations (if visible)
- Track negotiation status separately from traditional leads
```

**Story 20: Legal/Compliance Awareness**
```
AS AN influencer partnership manager
I WANT to be alerted to potential regulatory concerns
SO THAT I don't approach channels in prohibited markets

ACCEPTANCE CRITERIA:
- Flags if channel promotes in regulated market
- Notes if channel has gambling license disclaimers
- Highlights if channel targets minors (red flag)
- Suggests legal review before outreach for specific markets
```

---

## 📊 Success Metrics

### POC Success Criteria (4 Weeks)

**Metric 1: Signal Quality**
- **Target:** 60% of HIGH priority signals deemed useful by Sales/BD
- **Measurement:** Feedback thumbs up/down ratio
- **Threshold:** If < 40%, POC requires iteration before MVP

**Metric 2: Time Savings**
- **Target:** 4+ hours saved per week for Sales team
- **Measurement:** Self-reported survey + time-tracking
- **Baseline:** Current manual research takes ~4-8 hours/week

**Metric 3: Discovery Rate**
- **Target:** 2-3 "we didn't know about this" opportunities per cycle
- **Measurement:** Feedback field "Was this new to you?"
- **Success:** Finding opportunities team would have missed

**Metric 4: System Reliability**
- **Target:** 95%+ uptime for weekly cron jobs
- **Measurement:** Monitoring logs + email delivery confirmation
- **Critical:** If < 90%, technical issues must be resolved

**Metric 5: Engagement**
- **Target:** 70%+ of Sales team reviews dashboard weekly
- **Measurement:** Analytics tracking page views
- **Indicates:** Reports are valuable enough to warrant attention

### MVP Success Criteria (3-6 Months Post-Launch)

**Business Metrics:**
- **Conversion Rate:** 10% of HIGH signals result in meaningful BD conversations
- **Pipeline Value:** $150K+ in opportunities attributed to system per quarter
- **Deal Closure:** At least 1 deal closed from system-generated lead

**Operational Metrics:**
- **Coverage:** System tracks 50+ entities across 3 geos
- **Cycle Time:** Full collection → report cycle completes in < 30 minutes
- **Feedback Rate:** 50%+ of signals receive explicit feedback

**Learning Metrics:**
- **Score Accuracy:** Agent score correlates with Sales feedback (>0.7 correlation)
- **False Positive Rate:** < 20% of HIGH signals are marked "not useful"
- **Improvement Over Time:** Score accuracy increases month-over-month

---

## 🔧 Technical Specifications

### API Endpoints Required

```
Collection & Analysis:
- GET  /api/cron/weekly          # Automated weekly trigger
- POST /api/collect              # Manual collection (testing)
- POST /api/analyze              # Run analyzer agent
- POST /api/report               # Generate report

Dashboard & Feedback:
- GET  /api/dashboard            # Get signals with filters
- POST /api/feedback             # Submit user feedback
- GET  /api/reports              # List historical reports

Lead Tracking (MVP):
- POST /api/leads/claim          # Claim a signal as lead
- PATCH /api/leads/:id/status    # Update lead status
- POST /api/leads/:id/activity   # Log activity on lead
- POST /api/leads/:id/comment    # Add comment to lead
- GET  /api/leads/my-leads       # Get user's active leads
- GET  /api/leads/team           # Get team's leads (managers)
- POST /api/leads/:id/reminder   # Set reminder
- POST /api/leads/:id/assign     # Assign/reassign lead
- GET  /api/leads/:id/timeline   # Get full activity timeline
- GET  /api/leads/stalled        # Get stalled leads

Admin (Optional for POC):
- GET  /api/admin/logs           # Agent execution logs
- POST /api/admin/test-tool      # Manual tool testing
```

### Database Schema Requirements

**Core Tables (POC):**
1. **signals** - Raw collected market signals
   - Entity information (name, type, geo)
     * type values: "bookmaker", "publisher", "app", "channel" (MVP)
   - Signal type and evidence (JSON)
     * For channels: platform (youtube/reddit/twitter), follower_count, promotion_frequency, content_themes
   - Preliminary score
   - Source URLs
   - Timestamp

2. **analyzed_signals** - AI-scored opportunities
   - Reference to signal
   - Final score (0-14) with breakdown
   - Priority level (HIGH/MEDIUM/LOW)
   - Risk flags (JSON)
   - Recommended actions
   - AI reasoning

3. **reports** - Generated bi-weekly reports
   - Cycle date range
   - Report content (markdown/HTML)
   - Summary statistics
   - Sent timestamp

4. **feedback** - User feedback on signals
   - Signal reference
   - User identification
   - Useful/not useful flag
   - Action taken
   - Notes

5. **agent_runs** - Execution logs
   - Agent type (collector/analyzer/reporter)
   - Input parameters
   - Output summary
   - Token usage and duration
   - Errors

**Lead Tracking Tables (MVP):**

6. **leads** - Lead lifecycle management
   - Signal reference (foreign key)
   - Status (new/claimed/contacted/engaged/qualified/opportunity/won/lost/snoozed)
   - Assigned to (user ID)
   - Claimed at timestamp
   - Last activity timestamp
   - Next action date
   - CRM sync status
   - Created/updated timestamps

7. **lead_activities** - Activity timeline
   - Lead reference (foreign key)
   - User ID (who did the action)
   - Activity type (claimed/contacted/updated_status/added_note/mentioned/etc)
   - Description/notes
   - Previous status
   - New status
   - Timestamp

8. **lead_comments** - Collaboration and notes
   - Lead reference (foreign key)
   - User ID (author)
   - Comment text
   - Mentions (array of user IDs)
   - Parent comment (for threading)
   - Created/updated timestamps

9. **lead_reminders** - Follow-up tracking
   - Lead reference (foreign key)
   - User ID (assigned to)
   - Reminder date/time
   - Reminder type (follow_up/meeting/call/etc)
   - Status (pending/completed/dismissed)
   - Created timestamp

10. **team_members** - User management
    - User ID
    - Email
    - Name
    - Role (rep/manager/admin)
    - Territories (array)
    - Active status
    - Created timestamp

### Environment Configuration

**Required Variables:**
- `ANTHROPIC_API_KEY` - Claude AI access
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` - Database
- `CRON_SECRET` - Secure cron job trigger
- `NEWS_API_KEY` - News data access
- `RESEND_API_KEY` - Email delivery
- `SALES_TEAM_EMAIL` - Distribution list

**Optional Variables:**
- `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` - Community data
- `SENTRY_DSN` - Error tracking
- Feature flags for gradual rollout

### Data Source Integration Requirements

**NewsAPI:**
- REST API integration
- Rate limiting (100 requests/day)
- Response parsing and storage
- Error handling for quota exhaustion

**Google Trends:**
- Unofficial API via npm package
- Rate limiting and backoff
- Trend data extraction and analysis
- Graceful degradation if unavailable

**Reddit API:**
- OAuth authentication
- Subreddit searching
- Sentiment analysis (basic)
- Community buzz quantification

**E2 GraphQL:**
- MCP server integration (existing)
- Bookmaker existence checks
- Market coverage analysis
- Integration status verification

**YouTube API (MVP Addition):**
- Free quota: 10,000 units/day (sufficient for channel discovery)
- Search for sports betting channels by keywords
- Parse video descriptions for WhatsApp/Telegram links
- Track subscriber counts and view rates
- Monitor channel growth over time
- Useful queries:
  * "apostas esportivas brasil"
  * "tips futebol brasileiro"
  * "análise de odds"
  * Team-specific betting channels

**Reddit API (Extended for Channels in MVP):**
- Existing OAuth integration from POC
- Expand queries to detect channel promotion:
  * "grupo whatsapp [team name]"
  * "melhor canal telegram apostas"
  * "sports betting discord/whatsapp"
- Community validation via upvotes
- Track which channels get recommended

**Apify (MVP Addition - Scheduled Scraping):**
- Starter plan: $49/month (datacenter proxies included)
- Pre-built actors for social media and web scraping
- Built-in proxy rotation (avoid rate limiting and blocking)
- Residential proxies available for Post-MVP (better anti-bot)

**Scraping Strategy (Scheduled + Query Pattern):**
1. **Scheduled scrapers run independently** (daily/12-hourly cron jobs)
2. **Results stored in Supabase** (scraped_publisher_data, scraped_twitter_mentions, etc.)
3. **Agent queries pre-scraped data** (fast, no timeout risk during agent execution)
4. **Agent decides WHAT to query**, not what to scrape (maintains agentic pattern)

**Apify Actors Used:**
- **Twitter Search Actor:** Scrape tweets matching keywords
  * Query examples: "grupo whatsapp palmeiras", "canal telegram apostas"
  * Extract: account handle, follower count, engagement, tweet text
  * Frequency: Every 12 hours
  
- **Instagram Profile Scraper:** Scrape influencer profiles
  * Extract: bio links, Linktree URLs, WhatsApp links, follower count
  * Identify sports betting influencers
  * Frequency: Daily
  
- **Google Search Actor:** Replace unreliable google-trends-api
  * Search: "[bookmaker name] brasil", "canal whatsapp apostas"
  * Track: which sites rank, SERP changes, related searches
  * More reliable than unofficial Trends package
  * Frequency: Every 6 hours
  
- **Web Scraper Actor:** Scrape publisher websites
  * Detect: WhatsApp CTAs, Telegram links, betting widgets
  * Monitor: content changes, new features
  * Target: Top 50 sports publishers per geo
  * Frequency: Daily

**Implementation Pattern:**
```javascript
// Cron job triggers Apify actor
// POST https://api.apify.com/v2/acts/[actor-id]/runs
// Result stored in Supabase

// Agent later queries stored results
agent_tool: query_scraped_twitter_mentions(keywords, min_engagement)
→ Returns pre-scraped data instantly (no scraping delay)
```

---

## 🚦 Constraints & Assumptions

### Hard Constraints (POC)

1. **Budget:** $0 for infrastructure and data sources
   - All services must have free tiers
   - No paid API subscriptions
   - No server hosting costs

2. **Timeline:** 4 weeks to demonstrate value
   - Week 1: Setup and first collection
   - Week 2-3: Two full cycles with reports
   - Week 4: Analysis and MVP pitch

3. **Data Sources:** Limited to free APIs
   - NewsAPI: 100 requests/day
   - Google Trends: Unofficial library (rate-limited)
   - Reddit: 100 requests/minute
   - E2 GraphQL: Per existing agreement

4. **Team:** Single developer (Carlos) + stakeholder feedback
   - No dedicated QA
   - No dedicated DevOps
   - Stakeholders provide domain expertise

### Soft Constraints

1. **Scope:** Focus on single geo + vertical for POC
   - Primary: Brazil + Bookmakers
   - Can expand to other geos in MVP

2. **Accuracy:** 60%+ useful signal rate acceptable for POC
   - Will improve with learning loop in MVP

3. **Automation:** Some manual input acceptable for POC
   - App store rankings (manual check)
   - Domain registrations (manual WHOIS)

### Key Assumptions

1. **Claude API Performance:**
   - Tool use works reliably for agentic pattern
   - 5M free tokens sufficient for POC (~32K tokens estimated)

2. **Data Source Availability:**
   - NewsAPI Brazil coverage adequate
   - Brazilian bookmakers searchable via trends
   - r/sportsbook has relevant Brazil discussions

3. **Stakeholder Engagement:**
   - Sales/BD will review reports within 24 hours
   - Feedback provided on 50%+ of HIGH signals
   - Willingness to iterate based on POC learnings

4. **E2 Integration:**
   - E2 GraphQL MCP server remains accessible
   - Bookmaker coverage data available via API
   - Carlos' existing E2 skill applies to this use case

5. **Technical:**
   - Vercel free tier sufficient for POC traffic
   - Supabase 500MB sufficient for signal storage
   - Email deliverability not blocked by spam filters

---

## ⚠️ Risks & Mitigations

### Technical Risks

**Risk 1: API Rate Limits**
- **Impact:** HIGH - Could prevent data collection
- **Probability:** MEDIUM - NewsAPI limited to 100/day
- **Mitigation:**
  - Implement request queuing and rate limiting
  - Cache results for 24 hours to avoid redundant calls
  - Fallback to fewer sources if limits hit
  - Accept reduced coverage for POC

**Risk 2: Agentic AI Unpredictability**
- **Impact:** MEDIUM - Agent might make poor tool choices or miss signals
- **Probability:** MEDIUM - Complex reasoning required
- **Mitigation:**
  - Start with detailed system prompts and examples
  - Log all agent decisions for debugging
  - Implement fallback to simpler rule-based flow if agent fails
  - Manual review of first few cycles

**Risk 3: Data Quality Issues**
- **Impact:** MEDIUM - Low-quality signals damage trust
- **Probability:** HIGH - Free data sources vary in quality
- **Mitigation:**
  - Require multiple evidence points per signal
  - Implement confidence scoring
  - Human review for HIGH priority signals in POC
  - Clear labeling of data source reliability

**Risk 4: Infrastructure Reliability**
- **Impact:** HIGH - Missed cycles lose trust
- **Probability:** LOW - Vercel is reliable
- **Mitigation:**
  - Set up monitoring with alerts
  - Implement retry logic for failed cron jobs
  - Email notification if cycle fails
  - Manual trigger capability as backup

**Risk 5: Geo-Blocking of Target Sites**
- **Impact:** HIGH - Can't scrape bookmaker sites if blocked by geo (licensing restrictions)
- **Probability:** HIGH - Most bookmakers block non-local IPs for legal compliance
- **Mitigation:**
  - **Use Apify with proxy rotation** (datacenter proxies included, residential available)
  - Focus scraping on accessible sources: social media, news sites, publisher content
  - Don't scrape bookmaker sites directly (track via mentions, not direct access)
  - Publishers may geo-target ads, but content/CTAs remain accessible
  - Apify's built-in proxies can appear from target geos when needed

### Business Risks

**Risk 6: Low Stakeholder Engagement**
- **Impact:** HIGH - POC fails without feedback
- **Probability:** MEDIUM - Busy teams may not prioritize
- **Mitigation:**
  - Short, scannable email format (2-3 min read)
  - Clear action items (not just information)
  - 1-on-1 check-ins with key users
  - Track who provides most feedback

**Risk 7: Misalignment with Sales Priorities**
- **Impact:** HIGH - Signals don't match what Sales needs
- **Probability:** MEDIUM - Agent learning from scratch
- **Mitigation:**
  - Pre-launch interviews with Sales on ideal leads
  - Weekly feedback sessions during POC
  - Rapid iteration on scoring criteria
  - Option to manually adjust priority on signals

**Risk 8: Regulatory/Legal Concerns**
- **Impact:** HIGH - Grey market operators or unlicensed influencers flagged as opportunities
- **Probability:** MEDIUM - Not all bookmakers are licensed; betting promotion regulations vary by market
- **Mitigation:**
  - Explicit risk flagging in reports
  - Legal review required disclaimer
  - Clear separation of "flagged" vs "opportunity"
  - Training data includes grey market examples
  - **For channels (MVP):** Flag if promoting in regulated markets, note gambling disclaimers, highlight if targeting minors
  - Sales team responsible for legal compliance checks before outreach

### Market Risks

**Risk 9: Limited POC Scope Doesn't Prove Value**
- **Impact:** CRITICAL - No MVP funding secured
- **Probability:** MEDIUM - Single geo may not be representative
- **Mitigation:**
  - Choose high-activity geo (Brazil good choice)
  - Focus on quality over quantity
  - Document "what we'd catch with more coverage"
  - Present expansion roadmap with MVP pitch

---

## 🚫 Scope Boundaries

### POC (Weeks 1-4) - Intelligence Only

**IN SCOPE:**
- ✅ AI signal discovery (bookmakers only)
- ✅ Scoring and prioritization
- ✅ Bi-weekly email reports
- ✅ Basic dashboard with feedback
- ✅ Brazil market only

**OUT OF SCOPE:**
- ❌ Lead claiming/tracking
- ❌ Status pipeline
- ❌ Team collaboration features
- ❌ Publishers and fan apps
- ❌ Multiple geographies

---

### MVP (Months 1-3) - Add Lead Tracking + Expand Entity Types

**IN SCOPE:**

*Lead Management:*
- ✅ Lead claiming and assignment
- ✅ Status pipeline (5-6 stages)
- ✅ Activity logging
- ✅ Team activity feed
- ✅ My Active Leads view
- ✅ Basic reminders

*Market Coverage:*
- ✅ Brazil + US + EU markets
- ✅ Bookmakers + Publishers + Fan Apps
- ✅ **NEW: Channels/Influencers** (WhatsApp/Telegram groups, YouTube channels, Twitter accounts)

*Data Sources:*

**Free APIs:**
- ✅ YouTube API (channel discovery via descriptions)
- ✅ Reddit API (expand queries for channel mentions)
- ✅ NewsAPI (100 requests/day limit)
- ✅ E2 GraphQL (partnership status checks)

**Apify Scrapers (Scheduled):**
- ✅ **Twitter search** (channel promotion detection: "grupo whatsapp", "canal telegram")
- ✅ **Instagram scraping** (bio links, Linktree analysis, influencer content)
- ✅ **Google Search** (replaces unofficial Trends API - more reliable)
- ✅ **Publisher websites** (detect WhatsApp CTAs, betting widgets, Telegram links)
- ✅ **Built-in proxy rotation** (datacenter proxies included, residential available)
- ✅ **Cost:** $49/month Starter plan

**Hybrid Architecture:**
- Apify scrapers run on schedule (daily/12-hourly)
- Results stored in Supabase
- Agent queries pre-scraped data (fast, no timeout risk)
- Agent decides WHAT to query, scrapers provide data layer

**OUT OF SCOPE:**
- ❌ Real-time scraping during agent execution (uses scheduled approach)
- ❌ Custom Puppeteer scrapers (use Apify pre-built actors instead)
- ❌ CRM integration
- ❌ Mobile app
- ❌ Predictive analytics
- ❌ AI-suggested actions
- ❌ Slack notifications

**Partnership Models by Entity Type:**
- **Bookmakers:** E2 Ads, CaaS, widgets (standard B2B)
- **Publishers:** E2 Ads, affiliate, CaaS (website integration)
- **Apps:** In-app odds, E2 Ads overlays (SDK integration)
- **Channels/Influencers:** Rev share, paid promotion, bookmaker intermediation (flexible models)

**Note:** Channels require different sales approach and may involve separate BD team members.

---

### Post-MVP (Months 4-12) - Full Platform + Enhanced Intelligence

**IN SCOPE:**

*Platform Features:*
- ✅ Complete status pipeline (8 stages)
- ✅ CRM integration (Salesforce/HubSpot)
- ✅ Mobile app experience
- ✅ Advanced analytics and reporting
- ✅ AI-suggested next actions
- ✅ Predictive lead scoring
- ✅ Slack/email notifications

*Market Coverage:*
- ✅ All geographies (EU, LATAM, US, APAC)
- ✅ All entity types (bookmakers, publishers, apps, channels/influencers)

*Enhanced Apify Capabilities:*
- ✅ **Residential proxies** (appear as real users, better for anti-bot sites)
- ✅ **Increased scraping frequency** (every 6 hours vs. daily)
- ✅ **More publishers/sites** (expand from top 50 to top 200)
- ✅ **LinkedIn scraping** (decision-maker contact discovery)
- ✅ **App store scraping** (download ranks, review analysis)

*Additional Paid APIs:*
- ✅ **Similarweb API** (traffic estimates for publishers)
- ✅ **Twitter API** (if Apify scraping becomes unreliable - $100/month backup)

*Advanced Channel Intelligence:*
- ✅ Engagement rate calculations
- ✅ Influencer network mapping
- ✅ Promotion frequency tracking
- ✅ Cross-platform presence detection
- ✅ Audience overlap analysis

---

### Never In Scope

These features are explicitly not planned:

**Data Sources:**
- ❌ LinkedIn scraping for contacts (legal concerns)
- ❌ Private/proprietary data sources
- ❌ Paid services > $5K/year

**Features:**
- ❌ Automatic outreach (sending emails on behalf of reps)
- ❌ Complete CRM replacement (augment, not replace)
- ❌ Financial forecasting
- ❌ Contract management

**Intelligence Types:**
- ❌ Player-level sentiment analysis
- ❌ Sponsorship ROI calculations
- ❌ Market sizing estimates
- ❌ Competitive win/loss analysis
- ❌ Player sentiment analysis
- ❌ Regulatory change tracking
- ❌ Sponsorship ROI analysis
- ❌ Market size estimation

---

## 🔗 Dependencies

### External Dependencies

1. **Anthropic Claude API**
   - Required for: Agentic AI functionality
   - Free tier: $5 credit (~5M tokens)
   - Risk: If quota exceeded, POC pauses

2. **Vercel Platform**
   - Required for: Hosting, cron jobs
   - Free tier: 100GB bandwidth, 6000 serverless hours
   - Risk: Exceeding limits

3. **Supabase**
   - Required for: Database, storage
   - Free tier: 500MB database
   - Risk: Storage limit

4. **NewsAPI**
   - Required for: News signal collection
   - Free tier: 100 requests/day
   - Risk: Hitting limit

5. **Resend**
   - Required for: Email delivery
   - Free tier: 100 emails/day
   - Risk: Spam filtering

6. **E2 GraphQL API**
   - Required for: Bookmaker integration checks
   - Access: Via existing MCP server setup
   - Risk: API changes or downtime

### Internal Dependencies

1. **Sales Team Availability**
   - Required for: Feedback and validation
   - Timeline: Weekly 15-min reviews
   - Risk: Team too busy

2. **BD Leadership Buy-In**
   - Required for: POC→MVP approval
   - Timeline: End of week 4
   - Risk: Competing priorities

3. **Carlos' E2 GraphQL Expertise**
   - Required for: E2 integration implementation
   - Timeline: Week 1-2
   - Risk: Other project conflicts

---

## ✅ Acceptance Criteria

### POC Completion Criteria

**Functional Requirements:**
- [ ] System successfully completes 2 full weekly cycles
- [ ] At least 20 signals collected and analyzed per cycle
- [ ] Bi-weekly emails delivered automatically
- [ ] Dashboard accessible with filtering
- [ ] Feedback mechanism working
- [ ] Agent execution logs visible

**Quality Requirements:**
- [ ] 60%+ of HIGH priority signals marked "useful"
- [ ] Zero critical bugs (crashes, data loss, missed cycles)
- [ ] Email deliverability 100%
- [ ] Page load times < 3 seconds
- [ ] Mobile-responsive dashboard

**Documentation Requirements:**
- [ ] README with setup instructions
- [ ] Architecture diagram
- [ ] Agent prompt templates documented
- [ ] API endpoint documentation
- [ ] Troubleshooting guide

**Business Requirements:**
- [ ] At least 2 "we didn't know about this" discoveries per cycle
- [ ] Sales team provides feedback on 50%+ of HIGH signals
- [ ] Time savings quantified
- [ ] MVP pitch deck prepared

### Definition of "Done" for MVP Approval

- [ ] 3+ Sales/BD stakeholders recommend proceeding
- [ ] Leadership approves budget for MVP
- [ ] Clear MVP scope agreed upon
- [ ] Development timeline defined
- [ ] Success metrics for MVP established

---

## 📝 Additional Context

### Development Philosophy

**Prioritize Speed for POC:**
- Use libraries and existing solutions
- Don't over-engineer
- Accept technical debt (document for refactoring)
- Focus on demonstrating value, not perfect architecture

**Embrace Agentic Approach:**
- Trust Claude to make decisions
- Don't hardcode workflows
- Log everything for debugging
- Iterate on prompts based on behavior

**User-Centric:**
- Sales/BD are the customer
- Their feedback is the product roadmap
- Build for their workflow
- Minimize friction to provide feedback

### Success Factors

**Critical for POC Success:**
1. At least 2 "aha!" moments (discoveries Sales didn't know)
2. Reports are scannable in 2-3 minutes
3. Feedback loop is frictionless
4. System reliability (zero missed cycles)
5. Clear value demonstration

**Red Flags to Watch:**
- Low engagement (< 50% team reviews dashboard)
- Poor signal quality (< 40% marked useful)
- Technical unreliability
- Scope creep

---

## 🎬 Next Steps for Product Lead

**Immediate Actions:**
1. Break down into granular development tasks
2. Create technical design documents for core components
3. Set up project tracking and milestones
4. Schedule kickoff meeting with developer (Carlos)
5. Establish weekly stakeholder check-ins

**Pre-Development Checklist:**
- [ ] All stakeholders reviewed and approved brief
- [ ] Sales/BD committed to weekly feedback
- [ ] Leadership understands POC limitations
- [ ] Developer has bandwidth for 4-week sprint
- [ ] API keys can be obtained
- [ ] POC success criteria agreed upon
- [ ] MVP approval process defined

**Development Priorities:**
1. Core agent functionality (collection, analysis, reporting)
2. Database and storage setup
3. Dashboard UI (minimal viable)
4. Feedback mechanism
5. Automation (cron jobs)
6. Polish and documentation

---

## 📚 Reference Materials

**Technical Context:**
- E2 GraphQL API integration (via existing MCP server)
- Brazilian sports betting market knowledge
- POC-first development approach
- Agentic AI patterns with Claude

**Related Documentation:**
- E2 GraphQL skill documentation
- E2 API query patterns and examples
- E2 API schema reference

**External Resources:**
- Anthropic Claude API Documentation
- Vercel Cron Jobs Documentation
- Supabase PostgreSQL Documentation
- NewsAPI Documentation
- Next.js 14 App Router Guide

---

**Document Status:** Ready for Product Lead Review  
**Next Action:** Product Lead creates development roadmap and task breakdown  
**Success Mantra:** *Ship fast, learn quickly, iterate based on user feedback.*

The goal is to demonstrate enough value in 4 weeks to secure funding for building a comprehensive system over 6-12 months.
