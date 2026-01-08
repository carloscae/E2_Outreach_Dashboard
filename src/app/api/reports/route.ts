/**
 * GET /api/reports
 * Fetch reports with optional pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { getReports, getReportById } from '@/lib/db/reports';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        // If ID provided, fetch single report
        if (id) {
            const report = await getReportById(id);
            if (!report) {
                return NextResponse.json(
                    { success: false, error: 'Report not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json({ success: true, data: report });
        }

        // Fetch all reports
        const reports = await getReports(limit);

        return NextResponse.json({
            success: true,
            data: reports,
            count: reports.length,
        });
    } catch (err) {
        console.error('[API/reports] Error:', err);
        return NextResponse.json(
            { success: false, error: String(err) },
            { status: 500 }
        );
    }
}
