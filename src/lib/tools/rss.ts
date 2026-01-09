/**
 * RSS Feed Tool
 * Fetch news from curated industry sources for LatAm betting market
 */

// ============================================================
// Industry RSS Sources (Curated for Quality)
// ============================================================

const INDUSTRY_SOURCES = [
    {
        name: 'SBC Americas',
        url: 'https://sbcamericas.com/feed/',
        region: 'latam',
        quality: 5,
        language: 'en',
    },
    {
        name: 'iGaming Brazil',
        url: 'https://igamingbrazil.com/feed/',
        region: 'br',
        quality: 5,
        language: 'pt',
    },
    {
        name: 'Yogonet Latam',
        url: 'https://www.yogonet.com/latinoamerica/rss/noticias.xml',
        region: 'latam',
        quality: 4,
        language: 'es',
    },
    {
        name: 'Gaming Post',
        url: 'https://gamingpost.com.br/feed/',
        region: 'br',
        quality: 4,
        language: 'pt',
    },
    {
        name: 'iGaming Business',
        url: 'https://igamingbusiness.com/feed/',
        region: 'global',
        quality: 5,
        language: 'en',
    },
];

// ============================================================
// Types
// ============================================================

export interface RSSArticle {
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    quality: number;
    language: string;
}

export interface RSSSearchResult {
    articles: RSSArticle[];
    sources_checked: string[];
    errors: string[];
}

// ============================================================
// RSS Parsing
// ============================================================

/**
 * Parse RSS XML to extract articles
 */
function parseRSSXml(xml: string, sourceName: string, quality: number, language: string): RSSArticle[] {
    const articles: RSSArticle[] = [];

    // Simple regex-based parsing (no external dependencies)
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const matches = xml.matchAll(itemRegex);

    for (const match of matches) {
        const itemContent = match[1];

        // Extract fields
        const title = extractTag(itemContent, 'title');
        const description = extractTag(itemContent, 'description') || extractTag(itemContent, 'content:encoded');
        const link = extractTag(itemContent, 'link') || extractTag(itemContent, 'guid');
        const pubDate = extractTag(itemContent, 'pubDate');

        if (title && link) {
            articles.push({
                title: cleanHtml(title),
                description: cleanHtml(description || '').slice(0, 500),
                url: link.trim(),
                source: sourceName,
                publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                quality,
                language,
            });
        }
    }

    return articles;
}

function extractTag(content: string, tag: string): string {
    // Handle CDATA
    const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
    const cdataMatch = content.match(cdataRegex);
    if (cdataMatch) return cdataMatch[1];

    // Handle regular tags
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = content.match(regex);
    return match ? match[1] : '';
}

function cleanHtml(text: string): string {
    return text
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

// ============================================================
// Fetch Functions
// ============================================================

/**
 * Fetch and parse a single RSS feed
 */
async function fetchRSSFeed(
    source: typeof INDUSTRY_SOURCES[0]
): Promise<{ articles: RSSArticle[]; error?: string }> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(source.url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'E2-Market-Intelligence/1.0',
            },
        });

        clearTimeout(timeout);

        if (!response.ok) {
            return { articles: [], error: `HTTP ${response.status}` };
        }

        const xml = await response.text();
        const articles = parseRSSXml(xml, source.name, source.quality, source.language);

        console.log(`[RSS] ${source.name}: ${articles.length} articles`);
        return { articles };

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.warn(`[RSS] ${source.name} failed: ${errorMessage}`);
        return { articles: [], error: errorMessage };
    }
}

/**
 * Search industry RSS feeds for keywords
 */
export async function searchIndustryNews(
    keywords: string[],
    options?: {
        region?: string;
        maxDaysOld?: number;
        limit?: number;
    }
): Promise<RSSSearchResult> {
    const { region, maxDaysOld = 30, limit = 20 } = options || {};

    // Filter sources by region if specified
    const sourcesToFetch = region
        ? INDUSTRY_SOURCES.filter(s => s.region === region || s.region === 'global' || s.region === 'latam')
        : INDUSTRY_SOURCES;

    console.log(`[RSS] Searching ${sourcesToFetch.length} sources for: ${keywords.join(', ')}`);

    // Fetch all feeds in parallel
    const feedResults = await Promise.all(
        sourcesToFetch.map(source => fetchRSSFeed(source))
    );

    // Collect all articles
    let allArticles: RSSArticle[] = [];
    const errors: string[] = [];

    feedResults.forEach((result, i) => {
        if (result.error) {
            errors.push(`${sourcesToFetch[i].name}: ${result.error}`);
        }
        allArticles.push(...result.articles);
    });

    // Filter by keywords
    const keywordLower = keywords.map(k => k.toLowerCase());
    allArticles = allArticles.filter(article => {
        const searchText = `${article.title} ${article.description}`.toLowerCase();
        return keywordLower.some(kw => searchText.includes(kw));
    });

    // Filter by date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxDaysOld);
    allArticles = allArticles.filter(article => {
        const articleDate = new Date(article.publishedAt);
        return articleDate >= cutoffDate;
    });

    // Sort by quality and date
    allArticles.sort((a, b) => {
        if (b.quality !== a.quality) return b.quality - a.quality;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    // Limit results
    allArticles = allArticles.slice(0, limit);

    console.log(`[RSS] Found ${allArticles.length} matching articles`);

    return {
        articles: allArticles,
        sources_checked: sourcesToFetch.map(s => s.name),
        errors,
    };
}

/**
 * Get recent industry news (no keyword filter)
 */
export async function getRecentIndustryNews(
    region?: string,
    limit = 30
): Promise<RSSSearchResult> {
    const sourcesToFetch = region
        ? INDUSTRY_SOURCES.filter(s => s.region === region || s.region === 'global' || s.region === 'latam')
        : INDUSTRY_SOURCES;

    console.log(`[RSS] Fetching recent news from ${sourcesToFetch.length} sources`);

    const feedResults = await Promise.all(
        sourcesToFetch.map(source => fetchRSSFeed(source))
    );

    let allArticles: RSSArticle[] = [];
    const errors: string[] = [];

    feedResults.forEach((result, i) => {
        if (result.error) {
            errors.push(`${sourcesToFetch[i].name}: ${result.error}`);
        }
        allArticles.push(...result.articles);
    });

    // Sort by date (most recent first)
    allArticles.sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return {
        articles: allArticles.slice(0, limit),
        sources_checked: sourcesToFetch.map(s => s.name),
        errors,
    };
}

// ============================================================
// Tool Definition for Agent Use
// ============================================================

export const RSS_TOOL_DEFINITION = {
    name: 'search_industry_news',
    description: `Search curated industry news sources for betting/gambling market intelligence. 
Returns high-quality articles from: SBC Americas, iGaming Brazil, Yogonet, Gaming Post.
Much better than general news search - these are REAL industry publications, not SEO spam.`,
    input_schema: {
        type: 'object',
        properties: {
            keywords: {
                type: 'array',
                items: { type: 'string' },
                description: 'Keywords to search for (e.g., ["parimatch", "brazil", "license"])',
            },
            region: {
                type: 'string',
                description: 'Region filter: "br", "latam", or leave empty for all',
            },
        },
        required: ['keywords'],
    },
};
