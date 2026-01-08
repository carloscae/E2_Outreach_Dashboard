# AI Market Intelligence Agent - Roadmap

## Overview

| Phase | Timeline | Budget | Goal |
|-------|----------|--------|------|
| **POC** | 4 weeks | $0 | Prove AI finds valuable opportunities in Brazil bookmaker market |
| **MVP** | 8-12 weeks | $2K | Add lead tracking + expand to 3 geos and all verticals |
| **Platform** | Year 1 | TBD | Complete lifecycle management with CRM integration |

---

## Sprint 1: POC Foundation (Week 1)

**Goal:** Project setup and core agent infrastructure

**Key Deliverables:**
- Next.js 14 application scaffolded
- Supabase database schema deployed
- Collector Agent with NewsAPI + Trends tools
- Basic API routes for manual testing

**Success:** Can trigger collection and see signals in database

---

## Sprint 2: POC Intelligence (Week 2)

**Goal:** Complete agent pipeline and first report

**Key Deliverables:**
- Analyzer Agent with scoring framework
- Reporter Agent with email template
- First bi-weekly report generated
- Redis + E2 GraphQL tools integrated

**Success:** Full collection→analyze→report cycle works end-to-end

---

## Sprint 3: POC Dashboard (Week 3)

**Goal:** User interface for reviewing signals

**Key Deliverables:**
- Dashboard page with signal cards
- Filtering by priority, entity type, geo
- Feedback mechanism (👍/👎)
- Report archive view

**Success:** Sales team can review signals and provide feedback

---

## Sprint 4: POC Polish (Week 4)

**Goal:** Automation and stakeholder validation

**Key Deliverables:**
- Weekly cron job running reliably
- Email delivery to Sales team
- Monitoring and error tracking
- POC metrics collected
- MVP pitch prepared

**Success Criteria:**
- [ ] 60%+ of HIGH signals marked useful
- [ ] 2+ unknown opportunities discovered
- [ ] 4+ hours/week time savings reported
- [ ] Leadership approves MVP

---

## MVP Sprints (Pending POC Success)

### Sprint 5-6: Lead Tracking Core
- Lead claiming and assignment
- Status pipeline (Discovery→Qualified)
- Activity logging
- My Active Leads view

### Sprint 7-8: Multi-Geo Expansion
- US market coverage
- EU market coverage
- Geo-specific scoring adjustments

### Sprint 9-10: Multi-Entity Types
- Publisher discovery (sports traffic, no betting tech)
- Fan app tracking (high-ranking, growth signals)
- Channel/influencer detection (WhatsApp, Telegram, YouTube)

### Sprint 11-12: Advanced Features
- Apify scraping integration
- Team collaboration (comments, mentions)
- Stalled lead detection
- Performance metrics dashboard

---

## Post-MVP Backlog

- CRM integration (Salesforce/HubSpot)
- AI-suggested next actions
- Predictive lead scoring
- Mobile app experience
- Advanced analytics and reporting
- Slack/email notifications
- Residential proxy upgrades
- LinkedIn scraping (legal review required)

---

## Decision Points

| Milestone | Decision | Criteria |
|-----------|----------|----------|
| End of POC | Go/No-Go on MVP | 60%+ useful signals, stakeholder support |
| MVP Week 4 | Budget adjustment? | Service tier usage patterns |
| MVP Week 8 | Expand scope? | Lead tracking adoption metrics |
| End of MVP | Platform investment? | ROI demonstrated, deal closed |

---

## Resource Allocation

| Role | POC | MVP |
|------|-----|-----|
| Product Lead | Planning, stakeholder mgmt | Roadmap, prioritization |
| Developer (Carlos) | Full implementation | Core development |
| Sales/BD | Feedback, validation | Daily usage, testing |
| Leadership | POC approval | MVP budget approval |
