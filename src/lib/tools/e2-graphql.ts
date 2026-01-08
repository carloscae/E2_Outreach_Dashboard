/**
 * E2 GraphQL Tool - Enhanced Partnership Detection
 * 
 * Partnership Tiers:
 * - AFFILIATE_PARTNER: Has promotions/bonuses (affiliate deal exists)
 * - KNOWN_BOOKIE: Exists in E2 bookies table but no active deal
 * - NEW_PROSPECT: Not in E2 system (best opportunity)
 * 
 * Uses the E2 GraphQL API to check for:
 * 1. Bookie existence in E2 database
 * 2. Promotion/bonus entries (indicates affiliate relationship)
 */

// ============================================================
// Types
// ============================================================

export type PartnershipTier =
    | 'AFFILIATE_PARTNER'  // Has promotions/bonuses - existing deal
    | 'KNOWN_BOOKIE'       // In E2 system but no promotions
    | 'NEW_PROSPECT';      // Not in E2 - opportunity!

export interface E2PartnerCheckResult {
    tier: PartnershipTier;
    isOpportunity: boolean;      // true if NEW_PROSPECT
    bookieId?: string;
    bookieName?: string;
    matchScore: number;          // 0-1 similarity score
    promotionCount: number;      // Number of promotions (0 = no affiliate deal)
    details: string;             // Human-readable explanation
    error?: string;
}

export interface E2Bookie {
    id: string;
    name: string;
    slug: string;
    promotionCount?: number;
}

// ============================================================
// Bookie Cache (refreshed periodically)
// ============================================================

interface BookieCache {
    bookies: E2Bookie[];
    lastRefresh: number;
    ttl: number;
}

const bookieCache: BookieCache = {
    bookies: [],
    lastRefresh: 0,
    ttl: 60 * 60 * 1000, // 1 hour
};

// E2 GraphQL endpoint (for direct HTTP calls)
const E2_GRAPHQL_URL = process.env.E2_GRAPHQL_URL || 'https://e2api.odds.team/graphql';
const E2_GRAPHQL_TOKEN = process.env.E2_GRAPHQL_TOKEN || '';

/**
 * Execute a GraphQL query against E2 API
 */
async function executeE2Query<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
        const response = await fetch(E2_GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(E2_GRAPHQL_TOKEN ? { 'Authorization': `Bearer ${E2_GRAPHQL_TOKEN}` } : {}),
            },
            body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
            console.error('[E2 GraphQL] HTTP error:', response.status);
            return null;
        }

        const result = await response.json();
        if (result.errors) {
            console.error('[E2 GraphQL] Query errors:', result.errors);
            return null;
        }

        return result.data as T;
    } catch (err) {
        console.error('[E2 GraphQL] Fetch error:', err);
        return null;
    }
}

/**
 * Fetch all bookies from E2 API with pagination
 */
async function fetchAllBookies(): Promise<E2Bookie[]> {
    // Check if cache is valid
    if (bookieCache.bookies.length > 0 &&
        Date.now() - bookieCache.lastRefresh < bookieCache.ttl) {
        return bookieCache.bookies;
    }

    console.log('[E2 GraphQL] Refreshing bookie cache...');

    const allBookies: E2Bookie[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 15) { // Max ~1500 bookies (100 per page * 15 pages)
        const query = `
            query GetBookies($page: Int!) {
                bookies(first: 100, page: $page) {
                    data {
                        id
                        name
                        slug
                    }
                    paginatorInfo {
                        hasMorePages
                    }
                }
            }
        `;

        const data = await executeE2Query<{
            bookies: {
                data: Array<{ id: string; name: string; slug: string }>;
                paginatorInfo: { hasMorePages: boolean };
            };
        }>(query, { page });

        if (!data) {
            console.warn('[E2 GraphQL] Failed to fetch page', page);
            break;
        }

        allBookies.push(...data.bookies.data.map(b => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
        })));

        hasMore = data.bookies.paginatorInfo.hasMorePages;
        page++;
    }

    console.log(`[E2 GraphQL] Cached ${allBookies.length} bookies`);

    bookieCache.bookies = allBookies;
    bookieCache.lastRefresh = Date.now();

    return allBookies;
}

/**
 * Check promotion count for a specific bookie
 */
async function getBookiePromotionCount(bookieId: string): Promise<number> {
    const query = `
        query GetBookiePromotions($id: ID!) {
            bookie(filter: { id: $id }) {
                promotions(first: 1) {
                    paginatorInfo {
                        total
                    }
                }
            }
        }
    `;

    const data = await executeE2Query<{
        bookie: {
            promotions: {
                paginatorInfo: { total: number };
            };
        } | null;
    }>(query, { id: bookieId });

    return data?.bookie?.promotions?.paginatorInfo?.total || 0;
}

// ============================================================
// Name Matching
// ============================================================

/**
 * Calculate similarity score between two strings (0-1)
 * Uses Levenshtein distance normalized by max length
 */
