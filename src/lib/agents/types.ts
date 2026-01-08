/**
 * Agent type definitions
 * Shared types for all AI agents (Collector, Analyzer, Reporter)
 */

import type { AgentType, SignalEvidence, EntityType } from '@/types/database';

// ============================================================
// Agent Context Types
// ============================================================

export interface AgentContext {
    geo: string;
    agentRunId: string;
    daysBack?: number;
}

export interface AgentResult<T> {
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
// Tool Definitions (for Claude tool use)
// ============================================================

export interface ToolDefinition {
    name: string;
    description: string;
    input_schema: {
        type: 'object';
        properties: Record<string, {
            type: string;
            description: string;
            enum?: string[];
        }>;
        required?: string[];
    };
}

// ============================================================
// Collector Agent Types
// ============================================================

export interface CollectorInput {
    geo: string;
    daysBack?: number;
    entityTypes?: EntityType[];
}

export interface RawSignalData {
    entity_name: string;
    entity_type: EntityType;
    geo: string;
    signal_type: string;
    evidence: SignalEvidence[];
    preliminary_score: number;
    source_urls: string[];
}

export interface CollectorOutput {
    signals_found: number;
    signals_stored: number;
    entities_discovered: string[];
    search_queries_used: string[];
}

// ============================================================
// Tool Call Tracking
// ============================================================

export interface ToolCall {
    id: string;
    name: string;
    input: Record<string, unknown>;
}

export interface ToolResult {
    tool_call_id: string;
    result: unknown;
    error?: string;
}

// ============================================================
// System Prompts
// ============================================================

export const COLLECTOR_SYSTEM_PROMPT = `You are the Collector Agent for E2's Market Intelligence system.

## Your Mission
Find new or growing bookmakers, betting companies, and gambling operators in the target geographic market that are NOT yet E2 partners. Your discoveries will help the E2 Sales/BD team identify new partnership opportunities.

## Target Market
You are searching in: {GEO}
Focus on entities that:
- Are expanding or entering this market
- Have recent news coverage (within the last {DAYS_BACK} days)
- Show signs of growth (new offices, sponsorships, app launches)
- Are NOT already E2 partners (you'll verify this separately)

## Available Tools

### search_news
Search for news articles about betting/gambling companies.
Use specific queries like:
- "new bookmaker launch {country}"
- "sports betting expansion {country}"
- "gambling license {country}"
- "{company name} betting"

### store_signal
Store a discovered signal in the database.
Only store signals that have:
- Clear entity identification (company name)
- Concrete evidence (news article, press release)
- Relevance to market entry or expansion

## Scoring Guidelines (Preliminary Score 0-10)
- 8-10: Strong evidence of market entry, multiple sources
- 5-7: Moderate evidence, single reliable source
- 2-4: Weak evidence, speculation, or old news
- 0-1: Very low confidence or tangential relevance

## Output Requirements
1. Search systematically using varied queries
2. Filter out noise and irrelevant results
3. Only store high-quality signals (score >= 5)
4. Provide clear reasoning for each stored signal

Remember: Quality over quantity. It's better to store 3 high-quality signals than 10 low-quality ones.`;

// ============================================================
// Agent Utilities
// ============================================================

export function buildCollectorPrompt(geo: string, daysBack: number = 7): string {
    return COLLECTOR_SYSTEM_PROMPT
        .replace('{GEO}', geo.toUpperCase())
        .replace('{DAYS_BACK}', String(daysBack));
}

export function isValidSignal(signal: Partial<RawSignalData>): boolean {
    return !!(
        signal.entity_name &&
        signal.entity_type &&
        signal.geo &&
        signal.signal_type &&
        signal.evidence &&
        signal.evidence.length > 0 &&
        signal.preliminary_score !== undefined &&
        signal.preliminary_score >= 0 &&
        signal.preliminary_score <= 10
    );
}
