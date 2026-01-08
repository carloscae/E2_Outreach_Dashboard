/**
 * Database module barrel export
 * Re-exports all database queries and types
 */

// Client
export { supabase, createServiceClient } from './client';

// Queries
export * from './signals';
export * from './analyzed-signals';
export * from './reports';
export * from './feedback';
export * from './agent-runs';

// Types (re-export for convenience)
export type {
    Signal,
    SignalInsert,
    AnalyzedSignal,
    AnalyzedSignalInsert,
    Report,
    ReportInsert,
    Feedback,
    FeedbackInsert,
    AgentRun,
    AgentRunInsert,
    SignalWithAnalysis,
    DashboardSignal,
    EntityType,
    Priority,
    AgentType,
} from '@/types/database';
