/**
 * Collector Agent v2
 * Multi-source intelligence gathering with quality-first approach
 * 
 * Sources:
 * - Industry RSS feeds (SBC Americas, iGaming Brazil, etc.)
 * - Reddit discussions and sentiment
 * - Google Trends for validation
 * - E2 GraphQL for partnership status
 */

import { runAgent, type AgentTool } from '@/lib/ai/client';
import { searchIndustryNews, getRecentIndustryNews } from '@/lib/tools/rss';
import { searchBookmakerMentions, getTrendingBettingDiscussions } from '@/lib/tools/reddit';
import { checkGoogleTrends } from '@/lib/tools/trends';
import { checkE2Partnership } from '@/lib/tools/e2-graphql';
import { createSignal } from '@/lib/db/signals';
import { startAgentRun, completeAgentRun } from '@/lib/db/agent-runs';
import {
    isValidSignal,
    type CollectorInput,
    type CollectorOutput,
    type RawSignalData,
    type AgentResult
} from './types';
import type { SignalEvidence } from '@/types/database';

// ============================================================
// Tool Definitions (5 tools for comprehensive intelligence)
// ============================================================

const COLLECTOR_TOOLS: AgentTool[] = [
    {
        name: 'search_industry_news',
        description: `Search HIGH-QUALITY industry news sources (SBC Americas, iGaming Brazil, Yogonet, Gaming Post).
These are REAL industry publications with actual news - not SEO spam.
Use this as your PRIMARY news source.`,
        input_schema: {
            type: 'object',
            properties: {
                keywords: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Keywords to search (e.g., ["parimatch", "brazil"], ["license", "approval"])',
                },
                region: {
                    type: 'string',
                    description: 'Region: "br" for Brazil, "latam" for Latin America, empty for all',
                },
            },
            required: ['keywords'],
        },
    },
    {
        name: 'search_reddit',
        description: `Search Reddit for bookmaker discussions and user sentiment.
Returns real user posts with sentiment analysis (positive/negative/neutral).
Great for validating if a bookmaker has genuine user traction.`,
        input_schema: {
            type: 'object',
            properties: {
                bookmaker_name: {
                    type: 'string',
                    description: 'Bookmaker name to search for',
                },
                region: {
                    type: 'string',
                    description: '"br" for Brazil subreddits, "global" for general',
                },
            },
            required: ['bookmaker_name'],
        },
    },
    {
        name: 'check_trends',
        description: `Check Google Trends search interest for a keyword.
Returns trend direction (rising/stable/declining) and interest level.
Use this to validate market momentum for bookmakers.`,
        input_schema: {
            type: 'object',
            properties: {
                keyword: {
                    type: 'string',
                    description: 'Keyword to check (bookmaker name, brand)',
                },
                geo: {
                    type: 'string',
                    description: 'Country code (e.g., "BR" for Brazil)',
                },
            },
            required: ['keyword'],
        },
    },
    {
        name: 'check_e2_partner',
        description: `Check if a bookmaker is already an E2 partner.
- AFFILIATE_PARTNER: Already partnered (cross-sell opportunity)
- KNOWN_BOOKIE: In system but no deal (opportunity)
- NEW_PROSPECT: Not in E2 system (best opportunity)`,
        input_schema: {
            type: 'object',
            properties: {
                entity_name: {
                    type: 'string',
                    description: 'Bookmaker name to check',
                },
            },
            required: ['entity_name'],
        },
    },
    {
        name: 'store_signal',
        description: `Store a validated signal. ONLY store signals with:
1. At least one quality evidence source
2. E2 partnership status checked
3. Clear reasoning explaining the opportunity

Quality signals have triangulation: industry news + trends OR reddit sentiment.`,
        input_schema: {
            type: 'object',
            properties: {
                entity_name: {
                    type: 'string',
                    description: 'Bookmaker name',
                },
                signal_type: {
                    type: 'string',
                    enum: ['MARKET_ENTRY', 'EXPANSION', 'LICENSING', 'SPONSORSHIP', 'TREND_SURGE'],
                    description: 'Type of signal',
                },
                evidence: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            source: { type: 'string' },
                            headline: { type: 'string' },
                            url: { type: 'string' },
                        },
                    },
                    description: 'Array of evidence items (industry news, reddit posts, etc.)',
                },
                trends_data: {
                    type: 'object',
                    properties: {
                        interest: { type: 'number' },
                        direction: { type: 'string' },
                    },
                    description: 'Optional Google Trends data',
                },
                reddit_sentiment: {
                    type: 'object',
                    properties: {
                        mentions: { type: 'number' },
                        positive: { type: 'number' },
                        negative: { type: 'number' },
                    },
                    description: 'Optional Reddit sentiment data',
                },
                e2_status: {
                    type: 'string',
                    description: 'E2 partnership tier',
                },
                preliminary_score: {
                    type: 'number',
                    description: 'Score 0-10 based on evidence quality and triangulation',
                },
                reasoning: {
                    type: 'string',
                    description: 'REQUIRED: Detailed explanation of why this is a valuable signal',
                },
            },
            required: ['entity_name', 'signal_type', 'evidence', 'preliminary_score', 'reasoning'],
        },
    },
];

