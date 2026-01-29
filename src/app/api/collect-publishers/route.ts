/**
 * Publisher Collector API Route
 * Trigger publisher discovery and betting detection
 */

import { NextResponse } from 'next/server';
import { runPublisherCollector } from '@/lib/agents/publisher-collector';

export const maxDuration = 120; // 2 minutes max for Vercel

export async function POST(request: Request) {
    try {
        // Optional: Add authorization check
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            // Allow unauthenticated in development
            if (process.env.NODE_ENV === 'production') {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
        }

        console.log('[API] Starting publisher collection...');

        const result = await runPublisherCollector({ geo: 'br' });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Publisher collection complete`,
                data: result.data,
                usage: result.usage,
            });
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('[API] Publisher collection failed:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

// Health check
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        endpoint: 'publisher-collect',
        description: 'POST to trigger publisher discovery and betting detection',
    });
}
