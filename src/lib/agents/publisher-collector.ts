/**
 * Publisher Collector Agent
 * Discovers Brazilian sports publishers without betting integrations
 * 
 * Flow:
 * 1. DISCOVER: Use Serper to find Brazilian sports publishers
 * 2. CRAWL: Use Firecrawl to analyze publisher sites
 * 3. SCORE: Detect betting integrations, score opportunities
 * 4. STORE: Save high-opportunity publishers as signals
 */

import { runAgent, type AgentTool } from '@/lib/ai/client';
import { searchGoogle, discoverBrazilianPublishers, checkSearchPresence } from '@/lib/tools/serper';
import { analyzePublisherForBetting, type PublisherAnalysis } from '@/lib/tools/firecrawl';
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
// Tool Definitions
// ============================================================

const PUBLISHER_COLLECTOR_TOOLS: AgentTool[] = [
    {
        name: 'discover_publishers',
        description: `Discover Brazilian sports publishers via Google Search.
Returns a list of sports news sites found for various search queries.
Use this as your first step to build a list of target publishers.`,
        input_schema: {
            type: 'object',
            properties: {
                limit: {
                    type: 'number',
                    description: 'Maximum number of publishers to discover (default: 30)',
                },
            },
            required: [],
        },
    },
    {
        name: 'search_specific_publishers',
        description: `Search for specific publishers by name or niche.
Use this to find publishers in specific sports like futebol, UFC, etc.`,
        input_schema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search query (e.g., "portal futebol amador brasil")',
                },
            },
            required: ['query'],
        },
    },
    {
        name: 'analyze_publisher',
        description: `Crawl and analyze a publisher site for betting integrations.
- Scrapes the site content via Firecrawl
- Uses AI to detect odds widgets, affiliate links, betting iframes
- Returns: hasBetting, confidence, recommendation

Publishers WITHOUT betting = HIGH opportunity for E2.`,
        input_schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    description: 'Publisher URL to analyze (e.g., "https://lance.com.br")',
                },
            },
            required: ['url'],
        },
    },
    {
        name: 'check_publisher_traffic',
        description: `Check a publisher's search presence/buzz.
Returns presence score (0-10) based on Google result count and autocomplete.
Higher score = more traffic potential.`,
        input_schema: {
            type: 'object',
            properties: {
                publisher_name: {
                    type: 'string',
                    description: 'Publisher name or domain',
                },
            },
            required: ['publisher_name'],
        },
    },
    {
        name: 'store_publisher_signal',
        description: `Store a publisher opportunity signal.
Only store publishers that are:
1. Sports-focused (futebol, esportes, etc.)
2. WITHOUT betting integrations (or minimal)
3. Have decent traffic potential

Quality signals need reasoning explaining the opportunity.`,
        input_schema: {
            type: 'object',
            properties: {
                publisher_name: {
                    type: 'string',
                    description: 'Publisher name/domain',
                },
                publisher_url: {
                    type: 'string',
                    description: 'Publisher website URL',
                },
                sports_focus: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Sports categories covered (futebol, UFC, etc.)',
                },
                traffic_score: {
                    type: 'number',
                    description: 'Traffic/presence score 0-10',
                },
                betting_detection: {
                    type: 'object',
                    properties: {
                        has_betting: { type: 'boolean' },
                        confidence: { type: 'number' },
                    },
                    description: 'Result from analyze_publisher',
                },
                preliminary_score: {
                    type: 'number',
                    description: 'Score 0-10: high traffic + no betting = high score',
                },
                reasoning: {
                    type: 'string',
                    description: 'REQUIRED: Why this is a good opportunity for E2',
                },
            },
            required: ['publisher_name', 'publisher_url', 'sports_focus', 'preliminary_score', 'reasoning'],
        },
    },
];

// ============================================================
// System Prompt
// ============================================================

