/**
 * Agent runs database queries
 * Track AI agent execution for debugging and metrics
 */

import { supabase } from './client';
import type { AgentRun, AgentRunInsert, AgentType } from '@/types/database';

// ============================================================
// Create Operations
// ============================================================

export async function startAgentRun(
    agentType: AgentType,
    inputParams?: Record<string, unknown>
): Promise<AgentRun> {
    const { data, error } = await supabase
        .from('agent_runs')
        .insert({
            agent_type: agentType,
            input_params: inputParams,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================================
// Read Operations
// ============================================================

export async function getAgentRunById(id: string): Promise<AgentRun | null> {
    const { data, error } = await supabase
        .from('agent_runs')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

export async function getAgentRuns(
    agentType?: AgentType,
    limit = 50
): Promise<AgentRun[]> {
    let query = supabase
        .from('agent_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

    if (agentType) {
        query = query.eq('agent_type', agentType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

export async function getLatestAgentRun(agentType: AgentType): Promise<AgentRun | null> {
    const { data, error } = await supabase
        .from('agent_runs')
        .select('*')
        .eq('agent_type', agentType)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

export async function getFailedRuns(limit = 20): Promise<AgentRun[]> {
    const { data, error } = await supabase
        .from('agent_runs')
        .select('*')
        .not('error', 'is', null)
        .order('started_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

// ============================================================
// Update Operations
// ============================================================

export async function completeAgentRun(
    id: string,
    result: {
        output_summary?: Record<string, unknown>;
        token_usage?: {
            inputTokens: number;
            outputTokens: number;
            totalTokens: number;
            cost?: number;
        };
        error?: string;
    }
): Promise<AgentRun> {
    const startedAt = await getAgentRunById(id);
    const durationMs = startedAt
        ? Date.now() - new Date(startedAt.started_at).getTime()
        : null;

    const { data, error } = await supabase
        .from('agent_runs')
        .update({
            output_summary: result.output_summary,
            token_usage: result.token_usage,
            error: result.error,
            duration_ms: durationMs,
            completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================================
// Stats & Metrics
// ============================================================

export interface AgentRunStats {
    total_runs: number;
    successful_runs: number;
    failed_runs: number;
    avg_duration_ms: number;
    total_tokens: number;
}

export async function getAgentRunStats(
    agentType?: AgentType,
    since?: string
): Promise<AgentRunStats> {
    let query = supabase
        .from('agent_runs')
        .select('duration_ms, error, token_usage, completed_at');

    if (agentType) {
        query = query.eq('agent_type', agentType);
    }
    if (since) {
        query = query.gte('started_at', since);
    }

    const { data, error } = await query;

    if (error) throw error;

    const runs = data || [];
    const completedRuns = runs.filter(r => r.completed_at);
    const successfulRuns = completedRuns.filter(r => !r.error);
    const failedRuns = completedRuns.filter(r => r.error);

    const totalDuration = completedRuns.reduce((sum, r) => sum + (r.duration_ms || 0), 0);
    const totalTokens = runs.reduce((sum, r) => {
        const tokens = r.token_usage as { totalTokens?: number } | null;
        return sum + (tokens?.totalTokens || 0);
    }, 0);

    return {
        total_runs: runs.length,
        successful_runs: successfulRuns.length,
        failed_runs: failedRuns.length,
        avg_duration_ms: completedRuns.length > 0 ? totalDuration / completedRuns.length : 0,
        total_tokens: totalTokens,
    };
}
