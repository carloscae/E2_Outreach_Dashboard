# MVP Budget Breakdown: $2-5K Estimate

## 📊 Overview

**Timeline:** 8-12 weeks  
**Scope:** Lead tracking + Multi-geo + Multi-entity (bookmakers, publishers, apps, channels)  
**Team:** Carlos (dev) + Product Lead + Stakeholders

---

## 💰 Direct Service Costs

### 1. Claude API (Primary Cost Driver)

**POC Usage (4 weeks):**
- $5 free credit = ~5M tokens
- 2 bi-weekly cycles
- Single geo (Brazil), single entity type (bookmakers)
- Estimated: 10-20 signals per cycle
- **Cost: $0** (within free credit)

**MVP Usage (8-12 weeks):**
- 4-6 bi-weekly cycles
- Multiple geos (Brazil + US + EU)
- Multiple entity types (bookmakers, publishers, apps, channels)
- Estimated: 50-100 signals per cycle
- Lead tracking queries (status updates, activity logs, team dashboards)

**Claude API Pricing:**
- Input: $3 per million tokens
- Output: $15 per million tokens
- Average: ~$10 per million tokens (mixed usage)

**Token Usage Estimates:**

**Per Weekly Cycle:**
```
Collector Agent:
- 20-30 tool calls (NewsAPI, Trends, Reddit, YouTube, E2 GraphQL)
- Context window: ~50K tokens per call
- Total: ~1M input tokens, ~200K output tokens
- Cost: ~$6 per cycle

Analyzer Agent:
- Process 50-100 signals
- Scoring calculations with context
- Total: ~500K input tokens, ~100K output tokens
- Cost: ~$3 per cycle

Reporter Agent:
- Generate email reports
- Update dashboard data
- Total: ~200K input tokens, ~50K output tokens
- Cost: ~$1.50 per cycle

Lead Tracking Queries (ongoing):
- Team dashboard loads
- Status updates
- Activity feeds
- Total: ~300K input tokens, ~50K output tokens per week
- Cost: ~$1.50 per week

Weekly Total: ~$12/week
```

**MVP Period (12 weeks):**
- Weekly cycles: $12 x 12 = $144
- Bi-weekly major cycles: 6 cycles x $10 = $60
- Lead tracking: $1.50 x 12 = $18
- Buffer for testing/debugging: +50%
- **Total Claude API: $330-500**

**Conservative Estimate:** $500  
**With Buffer:** $1,000 (if usage higher than expected)

---

### 2. Supabase (Database)

**POC Usage:**
- Free tier: 500MB database, 2GB bandwidth
- Stores: signals, analyzed_signals, reports, feedback, agent_runs
- **Cost: $0**

**MVP Usage:**
- Add: leads, lead_activities, lead_comments, lead_reminders, team_members
- More entity types = more data
- Team collaboration = more queries
- 8-12 weeks of data accumulation

**Free Tier Limits:**
- 500MB database
- 2GB bandwidth/month
- Estimated MVP usage: 200-300MB database, 4-5GB bandwidth

**If free tier exceeded:**
- Pro Plan: $25/month
- Includes: 8GB database, 250GB bandwidth
- **Cost: $25 x 3 months = $75**

**Conservative Estimate:** $0 (stay within free tier)  
**If Exceeded:** $75

---

### 3. Vercel (Hosting + Cron)

**POC Usage:**
- Free tier: 100GB bandwidth, 6000 serverless hours
- Simple dashboard, weekly cron jobs
- **Cost: $0**

**MVP Usage:**
- More users (Sales/BD team accessing dashboard)
- More frequent updates (lead tracking)
- Larger responses (multi-entity data)
- Dashboard queries, API endpoints
- Cron jobs for Apify integration (trigger scrapers)

**Free Tier Limits:**
- 100GB bandwidth/month
- 6000 serverless execution hours
- Estimated MVP usage: 50-80GB bandwidth, 2000-3000 hours

**Note:** No heavy Puppeteer scraping on Vercel (using Apify instead)

**If free tier exceeded:**
- Pro Plan: $20/month per member
- For team usage: 1 account sufficient (dashboard is public to E2 team)
- **Cost: $20 x 3 months = $60**

**Conservative Estimate:** $0 (stay within free tier - no scraping load)  
**If Exceeded:** $60

---

### 4. Resend (Email Delivery)

**POC Usage:**
- Free tier: 100 emails/day, 3,000/month
- Bi-weekly reports to ~5-10 people
- **Cost: $0**

**MVP Usage:**
- Bi-weekly reports to larger team
- Lead notifications (claims, assignments, reminders)
- Status update emails
- Estimated: 200-300 emails/month

**Free Tier Limit:** 3,000/month (sufficient)

**If free tier exceeded:**
- Pro Plan: $20/month
- Includes: 50,000 emails/month
- **Cost: $20 x 3 months = $60**

**Conservative Estimate:** $0 (stay within free tier)  
**If Exceeded:** $60

---

### 5. Other Free Services (No Cost Impact)

