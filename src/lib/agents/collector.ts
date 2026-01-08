/**
 * Collector Agent
 * Discovers new bookmaker/betting opportunities using NewsAPI
 * and stores high-quality signals in the database
 */

import { runAgent, type AgentTool } from '@/lib/ai/client';
import { searchNews, type NewsArticle } from '@/lib/tools/news';
import { checkE2Partnership } from '@/lib/tools/e2-graphql';
import { checkGoogleTrends } from '@/lib/tools/trends';
import { createSignal } from '@/lib/db/signals';
import { startAgentRun, completeAgentRun } from '@/lib/db/agent-runs';
import {
    buildCollectorPrompt,
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

const COLLECTOR_TOOLS: AgentTool[] = [
    {
        name: 'search_news',
        description: 'Search for news articles about betting/gambling companies in the target market',
        input_schema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Search query (e.g., "new bookmaker launch Brazil")',
                },
                days_back: {
                    type: 'number',
                    description: 'How many days back to search (default: 7)',
                },
            },
            required: ['query'],
        },
    },
    {
        name: 'check_e2_partner',
        description: `Check if a bookmaker is an existing E2 partner. Returns partnership tier:
- AFFILIATE_PARTNER: Has active promotions (skip - already partnered)
- KNOWN_BOOKIE: In E2 database but no promotions (potential opportunity)  
- NEW_PROSPECT: Not in E2 system (best opportunity)`,
        input_schema: {
            type: 'object',
            properties: {
                entity_name: {
                    type: 'string',
                    description: 'Name of the bookmaker/operator to check',
                },
            },
            required: ['entity_name'],
        },
    },
    {
        name: 'check_trends',
        description: 'Check Google Trends search interest for a keyword. Returns trend direction (rising/stable/declining) and average interest level.',
        input_schema: {
            type: 'object',
            properties: {
                keyword: {
                    type: 'string',
                    description: 'Keyword to check (e.g., company name, betting term)',
                },
                geo: {
                    type: 'string',
                    description: 'Country code (e.g., "BR" for Brazil). Defaults to target geo.',
                },
            },
            required: ['keyword'],
        },
    },
    {
        name: 'store_signal',
        description: 'Store a discovered signal in the database. Only store if the entity is NOT an existing E2 partner.',
        input_schema: {
            type: 'object',
            properties: {
                entity_name: {
                    type: 'string',
                    description: 'Name of the bookmaker/betting company',
                },
                signal_type: {
                    type: 'string',
                    description: 'Type of signal (e.g., "market_entry", "expansion", "partnership")',
                },
                evidence_headline: {
                    type: 'string',
                    description: 'News headline as evidence',
                },
                evidence_url: {
                    type: 'string',
                    description: 'URL of the source article',
                },
                evidence_description: {
                    type: 'string',
                    description: 'Brief description of the evidence',
                },
                preliminary_score: {
                    type: 'number',
                    description: 'Confidence score 0-10',
                },
                reasoning: {
                    type: 'string',
                    description: 'Why this is a valuable signal',
                },
            },
            required: ['entity_name', 'signal_type', 'evidence_headline', 'evidence_url', 'preliminary_score'],
        },
    },
];

// ============================================================
// Tool Handlers
// ============================================================

async function handleSearchNews(
    input: { query: string; days_back?: number },
    geo: string
): Promise<{ articles: Array<{ title: string; description: string; url: string; source: string; publishedAt: string }> } | { error: string }> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - (input.days_back || 7));

    const result = await searchNews(input.query, {
        language: geo === 'br' ? 'pt' : 'en',
        from: fromDate.toISOString().split('T')[0],
        sortBy: 'relevancy',
        pageSize: 20,
    });

    if (result.error) {
        return { error: result.error };
    }

    // Return simplified article data for the agent
    return {
        articles: (result.data?.articles || []).map((a: NewsArticle) => ({
            title: a.title,
            description: a.description || '',
            url: a.url,
            source: a.source.name,
            publishedAt: a.publishedAt,
        })),
    };
}