// ============================================================
// System Prompt (Quality-First Strategy)
// ============================================================

function buildCollectorPromptV2(geo: string): string {
    return `You are the Collector Agent for E2's Market Intelligence system.

## Your Mission
Find NEW or GROWING bookmakers in ${geo.toUpperCase()} that could be E2 partners.

## WORKFLOW (Follow This Order)

### Step 1: Discover via Industry News
Use search_industry_news to find bookmakers mentioned in QUALITY sources:
- search_industry_news(["brazil", "license"]) - regulatory news
- search_industry_news(["parimatch", "brazil"]) - specific company
- search_industry_news(["expansion", "latam"]) - market moves

Extract bookmaker names from the articles.

### Step 2: Validate with Trends
For each bookmaker found, check Google Trends:
- check_trends("Parimatch", "BR")
- Rising trend = strong signal
- No data = weak signal

### Step 3: Check Reddit Sentiment
Validate real user interest:
- search_reddit("Parimatch", "br")
- High mentions + positive sentiment = good traction
- Complaints about non-payment = risk flag

### Step 4: Check E2 Partnership
- check_e2_partner("Parimatch")
- NEW_PROSPECT = best opportunity
- AFFILIATE_PARTNER = cross-sell opportunity

### Step 5: Store High-Quality Signals
Only store if you have:
- ✅ Industry news mention (from search_industry_news)
- ✅ E2 status checked
- ✅ Clear reasoning

Better signals also include:
- Trends data (rising = bonus points)
- Reddit sentiment (validation)

## SCORING GUIDELINES
- 8-10: Industry news + rising trend + positive Reddit + not E2 partner
- 6-7: Industry news + one validation source
- 4-5: Industry news only, needs more validation
- 0-3: Weak evidence, skip

## CRITICAL REQUIREMENTS
1. NEVER rely on general news search - use search_industry_news
2. ALWAYS check E2 partnership status before storing
3. ALWAYS provide detailed reasoning
4. Quality over quantity - 3 excellent signals > 10 weak ones

## SIGNAL TYPES
- MARKET_ENTRY: New operator launching in ${geo.toUpperCase()}
- EXPANSION: Existing operator expanding
- LICENSING: Regulatory approval/application
- SPONSORSHIP: Sports/team partnerships
- TREND_SURGE: Significant search interest growth

Start by searching industry news for recent ${geo.toUpperCase()} betting market developments.`;
}

// ============================================================
// Tool Handlers
// ============================================================

async function handleIndustryNews(
    input: { keywords: string[]; region?: string }
): Promise<unknown> {
    console.log(`[Collector] 📰 search_industry_news: ${input.keywords.join(', ')}`);
    const result = await searchIndustryNews(input.keywords, {
        region: input.region,
        maxDaysOld: 30,
        limit: 15,
    });
    console.log(`[Collector]    → Found ${result.articles.length} articles from ${result.sources_checked.length} sources`);
    return {
        articles: result.articles.map(a => ({
            title: a.title,
            description: a.description,
            url: a.url,
            source: a.source,
            publishedAt: a.publishedAt,
            quality: a.quality,
        })),
        sources_checked: result.sources_checked,
    };
}

async function handleRedditSearch(
    input: { bookmaker_name: string; region?: string }
): Promise<unknown> {
    console.log(`[Collector] 💬 search_reddit: "${input.bookmaker_name}"`);
    const result = await searchBookmakerMentions(input.bookmaker_name, {
        region: input.region || 'br',
    });
    console.log(`[Collector]    → ${result.mentionCount} mentions, sentiment: +${result.sentimentIndicators.positive}/-${result.sentimentIndicators.negative}`);
    return {
        posts: result.posts.slice(0, 10).map(p => ({
            title: p.title,
            subreddit: p.subreddit,
            score: p.score,
            numComments: p.numComments,
            url: p.permalink,
        })),
        mentionCount: result.mentionCount,
        sentiment: result.sentimentIndicators,
    };
}