**NewsAPI:**
- Free: 100 requests/day = 3,000/month
- MVP usage: ~50/day = 1,500/month
- **Cost: $0**

**Google Trends:**
- Unofficial API (no official pricing)
- Rate-limited but free
- **Cost: $0**

**Reddit API:**
- Free tier: 100 requests/minute
- MVP usage: ~20/day
- **Cost: $0**

**YouTube API:**
- Free tier: 10,000 units/day
- Search = 100 units, video details = 1 unit
- MVP usage: ~500 units/day
- **Cost: $0**

---

### 6. Apify (Web Scraping Platform) - MVP Addition

**POC Usage:**
- Not used
- **Cost: $0**

**MVP Usage:**
- Scheduled scraping for social media and publisher sites
- Pre-built actors for Twitter, Instagram, Google Search, websites
- Built-in proxy rotation (datacenter proxies included)
- Handles anti-bot measures automatically

**Why Apify:**
- Geo-blocking solution (bookmakers block non-local IPs)
- Social media scraping (Twitter, Instagram accessible)
- No maintenance burden (Apify maintains scrapers)
- Faster than building custom Puppeteer (saves 3-5 dev days)
- Built-in proxies avoid rate limiting

**Pricing:**
- Free tier: $5 credit (insufficient for MVP)
- Starter plan: $49/month
- Includes: Datacenter proxies, all actors, 100 actor runs/month

**MVP Period (3 months):**
- $49 x 3 = $147

**What We Scrape:**
- Twitter: Channel promotion mentions ("grupo whatsapp", "canal telegram")
- Instagram: Bio links, Linktree analysis, influencer content
- Google Search: Replaces unreliable google-trends-api
- Publisher sites: Top 50 sports sites for WhatsApp CTAs, betting widgets

**Scraping Frequency:**
- Twitter/Instagram: Every 12 hours
- Publisher sites: Daily
- Google searches: Every 6 hours

**Storage:**
- Results stored in Supabase
- Agent queries pre-scraped data (fast, no timeout)

**Conservative Estimate:** $147 (required for MVP)

---

## 🛠️ Development & Tooling (Optional)

### 6. Error Tracking & Monitoring

**Sentry (Error Tracking):**
- Free tier: 5,000 events/month
- Team plan: $26/month (50K events)
- **Cost: $0-80** (optional, $26 x 3 months if needed)

**Uptime Monitoring:**
- UptimeRobot: Free for basic monitoring
- Better Stack: $10/month
- **Cost: $0-30** (optional)

---

### 7. Domain & Infrastructure

**Custom Domain:**
- e2-intelligence.com or similar
- **Cost: $15/year** (one-time, optional)

**SSL Certificates:**
- Free via Vercel/Let's Encrypt
- **Cost: $0**

---

### 8. Development Tools (Usually Covered)

**GitHub:**
- Free for private repos
- **Cost: $0**

**Postman/Insomnia:**
- Free tiers sufficient
- **Cost: $0**

**VS Code & Extensions:**
- Free
- **Cost: $0**

---

## 💸 Total MVP Budget Breakdown

### Minimum Budget Scenario ($650-1,150)

**Assumptions:**
- All services stay within free tiers (except Apify)
- Claude API + Apify are essential costs
- No monitoring tools
- No custom domain
- Apify required for channels/influencers scope

```
Claude API (essential):           $500-1,000
Apify (essential for MVP):        $147
Supabase (stay free):             $0
Vercel (stay free):               $0
Resend (stay free):               $0
Other services:                   $0
----------------------------------------
Total:                            $650-1,150
```

**Risk:** Tight limits on everything except scraping, might hit caps mid-MVP

---

### Comfortable Budget Scenario ($2,000-2,150)

**Assumptions:**
- Claude API with buffer
- Apify for scraping (essential)
- Upgrade 1-2 services if needed
- Basic monitoring
- Domain registration

```
Claude API:                       $1,000
Apify (essential):                $147
Supabase (if needed):             $75
Vercel (stay free):               $0
Resend (if needed):               $60
Monitoring (optional):            $80
Domain:                           $15
Testing/debugging buffer:         $623
----------------------------------------
Total:                            $2,000
```

**Risk:** Medium - covers most scenarios

**⭐ RECOMMENDED BUDGET**

---

### Maximum Budget Scenario ($2,700)

**Assumptions:**
- Higher Claude API usage (more testing, debugging)
- Apify with potential residential proxy upgrades
- All services upgraded to paid tiers
- Full monitoring stack
- Contingency for unknowns

```
Claude API (high usage):          $1,500
Apify Starter:                    $147
Supabase Pro:                     $75
Vercel (stay free):               $0
Resend Pro:                       $60
Monitoring (full):                $150
Domain + setup:                   $50
Development tools:                $100
Testing data/sandbox:             $200
Contingency buffer:               $418
----------------------------------------
Total:                            $2,700
```

**Risk:** Low - plenty of buffer for surprises

**Note:** Reduced from $5K as Puppeteer development eliminated (4 days saved)

---

## 🎯 Recommended Budget: $2,000

### Reasoning:

