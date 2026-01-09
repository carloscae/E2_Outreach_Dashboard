/**
 * Reddit Tool
 * Search Reddit for bookmaker/betting discussions and sentiment
 * Uses Reddit's public JSON API (no authentication required for public posts)
 */

// ============================================================
// Configuration
// ============================================================

const REDDIT_BASE = 'https://www.reddit.com';

// Relevant subreddits for Brazil betting market
const BRAZIL_SUBREDDITS = [
    'brasil',
    'investimentos',
    'futebol',
    'sportsbook',
];

// Rate limiting (Reddit public API is generous but let's be respectful)
const RATE_LIMIT = {
    minDelayMs: 2000,
    lastRequest: 0,
};

async function respectRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - RATE_LIMIT.lastRequest;
    if (elapsed < RATE_LIMIT.minDelayMs) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT.minDelayMs - elapsed));
    }
    RATE_LIMIT.lastRequest = Date.now();
}

// ============================================================
// Types
// ============================================================

export interface RedditPost {
    title: string;
    selftext: string;
    url: string;
    subreddit: string;
    author: string;
    score: number;
    numComments: number;
    createdAt: string;
    permalink: string;
}

export interface RedditSearchResult {
    posts: RedditPost[];
    subredditsSearched: string[];
    mentionCount: number;
    sentimentIndicators: {
        positive: number;
        negative: number;
        neutral: number;
    };
    error?: string;
}

// ============================================================
// Sentiment Analysis (Simple keyword-based)
// ============================================================

const POSITIVE_KEYWORDS = [
    'recomendo', 'melhor', 'excelente', 'ótimo', 'confiável', 'rápido', 'pagou',
    'recommend', 'great', 'excellent', 'reliable', 'fast', 'paid', 'legit',
    'bom', 'legal', 'funciona', 'works', 'good',
];

const NEGATIVE_KEYWORDS = [
    'golpe', 'scam', 'fraude', 'não pagou', 'roubou', 'evite', 'péssimo',
    'scam', 'fraud', 'avoid', 'terrible', 'worst', 'stolen', 'never paid',
    'ruim', 'problema', 'cuidado', 'warning', 'bad', 'issue',
];

function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const lowerText = text.toLowerCase();

    let positiveScore = 0;
    let negativeScore = 0;

    for (const keyword of POSITIVE_KEYWORDS) {
        if (lowerText.includes(keyword)) positiveScore++;
    }

    for (const keyword of NEGATIVE_KEYWORDS) {
        if (lowerText.includes(keyword)) negativeScore++;
    }

    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
}

// ============================================================
// Reddit API Functions
// ============================================================

/**
 * Search Reddit for posts mentioning specific keywords
 */
async function searchReddit(
    query: string,
    subreddit?: string,
    limit = 25
): Promise<RedditPost[]> {
    await respectRateLimit();

    try {
        const url = subreddit
            ? `${REDDIT_BASE}/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&limit=${limit}&sort=relevance&t=month`
            : `${REDDIT_BASE}/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance&t=month`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'E2-Market-Intelligence/1.0',
            },
        });

        if (!response.ok) {
            console.warn(`[Reddit] Search failed: HTTP ${response.status}`);
            return [];
        }

        const data = await response.json();
        const posts: RedditPost[] = [];

        for (const child of data.data?.children || []) {
            const post = child.data;
            posts.push({
                title: post.title || '',
                selftext: (post.selftext || '').slice(0, 500),
                url: post.url || '',
                subreddit: post.subreddit || '',
                author: post.author || '[deleted]',
                score: post.score || 0,
                numComments: post.num_comments || 0,
                createdAt: new Date(post.created_utc * 1000).toISOString(),
                permalink: `${REDDIT_BASE}${post.permalink}`,
            });
        }

        return posts;

    } catch (err) {
        console.error('[Reddit] Search error:', err);
        return [];
    }
}

/**
 * Search for bookmaker mentions across relevant subreddits
 */