function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;

    // Check if one contains the other
    if (s1.includes(s2) || s2.includes(s1)) {
        return 0.9;
    }

    // Simple Levenshtein distance
    const matrix: number[][] = [];

    for (let i = 0; i <= s1.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    const distance = matrix[s1.length][s2.length];
    const maxLength = Math.max(s1.length, s2.length);
    return 1 - distance / maxLength;
}

/**
 * Find best matching bookie by name
 */
async function findMatchingBookie(
    entityName: string,
    threshold = 0.7
): Promise<{ bookie: E2Bookie; matchScore: number } | null> {
    const bookies = await fetchAllBookies();

    let bestMatch: { bookie: E2Bookie; matchScore: number } | null = null;

    for (const bookie of bookies) {
        const similarity = calculateSimilarity(entityName, bookie.name);

        // Also check slug match
        const slugSimilarity = calculateSimilarity(
            entityName.toLowerCase().replace(/\s+/g, '-'),
            bookie.slug
        );

        const bestSimilarity = Math.max(similarity, slugSimilarity);

        if (bestSimilarity >= threshold) {
            if (!bestMatch || bestSimilarity > bestMatch.matchScore) {
                bestMatch = { bookie, matchScore: bestSimilarity };
            }
        }
    }

    return bestMatch;
}

// ============================================================
// Main Tool Functions
// ============================================================

/**
 * Check E2 partnership status for an entity
 * Returns partnership tier with details
 */
export async function checkE2Partnership(
    entityName: string,
    threshold = 0.7
): Promise<E2PartnerCheckResult> {
    try {
        // Find matching bookie in E2 database
        const match = await findMatchingBookie(entityName, threshold);

        if (!match) {
            // Not found in E2 - this is an opportunity!
            return {
                tier: 'NEW_PROSPECT',
                isOpportunity: true,
                matchScore: 0,
                promotionCount: 0,
                details: `"${entityName}" not found in E2 database - potential new partnership opportunity`,
            };
        }

        // Found in E2 - check for promotions (indicates affiliate deal)
        const promotionCount = await getBookiePromotionCount(match.bookie.id);

        if (promotionCount > 0) {
            // Has promotions - existing affiliate partner, but still opportunity for other products
            return {
                tier: 'AFFILIATE_PARTNER',
                isOpportunity: true,  // Still an opportunity for cross-sell!
                bookieId: match.bookie.id,
                bookieName: match.bookie.name,
                matchScore: match.matchScore,
                promotionCount,
                details: `"${entityName}" matches E2 affiliate partner "${match.bookie.name}" (${promotionCount} promotions). Cross-sell opportunity for E2 Ads, Widget Studio, or SaaS.`,
            };
        }

        // In E2 but no promotions - known but not partnered
        return {
            tier: 'KNOWN_BOOKIE',
            isOpportunity: true, // Could still be an opportunity
            bookieId: match.bookie.id,
            bookieName: match.bookie.name,
            matchScore: match.matchScore,
            promotionCount: 0,
            details: `"${entityName}" matches E2 bookie "${match.bookie.name}" but no active promotions - potential partnership opportunity`,
        };

    } catch (err) {
        console.error('[E2 GraphQL] Error checking partnership:', err);
        return {
            tier: 'NEW_PROSPECT',
            isOpportunity: true,
            matchScore: 0,
            promotionCount: 0,
            details: 'Unable to check E2 partnership status',
            error: String(err),
        };
    }
}

/**
 * Batch check multiple entity names against E2
 */
export async function batchCheckE2Partnerships(
    entityNames: string[],
    threshold = 0.7
): Promise<Map<string, E2PartnerCheckResult>> {
    const results = new Map<string, E2PartnerCheckResult>();

    for (const name of entityNames) {
        const result = await checkE2Partnership(name, threshold);
        results.set(name, result);
    }

    return results;
}

/**
 * Get all known E2 bookies (for debugging/display)
 */
export async function listE2Bookies(): Promise<E2Bookie[]> {
    return fetchAllBookies();
}

/**
 * Refresh the bookie cache
 */
export async function refreshBookieCache(): Promise<void> {
    bookieCache.lastRefresh = 0;
    await fetchAllBookies();
}

/**
 * Get cache stats (for debugging)
 */
export function getCacheStats(): { bookieCount: number; cacheAge: number; ttl: number } {
    return {
        bookieCount: bookieCache.bookies.length,
        cacheAge: Date.now() - bookieCache.lastRefresh,
        ttl: bookieCache.ttl,
    };
}

// ============================================================
// Tool Definition for Agent Use
// ============================================================

export const E2_GRAPHQL_TOOL_DEFINITION = {
    name: 'check_e2_partner',
    description: `Check if a bookmaker is an existing E2 partner. Returns partnership tier:
- AFFILIATE_PARTNER: Has active promotions (skip - already partnered)
- KNOWN_BOOKIE: In E2 database but no promotions (potential opportunity)
- NEW_PROSPECT: Not in E2 system (best opportunity)`,
    input_schema: {
        type: 'object',
        properties: {
            entity_name: {
                type: 'string',
                description: 'Name of the bookmaker/operator to check',
            },
        },
        required: ['entity_name'],
    },
};
