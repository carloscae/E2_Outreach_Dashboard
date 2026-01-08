/**
 * Database types for AI Market Intelligence Agent
 * Generated from Supabase schema for type-safe queries
 */

// ============================================================
// Core Entity Types
// ============================================================

export type EntityType = 'bookmaker' | 'publisher' | 'app' | 'channel';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type AgentType = 'collector' | 'analyzer' | 'reporter';

// ============================================================
// Evidence & Scoring Types (JSONB fields)
// ============================================================

export interface SignalEvidence {
    source: string;
    headline?: string;
    description?: string;
    url?: string;
    publishedAt?: string;
    confidence: number; // 0-1
}

export interface ScoreBreakdown {
    marketEntryMomentum: number; // 0-4
    e2PartnershipFit: number;    // 0-4
    actionability: number;       // 0-3
    dataConfidence: number;      // 0-3
}

export interface RiskFlags {
    regulatory?: boolean;
    reputational?: boolean;
    financial?: boolean;
    notes?: string[];
}

export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost?: number;
}

export interface SummaryStats {
    totalSignals: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    newEntities: number;
    topGeos: string[];
}

// ============================================================
// Database Row Types
// ============================================================

export interface Signal {
    id: string;
    entity_name: string;
    entity_type: EntityType;
    geo: string;
    signal_type: string;
    evidence: SignalEvidence[];
    preliminary_score: number | null;
    source_urls: string[] | null;
    collected_at: string;
    agent_run_id: string | null;
}

export interface AnalyzedSignal {
    id: string;
    signal_id: string;
    final_score: number | null;
    score_breakdown: ScoreBreakdown;
    priority: Priority | null;
    risk_flags: RiskFlags | null;
    recommended_actions: string[] | null;
    ai_reasoning: string | null;
    analyzed_at: string;
}

export interface Report {
    id: string;
    cycle_start: string;
    cycle_end: string;
    content_markdown: string;
    content_html: string | null;
    summary_stats: SummaryStats | null;
    sent_at: string | null;
    created_at: string;
}

export interface Feedback {
    id: string;
    signal_id: string;
    user_email: string;
    is_useful: boolean;
    action_taken: string | null;
    notes: string | null;
    created_at: string;
}

export interface AgentRun {
    id: string;
    agent_type: AgentType;
    input_params: Record<string, unknown> | null;
    output_summary: Record<string, unknown> | null;
    token_usage: TokenUsage | null;
    duration_ms: number | null;
    error: string | null;
    started_at: string;
    completed_at: string | null;
}

// ============================================================
// Insert Types (id and timestamps optional)
// ============================================================

export type SignalInsert = Omit<Signal, 'id' | 'collected_at'> & {
    id?: string;
    collected_at?: string;
};

export type AnalyzedSignalInsert = Omit<AnalyzedSignal, 'id' | 'analyzed_at'> & {
    id?: string;
    analyzed_at?: string;
};

export type ReportInsert = Omit<Report, 'id' | 'created_at' | 'sent_at'> & {
    id?: string;
    created_at?: string;
    sent_at?: string | null;
};

export type FeedbackInsert = Omit<Feedback, 'id' | 'created_at'> & {
    id?: string;
    created_at?: string;
};

export type AgentRunInsert = Omit<AgentRun, 'id' | 'started_at'> & {
    id?: string;
    started_at?: string;
};

// ============================================================
// Query Result Types (joined data)
// ============================================================

export interface SignalWithAnalysis extends Signal {
    analyzed_signal?: AnalyzedSignal | null;
    feedback?: Feedback[];
}

export interface DashboardSignal {
    id: string;
    entity_name: string;
    entity_type: EntityType;
    geo: string;
    signal_type: string;
    preliminary_score: number | null;
    collected_at: string;
    // Evidence data from signals table
    evidence: SignalEvidence[];
    source_urls: string[] | null;
    // Analysis data from analyzed_signals table
    final_score: number | null;
    priority: Priority | null;
    score_breakdown: ScoreBreakdown | null;
    ai_reasoning: string | null;
    risk_flags: RiskFlags | null;
    recommended_actions: string[] | null;
    // Feedback count
    feedback_count: number;
}
