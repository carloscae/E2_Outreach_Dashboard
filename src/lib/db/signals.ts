/**
 * Signals database queries
 * CRUD operations for signal collection and retrieval
 */

import { supabase } from './client';
import type { Signal, SignalInsert, AnalyzedSignal, DashboardSignal } from '@/types/database';

// ============================================================
// Create Operations
// ============================================================

export async function createSignal(signal: SignalInsert): Promise<Signal> {
    const { data, error } = await supabase
        .from('signals')
        .insert(signal)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function createSignals(signals: SignalInsert[]): Promise<Signal[]> {
    const { data, error } = await supabase
        .from('signals')
        .insert(signals)
        .select();

    if (error) throw error;
    return data;
}

// ============================================================
// Read Operations
// ============================================================

export async function getSignalById(id: string): Promise<Signal | null> {
    const { data, error } = await supabase
        .from('signals')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }
    return data;
}

export interface SignalFilters {
    geo?: string;
    entity_type?: string;
    signal_type?: string;
    from_date?: string;
    to_date?: string;
    limit?: number;
    offset?: number;
    include_archived?: boolean; // Show archived/expired signals
}

export async function getSignals(filters: SignalFilters = {}): Promise<Signal[]> {
    let query = supabase
        .from('signals')
        .select('*')
        .order('collected_at', { ascending: false });

    if (filters.geo) {
        query = query.eq('geo', filters.geo);
    }
    if (filters.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
    }
    if (filters.signal_type) {
        query = query.eq('signal_type', filters.signal_type);
    }
    if (filters.from_date) {
        query = query.gte('collected_at', filters.from_date);
    }
    if (filters.to_date) {
        query = query.lte('collected_at', filters.to_date);
    }
    if (filters.limit) {
        query = query.limit(filters.limit);
    }
    if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

export async function getRecentSignals(limit = 50): Promise<Signal[]> {
    const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('collected_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

// ============================================================
// Dashboard Queries (with analysis data)
// ============================================================

export async function getDashboardSignals(
    filters: SignalFilters = {}
): Promise<DashboardSignal[]> {
    let query = supabase
        .from('signals')
        .select(`
      id,
      entity_name,
      entity_type,
      geo,
      signal_type,
      preliminary_score,
      collected_at,
      evidence,
      source_urls,
      signal_category,
      expires_at,
      is_archived,
      analyzed_signals (
        final_score,
        priority,
        score_breakdown,
        ai_reasoning,
        risk_flags,
        recommended_actions
      ),
      feedback (
        id
      )
    `)
        .order('collected_at', { ascending: false });

    if (filters.geo) {
        query = query.eq('geo', filters.geo);
    }
    if (filters.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
    }
    if (filters.limit) {
        query = query.limit(filters.limit);
    }
    // By default, exclude archived signals unless explicitly requested
    if (!filters.include_archived) {
        query = query.eq('is_archived', false);
    }

    const { data, error } = await query;

    if (error) throw error;

    const now = new Date();

    // Transform to flat dashboard format
    return (data || []).map((row) => {
        const expiresAt = row.expires_at ? new Date(row.expires_at) : null;
        const isExpired = expiresAt ? expiresAt <= now : false;

        return {
            id: row.id,
            entity_name: row.entity_name,
            entity_type: row.entity_type,
            geo: row.geo,
            signal_type: row.signal_type,
            preliminary_score: row.preliminary_score,
            collected_at: row.collected_at,
            // Evidence data
            evidence: row.evidence ?? [],
            source_urls: row.source_urls ?? null,
            // Expiration data
            signal_category: row.signal_category ?? null,
            expires_at: row.expires_at ?? null,
            is_expired: isExpired,
            is_archived: row.is_archived ?? false,
            // Analysis data
            final_score: row.analyzed_signals?.[0]?.final_score ?? null,
            priority: row.analyzed_signals?.[0]?.priority ?? null,
            score_breakdown: row.analyzed_signals?.[0]?.score_breakdown ?? null,
            ai_reasoning: row.analyzed_signals?.[0]?.ai_reasoning ?? null,
            risk_flags: row.analyzed_signals?.[0]?.risk_flags ?? null,
            recommended_actions: row.analyzed_signals?.[0]?.recommended_actions ?? null,
            // Feedback
            feedback_count: row.feedback?.length ?? 0,
        };
    });
}

/**
 * Get archived/expired signals for the archive view
 */
export async function getArchivedSignals(
    filters: SignalFilters = {}
): Promise<DashboardSignal[]> {
    return getDashboardSignals({ ...filters, include_archived: true });
}

// ============================================================
// Analyzed Signals
// ============================================================

export async function getAnalyzedSignal(signalId: string): Promise<AnalyzedSignal | null> {
    const { data, error } = await supabase
        .from('analyzed_signals')
        .select('*')
        .eq('signal_id', signalId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

export async function getUnanalyzedSignals(limit = 100): Promise<Signal[]> {
    // Get signals that don't have an analyzed_signals entry
    const { data, error } = await supabase
        .from('signals')
        .select(`
      *,
      analyzed_signals (id)
    `)
        .is('analyzed_signals', null)
        .order('collected_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

// ============================================================
// Update Operations
// ============================================================

export async function updateSignal(
    id: string,
    updates: Partial<SignalInsert>
): Promise<Signal> {
    const { data, error } = await supabase
        .from('signals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================================
// Delete Operations
// ============================================================

export async function deleteSignal(id: string): Promise<void> {
    const { error } = await supabase
        .from('signals')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============================================================
// Stats & Aggregations
// ============================================================

export async function getSignalStats(geo?: string): Promise<{
    total: number;
    by_type: Record<string, number>;
    by_priority: Record<string, number>;
}> {
    let query = supabase
        .from('signals')
        .select(`
      id,
      entity_type,
      analyzed_signals (priority)
    `);

    if (geo) {
        query = query.eq('geo', geo);
    }

    const { data, error } = await query;

    if (error) throw error;

    const by_type: Record<string, number> = {};
    const by_priority: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0, UNANALYZED: 0 };

    for (const row of data || []) {
        by_type[row.entity_type] = (by_type[row.entity_type] || 0) + 1;
        const priority = row.analyzed_signals?.[0]?.priority || 'UNANALYZED';
        by_priority[priority] = (by_priority[priority] || 0) + 1;
    }

    return {
        total: data?.length || 0,
        by_type,
        by_priority,
    };
}
