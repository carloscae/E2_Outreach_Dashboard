/**
 * Analyzer Agent
 * Scores signals using a 0-14 point framework and assigns priority levels
 */

import { runAgent, type AgentTool } from '@/lib/ai/client';
import { getSignalById } from '@/lib/db/signals';
import { createAnalyzedSignal, getAnalyzedSignalBySignalId } from '@/lib/db/analyzed-signals';
import { startAgentRun, completeAgentRun } from '@/lib/db/agent-runs';
import type { Signal, ScoreBreakdown, RiskFlags, Priority, AnalyzedSignalInsert } from '@/types/database';

// ============================================================
// Scoring Constants
// ============================================================

export const PRIORITY_THRESHOLDS = {
    HIGH: 10,   // >= 10 points
    MEDIUM: 7,  // 7-9 points
    LOW: 0,     // < 7 points
} as const;

export function calculatePriority(score: number): Priority {
    if (score >= PRIORITY_THRESHOLDS.HIGH) return 'HIGH';
    if (score >= PRIORITY_THRESHOLDS.MEDIUM) return 'MEDIUM';
    return 'LOW';
}

// ============================================================
// System Prompt
// ============================================================

const ANALYZER_SYSTEM_PROMPT = `You are the Analyzer Agent for E2's Market Intelligence system.

## Your Mission
Score and prioritize signals to help Sales/BD focus on the BEST opportunities.

## Scoring Framework (0-14 total points)

### 1. Market Entry Momentum (0-4 points)
Evidence of active market expansion:
- 4: Multiple strong signals (new office + major sponsorship + app launch)
- 3: Clear expansion (licensing approval, major partnership)
- 2: Moderate activity (job postings, minor news, single event)
- 1: Weak signals (rumors, speculation, no concrete evidence)
- 0: No evidence of expansion

### 2. E2 Partnership Fit (0-4 points)
Alignment with E2's target profile:
- 4: Perfect fit (Brazil/target geo, sports betting focus, NOT existing partner)
- 3: Strong fit (right geo, relevant verticals)
- 2: Moderate fit (adjacent market or partial overlap)
- 1: Weak fit (different focus, limited opportunity)
- 0: Poor fit OR already E2 partner

### 3. Actionability (0-3 points)
How easy to pursue this opportunity:
- 3: Clear contact path (found LinkedIn, email, or decision maker)
- 2: Some contact info available (company website, general contact)
- 1: Would require significant research to find contact
- 0: No clear path to action

### 4. Data Confidence (0-3 points)
Quality of intelligence:
- 3: Multiple credible sources, data < 7 days old
- 2: Single credible source, data < 7 days old  
- 1: Single source OR data 7-30 days old
- 0: Unreliable source OR data > 30 days old

## CRITICAL: Score Calibration
- Most signals should score between 4-10
- Scores of 12+ should be RARE (< 10% of signals)
- Scores of 11-14 require EXCEPTIONAL evidence
- Be SKEPTICAL - default to lower scores when uncertain
- A single news article is NOT enough for high momentum scores

## Risk Flags (identify ALL that apply)
- **regulatory**: Grey market operations, license issues, regulatory investigations
- **reputational**: Negative press, fraud allegations, player complaints
- **financial**: Solvency concerns, unpaid debts, investor issues

## Recommended Actions (REQUIRED: Provide 1-3 specific actions)
Examples by priority:
- HIGH: "Schedule intro call this week via LinkedIn", "Send partnership deck to [name]"
- MEDIUM: "Add to monitoring list", "Research decision maker contacts"
- LOW: "Track for future opportunities", "Monitor for expansion news"

## Per-Criterion Reasoning (REQUIRED)
For EACH score component, explain WHY you gave that score:
- momentum_reasoning: "Scored 3 because Flamengo sponsorship is significant but only one source"
- fit_reasoning: "Scored 4 because Brazil focus + sports betting + not in E2 system"
- actionability_reasoning: "Scored 2 because website exists but no direct contact found"
- confidence_reasoning: "Scored 2 because single article from SBC News, published 3 days ago"

Be objective. Under-scoring is better than over-scoring.`;


// ============================================================
// Tool Definitions
// ============================================================

