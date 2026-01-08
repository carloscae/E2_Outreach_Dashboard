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
    runId?: string;
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
Find new or growing BOOKMAKERS and betting operators in {GEO} that are NOT yet E2 partners.

## REQUIRED: Search Strategy
You MUST perform at least 3 searches with VARIED signal categories:

### Signal Categories to Search
1. MARKET_ENTRY - New operator launches
   Query: "new bookmaker launch {GEO} 2024", "nova casa de apostas {GEO}"
   
2. EXPANSION - Regional/product expansion
   Query: "betting operator expansion {GEO}", "casa de apostas expansão"
   
3. SPONSORSHIP - Team/athlete deals
   Query: "bookmaker patrocinador futebol {GEO}", "betting sponsorship deal"
   
4. LICENSING - Regulatory approvals
   Query: "gambling license {GEO} 2024", "casa de apostas licença regulamentação"
   
5. GROWTH - App rankings, traffic growth
   Query: "betting app ranking {GEO}", "bookmaker downloads growth"

## Available Tools

### search_news
Search for news articles. Use varied queries from different categories above.

### check_e2_partner
Check if a bookmaker is already an E2 partner. Use BEFORE storing signals.
- AFFILIATE_PARTNER: Skip (already partnered)
- KNOWN_BOOKIE: Still opportunity (no active deal)
- NEW_PROSPECT: Best opportunity (not in E2 system)

### check_trends
Check Google Trends interest for a bookmaker name.

### store_signal
Store a discovered signal. REQUIRED fields:
- entity_name: Company name
- signal_type: One of MARKET_ENTRY, EXPANSION, SPONSORSHIP, LICENSING, GROWTH
- evidence_headline: News headline
- evidence_url: Source URL
- preliminary_score: 0-10
- reasoning: WHY this signal is valuable (REQUIRED)

## Scoring Guidelines
- 8-10: Strong evidence, multiple sources, clear opportunity
- 5-7: Moderate evidence, single reliable source
- 2-4: Weak evidence, speculation
- 0-1: Very low confidence

## CRITICAL REQUIREMENTS
1. Perform at least 3 different searches
2. Use queries from at least 2 different signal categories
3. Include Portuguese queries for Brazil market
4. Always check E2 partnership status before storing
5. Provide detailed reasoning for EVERY signal stored

Quality over quantity. Better to store 3 excellent signals than 10 mediocre ones.`;


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
