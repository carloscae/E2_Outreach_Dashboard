/**
 * Article-First Collector
 * 
 * Different approach: Instead of extracting entities and scoring them,
 * we show the ACTUAL high-quality articles as evidence.
 * 
 * Flow:
 * 1. Fetch recent industry news (no keyword filter - get everything)
 * 2. Group articles by company/topic mentioned
 * 3. REGULATORY articles → Store in GEO context for user review (dashboard cards)
 * 4. Entity articles → Create signals with REAL headlines as evidence
 */

import { getRecentIndustryNews, type RSSArticle } from '@/lib/tools/rss';
import { createSignal } from '@/lib/db/signals';
import { startAgentRun, completeAgentRun } from '@/lib/db/agent-runs';
import { addPendingRegulatoryNews } from '@/data/geo-context';
import type { SignalEvidence } from '@/types/database';

// ============================================================
// Types
// ============================================================

interface CollectorInput {
    geo: string;
    daysBack?: number;
}

interface CollectorOutput {
    signals_found: number;
    signals_stored: number;
    entities_discovered: string[];
    articles_processed: number;
}

// ============================================================
// Article Analysis
// ============================================================

interface ArticleCluster {
    topic: string;
    type: 'REGULATORY' | 'MARKET_ENTRY' | 'PARTNERSHIP' | 'EXPANSION' | 'INDUSTRY_NEWS';
    articles: RSSArticle[];
    entities: string[];
}

// Brazil-specific keywords for regulatory news filtering
const BRAZIL_KEYWORDS = [
    'brazil', 'brasil', 'brazilian', 'brasileiro', 'brasileira',
    'spa', 'secretaria de prêmios', 'ministério da fazenda', 'fazenda',
    'loterj', 'caixa', 'são paulo', 'rio de janeiro', 'minas gerais',
    'lei 14.790', '14790', 'bets', 'apostas',
];

// Non-Brazil keywords to filter out
const NON_BRAZIL_KEYWORDS = [
    'virginia', 'new york', 'california', 'florida', 'texas', 'ohio',
    'uk', 'united kingdom', 'germany', 'spain', 'italy', 'france',
    'ontario', 'canada', 'australia', 'india', 'africa',
];

/**
 * Check if article is Brazil-relevant
 */
function isBrazilRelevant(article: RSSArticle): boolean {
    const text = `${article.title} ${article.description}`.toLowerCase();

    // Must contain Brazil keyword
    const hasBrazilKeyword = BRAZIL_KEYWORDS.some(kw => text.includes(kw));

    // Must NOT contain non-Brazil keywords (unless also has Brazil keyword)
    const hasNonBrazilKeyword = NON_BRAZIL_KEYWORDS.some(kw => text.includes(kw));

    // If it's from a Brazil source (iGaming Brazil), be more lenient
    const isBrazilSource = article.source.toLowerCase().includes('brazil') ||
        article.source.toLowerCase().includes('brasil');

    if (isBrazilSource) return !hasNonBrazilKeyword;
    return hasBrazilKeyword && !hasNonBrazilKeyword;
}

/**
 * Categorize article based on keywords
 * REGULATORY only if Brazil-relevant AND no specific entity mentioned
 */
function categorizeArticle(article: RSSArticle, geo: string): ArticleCluster['type'] {
    const text = `${article.title} ${article.description}`.toLowerCase();
    const companies = extractCompanyNames(article);

    // Check if it's regulatory content
    const isRegulatoryContent = text.includes('licen') || text.includes('regulat') ||
        text.includes('law') || text.includes('lei') || text.includes('regul') ||
        text.includes('secretaria') || text.includes('ministry') ||
        text.includes('governo') || text.includes('legisl') || text.includes('tribunal');

    // REGULATORY: Must be regulatory + Brazil-relevant + NOT entity-specific
    if (isRegulatoryContent && geo === 'br') {
        const isBrazilNews = isBrazilRelevant(article);
        const hasEntity = companies.length > 0;

        // If it mentions a specific company, it's a signal about that company, not regulatory context
        if (isBrazilNews && !hasEntity) {
            return 'REGULATORY';
        }
    }

    // Entity-specific signal types
    if (text.includes('launch') || text.includes('lança') || text.includes('debut') ||
        text.includes('enter') || text.includes('estreia')) {
        return 'MARKET_ENTRY';
    }

    if (text.includes('partner') || text.includes('sponsor') || text.includes('patroci') ||
        text.includes('deal') || text.includes('acordo') || text.includes('agreement')) {
        return 'PARTNERSHIP';
    }

    if (text.includes('expan') || text.includes('growth') || text.includes('cresci') ||
        text.includes('internacional') || text.includes('global') || text.includes('novo mercado')) {
        return 'EXPANSION';
    }

    return 'INDUSTRY_NEWS';
}

