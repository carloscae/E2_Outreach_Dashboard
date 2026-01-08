/**
 * POST /api/feedback
 * Submit feedback (thumbs up/down) for a signal
 * 
 * Body:
 * - signalId: string (required)
 * - isUseful: boolean (required)
 * - comment?: string (optional)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createFeedback, getFeedbackBySignalId } from '@/lib/db/feedback';
import type { FeedbackInsert } from '@/types/database';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { signalId, isUseful, comment, userEmail } = body as {
            signalId: string;
            isUseful: boolean;
            comment?: string;
            userEmail?: string;
        };

        // Validate required fields
        if (!signalId) {
            return NextResponse.json(
                { success: false, error: 'signalId is required' },
                { status: 400 }
            );
        }
        if (typeof isUseful !== 'boolean') {
            return NextResponse.json(
                { success: false, error: 'isUseful must be a boolean' },
                { status: 400 }
            );
        }

        console.log(`[API/feedback] Signal ${signalId}: ${isUseful ? '👍' : '👎'}`);

        // Create feedback record
        const feedbackData: FeedbackInsert = {
            signal_id: signalId,
            is_useful: isUseful,
            notes: comment || null,
            user_email: userEmail || 'anonymous@dashboard.local',
            action_taken: null,
        };

        const feedback = await createFeedback(feedbackData);

        return NextResponse.json({
            success: true,
            feedback: {
                id: feedback.id,
                signalId: feedback.signal_id,
                isUseful: feedback.is_useful,
            },
        });
    } catch (err) {
        console.error('[API/feedback] Error:', err);
        return NextResponse.json(
            { success: false, error: String(err) },
            { status: 500 }
        );
    }
}

// GET feedback for a specific signal
export async function GET(request: NextRequest) {
    const signalId = request.nextUrl.searchParams.get('signalId');

    if (!signalId) {
        return NextResponse.json({
            status: 'ready',
            endpoint: '/api/feedback',
            methods: {
                POST: {
                    description: 'Submit feedback for a signal',
                    body: { signalId: 'string', isUseful: 'boolean', comment: 'string?' },
                },
                GET: {
                    description: 'Get feedback for a signal',
                    params: { signalId: 'string' },
                },
            },
        });
    }

    try {
        const feedbackList = await getFeedbackBySignalId(signalId);

        return NextResponse.json({
            success: true,
            signalId,
            feedback: feedbackList.map(f => ({
                id: f.id,
                isUseful: f.is_useful,
                notes: f.notes,
                createdAt: f.created_at,
            })),
            summary: {
                total: feedbackList.length,
                useful: feedbackList.filter(f => f.is_useful).length,
                notUseful: feedbackList.filter(f => !f.is_useful).length,
            },
        });
    } catch (err) {
        console.error('[API/feedback] GET Error:', err);
        return NextResponse.json(
            { success: false, error: String(err) },
            { status: 500 }
        );
    }
}
