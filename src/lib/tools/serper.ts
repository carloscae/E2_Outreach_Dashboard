/**
 * Serper.dev API Integration
 * Real Google Search data for publisher discovery and trend signals
 * 
 * Replaces simulated Google Trends with actual search data
 */

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const SERPER_BASE_URL = 'https://google.serper.dev';

// ============================================================
// Types
// ============================================================

export interface SerperSearchResult {
    title: string;
    link: string;
    snippet: string;
    position: number;
    domain?: string;
}

export interface SerperSearchResponse {
    searchParameters: {
        q: string;
        gl: string;
        hl: string;
    };
    organic: SerperSearchResult[];
    relatedSearches?: { query: string }[];
    searchInformation?: {
        totalResults: number;
    };
}

export interface SerperAutocompleteResponse {
    suggestions: string[];
    query: string;
}

export interface PublisherDiscoveryResult {
    domain: string;
    title: string;
    snippet: string;
    url: string;
    position: number;
}

// ============================================================
// API Functions
// ============================================================

/**
 * Search Google via Serper.dev
 * Use for discovering Brazilian sports publishers
 */
export async function searchGoogle(
    query: string,
    options: {
        country?: string;  // 'br' for Brazil
        language?: string; // 'pt' for Portuguese
        num?: number;      // Results count (max 100)
    } = {}
): Promise<{ results: SerperSearchResult[]; totalResults: number; error?: string }> {
    if (!SERPER_API_KEY) {
        console.error('[Serper] Missing SERPER_API_KEY');
        return { results: [], totalResults: 0, error: 'Missing API key' };
    }

    const { country = 'br', language = 'pt', num = 20 } = options;

    try {
        console.log(`[Serper] 🔍 Searching: "${query}" (${country}/${language})`);

        const response = await fetch(`${SERPER_BASE_URL}/search`, {
            method: 'POST',
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: query,
                gl: country,
                hl: language,
                num,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Serper] API error: ${response.status} - ${errorText}`);
            return { results: [], totalResults: 0, error: `API error: ${response.status}` };
        }

        const data: SerperSearchResponse = await response.json();

        // Extract domain from each result
        const results = (data.organic || []).map(r => ({
            ...r,
            domain: extractDomain(r.link),
        }));

        console.log(`[Serper]    → Found ${results.length} results`);

        return {
            results,
            totalResults: data.searchInformation?.totalResults || results.length,
        };
    } catch (err) {
        console.error('[Serper] Request failed:', err);
        return { results: [], totalResults: 0, error: String(err) };
    }
}

/**
 * Get Google Autocomplete suggestions
 * Use as trend signal - if a keyword autocompletes, it has search volume
 */
export async function getAutocomplete(
    query: string,
    options: { country?: string } = {}
): Promise<{ suggestions: string[]; hasTrend: boolean; error?: string }> {
    if (!SERPER_API_KEY) {
        return { suggestions: [], hasTrend: false, error: 'Missing API key' };
    }

    const { country = 'br' } = options;

    try {
        console.log(`[Serper] 📊 Autocomplete: "${query}"`);

        const response = await fetch(`${SERPER_BASE_URL}/autocomplete`, {
            method: 'POST',
            headers: {
                'X-API-KEY': SERPER_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: query,
                gl: country,
            }),
        });

        if (!response.ok) {
            return { suggestions: [], hasTrend: false, error: `API error: ${response.status}` };
        }

        const data: SerperAutocompleteResponse = await response.json();
        const suggestions = data.suggestions || [];

        // If the query autocompletes, it indicates search volume (trend signal)
        const hasTrend = suggestions.length > 0;

        console.log(`[Serper]    → ${suggestions.length} suggestions, hasTrend: ${hasTrend}`);

        return { suggestions, hasTrend };
    } catch (err) {
        console.error('[Serper] Autocomplete failed:', err);
        return { suggestions: [], hasTrend: false, error: String(err) };
    }
}

/**
 * Discover Brazilian sports publishers
 * Uses multiple queries to find sports news sites
 */
export async function discoverBrazilianPublishers(
    options: { limit?: number } = {}
): Promise<PublisherDiscoveryResult[]> {
    const { limit = 50 } = options;

    // Discovery queries targeting Brazilian sports publishers
    const queries = [
        'esportes notícias brasil',
        'futebol brasileiro portal',
        'placar ao vivo site:.com.br',
        'brasileirão cobertura',
        'notícias esportivas brasil',
        'portal esportes brasil',
    ];

    const allResults: PublisherDiscoveryResult[] = [];
    const seenDomains = new Set<string>();

    for (const query of queries) {
        const { results } = await searchGoogle(query, { num: 20 });

        for (const result of results) {
            const domain = result.domain;
            if (domain && !seenDomains.has(domain)) {
                seenDomains.add(domain);
                allResults.push({
                    domain,
                    title: result.title,
                    snippet: result.snippet,
                    url: result.link,
                    position: result.position,
                });
            }
        }

        // Rate limiting - avoid hitting API too fast
        await new Promise(resolve => setTimeout(resolve, 200));

        if (allResults.length >= limit) break;
    }

    console.log(`[Serper] 📰 Discovered ${allResults.length} unique publishers`);
    return allResults.slice(0, limit);
}

/**
 * Check search presence for a bookmaker/entity
 * More results = higher market presence
 */
export async function checkSearchPresence(
    entityName: string,
    options: { country?: string } = {}
): Promise<{
    totalResults: number;
    presenceScore: number; // 0-10
    topMentions: string[];
    hasTrend: boolean;
}> {
    const { country = 'br' } = options;

    // Search for the entity
    const searchQuery = `"${entityName}" brasil`;
    const { results, totalResults } = await searchGoogle(searchQuery, { country, num: 10 });

    // Check autocomplete for trend signal
    const { hasTrend } = await getAutocomplete(entityName, { country });

    // Calculate presence score (0-10)
    let presenceScore = 0;
    if (totalResults > 100000) presenceScore = 10;
    else if (totalResults > 50000) presenceScore = 8;
    else if (totalResults > 10000) presenceScore = 6;
    else if (totalResults > 1000) presenceScore = 4;
    else if (totalResults > 100) presenceScore = 2;
    else presenceScore = 1;

    // Bonus for autocomplete presence
    if (hasTrend) presenceScore = Math.min(10, presenceScore + 1);

    const topMentions = results.slice(0, 5).map(r => r.title);

    return {
        totalResults,
        presenceScore,
        topMentions,
        hasTrend,
    };
}

// ============================================================
// Helpers
// ============================================================

function extractDomain(url: string): string {
    try {
        const parsed = new URL(url);
        return parsed.hostname.replace('www.', '');
    } catch {
        return '';
    }
}
