/**
 * Lightweight Collector
 * Token-efficient signal collection using local entity extraction
 * 
 * Flow:
 * 1. Fetch RSS articles (no AI)
 * 2. Extract entities locally (no AI) 
 * 3. Check E2 partnership status (no AI)
 * 4. Check Google Trends (no AI)
 * 5. Only call Claude for final scoring (minimal tokens)
 */

import { runAgent, type AgentTool } from '@/lib/ai/client';
import { searchIndustryNews } from '@/lib/tools/rss';
import { extractEntitiesFromArticles } from '@/lib/tools/entity-extraction';
import { checkGoogleTrends } from '@/lib/tools/trends';
import { checkE2Partnership } from '@/lib/tools/e2-graphql';
import { createSignal } from '@/lib/db/signals';
import { startAgentRun, completeAgentRun } from '@/lib/db/agent-runs';
import type { SignalEvidence } from '@/types/database';

// ============================================================
// Types
// ============================================================

interface CollectorInput {
    geo: string;
    daysBack?: number;
}

interface CollectorOutput {
    signals_found: number;
    signals_stored: number;
    entities_discovered: string[];
    sources_checked: string[];
}

interface EnrichedEntity {
    name: string;
    articles: Array<{ title: string; url: string; source: string }>;
    e2Status: {
        tier: string;
        isOpportunity: boolean;
        recommendation: string;
    };
    trends: {
        interest: number;
        trend: string;
    } | null;
}

// ============================================================
// Main Lightweight Collector
// ============================================================