async function handleTrendsCheck(
    input: { keyword: string; geo?: string },
    defaultGeo: string
): Promise<unknown> {
    const geo = input.geo || defaultGeo.toUpperCase();
    console.log(`[Collector] 📈 check_trends: "${input.keyword}" in ${geo}`);
    const result = await checkGoogleTrends(input.keyword, geo);
    if (result.data) {
        console.log(`[Collector]    → Interest: ${result.data.averageInterest}, Trend: ${result.data.trend}`);
        return {
            keyword: result.data.keyword,
            interest: result.data.averageInterest,
            trend: result.data.trend,
            relatedQueries: result.data.relatedQueries,
        };
    }
    console.log(`[Collector]    → No trends data available`);
    return { error: result.error || 'No data available' };
}

async function handleE2PartnerCheck(
    input: { entity_name: string }
): Promise<unknown> {
    console.log(`[Collector] 🔎 check_e2_partner: "${input.entity_name}"`);
    const result = await checkE2Partnership(input.entity_name);
    console.log(`[Collector]    → Tier: ${result.tier}, Opportunity: ${result.isOpportunity}`);
    return {
        tier: result.tier,
        is_opportunity: result.isOpportunity,
        matched_bookie: result.bookieName || null,
        promotion_count: result.promotionCount,
        recommendation: result.tier === 'AFFILIATE_PARTNER'
            ? 'Cross-sell opportunity (E2 Ads, Widget Studio, SaaS)'
            : result.tier === 'KNOWN_BOOKIE'
                ? 'Good opportunity - known but no active deal'
                : 'Best opportunity - new prospect',
    };
}

async function handleStoreSignal(
    input: {
        entity_name: string;
        signal_type: string;
        evidence: Array<{ source: string; headline: string; url?: string }>;
        trends_data?: { interest: number; direction: string };
        reddit_sentiment?: { mentions: number; positive: number; negative: number };
        e2_status?: string;
        preliminary_score: number;
        reasoning: string;
    },
    geo: string,
    agentRunId: string
): Promise<{ success: true; signal_id: string } | { success: false; error: string }> {
    console.log(`[Collector] 💾 store_signal: "${input.entity_name}" (${input.signal_type})`);

    // Build evidence array
    const evidence: SignalEvidence[] = input.evidence.map(e => ({
        source: e.source,
        headline: e.headline,
        url: e.url,
        confidence: input.preliminary_score / 10,
    }));

    // Add trends as evidence if present
    if (input.trends_data) {
        evidence.push({
            source: 'Google Trends',
            headline: `Search interest: ${input.trends_data.interest}%, Trend: ${input.trends_data.direction}`,
            confidence: input.trends_data.interest > 50 ? 0.8 : 0.5,
        });
    }

    // Add Reddit as evidence if present
    if (input.reddit_sentiment) {
        evidence.push({
            source: 'Reddit',
            headline: `${input.reddit_sentiment.mentions} mentions (${input.reddit_sentiment.positive} positive, ${input.reddit_sentiment.negative} negative)`,
            confidence: input.reddit_sentiment.mentions > 5 ? 0.7 : 0.4,
        });
    }

    const signalData: RawSignalData = {
        entity_name: input.entity_name,
        entity_type: 'bookmaker',
        geo,
        signal_type: input.signal_type,
        evidence,
        preliminary_score: Math.min(10, Math.max(0, input.preliminary_score)),
        source_urls: input.evidence.filter(e => e.url).map(e => e.url!),
    };

    if (!isValidSignal(signalData)) {
        console.log(`[Collector]    → Invalid signal data`);
        return { success: false, error: 'Invalid signal data' };
    }

    try {
        const signal = await createSignal({
            ...signalData,
            agent_run_id: agentRunId,
        });
        console.log(`[Collector]    → Stored signal: ${signal.id}`);
        return { success: true, signal_id: signal.id };
    } catch (err) {
        console.error('[Collector] Failed to store signal:', err);
        return { success: false, error: String(err) };
    }
}

// ============================================================
// Main Collector Function
// ============================================================

