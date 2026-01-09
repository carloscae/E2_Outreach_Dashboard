/**
 * GET/POST /api/regulatory-news
 * Manage regulatory news items that need user review
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    getPendingRegulatoryNews,
    updateRegulatoryNewsStatus
} from '@/data/geo-context';

/**
 * GET - Fetch pending regulatory news for dashboard
 */
export async function GET() {
    try {
        const pendingNews = getPendingRegulatoryNews();

        return NextResponse.json({
            success: true,
            data: pendingNews,
            count: pendingNews.length,
        });
    } catch (err) {
        console.error('[API/regulatory-news] Error:', err);
        return NextResponse.json(
            { success: false, error: String(err) },
            { status: 500 }
        );
    }
}

/**
 * POST - Update news status (apply or ignore)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, action } = body as { id: string; action: 'apply' | 'ignore' };

        if (!id || !action) {
            return NextResponse.json(
                { success: false, error: 'Missing id or action' },
                { status: 400 }
            );
        }

        const status = action === 'apply' ? 'applied' : 'ignored';
        const updated = updateRegulatoryNewsStatus(id, status);

        if (!updated) {
            return NextResponse.json(
                { success: false, error: 'News item not found' },
                { status: 404 }
            );
        }

        console.log(`[API/regulatory-news] ${id} marked as ${status}`);

        return NextResponse.json({
            success: true,
            message: `News ${status}`,
        });
    } catch (err) {
        console.error('[API/regulatory-news] Error:', err);
        return NextResponse.json(
            { success: false, error: String(err) },
            { status: 500 }
        );
    }
}