export async function runLightweightCollector(
    input: CollectorInput
): Promise<{ success: boolean; data?: CollectorOutput; error?: string }> {
    const { geo, daysBack = 14 } = input;

    console.log(`[LightCollector] 🚀 Starting for ${geo.toUpperCase()}`);

    // Start tracking
    let agentRun;
    try {
        agentRun = await startAgentRun('collector', { geo, daysBack, mode: 'lightweight' });
    } catch (err) {
        console.error('[LightCollector] Failed to start agent run:', err);
        return { success: false, error: 'Failed to start agent run' };
    }

    try {
        // ========================================
        // Step 1: Fetch industry news (no AI)
        // ========================================
        console.log(`[LightCollector] 📰 Fetching industry news...`);

        const searchQueries = [
            ['brazil', 'betting'],
            ['brazil', 'operator'],
            ['brazil', 'license'],
            ['latam', 'expansion'],
        ];

        const allArticles: Array<{ title: string; description: string; url: string; source: string }> = [];

        for (const keywords of searchQueries) {
            const result = await searchIndustryNews(keywords, {
                region: geo === 'br' ? 'br' : 'latam',
                maxDaysOld: daysBack,
                limit: 10,
            });
            allArticles.push(...result.articles);
        }

        console.log(`[LightCollector]    → Found ${allArticles.length} articles total`);

        // ========================================
        // Step 2: Extract entities locally (no AI)
        // ========================================
        console.log(`[LightCollector] 🔍 Extracting entities locally...`);

        const entityGroups = extractEntitiesFromArticles(allArticles);
        console.log(`[LightCollector]    → Found ${entityGroups.length} potential entities`);

        // Limit to top 10 entities
        const topEntities = entityGroups.slice(0, 10);

        // ========================================
        // Step 3: Enrich with E2 status + Trends (no AI)
        // ========================================
        console.log(`[LightCollector] 📊 Enriching entities with E2 status and trends...`);

        const enrichedEntities: EnrichedEntity[] = [];

        for (const group of topEntities) {
            const entityName = group.entity.name;

            // Check E2 partnership
            const e2Result = await checkE2Partnership(entityName);

            // Check trends
            let trendsData = null;
            try {
                const trendsResult = await checkGoogleTrends(entityName, geo.toUpperCase());
                if (trendsResult.data) {
                    trendsData = {
                        interest: trendsResult.data.averageInterest,
                        trend: trendsResult.data.trend,
                    };
                }
            } catch {
                // Trends API may fail, continue without it
            }

            enrichedEntities.push({
                name: entityName,
                articles: group.articles,
                e2Status: {
                    tier: e2Result.tier,
                    isOpportunity: e2Result.isOpportunity,
                    recommendation: e2Result.tier === 'NEW_PROSPECT'
                        ? 'High priority - new prospect'
                        : e2Result.tier === 'KNOWN_BOOKIE'
                            ? 'Medium priority - known but no deal'
                            : 'Cross-sell opportunity',
                },
                trends: trendsData,
            });

            console.log(`[LightCollector]    → ${entityName}: E2=${e2Result.tier}, Trends=${trendsData?.interest || 'N/A'}`);
        }

        // ========================================
        // Step 4: Score with Claude (minimal tokens!)
        // ========================================
        console.log(`[LightCollector] 🤖 Scoring ${enrichedEntities.length} entities with Claude...`);

        // Only call Claude if we have entities to score
        if (enrichedEntities.length === 0) {
            console.log(`[LightCollector] ⚠️ No entities found to score`);
            await completeAgentRun(agentRun.id, {
                output_summary: { signals_found: 0, entities_discovered: [] },
            });
            return {
                success: true,
                data: {
                    signals_found: 0,
                    signals_stored: 0,
                    entities_discovered: [],
                    sources_checked: ['SBC Americas', 'iGaming Brazil', 'iGaming Business'],
                },
            };
        }

        // Build minimal prompt for Claude (just entity summaries)
        const entitySummary = enrichedEntities.map(e => ({
            name: e.name,
            article_count: e.articles.length,
            sample_headline: e.articles[0]?.title || '',
            e2_status: e.e2Status.tier,
            trends_interest: e.trends?.interest || 0,
            trends_direction: e.trends?.trend || 'unknown',
        }));

        const scoringPrompt = `Score these ${geo.toUpperCase()} betting market entities for E2 partnership potential.

ENTITIES:
${JSON.stringify(entitySummary, null, 2)}

For each entity, respond with JSON array:
[{"name": "...", "score": 0-10, "signal_type": "MARKET_ENTRY|EXPANSION|LICENSING|SPONSORSHIP|TREND_SURGE", "reasoning": "1-2 sentence explanation"}]

SCORING:
- 8-10: Rising trends + multiple sources + not E2 partner
- 5-7: Some evidence, single source
- 0-4: Weak evidence or already partnered

Only include entities scoring 5+. Be concise.`;

        const response = await runAgent({
            systemPrompt: 'You are a market analyst. Score entities concisely. Respond only with JSON array.',
            messages: [{ role: 'user', content: scoringPrompt }],
            tools: [],
            maxTokens: 1024, // Much smaller!
        });

        if (response.error) {
            console.error('[LightCollector] Claude error:', response.error);
            await completeAgentRun(agentRun.id, { error: response.error });
            return { success: false, error: response.error };
        }

        // Parse Claude's response
        const textBlock = (response.content || []).find(
            (b: { type: string }) => b.type === 'text'
        ) as { type: 'text'; text: string } | undefined;

        let scoredEntities: Array<{
            name: string;
            score: number;
            signal_type: string;
            reasoning: string;
        }> = [];

        if (textBlock?.text) {
            try {
                // Extract JSON from response
                const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    scoredEntities = JSON.parse(jsonMatch[0]);
                }
            } catch (e) {
                console.warn('[LightCollector] Failed to parse Claude response:', e);
            }
        }

        console.log(`[LightCollector]    → Claude scored ${scoredEntities.length} entities`);

        // ========================================
        // Step 5: Store signals
        // ========================================
        const signalsStored: string[] = [];
        const entitiesDiscovered: string[] = [];

        for (const scored of scoredEntities) {
            if (scored.score < 5) continue; // Skip low scores

            const enriched = enrichedEntities.find(
                e => e.name.toLowerCase() === scored.name.toLowerCase()
            );

            if (!enriched) continue;

            // Build evidence
            const evidence: SignalEvidence[] = enriched.articles.slice(0, 3).map(a => ({
                source: a.source,
                headline: a.title,
                url: a.url,
                confidence: scored.score / 10,
            }));

            if (enriched.trends) {
                evidence.push({
                    source: 'Google Trends',
                    headline: `Interest: ${enriched.trends.interest}%, Trend: ${enriched.trends.trend}`,
                    confidence: enriched.trends.interest > 50 ? 0.8 : 0.5,
                });
            }

            try {
                const signal = await createSignal({
                    entity_name: scored.name,
                    entity_type: 'bookmaker',
                    geo,
                    signal_type: scored.signal_type,
                    evidence,
                    preliminary_score: scored.score,
                    source_urls: enriched.articles.map(a => a.url),
                    agent_run_id: agentRun.id,
                });

                signalsStored.push(signal.id);
                entitiesDiscovered.push(scored.name);
                console.log(`[LightCollector] 💾 Stored: ${scored.name} (score: ${scored.score})`);
            } catch (err) {
                console.error(`[LightCollector] Failed to store ${scored.name}:`, err);
            }
        }

        // Complete run
        await completeAgentRun(agentRun.id, {
            output_summary: {
                signals_found: signalsStored.length,
                entities_discovered: entitiesDiscovered,
            },
            token_usage: response.usage ? {
                inputTokens: response.usage.input_tokens,
                outputTokens: response.usage.output_tokens,
                totalTokens: response.usage.input_tokens + response.usage.output_tokens,
            } : undefined,
        });

        console.log(`[LightCollector] 🏁 Complete: ${signalsStored.length} signals stored`);

        return {
            success: true,
            data: {
                signals_found: signalsStored.length,
                signals_stored: signalsStored.length,
                entities_discovered: entitiesDiscovered,
                sources_checked: ['SBC Americas', 'iGaming Brazil', 'iGaming Business'],
            },
        };

    } catch (err) {
        console.error('[LightCollector] Exception:', err);
        await completeAgentRun(agentRun.id, { error: String(err) });
        return { success: false, error: String(err) };
    }
}