const ANALYZER_TOOLS: AgentTool[] = [
    {
        name: 'score_signal',
        description: 'Submit your analysis and score for a signal',
        input_schema: {
            type: 'object',
            properties: {
                signal_id: {
                    type: 'string',
                    description: 'The ID of the signal being analyzed',
                },
                market_entry_momentum: {
                    type: 'number',
                    description: 'Score 0-4 for market expansion activity',
                },
                e2_partnership_fit: {
                    type: 'number',
                    description: 'Score 0-4 for alignment with E2 target profile',
                },
                actionability: {
                    type: 'number',
                    description: 'Score 0-3 for ease of taking action',
                },
                data_confidence: {
                    type: 'number',
                    description: 'Score 0-3 for data quality and reliability',
                },
                risk_regulatory: {
                    type: 'boolean',
                    description: 'Flag for regulatory/compliance risks',
                },
                risk_reputational: {
                    type: 'boolean',
                    description: 'Flag for reputational risks',
                },
                risk_financial: {
                    type: 'boolean',
                    description: 'Flag for financial/solvency risks',
                },
                risk_notes: {
                    type: 'string',
                    description: 'Additional notes on risks (optional)',
                },
                recommended_actions: {
                    type: 'array',
                    description: 'List of 1-3 SPECIFIC recommended actions (e.g., "Research CEO contact on LinkedIn")',
                },
                reasoning: {
                    type: 'string',
                    description: 'Overall assessment summary',
                },
                momentum_reasoning: {
                    type: 'string',
                    description: 'Why this momentum score? Cite specific evidence.',
                },
                fit_reasoning: {
                    type: 'string',
                    description: 'Why this fit score? Explain geo/vertical alignment.',
                },
                actionability_reasoning: {
                    type: 'string',
                    description: 'Why this actionability score? What contact info exists?',
                },
                confidence_reasoning: {
                    type: 'string',
                    description: 'Why this confidence score? How many sources, how recent?',
                },
            },
            required: [
                'signal_id',
                'market_entry_momentum',
                'e2_partnership_fit',
                'actionability',
                'data_confidence',
                'recommended_actions',
                'reasoning',
                'momentum_reasoning',
                'fit_reasoning',
                'actionability_reasoning',
                'confidence_reasoning',
            ],
        },
    },
];

// ============================================================
// Types
// ============================================================

interface AnalyzerInput {
    signalIds: string[];
}

interface AnalyzerOutput {
    signals_analyzed: number;
    by_priority: { HIGH: number; MEDIUM: number; LOW: number };
    avg_score: number;
}

interface AgentResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
}

// ============================================================
// Tool Handler
// ============================================================

async function handleScoreSignal(input: {
    signal_id: string;
    market_entry_momentum: number;
    e2_partnership_fit: number;
    actionability: number;
    data_confidence: number;
    risk_regulatory?: boolean;
    risk_reputational?: boolean;
    risk_financial?: boolean;
    risk_notes?: string;
    recommended_actions?: string[];
    reasoning: string;
    momentum_reasoning?: string;
    fit_reasoning?: string;
    actionability_reasoning?: string;
    confidence_reasoning?: string;
}): Promise<{ success: boolean; analyzed_signal_id?: string; error?: string }> {
    // Validate scores
    const momentum = Math.min(4, Math.max(0, input.market_entry_momentum));
    const fit = Math.min(4, Math.max(0, input.e2_partnership_fit));
    const action = Math.min(3, Math.max(0, input.actionability));
    const confidence = Math.min(3, Math.max(0, input.data_confidence));

    const totalScore = momentum + fit + action + confidence;
    const priority = calculatePriority(totalScore);

    const scoreBreakdown: ScoreBreakdown = {
        marketEntryMomentum: momentum,
        e2PartnershipFit: fit,
        actionability: action,
        dataConfidence: confidence,
    };

    const riskFlags: RiskFlags = {
        regulatory: input.risk_regulatory,
        reputational: input.risk_reputational,
        financial: input.risk_financial,
        notes: input.risk_notes ? [input.risk_notes] : undefined,
    };

    // Check if already analyzed
    const existing = await getAnalyzedSignalBySignalId(input.signal_id);
    if (existing) {
        return { success: false, error: 'Signal already analyzed' };
    }

    const analyzedSignalData: AnalyzedSignalInsert = {
        signal_id: input.signal_id,
        final_score: totalScore,
        score_breakdown: scoreBreakdown,
        priority,
        risk_flags: riskFlags,
        recommended_actions: input.recommended_actions || [],
        ai_reasoning: input.reasoning,
    };

    try {
        const result = await createAnalyzedSignal(analyzedSignalData);
        return { success: true, analyzed_signal_id: result.id };
    } catch (err) {
        console.error('[Analyzer] Failed to store analysis:', err);
        return { success: false, error: String(err) };
    }
}

// ============================================================
// Main Analyzer Function
// ============================================================