export async function searchBookmakerMentions(
    bookmakerName: string,
    options?: {
        region?: string;
        includeComments?: boolean;
    }
): Promise<RedditSearchResult> {
    const { region = 'br' } = options || {};

    // Select subreddits based on region
    const subreddits = region === 'br' ? BRAZIL_SUBREDDITS : ['sportsbook', 'gambling'];

    console.log(`[Reddit] Searching for "${bookmakerName}" in ${subreddits.length} subreddits`);

    const allPosts: RedditPost[] = [];

    // Search each subreddit
    for (const subreddit of subreddits) {
        const posts = await searchReddit(bookmakerName, subreddit, 10);
        allPosts.push(...posts);
    }

    // Also do a general search
    const generalPosts = await searchReddit(`${bookmakerName} betting OR apostas`, undefined, 15);
    allPosts.push(...generalPosts);

    // Deduplicate by permalink
    const uniquePosts = Array.from(
        new Map(allPosts.map(p => [p.permalink, p])).values()
    );

    // Analyze sentiment
    const sentimentIndicators = { positive: 0, negative: 0, neutral: 0 };
    for (const post of uniquePosts) {
        const text = `${post.title} ${post.selftext}`;
        const sentiment = analyzeSentiment(text);
        sentimentIndicators[sentiment]++;
    }

    // Sort by score (upvotes)
    uniquePosts.sort((a, b) => b.score - a.score);

    console.log(`[Reddit] Found ${uniquePosts.length} posts, sentiment: +${sentimentIndicators.positive} / -${sentimentIndicators.negative}`);

    return {
        posts: uniquePosts.slice(0, 20),
        subredditsSearched: subreddits,
        mentionCount: uniquePosts.length,
        sentimentIndicators,
    };
}

/**
 * Get trending betting discussions
 */
export async function getTrendingBettingDiscussions(
    region = 'br',
    limit = 20
): Promise<RedditSearchResult> {
    const subreddits = region === 'br' ? BRAZIL_SUBREDDITS : ['sportsbook', 'gambling'];

    console.log(`[Reddit] Fetching trending betting discussions`);

    // Search for general betting topics
    const bettingTerms = region === 'br'
        ? 'casa de apostas OR bookmaker OR bet OR aposta'
        : 'bookmaker OR sportsbook OR betting site';

    const allPosts: RedditPost[] = [];

    for (const subreddit of subreddits) {
        const posts = await searchReddit(bettingTerms, subreddit, 10);
        allPosts.push(...posts);
    }

    // Deduplicate
    const uniquePosts = Array.from(
        new Map(allPosts.map(p => [p.permalink, p])).values()
    );

    // Analyze sentiment
    const sentimentIndicators = { positive: 0, negative: 0, neutral: 0 };
    for (const post of uniquePosts) {
        const text = `${post.title} ${post.selftext}`;
        const sentiment = analyzeSentiment(text);
        sentimentIndicators[sentiment]++;
    }

    // Sort by recency and score
    uniquePosts.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
    });

    return {
        posts: uniquePosts.slice(0, limit),
        subredditsSearched: subreddits,
        mentionCount: uniquePosts.length,
        sentimentIndicators,
    };
}

// ============================================================
// Tool Definition for Agent Use
// ============================================================

export const REDDIT_TOOL_DEFINITION = {
    name: 'search_reddit',
    description: `Search Reddit for bookmaker/betting discussions and sentiment.
Returns real user discussions from subreddits like r/brasil, r/sportsbook.
Includes sentiment analysis (positive/negative/neutral) based on keywords.
Great for validating if a bookmaker has real user traction.`,
    input_schema: {
        type: 'object',
        properties: {
            bookmaker_name: {
                type: 'string',
                description: 'Name of the bookmaker to search for (e.g., "Bet365", "Parimatch")',
            },
            region: {
                type: 'string',
                description: 'Region for subreddit selection: "br" (Brazil) or "global"',
            },
        },
        required: ['bookmaker_name'],
    },
};
