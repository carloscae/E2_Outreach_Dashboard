const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE = "https://newsapi.org/v2";

// Rate limiting: NewsAPI free tier = 100 requests/day
// We use a conservative 50/day to leave buffer
const RATE_LIMIT = {
    maxRequests: 50,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    retryAfterMs: 2 * 1000, // 2 seconds between requests (avoid hammering)
};

// In-memory rate limit tracking (resets on server restart)
const rateLimitState = {
    requestCount: 0,
    windowStart: Date.now(),
    lastRequest: 0,
};

function checkRateLimit(): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();

    // Reset window if expired
    if (now - rateLimitState.windowStart > RATE_LIMIT.windowMs) {
        rateLimitState.requestCount = 0;
        rateLimitState.windowStart = now;
    }

    // Check if we've hit the limit
    if (rateLimitState.requestCount >= RATE_LIMIT.maxRequests) {
        const retryAfter = rateLimitState.windowStart + RATE_LIMIT.windowMs - now;
        return { allowed: false, retryAfter };
    }

    // Ensure minimum delay between requests
    const timeSinceLast = now - rateLimitState.lastRequest;
    if (timeSinceLast < RATE_LIMIT.retryAfterMs) {
        return { allowed: false, retryAfter: RATE_LIMIT.retryAfterMs - timeSinceLast };
    }

    return { allowed: true };
}

function recordRequest() {
    rateLimitState.requestCount++;
    rateLimitState.lastRequest = Date.now();
}

if (!NEWS_API_KEY) {
    console.warn("Missing NEWS_API_KEY - news search disabled");
}

export interface NewsArticle {
    source: { id: string | null; name: string };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
}

export interface NewsSearchResult {
    status: string;
    totalResults: number;
    articles: NewsArticle[];
}

/**
 * Search news articles via NewsAPI
 * @param query - Search keywords
 * @param options - Optional filters
 * @returns Search results or error
 */
export async function searchNews(
    query: string,
    options?: {
        country?: string; // e.g., "br" for Brazil
        language?: string; // e.g., "pt" for Portuguese
        from?: string; // ISO date string
        to?: string; // ISO date string
        sortBy?: "relevancy" | "popularity" | "publishedAt";
        pageSize?: number; // max 100
    }
): Promise<{ data?: NewsSearchResult; error?: string; rateLimited?: boolean }> {
    if (!NEWS_API_KEY) {
        return { error: "NewsAPI not configured" };
    }

    // Check rate limit
    const rateCheck = checkRateLimit();
    if (!rateCheck.allowed) {
        console.warn(`[NewsAPI] Rate limited. Retry after ${rateCheck.retryAfter}ms`);
        return {
            error: `Rate limited. Retry after ${Math.ceil((rateCheck.retryAfter || 0) / 1000)}s`,
            rateLimited: true
        };
    }

    const params = new URLSearchParams({
        q: query,
        apiKey: NEWS_API_KEY,
        pageSize: String(options?.pageSize || 20),
        sortBy: options?.sortBy || "publishedAt",
    });

    if (options?.language) params.append("language", options.language);
    if (options?.from) params.append("from", options.from);
    if (options?.to) params.append("to", options.to);

    try {
        const endpoint = options?.country
            ? `${NEWS_API_BASE}/top-headlines?country=${options.country}&${params}`
            : `${NEWS_API_BASE}/everything?${params}`;

        const response = await fetch(endpoint);
        recordRequest(); // Track the request for rate limiting
        const data = await response.json();

        if (data.status !== "ok") {
            return { error: data.message || "NewsAPI error" };
        }

        return { data };
    } catch (err) {
        console.error("[NewsAPI] Exception:", err);
        return { error: String(err) };
    }
}

/**
 * Search for bookmaker-related news in a specific country
 * Convenience function for the Collector Agent
 */
export async function searchBookmakerNews(
    geo: string = "br",
    daysBack: number = 7
): Promise<{ data?: NewsSearchResult; error?: string }> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);

    return searchNews("betting OR bookmaker OR apostas OR casa de apostas", {
        language: geo === "br" ? "pt" : "en",
        from: fromDate.toISOString().split("T")[0],
        sortBy: "relevancy",
        pageSize: 50,
    });
}