export async function runCollector(
    input: CollectorInput
): Promise<AgentResult<CollectorOutput>> {
    const { geo, daysBack = 7 } = input;

    console.log(`[Collector] 🚀 Starting collection for ${geo.toUpperCase()}`);

    // Start agent run for tracking
    let agentRun;
    try {
        agentRun = await startAgentRun('collector', { geo, daysBack });
    } catch (err) {
        console.error('[Collector] Failed to start agent run:', err);
        return { success: false, error: 'Failed to start agent run' };
    }

    const systemPrompt = buildCollectorPromptV2(geo);
    const signalsStored: string[] = [];
    const entitiesDiscovered: string[] = [];
    const searchQueries: string[] = [];

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
        {
            role: 'user',
            content: `Start collecting signals for ${geo.toUpperCase()} market. Use the industry news tool first to find recent developments, then validate with trends and reddit.`,
        },
    ];

    let iterations = 0;
    const MAX_ITERATIONS = 15;
    const totalUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

    try {
        while (iterations < MAX_ITERATIONS) {
            iterations++;

            const response = await runAgent({
                systemPrompt,
                messages,
                tools: COLLECTOR_TOOLS,
                maxTokens: 4096,
            });

            if (response.error) {
                console.error('[Collector] Agent error:', response.error);
                break;
            }

            if (response.usage) {
                totalUsage.inputTokens += response.usage.input_tokens;
                totalUsage.outputTokens += response.usage.output_tokens;
                totalUsage.totalTokens += response.usage.input_tokens + response.usage.output_tokens;
            }

            const toolUses = (response.content || []).filter(
                (block: { type: string }) => block.type === 'tool_use'
            );

            if (toolUses.length === 0) {
                console.log(`[Collector] ✅ Agent completed with ${signalsStored.length} signals`);
                break;
            }

            const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = [];

            for (const toolUse of toolUses) {
                const { id, name, input: toolInput } = toolUse as {
                    id: string;
                    name: string;
                    input: Record<string, unknown>
                };

                let result: unknown;

                if (name === 'search_industry_news') {
                    const newsInput = toolInput as { keywords: string[]; region?: string };
                    searchQueries.push(`industry: ${newsInput.keywords.join(', ')}`);
                    result = await handleIndustryNews(newsInput);

                } else if (name === 'search_reddit') {
                    const redditInput = toolInput as { bookmaker_name: string; region?: string };
                    result = await handleRedditSearch(redditInput);

                } else if (name === 'check_trends') {
                    const trendsInput = toolInput as { keyword: string; geo?: string };
                    result = await handleTrendsCheck(trendsInput, geo);

                } else if (name === 'check_e2_partner') {
                    const checkInput = toolInput as { entity_name: string };
                    result = await handleE2PartnerCheck(checkInput);

                } else if (name === 'store_signal') {
                    const storeInput = toolInput as {
                        entity_name: string;
                        signal_type: string;
                        evidence: Array<{ source: string; headline: string; url?: string }>;
                        trends_data?: { interest: number; direction: string };
                        reddit_sentiment?: { mentions: number; positive: number; negative: number };
                        e2_status?: string;
                        preliminary_score: number;
                        reasoning: string;
                    };
                    result = await handleStoreSignal(storeInput, geo, agentRun.id);

                    if ((result as { success: boolean }).success) {
                        signalsStored.push((result as { signal_id: string }).signal_id);
                        if (!entitiesDiscovered.includes(storeInput.entity_name)) {
                            entitiesDiscovered.push(storeInput.entity_name);
                        }
                    }
                } else {
                    result = { error: `Unknown tool: ${name}` };
                }

                toolResults.push({
                    type: 'tool_result',
                    tool_use_id: id,
                    content: JSON.stringify(result),
                });
            }

            messages.push({
                role: 'assistant',
                content: JSON.stringify(response.content),
            });
            messages.push({
                role: 'user',
                content: JSON.stringify(toolResults),
            });
        }

        await completeAgentRun(agentRun.id, {
            output_summary: {
                signals_found: signalsStored.length,
                entities_discovered: entitiesDiscovered,
                search_queries_used: searchQueries,
                iterations,
            },
            token_usage: totalUsage,
        });

        console.log(`[Collector] 🏁 Completed: ${signalsStored.length} signals stored`);

        return {
            success: true,
            data: {
                signals_found: signalsStored.length,
                signals_stored: signalsStored.length,
                entities_discovered: entitiesDiscovered,
                search_queries_used: searchQueries,
            },
            usage: totalUsage,
        };
    } catch (err) {
        console.error('[Collector] Exception:', err);

        await completeAgentRun(agentRun.id, {
            error: String(err),
        });

        return {
            success: false,
            error: String(err),
        };
    }
}