function buildPublisherCollectorPrompt(): string {
    return `You are the Publisher Collector Agent for E2's Market Intelligence system.

## Your Mission
Find Brazilian sports publishers WITHOUT betting integrations - these are prime opportunities for E2.

## Target Publishers
- Medium/small sports news sites (Super Esportes, No Ataque, etc.)
- Regional football portals
- Sports blogs with traffic
- Fan sites for Brazilian teams

## WORKFLOW

### Step 1: Discover Publishers
Use discover_publishers to get a list of Brazilian sports sites.
Also use search_specific_publishers for niche queries like:
- "portal futebol mineiro"
- "notícias flamengo"
- "brasileirão série b cobertura"

### Step 2: Analyze Each Publisher
For promising sites, use analyze_publisher to:
- Crawl their homepage
- Detect betting widgets/odds
- Check for affiliate links

### Step 3: Check Traffic
Use check_publisher_traffic to estimate audience size.
Higher traffic = better opportunity.

### Step 4: Store Opportunities
Store signals for publishers that meet criteria:
- ✅ Sports-focused content
- ✅ NO betting integrations (or minimal)
- ✅ Decent traffic (score 4+)

## SCORING GUIDELINES
- 8-10: No betting + high traffic + football focus
- 6-7: No betting + medium traffic
- 4-5: Minimal betting + good traffic
- 0-3: Has betting or low traffic (skip)

## CRITICAL RULES
1. Focus on MEDIUM/SMALL publishers (not Lance or UOL)
2. NO betting detected = HIGH opportunity
3. Always explain WHY in your reasoning
4. Quality over quantity - 5 solid leads > 20 weak ones

Start by discovering publishers, then analyze the most promising ones.`;
}

// ============================================================
// Tool Handlers
// ============================================================

async function handleDiscoverPublishers(
    input: { limit?: number }
): Promise<unknown> {
    console.log(`[Publisher Collector] 🔍 Discovering publishers...`);
    const publishers = await discoverBrazilianPublishers({ limit: input.limit || 30 });
    console.log(`[Publisher Collector]    → Found ${publishers.length} publishers`);
    return {
        publishers: publishers.map(p => ({
            domain: p.domain,
            title: p.title,
            url: p.url,
            snippet: p.snippet.slice(0, 150),
        })),
        count: publishers.length,
    };
}

async function handleSearchSpecificPublishers(
    input: { query: string }
): Promise<unknown> {
    console.log(`[Publisher Collector] 🔎 Searching: "${input.query}"`);
    const { results } = await searchGoogle(input.query, { num: 15 });
    return {
        results: results.map(r => ({
            domain: r.domain,
            title: r.title,
            url: r.link,
            snippet: r.snippet.slice(0, 150),
        })),
        count: results.length,
    };
}

async function handleAnalyzePublisher(
    input: { url: string }
): Promise<unknown> {
    console.log(`[Publisher Collector] 🕷️ Analyzing: ${input.url}`);
    const analysis = await analyzePublisherForBetting(input.url);

    if (!analysis) {
        return { error: 'Failed to analyze publisher' };
    }

    console.log(`[Publisher Collector]    → Betting: ${analysis.bettingDetection.hasBetting}, Recommendation: ${analysis.bettingDetection.recommendation}`);

    return {
        domain: analysis.domain,
        title: analysis.title,
        sports_categories: analysis.sportsCategories,
        betting_detected: analysis.bettingDetection.hasBetting,
        betting_confidence: analysis.bettingDetection.confidence,
        betting_indicators: analysis.bettingDetection.indicators.slice(0, 3),
        recommendation: analysis.bettingDetection.recommendation,
    };
}

async function handleCheckTraffic(
    input: { publisher_name: string }
): Promise<unknown> {
    console.log(`[Publisher Collector] 📊 Checking traffic: ${input.publisher_name}`);
    const presence = await checkSearchPresence(input.publisher_name);
    return {
        total_results: presence.totalResults,
        presence_score: presence.presenceScore,
        has_trend: presence.hasTrend,
        top_mentions: presence.topMentions.slice(0, 3),
    };
}

