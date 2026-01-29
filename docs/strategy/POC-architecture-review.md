# POC Architecture Review: Brazilian Publishers & Bookmakers
**Date:** January 29, 2026
**Budget:** 200-300€ for 4 weeks
**Scope:** Brazilian Publishers and Bookmakers signal discovery

---

## 1. Current State: What's Broken

After reviewing the codebase, I identified several critical issues with the "free API" approach:

### 1.1 Google Trends is SIMULATED
```typescript
// From src/lib/tools/trends.ts line 99-102
// Simulate trend data based on keyword patterns
// In production, this would call the actual Google Trends API
const simulatedData = simulateTrendData(keyword, geo);
```
**Impact:** The trend data shown is fake randomized numbers, not actual Google search interest. This makes "65% search spike" evidence meaningless.

### 1.2 NewsAPI Has Poor Brazil Coverage
- Free tier: 100 requests/day (you have it capped at 50)
- **Critical Issue:** NewsAPI returns mostly aggregated SEO content, not industry-specific news
- For Brazilian betting market, it returns generic sports news, not operator announcements

### 1.3 No Publisher Discovery Mechanism
The current architecture can't answer: "Which Brazilian sports publishers don't have betting integrations yet?"

You have:
- RSS feeds from industry news (SBC Americas, iGaming Brazil) - good for **bookmaker** news
- No way to **discover publisher websites**
- No way to **crawl publisher sites** to detect betting widgets/integrations

### 1.4 RSS Sources Are News, Not Publishers
Your RSS sources (SBC Americas, iGaming Brazil, Yogonet) are great for industry news but they report **about** operators, they don't help you find **publishers without integrations** - which is your actual opportunity signal.

---

## 2. Firecrawl: Self-Hosted vs API

### Decision: Use Firecrawl API (not self-hosted)

| Factor | Self-Hosted | API |
|--------|-------------|-----|
| **Vercel Compatible** | ❌ No (needs Docker/server) | ✅ Yes |
| **Setup Time** | 2-3 days | 30 minutes |
| **Maintenance** | You handle proxies, scaling | Included |
| **Cost** | $0 + server (~$20-50/mo) | $16-83/mo |
| **Proxy Rotation** | DIY (unreliable) | Built-in |