/**
 * Extract potential company names from article
 */
function extractCompanyNames(article: RSSArticle): string[] {
    const text = `${article.title} ${article.description}`;
    const names: string[] = [];

    // Known betting companies
    const knownOperators = [
        'bet365', 'betfair', 'betano', 'betway', 'bwin', 'pinnacle',
        'parimatch', 'stake', 'pokerstars', 'draftkings', 'fanduel',
        '1xbet', '22bet', 'melbet', 'mostbet', 'superbet', 'leovegas',
        'pixbet', 'sportingbet', 'galera', 'estrelabet', 'kto', 'rivalo',
        'bodog', 'betsson', 'netbet', 'betcris', 'caliente', 'codere',
        'playtech', 'evolution', 'microgaming', 'pragmatic', 'novomatic',
        'entain', 'flutter', 'draftkings', 'caesars', 'mgm', 'wynn',
        'polymarket', 'kalshi', 'fliff', // Prediction markets too
    ];

    const lowerText = text.toLowerCase();
    for (const name of knownOperators) {
        if (lowerText.includes(name)) {
            names.push(name.charAt(0).toUpperCase() + name.slice(1));
        }
    }

    // Also look for capitalized words that might be companies
    const capitalizedPattern = /\b([A-Z][a-z]+(?:bet|Bet|gaming|Gaming|poker|Poker))\b/g;
    const matches = text.matchAll(capitalizedPattern);
    for (const match of matches) {
        if (!names.includes(match[1])) {
            names.push(match[1]);
        }
    }

    return names;
}

// ============================================================
// Main Collector
// ============================================================