async function handleStorePublisherSignal(
    input: {
        publisher_name: string;
        publisher_url: string;
        sports_focus: string[];
        traffic_score?: number;
        betting_detection?: { has_betting: boolean; confidence: number };
        preliminary_score: number;
        reasoning: string;
    },
    agentRunId: string
): Promise<{ success: true; signal_id: string } | { success: false; error: string }> {
    console.log(`[Publisher Collector] 💾 Storing signal: ${input.publisher_name}`);

    const evidence: SignalEvidence[] = [
        {
            source: 'Publisher Analysis',
            headline: `Sports focus: ${input.sports_focus.join(', ')}`,
            url: input.publisher_url,
            confidence: input.preliminary_score / 10,
        },
    ];

    if (input.betting_detection) {
        evidence.push({
            source: 'Betting Detection',
            headline: input.betting_detection.has_betting
                ? `Betting widgets detected (${(input.betting_detection.confidence * 100).toFixed(0)}% confidence)`
                : `No betting integrations found (${(input.betting_detection.confidence * 100).toFixed(0)}% confidence)`,
            confidence: input.betting_detection.confidence,
        });
    }

    if (input.traffic_score !== undefined) {
        evidence.push({
            source: 'Traffic Analysis',
            headline: `Search presence score: ${input.traffic_score}/10`,
            confidence: input.traffic_score / 10,
        });
    }

    const signalData: RawSignalData = {
        entity_name: input.publisher_name,
        entity_type: 'publisher',
        geo: 'br',
        signal_type: 'PUBLISHER_OPPORTUNITY',
        evidence,
        preliminary_score: Math.min(10, Math.max(0, input.preliminary_score)),
        source_urls: [input.publisher_url],
    };

    if (!isValidSignal(signalData)) {
        console.log(`[Publisher Collector]    → Invalid signal data`);
        return { success: false, error: 'Invalid signal data' };
    }

    try {
        const signal = await createSignal({
            ...signalData,
            agent_run_id: agentRunId,
        });
        console.log(`[Publisher Collector]    → Stored signal: ${signal.id}`);
        return { success: true, signal_id: signal.id };
    } catch (err) {
        console.error('[Publisher Collector] Failed to store signal:', err);
        return { success: false, error: String(err) };
    }
}

// ============================================================
// Main Publisher Collector Function
// ============================================================

export async function runPublisherCollector(
    input: CollectorInput
): Promise<AgentResult<CollectorOutput>> {
    console.log(`[Publisher Collector] 🚀 Starting publisher discovery for Brazil`);

    let agentRun;
    try {
        agentRun = await startAgentRun('collector', { type: 'publisher', geo: 'br' });
    } catch (err) {
        console.error('[Publisher Collector] Failed to start agent run:', err);
        return { success: false, error: 'Failed to start agent run' };
    }

    const systemPrompt = buildPublisherCollectorPrompt();
    const signalsStored: string[] = [];
    const publishersDiscovered: string[] = [];

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
        {
            role: 'user',
            content: 'Start discovering Brazilian sports publishers. Focus on medium/small sites that could benefit from E2 ad network integration. Analyze at least 5-10 publishers and store the best opportunities.',
        },
    ];

    let iterations = 0;
    const MAX_ITERATIONS = 20;
    const totalUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

    try {
        while (iterations < MAX_ITERATIONS) {
            iterations++;

            const response = await runAgent({
                systemPrompt,
                messages,
                tools: PUBLISHER_COLLECTOR_TOOLS,
                maxTokens: 4096,
            });

            if (response.error) {
                console.error('[Publisher Collector] Agent error:', response.error);
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
                console.log(`[Publisher Collector] ✅ Agent completed with ${signalsStored.length} signals`);
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

                if (name === 'discover_publishers') {
                    result = await handleDiscoverPublishers(toolInput as { limit?: number });
                    const discovered = (result as { publishers: Array<{ domain: string }> }).publishers;
                    publishersDiscovered.push(...discovered.map(p => p.domain));

                } else if (name === 'search_specific_publishers') {
                    result = await handleSearchSpecificPublishers(toolInput as { query: string });

                } else if (name === 'analyze_publisher') {
                    result = await handleAnalyzePublisher(toolInput as { url: string });

                } else if (name === 'check_publisher_traffic') {
                    result = await handleCheckTraffic(toolInput as { publisher_name: string });

                } else if (name === 'store_publisher_signal') {
                    const storeInput = toolInput as {
                        publisher_name: string;
                        publisher_url: string;
                        sports_focus: string[];
                        traffic_score?: number;
                        betting_detection?: { has_betting: boolean; confidence: number };
                        preliminary_score: number;
                        reasoning: string;
                    };
                    result = await handleStorePublisherSignal(storeInput, agentRun.id);

                    if ((result as { success: boolean }).success) {
                        signalsStored.push((result as { signal_id: string }).signal_id);
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
                publishers_discovered: publishersDiscovered.length,
                iterations,
            },
            token_usage: totalUsage,
        });

        console.log(`[Publisher Collector] 🏁 Completed: ${signalsStored.length} publisher signals stored`);

        return {
            success: true,
            data: {
                signals_found: signalsStored.length,
                signals_stored: signalsStored.length,
                entities_discovered: publishersDiscovered,
                search_queries_used: [],
            },
            usage: totalUsage,
        };
    } catch (err) {
        console.error('[Publisher Collector] Exception:', err);

        await completeAgentRun(agentRun.id, {
            error: String(err),
        });

        return {
            success: false,
            error: String(err),
        };
    }
}
