/**
 * Analyzed Signals database queries
 * CRUD operations for AI-scored signals
 */

import { supabase } from './client';
import type { AnalyzedSignal, AnalyzedSignalInsert, Priority } from '@/types/database';

// ============================================================
// Create Operations
// ============================================================

export async function createAnalyzedSignal(
    analyzedSignal: AnalyzedSignalInsert
): Promise<AnalyzedSignal> {
    const { data, error } = await supabase
        .from('analyzed_signals')
        .insert(analyzedSignal)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function createAnalyzedSignals(
    analyzedSignals: AnalyzedSignalInsert[]
): Promise<AnalyzedSignal[]> {
    const { data, error } = await supabase
        .from('analyzed_signals')
        .insert(analyzedSignals)
        .select();

    if (error) throw error;
    return data;
}

// ============================================================
// Read Operations
// ============================================================

export async function getAnalyzedSignalById(id: string): Promise<AnalyzedSignal | null> {
    const { data, error } = await supabase
        .from('analyzed_signals')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

export async function getAnalyzedSignalBySignalId(
    signalId: string
): Promise<AnalyzedSignal | null> {
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

export interface AnalyzedSignalFilters {
    priority?: Priority;
    min_score?: number;
    max_score?: number;
    limit?: number;
    offset?: number;
}

export async function getAnalyzedSignals(
    filters: AnalyzedSignalFilters = {}
): Promise<AnalyzedSignal[]> {
    let query = supabase
        .from('analyzed_signals')
        .select('*')
        .order('final_score', { ascending: false });

    if (filters.priority) {
        query = query.eq('priority', filters.priority);
    }
    if (filters.min_score !== undefined) {
        query = query.gte('final_score', filters.min_score);
    }
    if (filters.max_score !== undefined) {
        query = query.lte('final_score', filters.max_score);
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

export async function getHighPrioritySignals(limit = 20): Promise<AnalyzedSignal[]> {
    const { data, error } = await supabase
        .from('analyzed_signals')
        .select('*')
        .eq('priority', 'HIGH')
        .order('final_score', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

/**
 * Get analyzed signals with their base signal data for reports
 */
export async function getAnalyzedSignalsWithDetails(
    priority?: Priority,
    limit = 50
): Promise<Array<AnalyzedSignal & { signal: { entity_name: string; entity_type: string; geo: string; signal_type: string } }>> {
    let query = supabase
        .from('analyzed_signals')
        .select(`
      *,
      signal:signals (
        entity_name,
        entity_type,
        geo,
        signal_type
      )
    `)
        .order('final_score', { ascending: false })
        .limit(limit);

    if (priority) {
        query = query.eq('priority', priority);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Array<AnalyzedSignal & { signal: { entity_name: string; entity_type: string; geo: string; signal_type: string } }>;
}

// ============================================================
// Update Operations
// ============================================================

export async function updateAnalyzedSignal(
    id: string,
    updates: Partial<AnalyzedSignalInsert>
): Promise<AnalyzedSignal> {
    const { data, error } = await supabase
        .from('analyzed_signals')
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

export async function deleteAnalyzedSignal(id: string): Promise<void> {
    const { error } = await supabase
        .from('analyzed_signals')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============================================================
// Stats
// ============================================================

export async function getAnalyzedSignalStats(): Promise<{
    total: number;
    by_priority: Record<Priority, number>;
    avg_score: number;
}> {
    const { data, error } = await supabase
        .from('analyzed_signals')
        .select('priority, final_score');

    if (error) throw error;

    const by_priority: Record<Priority, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    let totalScore = 0;

    for (const row of data || []) {
        if (row.priority) {
            by_priority[row.priority as Priority]++;
        }
        totalScore += row.final_score || 0;
    }

    return {
        total: data?.length || 0,
        by_priority,
        avg_score: data?.length ? totalScore / data.length : 0,
    };
}