1. **Claude API is primary driver:** $500-1,000 realistic
2. **Apify is essential:** $147 for channels/influencers scope (built-in proxies solve geo-blocking)
3. **Service overages likely:** At least 1-2 services will exceed free tier
4. **Monitoring is valuable:** Early error detection saves time
5. **Contingency important:** First production system, unknowns exist

### Allocation:

```
Guaranteed Spend:
- Claude API:                     $1,000
- Apify (scraping):               $147

Likely Spend:
- Service tier upgrades:          $135
- Monitoring/tooling:             $100

Buffer:
- Testing & debugging:            $300
- Unknowns:                       $318
----------------------------------------
Total:                            $2,000
```

### Why Apify Instead of Custom Scraping:

**Decision:** Use Apify over building custom Puppeteer scrapers

**Rationale:**
1. **Geo-blocking:** Bookmakers block non-local IPs; Apify includes proxy rotation
2. **Time savings:** 1 day integration vs. 5 days building custom scrapers
3. **Maintenance:** Apify handles anti-bot measures and scraper updates
4. **Reliability:** Pre-built actors maintained by Apify team
5. **Cost difference:** $147 (Apify) vs. $60 (Vercel Pro for Puppeteer) = $87 difference
6. **ROI:** $87 for 4 saved dev days is worth it

---

## 📈 Cost Drivers & Variables

### What Could Increase Costs:

1. **More Claude API calls:**
   - Higher signal volume than expected
   - More complex analysis required
   - Additional testing cycles

2. **Database growth:**
   - Team logs more activity than expected
   - Historical data retention
   - More entity types = more data

3. **Higher traffic:**
   - More dashboard users
   - Real-time updates
   - Mobile access (future)

4. **Additional features:**
   - Scope creep during MVP
   - Integrations added mid-stream
   - Advanced analytics

### What Could Decrease Costs:

1. **Efficient queries:**
   - Optimize Claude prompts
   - Cache frequently accessed data
   - Reduce redundant API calls

2. **Stay within free tiers:**
   - Careful usage monitoring
   - Query optimization
   - Batch operations

3. **Delayed features:**
   - Push non-essential features to Post-MVP
   - Simplify initial implementation

---

## 🔍 Cost Comparison

### Alternative Approaches:

**Manual Research (Current State):**
- 4-8 hours/week x $50/hour (loaded rate) = $200-400/week
- 12 weeks = $2,400-4,800
- **Plus:** Opportunity cost of missed deals

**Off-the-shelf Intelligence Tools:**
- Similarweb Pro: $200/month = $600 (3 months)
- Crunchbase Pro: $50/month = $150 (3 months)
- Custom scraping: $500-2000/month
- **Total:** $2,250+ (and still requires manual analysis)

**Custom Development Agency:**
- Typical MVP: $20K-50K
- Timeline: 3-6 months
- Plus ongoing maintenance

**Our Approach:**
- **$2,000 total**
- Automated + learning system
- Owned infrastructure
- **ROI:** Positive in 2-3 cycles if 1 deal found

---

## ✅ Budget Approval Recommendation

**Request:** $2,000 for MVP phase

**Justification:**
- Primary cost is AI processing ($1,000)
- Service tiers ($200) provide reliability
- Buffer ($800) covers unknowns
- **Total cost << manual research cost**
- One successful partnership = 25x ROI ($50K deal)

**Risk Mitigation:**
- Track spending weekly
- Alert if approaching limits
- Can scale back if needed (reduce geos/entity types)

**Success Criteria:**
- Stay under $2,500 (buffer remaining)
- Demonstrate ROI within MVP period
- No service outages due to cost caps

---

## 📋 Monthly Cost Breakdown (Post-MVP)

Once MVP proves successful, ongoing costs:

```
Claude API (production):          $300-500/month
Apify Starter (scraping):         $49/month
Supabase Pro:                     $25/month
Vercel (within free tier):        $0
Resend (within free tier):        $0
Monitoring:                       $26/month
Domain:                           $1.25/month (amortized)
----------------------------------------
Monthly Operating Cost:           $400-600/month

Annual Operating Cost:            $4,800-7,200/year
```

**For context:** One $50K deal per year = 7-10x ROI on operating costs

**Scaling Options:**
- If scraping needs increase: Upgrade to Apify Business ($499/month) for residential proxies
- If successful: One deal covers entire year of operating costs

---

## 🤔 Questions to Consider:

1. **Is labor included?** If so, add $30-50/hour x hours worked
2. **What's the threshold for MVP approval?** Should budget be lower to prove concept first?
3. **Can we start with $1K and add more if needed?** Phased budget approach
4. **Who approves service upgrades?** Need process for mid-MVP tier changes

---

**Bottom Line:** $2,000 is a **comfortable, realistic budget** for MVP with Apify scraping and contingency. Minimum viable spend is $650-1,150 (Claude API + Apify only), but $2,000 provides peace of mind, monitoring tools, and room for learning. The addition of Apify ($147) solves geo-blocking issues and saves 4 dev days compared to custom Puppeteer implementation.
