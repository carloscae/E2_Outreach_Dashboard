/**
 * POST /api/report
 * Generate and optionally send a market intelligence report
 * 
 * Body:
 * - cycleStart?: string (ISO date, defaults to 14 days ago)
 * - cycleEnd?: string (ISO date, defaults to now)
 * - sendEmail?: boolean (defaults to true in production)
 * - recipientEmails?: string[] (defaults to REPORT_RECIPIENT_EMAIL env var)
 * - preview?: boolean (if true, returns HTML/markdown without storing or sending)
 */

import { NextRequest, NextResponse } from 'next/server';
import { runReporter, generateReportPreview } from '@/lib/agents/reporter';

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        let body: {
            cycleStart?: string;
            cycleEnd?: string;
            sendEmail?: boolean;
            recipientEmails?: string[];
            preview?: boolean;
        } = {};

        try {
            body = await request.json();
        } catch {
            // Empty body is ok, use defaults
        }

        console.log('[API/report] Request:', body);

        // Preview mode - just generate and return without storing
        if (body.preview) {
            const result = await generateReportPreview(body.cycleStart, body.cycleEnd);

            if (!result.success) {
                return NextResponse.json(
                    { success: false, error: result.error },
                    { status: 500 }
                );
            }

            // Transform stats to camelCase for frontend
            const transformedStats = result.data?.stats ? {
                totalSignals: result.data.stats.total,
                highPriority: result.data.stats.byPriority.HIGH,
                mediumPriority: result.data.stats.byPriority.MEDIUM,
                lowPriority: result.data.stats.byPriority.LOW,
                avgScore: result.data.stats.avgScore,
                byGeo: result.data.stats.byGeo,
                byType: result.data.stats.byType,
            } : null;

            return NextResponse.json({
                success: true,
                preview: true,
                html: result.data?.html,
                markdown: result.data?.markdown,
                stats: transformedStats,
            });
        }

        // Full report generation
        const result = await runReporter({
            cycleStart: body.cycleStart,
            cycleEnd: body.cycleEnd,
            sendEmail: body.sendEmail,
            recipientEmails: body.recipientEmails,
        });

        if (!result.success) {
            console.error('[API/report] Report generation failed:', result.error);
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        console.log('[API/report] Report generated:', result.data);

        return NextResponse.json({
            success: true,
            data: result.data,
            usage: result.usage,
        });
    } catch (err) {
        console.error('[API/report] Exception:', err);
        return NextResponse.json(
            { success: false, error: String(err) },
            { status: 500 }
        );
    }
}

// GET for status and documentation
export async function GET() {
    return NextResponse.json({
        status: 'ready',
        endpoint: '/api/report',
        method: 'POST',
        description: 'Generate and optionally send a market intelligence report',
        body: {
            cycleStart: 'string? (ISO date, defaults to 14 days ago)',
            cycleEnd: 'string? (ISO date, defaults to now)',
            sendEmail: 'boolean? (defaults to true in production)',
            recipientEmails: 'string[]? (defaults to REPORT_RECIPIENT_EMAIL env var)',
            preview: 'boolean? (if true, returns HTML/markdown without storing or sending)',
        },
        examples: {
            preview: { preview: true },
            send: { sendEmail: true, recipientEmails: ['team@example.com'] },
        },
    });
}
