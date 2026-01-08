/**
 * Feedback database queries
 * CRUD operations for user feedback on signals
 */

import { supabase } from './client';
import type { Feedback, FeedbackInsert } from '@/types/database';

// ============================================================
// Create Operations
// ============================================================

export async function createFeedback(feedback: FeedbackInsert): Promise<Feedback> {
    const { data, error } = await supabase
        .from('feedback')
        .insert(feedback)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================================
// Read Operations
// ============================================================

export async function getFeedbackById(id: string): Promise<Feedback | null> {
    const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

export async function getFeedbackBySignalId(signalId: string): Promise<Feedback[]> {
    const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('signal_id', signalId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getFeedbackByUser(userEmail: string): Promise<Feedback[]> {
    const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getRecentFeedback(limit = 50): Promise<Feedback[]> {
    const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

// ============================================================
// Stats & Learning Data
// ============================================================

export interface FeedbackStats {
    total: number;
    useful: number;
    not_useful: number;
    useful_rate: number;
}

export async function getFeedbackStats(): Promise<FeedbackStats> {
    const { data, error } = await supabase
        .from('feedback')
        .select('is_useful');

    if (error) throw error;

    const total = data?.length || 0;
    const useful = data?.filter(f => f.is_useful).length || 0;
    const not_useful = total - useful;

    return {
        total,
        useful,
        not_useful,
        useful_rate: total > 0 ? useful / total : 0,
    };
}

/**
 * Get feedback data for learning loop
 * Returns signals with their feedback to improve scoring
 */
export async function getLearningData(limit = 200): Promise<{
    signal_id: string;
    entity_type: string;
    geo: string;
    final_score: number | null;
    is_useful: boolean;
    action_taken: string | null;
}[]> {
    const { data, error } = await supabase
        .from('feedback')
        .select(`
      signal_id,
      is_useful,
      action_taken,
      signals (
        entity_type,
        geo
      ),
      analyzed_signals:signals!inner (
        analyzed_signals (
          final_score
        )
      )
    `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;

    // Note: This query structure may need adjustment based on actual Supabase joins
    // Fallback to simpler structure if needed
    return (data || []).map(row => {
        const signalData = row.signals as { entity_type?: string; geo?: string } | null;
        return {
            signal_id: row.signal_id,
            entity_type: signalData?.entity_type || 'unknown',
            geo: signalData?.geo || 'unknown',
            final_score: null, // Will be populated via separate join
            is_useful: row.is_useful,
            action_taken: row.action_taken,
        };
    });
}

// ============================================================
// Update Operations
// ============================================================

export async function updateFeedback(
    id: string,
    updates: Partial<FeedbackInsert>
): Promise<Feedback> {
    const { data, error } = await supabase
        .from('feedback')
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

export async function deleteFeedback(id: string): Promise<void> {
    const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
