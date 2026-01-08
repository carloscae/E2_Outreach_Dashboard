/**
 * POST /api/analyze
 * Run the Analyzer Agent to score signals
 */

import { NextRequest, NextResponse } from 'next/server';
import { runAnalyzer, analyzeUnanalyzedSignals } from '@/lib/agents/analyzer';

export async function POST(request: NextRequest) {
    try {
        // Optional: require secret for non-dev environments
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            if (process.env.NODE_ENV === 'production') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        // Parse request body for options
        let body: { signalIds?: string[] } = {};
        try {
            body = await request.json();
        } catch {
            // Empty body is ok - will analyze all unanalyzed
        }

        console.log('[API/analyze] Starting analysis...');

        let result;
        if (body.signalIds && body.signalIds.length > 0) {
            // Analyze specific signals
            result = await runAnalyzer({ signalIds: body.signalIds });
        } else {
            // Analyze all unanalyzed signals
            result = await analyzeUnanalyzedSignals();
        }

        if (!result.success) {
            console.error('[API/analyze] Analysis failed:', result.error);
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        console.log('[API/analyze] Analysis complete:', result.data);

        // Transform to camelCase for frontend
        const responseData = result.data ? {
            signalsAnalyzed: result.data.signals_analyzed,
            highPriority: result.data.by_priority.HIGH,
            mediumPriority: result.data.by_priority.MEDIUM,
            lowPriority: result.data.by_priority.LOW,
            avgScore: result.data.avg_score,
            runId: 'analysis-run', // Placeholder for now
        } : null;

        return NextResponse.json({
            success: true,
            data: responseData,
            usage: result.usage,
        });
    } catch (err) {
        console.error('[API/analyze] Exception:', err);
        return NextResponse.json(
            { success: false, error: String(err) },
            { status: 500 }
        );
    }
}

// GET for status/documentation
export async function GET() {
    return NextResponse.json({
        status: 'ready',
        endpoint: '/api/analyze',
        method: 'POST',
        description: 'Run the Analyzer Agent to score signals',
        body: {
            signalIds: 'string[] (optional - if empty, analyzes all unanalyzed signals)',
        },
        scoring: {
            market_entry_momentum: '0-4 points',
            e2_partnership_fit: '0-4 points',
            actionability: '0-3 points',
            data_confidence: '0-3 points',
            total: '0-14 points',
            priority: 'HIGH (≥10), MEDIUM (7-9), LOW (<7)',
        },
    });
}