export async function runAnalyzer(
    input: AnalyzerInput
): Promise<AgentResult<AnalyzerOutput>> {
    const { signalIds } = input;

    if (signalIds.length === 0) {
        return { success: true, data: { signals_analyzed: 0, by_priority: { HIGH: 0, MEDIUM: 0, LOW: 0 }, avg_score: 0 } };
    }

    // Start agent run
    let agentRun;
    try {
        agentRun = await startAgentRun('analyzer', { signal_count: signalIds.length });
    } catch (err) {
        console.error('[Analyzer] Failed to start agent run:', err);
        return { success: false, error: 'Failed to start agent run' };
    }

    // Fetch signal details
    const signals: Signal[] = [];
    for (const id of signalIds) {
        const signal = await getSignalById(id);
        if (signal) {
            // Check if already analyzed
            const existing = await getAnalyzedSignalBySignalId(id);
            if (!existing) {
                signals.push(signal);
            }
        }
    }

    if (signals.length === 0) {
        await completeAgentRun(agentRun.id, {
            output_summary: { message: 'No unanalyzed signals to process' },
        });
        return { success: true, data: { signals_analyzed: 0, by_priority: { HIGH: 0, MEDIUM: 0, LOW: 0 }, avg_score: 0 } };
    }

    // Build signal descriptions for the agent
    const signalDescriptions = signals.map((s, i) => {
        const evidence = Array.isArray(s.evidence) ? s.evidence : [];
        return `
### Signal ${i + 1}: ${s.entity_name}
- **ID:** ${s.id}
- **Type:** ${s.entity_type}
- **Geo:** ${s.geo}
- **Signal Type:** ${s.signal_type}
- **Preliminary Score:** ${s.preliminary_score}/10
- **Evidence:**
${evidence.map(e => `  - ${e.headline || e.description || 'No description'} (${e.source})`).join('\n')}
`;
    }).join('\n---\n');

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
        {
            role: 'user',
            content: `Analyze and score the following ${signals.length} signal(s). Use the score_signal tool to submit your analysis for each one.

${signalDescriptions}

Remember: Score each signal using the 0-14 framework and provide clear reasoning.`,
        },
    ];

    const totalUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    const results: { priority: Priority; score: number }[] = [];
    let iterations = 0;
    const MAX_ITERATIONS = 10;

    try {
        while (iterations < MAX_ITERATIONS) {
            iterations++;
            console.log(`[Analyzer] === Iteration ${iterations}/${MAX_ITERATIONS} ===`);
            console.log(`[Analyzer] Signals analyzed so far: ${results.length}/${signals.length}`);

            const response = await runAgent({
                systemPrompt: ANALYZER_SYSTEM_PROMPT,
                messages,
                tools: ANALYZER_TOOLS,
                maxTokens: 4096,
            });

            if (response.error) {
                console.error('[Analyzer] Agent error:', response.error);
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
                break;
            }

            const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = [];

            for (const toolUse of toolUses) {
                const { id, name, input: toolInput } = toolUse as {
                    id: string;
                    name: string;
                    input: Record<string, unknown>;
                };

                if (name === 'score_signal') {
                    const scoreInput = toolInput as Parameters<typeof handleScoreSignal>[0];
                    const score = (scoreInput.market_entry_momentum as number) +
                        (scoreInput.e2_partnership_fit as number) +
                        (scoreInput.actionability as number) +
                        (scoreInput.data_confidence as number);
                    const priority = calculatePriority(score);
                    console.log(`[Analyzer] 📊 score_signal: ${scoreInput.signal_id}`);
                    console.log(`[Analyzer]    Score: ${score}/14 (${priority})`);
                    console.log(`[Analyzer]    Breakdown: M=${scoreInput.market_entry_momentum} F=${scoreInput.e2_partnership_fit} A=${scoreInput.actionability} C=${scoreInput.data_confidence}`);
                    if (scoreInput.momentum_reasoning) {
                        console.log(`[Analyzer]    Momentum: ${String(scoreInput.momentum_reasoning).substring(0, 80)}...`);
                    }

                    const result = await handleScoreSignal(scoreInput);
                    if (result.success) {
                        results.push({ priority, score });
                    }

                    toolResults.push({
                        type: 'tool_result',
                        tool_use_id: id,
                        content: JSON.stringify(result),
                    });
                }
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

        // Calculate stats
        const by_priority = { HIGH: 0, MEDIUM: 0, LOW: 0 };
        let totalScore = 0;
        for (const r of results) {
            by_priority[r.priority]++;
            totalScore += r.score;
        }

        const output: AnalyzerOutput = {
            signals_analyzed: results.length,
            by_priority,
            avg_score: results.length > 0 ? totalScore / results.length : 0,
        };

        await completeAgentRun(agentRun.id, {
            output_summary: { ...output },
            token_usage: totalUsage,
        });

        return {
            success: true,
            data: output,
            usage: totalUsage,
        };
    } catch (err) {
        console.error('[Analyzer] Exception:', err);
        await completeAgentRun(agentRun.id, { error: String(err) });
        return { success: false, error: String(err) };
    }
}

/**
 * Analyze all unanalyzed signals in the database
 */
export async function analyzeUnanalyzedSignals(): Promise<AgentResult<AnalyzerOutput>> {
    const { supabase } = await import('@/lib/db/client');

    // Get signals that don't have analyzed_signals entries
    const { data: unanalyzed, error } = await supabase
        .from('signals')
        .select('id')
        .order('collected_at', { ascending: false })
        .limit(50);

    if (error) {
        return { success: false, error: String(error) };
    }

    const signalIds = (unanalyzed || []).map(s => s.id);

    // Filter out already analyzed
    const toAnalyze: string[] = [];
    for (const id of signalIds) {
        const existing = await getAnalyzedSignalBySignalId(id);
        if (!existing) {
            toAnalyze.push(id);
        }
    }

    return runAnalyzer({ signalIds: toAnalyze });
}
