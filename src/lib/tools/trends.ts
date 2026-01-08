/**
 * Google Trends Tool
 * Check search interest for bookmaker/betting keywords
 * Uses google-trends-api npm package
 */

// Note: For POC, we simulate Google Trends data since it requires special handling
// In production, use google-trends-api package or SerpAPI

// ============================================================
// Types
// ============================================================

export interface TrendData {
    keyword: string;
    interestOverTime: Array<{
        date: string;
        value: number;
    }>;
    averageInterest: number;
    trend: 'rising' | 'stable' | 'declining';
    relatedQueries: string[];
}

export interface TrendsResult {
    data?: TrendData;
    error?: string;
}

// ============================================================
// Rate Limiting (to avoid Google blocking)
// ============================================================

const TRENDS_RATE_LIMIT = {
    maxRequests: 30,
    windowMs: 60 * 60 * 1000, // 1 hour
    retryAfterMs: 5 * 1000,   // 5 seconds between requests
};

const trendsRateState = {
    requestCount: 0,
    windowStart: Date.now(),
    lastRequest: 0,
};

function checkTrendsRateLimit(): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();

    // Reset window if expired
    if (now - trendsRateState.windowStart > TRENDS_RATE_LIMIT.windowMs) {
        trendsRateState.requestCount = 0;
        trendsRateState.windowStart = now;
    }

    // Check daily limit
    if (trendsRateState.requestCount >= TRENDS_RATE_LIMIT.maxRequests) {
        return { allowed: false, retryAfter: TRENDS_RATE_LIMIT.windowMs - (now - trendsRateState.windowStart) };
    }

    // Check minimum interval
    const timeSinceLastRequest = now - trendsRateState.lastRequest;
    if (timeSinceLastRequest < TRENDS_RATE_LIMIT.retryAfterMs) {
        return { allowed: false, retryAfter: TRENDS_RATE_LIMIT.retryAfterMs - timeSinceLastRequest };
    }

    return { allowed: true };
}

function recordTrendsRequest() {
    trendsRateState.requestCount++;
    trendsRateState.lastRequest = Date.now();
}

// ============================================================
// Main Function
// ============================================================

/**
 * Check Google Trends interest for a keyword in a specific geo
 * 
 * For POC, we use simulated data. In production:
 * - Use google-trends-api package: https://www.npmjs.com/package/google-trends-api
 * - Or SerpAPI Google Trends endpoint
 */
export async function checkGoogleTrends(
    keyword: string,
    geo: string = 'BR'
): Promise<TrendsResult> {
    // Rate limit check
    const rateCheck = checkTrendsRateLimit();
    if (!rateCheck.allowed) {
        console.log(`[Trends] Rate limited. Retry after ${rateCheck.retryAfter}ms`);
        return { error: `Rate limited. Retry after ${rateCheck.retryAfter}ms` };
    }

    recordTrendsRequest();

    try {
        // Simulate trend data based on keyword patterns
        // In production, this would call the actual Google Trends API
        const simulatedData = simulateTrendData(keyword, geo);
        return { data: simulatedData };
    } catch (err) {
        console.error('[Trends] Error:', err);
        return { error: String(err) };
    }
}

// ============================================================
// Simulation (for POC)
// ============================================================

function simulateTrendData(keyword: string, _geo: string): TrendData {
    const keywordLower = keyword.toLowerCase();

    // Generate realistic-looking trend data
    const now = new Date();
    const interestOverTime: Array<{ date: string; value: number }> = [];

    // Determine base interest and trend based on keyword
    let baseInterest = 30;
    let trendMultiplier = 1.0;

    // Known popular betting terms get higher base interest
    if (keywordLower.includes('bet365') || keywordLower.includes('betano') || keywordLower.includes('stake')) {
        baseInterest = 70;
        trendMultiplier = 1.1;
    } else if (keywordLower.includes('apostas') || keywordLower.includes('betting')) {
        baseInterest = 50;
        trendMultiplier = 1.05;
    } else if (keywordLower.includes('casa de apostas') || keywordLower.includes('bookmaker')) {
        baseInterest = 45;
        trendMultiplier = 1.02;
    }

    // Generate 30 days of data
    for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Add some noise and trend
        const noise = (Math.random() - 0.5) * 20;
        const dayMultiplier = 1 + (30 - i) * (trendMultiplier - 1) / 30;
        const value = Math.max(0, Math.min(100, Math.round(baseInterest * dayMultiplier + noise)));

        interestOverTime.push({
            date: date.toISOString().split('T')[0],
            value,
        });
    }

    // Calculate average
    const avgInterest = interestOverTime.reduce((sum, d) => sum + d.value, 0) / interestOverTime.length;

    // Determine trend direction
    const firstHalf = interestOverTime.slice(0, 15);
    const secondHalf = interestOverTime.slice(15);
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;

    let trend: 'rising' | 'stable' | 'declining';
    if (secondAvg > firstAvg * 1.1) {
        trend = 'rising';
    } else if (secondAvg < firstAvg * 0.9) {
        trend = 'declining';
    } else {
        trend = 'stable';
    }

    // Related queries (simulated)
    const relatedQueries = [
        `${keyword} app`,
        `${keyword} bonus`,
        `${keyword} cadastro`,
        `${keyword} odds`,
    ].filter(() => Math.random() > 0.3);

    return {
        keyword,
        interestOverTime,
        averageInterest: Math.round(avgInterest),
        trend,
        relatedQueries,
    };
}

// ============================================================
// Tool Definition for Agent Use
// ============================================================

export const GOOGLE_TRENDS_TOOL_DEFINITION = {
    name: 'check_trends',
    description: 'Check Google Trends search interest for a keyword. Returns interest over time, trend direction (rising/stable/declining), and related queries.',
    input_schema: {
        type: 'object',
        properties: {
            keyword: {
                type: 'string',
                description: 'Keyword to check (e.g., company name, betting term)',
            },
            geo: {
                type: 'string',
                description: 'Country code (e.g., "BR" for Brazil). Defaults to "BR".',
            },
        },
        required: ['keyword'],
    },
};
