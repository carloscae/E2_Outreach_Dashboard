/**
 * Reports database queries
 * CRUD operations for bi-weekly report management
 */

import { supabase } from './client';
import type { Report, ReportInsert } from '@/types/database';

// ============================================================
// Create Operations
// ============================================================

export async function createReport(report: ReportInsert): Promise<Report> {
    const { data, error } = await supabase
        .from('reports')
        .insert(report)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================================
// Read Operations
// ============================================================

export async function getReportById(id: string): Promise<Report | null> {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

export async function getReports(limit = 20): Promise<Report[]> {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

export async function getLatestReport(): Promise<Report | null> {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

export async function getReportByCycle(
    cycleStart: string,
    cycleEnd: string
): Promise<Report | null> {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('cycle_start', cycleStart)
        .eq('cycle_end', cycleEnd)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

export async function getUnsentReports(): Promise<Report[]> {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .is('sent_at', null)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

// ============================================================
// Update Operations
// ============================================================

export async function updateReport(
    id: string,
    updates: Partial<ReportInsert>
): Promise<Report> {
    const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function markReportAsSent(id: string): Promise<Report> {
    const { data, error } = await supabase
        .from('reports')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// ============================================================
// Delete Operations
// ============================================================

export async function deleteReport(id: string): Promise<void> {
    const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
