/**
 * GET /api/dashboard
 * Returns signals for the dashboard view with filtering options
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDashboardSignals, getSignalStats } from '@/lib/db/signals';
import type { SignalFilters } from '@/lib/db/signals';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const filters: SignalFilters = {};

        const geo = searchParams.get('geo');
        if (geo) filters.geo = geo;

        const entityType = searchParams.get('entity_type');
        if (entityType) filters.entity_type = entityType;

        const limit = searchParams.get('limit');
        if (limit) filters.limit = parseInt(limit, 10);

        console.log('[API/dashboard] Fetching signals with filters:', filters);

        // Fetch signals and stats in parallel
        const [signals, stats] = await Promise.all([
            getDashboardSignals(filters),
            getSignalStats(geo || undefined),
        ]);

        console.log(`[API/dashboard] Found ${signals.length} signals`);

        return NextResponse.json({
            success: true,
            signals,
            stats,
            count: signals.length,
        });
    } catch (err) {
        console.error('[API/dashboard] Error:', err);
        return NextResponse.json(
            {
                success: false,
                error: String(err),
                signals: [],
                stats: null,
            },
            { status: 500 }
        );
    }
}
