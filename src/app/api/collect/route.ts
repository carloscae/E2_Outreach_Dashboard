/**
 * POST /api/collect
 * Manually trigger the Collector Agent to find new signals
 * 
 * For development and testing - production uses Vercel Cron
 */

import { NextRequest, NextResponse } from 'next/server';
import { runArticleFirstCollector } from '@/lib/agents/article-collector';
// Alternative collectors:
// import { runLightweightCollector } from '@/lib/agents/lightweight-collector';
// import { runCollector } from '@/lib/agents/collector';

export async function POST(request: NextRequest) {
    try {
        // Optional: require secret for non-dev environments
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            // In development, allow without auth
            if (process.env.NODE_ENV === 'production') {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
        }

        // Parse request body for options
        let body: { geo?: string; daysBack?: number } = {};
        try {
            body = await request.json();
        } catch {
            // Empty body is ok, use defaults
        }

        const geo = body.geo || 'br';
        const daysBack = body.daysBack || 14;

        console.log(`[API/collect] Starting article-first collection for ${geo}, ${daysBack} days back`);

        const result = await runArticleFirstCollector({
            geo,
            daysBack,
        });

        if (!result.success) {
            console.error('[API/collect] Collection failed:', result.error);
            return NextResponse.json(
                {
                    success: false,
                    error: result.error
                },
                { status: 500 }
            );
        }

        console.log('[API/collect] Collection complete:', result.data);

        // Transform for frontend
        const responseData = result.data ? {
            signalsFound: result.data.signals_found,
            signalsStored: result.data.signals_stored,
            entitiesDiscovered: result.data.entities_discovered,
            articlesProcessed: result.data.articles_processed,
            runId: 'article-first-collect-run',
            geo: geo,
        } : null;

        return NextResponse.json({
            success: true,
            data: responseData,
        });
    } catch (err) {
        console.error('[API/collect] Exception:', err);
        return NextResponse.json(
            {
                success: false,
                error: String(err)
            },
            { status: 500 }
        );
    }
}

// GET for simple health check / status
export async function GET() {
    return NextResponse.json({
        status: 'ready',
        endpoint: '/api/collect',
        method: 'POST',
        description: 'Trigger the Collector Agent to find new signals',
        body: {
            geo: 'string (default: "br")',
            daysBack: 'number (default: 7)',
        },
    });
}