**Recommendation:** Use [Firecrawl API](https://www.firecrawl.dev/pricing) at $16/month (Hobby tier, 3,000 credits/month).

For your POC scope (Brazilian publishers), 3,000 pages/month is plenty:
- ~50 target publishers × 5 pages each = 250 pages
- Weekly recrawl = 1,000 pages/month
- Buffer for discovery = 2,000 pages remaining

---

## 3. Realistic Architecture for 200-300€ Budget

### 3.1 Budget Breakdown (4 weeks)

| Service | Monthly Cost | Purpose |
|---------|-------------|---------|
| **Claude API** | ~€50-80 | AI analysis (collector, analyzer, reporter) |
| **Firecrawl API** | ~€15 ($16 Hobby) | Crawl publisher sites for betting detection |
| **Serper.dev** | ~€0 (2,500 free) | Google Search for publisher discovery |
| **Vercel** | €0 (free tier) | Hosting |
| **Supabase** | €0 (free tier) | Database |
| **Resend** | €0 (free tier) | Email |
| **Total** | **~€65-95** | Well under budget |

**Buffer:** €105-235 for unexpected usage or upgrading tiers if needed.

### 3.2 Alternative: If You Need More Crawling

If Firecrawl Hobby isn't enough:

| Option | Cost | Credits |
|--------|------|---------|
| Firecrawl Standard | $83/mo (~€77) | 50,000 pages |
| Apify Starter | $49/mo (~€45) | Variable (compute-based) |
| Serper Pro | $50/mo (~€46) | 50,000 searches |

**My recommendation:** Start with Firecrawl Hobby + Serper Free. Upgrade only if you hit limits.

---

## 4. Signal Collection Strategy

### 4.1 For PUBLISHERS (the hard part)

**Problem:** How do you find Brazilian sports publishers that DON'T have betting integrations?

**Solution: 3-Step Pipeline**

```
STEP 1: DISCOVERY (Serper.dev - FREE)
┌────────────────────────────────────────────┐
│ Google Search API                          │
│ Queries:                                   │
│   "esportes notícias brasil"              │
│   "futebol brasileiro portal"             │
│   "placar ao vivo" site:.com.br           │
│   "brasileirão cobertura"                 │
│                                            │
│ Output: List of publisher domains          │
└────────────────────────────────────────────┘
                    ↓
STEP 2: CRAWL (Firecrawl API - $16/mo)
┌────────────────────────────────────────────┐
│ For each discovered domain:                │
│   1. Crawl homepage + sports pages        │
│   2. Extract: outbound links, scripts,    │
│      iframes, ad networks, widgets        │
│   3. Return LLM-ready markdown            │
└────────────────────────────────────────────┘
                    ↓
STEP 3: ANALYZE (Claude - existing)
┌────────────────────────────────────────────┐
│ AI Detection:                              │
│   - Betting widgets present? (bet365,     │
│     betano, stake iframes/links)          │
│   - Ad network detected? (E2 Ads?)        │
│   - Odds displayed? (odds API calls)      │
│   - Affiliate links? (tracking params)    │
│                                            │
│ Score: NO_BETTING = High opportunity      │
│        HAS_BETTING = Low priority         │
└────────────────────────────────────────────┘
```

**Key Insight:** Publishers WITHOUT betting = your opportunity. The AI should flag sites that have:
- High sports traffic indicators (team names, match coverage)
- NO betting integrations (no odds, no bookmaker links, no affiliate params)

### 4.2 For BOOKMAKERS (easier)

Your current approach mostly works, but fix these:

**Replace Simulated Google Trends with Serper:**
```typescript
// Use Serper's Google Trends endpoint or just search volume
// Query: "BetXplosion site:google.com.br" → indicates search interest
// Or use their autocomplete API for trending queries
```

**Keep RSS Feeds** - They're good for:
- New operator launches
- Sponsorship announcements
- License applications
- Market expansion news

**Add E2 GraphQL Check** - You already have this:
- Verify if bookmaker is already an E2 partner
- If NOT in E2 system → HIGH opportunity

---

## 5. Recommended Implementation Changes

### 5.1 New Tool: Publisher Discovery

```typescript
// src/lib/tools/publisher-discovery.ts
import Firecrawl from '@firecrawl/firecrawl-js';

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function crawlPublisher(url: string) {
  const result = await firecrawl.scrapeUrl(url, {
    formats: ['markdown'],
    onlyMainContent: true,
  });

  return {
    content: result.markdown,
    links: result.links,
    // AI will analyze this for betting presence
  };
}

export async function discoverPublishers(query: string) {
  // Use Serper to find Brazilian sports sites
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      gl: 'br',
      hl: 'pt',
      num: 20,
    }),
  });

  return response.json();
}
```

### 5.2 Replace Simulated Trends

Option A: Use Serper's autocomplete for trend signals
```typescript
// Check if bookmaker name appears in Google autocomplete
const autocomplete = await fetch('https://google.serper.dev/autocomplete', {
  method: 'POST',
  headers: { 'X-API-KEY': process.env.SERPER_API_KEY },
  body: JSON.stringify({ q: 'betxplosion' }),
});
// If it autocompletes → indicates search volume
```

Option B: Use search result count as proxy
```typescript
// More results = more presence/buzz
const results = await serperSearch(`"BetXplosion" brasil`);
const presenceScore = results.searchInformation.totalResults;
```

### 5.3 Betting Detection Prompt for Claude

```typescript
const BETTING_DETECTION_PROMPT = `
Analyze this publisher website content and determine:

1. BETTING PRESENCE (0-10 scale):
   - 0: No betting content at all
   - 5: Has odds/scores but no betting integration
   - 10: Full betting integration (widgets, affiliate links, odds APIs)

2. DETECTED INTEGRATIONS:
   - List any bookmaker brands mentioned (bet365, betano, stake, etc.)
   - List any betting widgets or iframes
   - List any affiliate tracking parameters in links
   - List any odds APIs or betting SDKs

3. TRAFFIC INDICATORS:
   - Estimate sports focus (football, all sports, single team)
   - Content freshness (daily updates, weekly, stale)

4. E2 OPPORTUNITY SCORE:
   - If BETTING_PRESENCE < 3 and TRAFFIC high → HIGH opportunity
   - If BETTING_PRESENCE > 7 → Already monetizing, lower priority
`;
```

---

## 6. Revised Data Flow

```
WEEKLY CYCLE - BRAZILIAN MARKET

Monday 9:00 AM
┌─────────────────────────────────────────────────────┐
│ PHASE 1: BOOKMAKER SIGNALS (existing, improved)    │
│                                                     │
│ 1. RSS Feeds → Industry news (launches, sponsors)  │
│ 2. Serper → Search presence/buzz indicators        │
│ 3. E2 GraphQL → Partnership status check           │
│                                                     │
│ Output: Bookmaker opportunities with evidence       │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 2: PUBLISHER DISCOVERY (NEW)                  │
│                                                     │
│ 1. Serper → Find Brazilian sports publishers       │
│ 2. Firecrawl → Crawl top 20 sites                  │
│ 3. Claude → Detect betting integrations            │
│                                                     │
│ Output: Publishers WITHOUT betting = opportunities  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 3: ANALYSIS & SCORING (existing)             │
│                                                     │
│ Apply scoring framework to both entity types        │
│ - Market momentum                                  │
│ - E2 partnership fit                               │
│ - Actionability                                    │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 4: REPORT (existing)                         │
│                                                     │
│ Email with:                                        │
│ - Top bookmaker opportunities                      │
│ - Top publisher opportunities (NEW)                │
│ - Brazilian regulatory updates                      │
└─────────────────────────────────────────────────────┘
```

---

## 7. Is the Plan Sane?

### What's GOOD about the original plan:
✅ Agentic AI approach (Claude deciding what to search)
✅ Vercel + Supabase stack (fast to deploy, scales)
✅ RSS feeds for industry news (free, reliable)
✅ E2 GraphQL integration (your unique advantage)
✅ Feedback loop concept (learning from BD input)

### What WASN'T working:
❌ Google Trends was fake/simulated
❌ No mechanism to find publishers
❌ No way to crawl sites for betting detection
❌ NewsAPI returns noise, not signals

### What you need to add:
1. **Firecrawl API** ($16/mo) - Crawl publisher sites
2. **Serper.dev** (free tier) - Google Search for discovery + trend signals
3. **Betting detection logic** - AI prompt to analyze crawled content

### Verdict: Plan is 70% sane, needs 30% adjustment

The architecture, stack, and approach are solid. The problem was relying on free APIs that don't actually work for this use case. With ~€65-95/month in API costs (well within your €200-300 budget), you can get real data.

---

## 8. Quick Start Checklist

- [ ] Sign up for [Firecrawl](https://www.firecrawl.dev/) - get API key
- [ ] Sign up for [Serper.dev](https://serper.dev/) - 2,500 free searches/month
- [ ] Remove simulated trends code, replace with Serper
- [ ] Create publisher discovery tool using Serper + Firecrawl
- [ ] Add betting detection prompt to analyzer agent
- [ ] Update collector agent to run both bookmaker AND publisher pipelines
- [ ] Test with 10 known Brazilian publishers to validate detection

---

## 9. Sources

- [Firecrawl Pricing](https://www.firecrawl.dev/pricing) - $16/mo Hobby tier
- [Serper.dev Pricing](https://serper.dev/) - 2,500 free searches/month
- [SerpAPI Pricing](https://serpapi.com/pricing) - Alternative at $75/mo (more expensive)
- [Apify vs Firecrawl Comparison](https://blog.apify.com/firecrawl-vs-apify/)

---

**Bottom Line:** Your €200-300 budget is MORE than enough. The fix is straightforward: add Firecrawl (~€15) and Serper (free) to enable real publisher discovery and trend detection. Total monthly cost: ~€65-95, leaving significant buffer.