async function handleStoreSignal(
    input: {
        entity_name: string;
        signal_type: string;
        evidence_headline: string;
        evidence_url: string;
        evidence_description?: string;
        preliminary_score: number;
        reasoning?: string;
    },
    geo: string,
    agentRunId: string
): Promise<{ success: true; signal_id: string } | { success: false; error: string }> {
    const evidence: SignalEvidence[] = [
        {
            source: 'NewsAPI',
            headline: input.evidence_headline,
            url: input.evidence_url,
            description: input.evidence_description,
            confidence: input.preliminary_score / 10,
        },
    ];

    const signalData: RawSignalData = {
        entity_name: input.entity_name,
        entity_type: 'bookmaker', // POC focuses on bookmakers
        geo,
        signal_type: input.signal_type,
        evidence,
        preliminary_score: Math.min(10, Math.max(0, input.preliminary_score)),
        source_urls: [input.evidence_url],
    };

    if (!isValidSignal(signalData)) {
        return { success: false, error: 'Invalid signal data' };
    }

    try {
        const signal = await createSignal({
            ...signalData,
            agent_run_id: agentRunId,
        });
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

    // Start agent run for tracking
    let agentRun;
    try {
        agentRun = await startAgentRun('collector', { geo, daysBack });
    } catch (err) {
        console.error('[Collector] Failed to start agent run:', err);
        return { success: false, error: 'Failed to start agent run' };
    }

    const systemPrompt = buildCollectorPrompt(geo, daysBack);
    const signalsStored: string[] = [];
    const entitiesDiscovered: string[] = [];
    const searchQueries: string[] = [];

    // Initial message to start the agent
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
        {
            role: 'user',
            content: `Start collecting signals for ${geo.toUpperCase()} market. Look for new bookmakers, betting companies, and gambling operators that might be potential E2 partners. Search the last ${daysBack} days of news.`,
        },
    ];

    let iterations = 0;
    const MAX_ITERATIONS = 10;
    const totalUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

    try {
        while (iterations < MAX_ITERATIONS) {
            iterations++;
            console.log(`[Collector] === Iteration ${iterations}/${MAX_ITERATIONS} ===`);
            console.log(`[Collector] Queries so far: ${searchQueries.length} | Signals stored: ${signalsStored.length}`);

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

            // Track token usage
            if (response.usage) {
                totalUsage.inputTokens += response.usage.input_tokens;
                totalUsage.outputTokens += response.usage.output_tokens;
                totalUsage.totalTokens += response.usage.input_tokens + response.usage.output_tokens;
            }

            // Process response content
            const toolUses = (response.content || []).filter(
                (block: { type: string }) => block.type === 'tool_use'
            );

            if (toolUses.length === 0) {
                // Agent finished (no more tool calls)
                // Enforce minimum 3 queries
                if (searchQueries.length < 3) {
                    console.log(`[Collector] ⚠️ Only ${searchQueries.length} queries. Requesting more searches...`);
                    messages.push({
                        role: 'user',
                        content: `You've only performed ${searchQueries.length} search(es). Please perform at least 3 searches using DIFFERENT signal categories (market_entry, expansion, sponsorship, licensing, growth). Try queries you haven't used yet.`,
                    });
                    continue;
                }
                console.log(`[Collector] ✅ Agent completed with ${searchQueries.length} queries, ${signalsStored.length} signals`);
                break;
            }

            // Handle each tool call
            const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = [];

            for (const toolUse of toolUses) {
                const { id, name, input: toolInput } = toolUse as {
                    id: string;
                    name: string;
                    input: Record<string, unknown>
                };

                let result: unknown;

                if (name === 'search_news') {
                    const searchInput = toolInput as { query: string; days_back?: number };
                    searchQueries.push(searchInput.query);
                    console.log(`[Collector] 🔍 search_news: "${searchInput.query}"`);
                    result = await handleSearchNews(searchInput, geo);
                    const articles = (result as { articles?: unknown[] }).articles;
                    console.log(`[Collector]    → Found ${articles?.length || 0} articles`);

                } else if (name === 'check_e2_partner') {
                    const checkInput = toolInput as { entity_name: string };
                    console.log(`[Collector] 🔎 check_e2_partner: "${checkInput.entity_name}"`);
                    const partnerCheck = await checkE2Partnership(checkInput.entity_name);
                    console.log(`[Collector]    → Tier: ${partnerCheck.tier}, Opportunity: ${partnerCheck.isOpportunity}`);
                    result = {

                        tier: partnerCheck.tier,
                        is_opportunity: partnerCheck.isOpportunity,
                        is_existing_affiliate: partnerCheck.tier === 'AFFILIATE_PARTNER',
                        matched_bookie: partnerCheck.bookieName || null,
                        match_score: partnerCheck.matchScore,
                        promotion_count: partnerCheck.promotionCount,
                        recommendation: partnerCheck.tier === 'AFFILIATE_PARTNER'
                            ? 'CROSS-SELL - Existing affiliate, upsell E2 Ads/Widget Studio/SaaS'
                            : partnerCheck.tier === 'KNOWN_BOOKIE'
                                ? 'PURSUE - Known bookie without active deal'
                                : 'HIGH PRIORITY - New prospect not in E2 system',
                        details: partnerCheck.details,
                    };
                } else if (name === 'check_trends') {
                    const trendsInput = toolInput as { keyword: string; geo?: string };
                    const trendsResult = await checkGoogleTrends(trendsInput.keyword, trendsInput.geo || geo.toUpperCase());
                    if (trendsResult.data) {
                        result = {
                            keyword: trendsResult.data.keyword,
                            average_interest: trendsResult.data.averageInterest,
                            trend: trendsResult.data.trend,
                            related_queries: trendsResult.data.relatedQueries,
                        };
                    } else {
                        result = { error: trendsResult.error || 'Failed to get trends data' };
                    }
                } else if (name === 'store_signal') {
                    const storeInput = toolInput as {
                        entity_name: string;
                        signal_type: string;
                        evidence_headline: string;
                        evidence_url: string;
                        evidence_description?: string;
                        preliminary_score: number;
                        reasoning?: string;
                    };
                    console.log(`[Collector] 💾 store_signal: "${storeInput.entity_name}" (${storeInput.signal_type}, score: ${storeInput.preliminary_score})`);
                    if (storeInput.reasoning) {
                        console.log(`[Collector]    Reasoning: ${storeInput.reasoning.substring(0, 100)}...`);
                    }
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

            // Add assistant response and tool results to conversation
            messages.push({
                role: 'assistant',
                content: JSON.stringify(response.content),
            });
            messages.push({
                role: 'user',
                content: JSON.stringify(toolResults),
            });
        }

        // Complete agent run
        await completeAgentRun(agentRun.id, {
            output_summary: {
                signals_found: signalsStored.length,
                entities_discovered: entitiesDiscovered,
                search_queries_used: searchQueries,
                iterations,
            },
            token_usage: totalUsage,
        });

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

        // Mark agent run as failed
        await completeAgentRun(agentRun.id, {
            error: String(err),
        });

        return {
            success: false,
            error: String(err),
        };
    }
}