export async function runArticleFirstCollector(
    input: CollectorInput
): Promise<{ success: boolean; data?: CollectorOutput; error?: string }> {
    const { geo, daysBack = 14 } = input;

    console.log(`[ArticleCollector] 🚀 Starting for ${geo.toUpperCase()}`);

    let agentRun;
    try {
        agentRun = await startAgentRun('collector', { geo, daysBack, mode: 'article-first' });
    } catch (err) {
        console.error('[ArticleCollector] Failed to start agent run:', err);
        return { success: false, error: 'Failed to start agent run' };
    }

    try {
        // ========================================
        // Step 1: Fetch ALL recent industry news
        // ========================================
        console.log(`[ArticleCollector] 📰 Fetching recent industry news...`);

        const newsResult = await getRecentIndustryNews(
            geo === 'br' ? 'br' : 'latam',
            50 // Get more articles
        );

        console.log(`[ArticleCollector]    → Found ${newsResult.articles.length} articles`);

        if (newsResult.articles.length === 0) {
            console.log('[ArticleCollector] ⚠️ No articles found');
            await completeAgentRun(agentRun.id, { output_summary: { articles_found: 0 } });
            return {
                success: true,
                data: { signals_found: 0, signals_stored: 0, entities_discovered: [], articles_processed: 0 },
            };
        }

        // ========================================
        // Step 2: Categorize and cluster articles
        // ========================================
        console.log(`[ArticleCollector] 🔍 Categorizing articles...`);

        const articlesByType: Record<string, RSSArticle[]> = {
            REGULATORY: [],
            MARKET_ENTRY: [],
            PARTNERSHIP: [],
            EXPANSION: [],
            INDUSTRY_NEWS: [],
        };

        for (const article of newsResult.articles) {
            const type = categorizeArticle(article, geo);
            articlesByType[type].push(article);
        }

        console.log(`[ArticleCollector]    → REGULATORY: ${articlesByType.REGULATORY.length}`);
        console.log(`[ArticleCollector]    → MARKET_ENTRY: ${articlesByType.MARKET_ENTRY.length}`);
        console.log(`[ArticleCollector]    → PARTNERSHIP: ${articlesByType.PARTNERSHIP.length}`);
        console.log(`[ArticleCollector]    → EXPANSION: ${articlesByType.EXPANSION.length}`);
        console.log(`[ArticleCollector]    → INDUSTRY_NEWS: ${articlesByType.INDUSTRY_NEWS.length}`);

        // ========================================
        // Step 3: Store REGULATORY news for user review
        // ========================================
        console.log(`[ArticleCollector] 📋 Processing regulatory news for dashboard...`);

        const regulatoryArticles = articlesByType.REGULATORY;
        const regulatoryNewsStored: string[] = [];

        for (const article of regulatoryArticles.slice(0, 5)) {
            try {
                const news = addPendingRegulatoryNews({
                    headline: article.title,
                    url: article.url,
                    source: article.source,
                    publishedAt: article.publishedAt,
                });
                regulatoryNewsStored.push(news.id);
                console.log(`[ArticleCollector] 📋 Regulatory: "${article.title.slice(0, 50)}..." (pending review)`);
            } catch (err) {
                console.error(`[ArticleCollector] Failed to store regulatory news:`, err);
            }
        }

        // ========================================
        // Step 4: Create signals from ENTITY articles
        // ========================================
        console.log(`[ArticleCollector] 💾 Creating signals from entity articles...`);

        const signalsStored: string[] = [];
        const entitiesDiscovered: string[] = [];

        // Process entity-related article types (not REGULATORY - those are in GEO context)
        const entityTypes: Array<'MARKET_ENTRY' | 'PARTNERSHIP' | 'EXPANSION' | 'INDUSTRY_NEWS'> = [
            'MARKET_ENTRY',
            'PARTNERSHIP',
            'EXPANSION',
            'INDUSTRY_NEWS',
        ];

        for (const signalType of entityTypes) {
            const articles = articlesByType[signalType].slice(0, 3); // Top 3 per category

            for (const article of articles) {
                const companies = extractCompanyNames(article);

                // Skip articles without entity names - they're not actionable
                if (companies.length === 0) {
                    console.log(`[ArticleCollector] ⏭️ Skipping (no entity): "${article.title.slice(0, 40)}..."`);
                    continue;
                }

                const entityName = companies.join(', ');

                // Build evidence from the actual article
                const evidence: SignalEvidence[] = [{
                    source: article.source,
                    headline: article.title,
                    url: article.url,
                    description: article.description.slice(0, 300),
                    publishedAt: article.publishedAt,
                    confidence: article.quality >= 5 ? 0.9 : 0.7,
                }];

                // Calculate score based on article quality and type
                let score = 5; // Base score
                if (article.quality >= 5) score += 2;
                if (signalType === 'MARKET_ENTRY') score += 2;
                if (signalType === 'PARTNERSHIP') score += 1;
                if (companies.length > 1) score += 1; // Multiple companies mentioned
                score = Math.min(10, score);

                try {
                    const signal = await createSignal({
                        entity_name: entityName,
                        entity_type: 'bookmaker',
                        geo,
                        signal_type: signalType,
                        evidence,
                        preliminary_score: score,
                        source_urls: [article.url],
                        agent_run_id: agentRun.id,
                    });

                    signalsStored.push(signal.id);
                    entitiesDiscovered.push(entityName);
                    console.log(`[ArticleCollector] ✅ ${signalType}: ${entityName} (score: ${score})`);

                } catch (err) {
                    console.error(`[ArticleCollector] Failed to store signal:`, err);
                }
            }
        }


        // Complete run
        await completeAgentRun(agentRun.id, {
            output_summary: {
                articles_processed: newsResult.articles.length,
                signals_stored: signalsStored.length,
                entities_discovered: entitiesDiscovered,
            },
        });

        console.log(`[ArticleCollector] 🏁 Complete: ${signalsStored.length} signals from ${newsResult.articles.length} articles`);

        return {
            success: true,
            data: {
                signals_found: signalsStored.length,
                signals_stored: signalsStored.length,
                entities_discovered: entitiesDiscovered,
                articles_processed: newsResult.articles.length,
            },
        };

    } catch (err) {
        console.error('[ArticleCollector] Exception:', err);
        await completeAgentRun(agentRun.id, { error: String(err) });
        return { success: false, error: String(err) };
    }
}
