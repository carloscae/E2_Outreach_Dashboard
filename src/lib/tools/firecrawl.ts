/**
 * Firecrawl API Integration
 * Web crawling for betting widget detection on publisher sites
 * 
 * Used to analyze publisher pages and detect:
 * - Betting widgets (odds displays, bet slips)
 * - Affiliate links (tracking parameters)
 * - Bookmaker integrations (iframes, scripts)
 */

import Anthropic from '@anthropic-ai/sdk';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const FIRECRAWL_BASE_URL = 'https://api.firecrawl.dev/v1';

// ============================================================
// Types
// ============================================================

export interface FirecrawlScrapeResult {
    success: boolean;
    data?: {
        markdown: string;
        html?: string;
        links?: string[];
        metadata?: {
            title?: string;
            description?: string;
            language?: string;
            sourceURL?: string;
        };
    };
    error?: string;
}

export interface BettingDetectionResult {
    hasBetting: boolean;
    confidence: number; // 0-1
    indicators: BettingIndicator[];
    recommendation: 'HIGH_OPPORTUNITY' | 'LOW_PRIORITY' | 'NEEDS_REVIEW';
}

export interface BettingIndicator {
    type: 'odds_widget' | 'affiliate_link' | 'bookmaker_iframe' | 'betting_script' | 'odds_api';
    description: string;
    evidence?: string;
}

export interface PublisherAnalysis {
    url: string;
    domain: string;
    title: string;
    contentSummary: string;
    sportsCategories: string[];
    bettingDetection: BettingDetectionResult;
    crawledAt: string;
}

// ============================================================
// API Functions
// ============================================================

/**
 * Scrape a URL using Firecrawl
 * Returns LLM-ready markdown content
 */
export async function scrapeUrl(
    url: string,
    options: {
        onlyMainContent?: boolean;
        includeLinks?: boolean;
    } = {}
): Promise<FirecrawlScrapeResult> {
    if (!FIRECRAWL_API_KEY) {
        console.error('[Firecrawl] Missing FIRECRAWL_API_KEY');
        return { success: false, error: 'Missing API key' };
    }

    const { onlyMainContent = true, includeLinks = true } = options;

    try {
        console.log(`[Firecrawl] 🕷️ Scraping: ${url}`);

        const response = await fetch(`${FIRECRAWL_BASE_URL}/scrape`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url,
                formats: ['markdown'],
                onlyMainContent,
                includeLinks,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Firecrawl] API error: ${response.status} - ${errorText}`);
            return { success: false, error: `API error: ${response.status}` };
        }

        const data = await response.json();

        if (!data.success) {
            return { success: false, error: data.error || 'Scrape failed' };
        }

        console.log(`[Firecrawl]    → Content length: ${data.data?.markdown?.length || 0} chars`);

        return {
            success: true,
            data: {
                markdown: data.data?.markdown || '',
                links: data.data?.links || [],
                metadata: data.data?.metadata,
            },
        };
    } catch (err) {
        console.error('[Firecrawl] Request failed:', err);
        return { success: false, error: String(err) };
    }
}

/**
 * Analyze a publisher site for betting integrations
 * Uses Claude to detect odds widgets and affiliate links
 */
export async function analyzePublisherForBetting(
    url: string
): Promise<PublisherAnalysis | null> {
    // First, scrape the page
    const scrapeResult = await scrapeUrl(url, { includeLinks: true });

    if (!scrapeResult.success || !scrapeResult.data) {
        console.error(`[Firecrawl] Failed to scrape ${url}`);
        return null;
    }

    const { markdown, links, metadata } = scrapeResult.data;

    // Truncate content if too long (save tokens)
    const truncatedContent = markdown.slice(0, 15000);

    // Use Claude to analyze for betting presence
    const bettingDetection = await detectBettingWithAI(truncatedContent, links || []);

    // Extract sports categories from content
    const sportsCategories = extractSportsCategories(markdown);

    return {
        url,
        domain: extractDomain(url),
        title: metadata?.title || '',
        contentSummary: markdown.slice(0, 500),
        sportsCategories,
        bettingDetection,
        crawledAt: new Date().toISOString(),
    };
}

/**
 * Use Claude to detect betting widgets/integrations
 * Looks for any odds display regardless of bookmaker
 */
async function detectBettingWithAI(
    content: string,
    links: string[]
): Promise<BettingDetectionResult> {
    const anthropic = new Anthropic();

    const prompt = `Analyze this publisher website content and detect ANY betting/gambling integrations.

## Content
${content.slice(0, 10000)}

## Outbound Links (sample)
${links.slice(0, 50).join('\n')}

## Detection Criteria
Look for ANY of these signals (regardless of bookmaker brand):

1. **ODDS WIDGETS**: Any display of betting odds (e.g., "2.50", "1.85", fractional odds)
2. **AFFILIATE LINKS**: URLs with tracking parameters (utm_source, ref=, aff=, btag=)
3. **BOOKMAKER IFRAMES**: Embedded betting content
4. **BETTING SCRIPTS**: Third-party betting SDKs or widgets
5. **ODDS API CALLS**: References to odds feeds or betting data providers

## Response Format (JSON only)
{
  "hasBetting": boolean,
  "confidence": 0.0-1.0,
  "indicators": [
    {
      "type": "odds_widget|affiliate_link|bookmaker_iframe|betting_script|odds_api",
      "description": "What was detected",
      "evidence": "Specific example from content"
    }
  ]
}

If NO betting detected, return:
{
  "hasBetting": false,
  "confidence": 0.9,
  "indicators": []
}`;

    try {
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
        });

        const textContent = response.content.find(b => b.type === 'text');
        if (!textContent || textContent.type !== 'text') {
            return { hasBetting: false, confidence: 0.5, indicators: [], recommendation: 'NEEDS_REVIEW' };
        }

        // Extract JSON from response
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { hasBetting: false, confidence: 0.5, indicators: [], recommendation: 'NEEDS_REVIEW' };
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Determine recommendation
        let recommendation: 'HIGH_OPPORTUNITY' | 'LOW_PRIORITY' | 'NEEDS_REVIEW';
        if (!parsed.hasBetting && parsed.confidence > 0.7) {
            recommendation = 'HIGH_OPPORTUNITY'; // No betting = opportunity
        } else if (parsed.hasBetting && parsed.confidence > 0.7) {
            recommendation = 'LOW_PRIORITY'; // Already has betting
        } else {
            recommendation = 'NEEDS_REVIEW';
        }

        return {
            hasBetting: parsed.hasBetting,
            confidence: parsed.confidence,
            indicators: parsed.indicators || [],
            recommendation,
        };
    } catch (err) {
        console.error('[Firecrawl] AI detection failed:', err);
        return { hasBetting: false, confidence: 0, indicators: [], recommendation: 'NEEDS_REVIEW' };
    }
}

/**
 * Batch analyze multiple publishers
 */
export async function batchAnalyzePublishers(
    urls: string[],
    options: { concurrency?: number } = {}
): Promise<PublisherAnalysis[]> {
    const { concurrency = 3 } = options;
    const results: PublisherAnalysis[] = [];

    // Process in batches
    for (let i = 0; i < urls.length; i += concurrency) {
        const batch = urls.slice(i, i + concurrency);
        const batchPromises = batch.map(url => analyzePublisherForBetting(url));
        const batchResults = await Promise.all(batchPromises);

        for (const result of batchResults) {
            if (result) results.push(result);
        }

        // Rate limiting between batches
        if (i + concurrency < urls.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return results;
}

// ============================================================
// Helpers
// ============================================================

function extractDomain(url: string): string {
    try {
        const parsed = new URL(url);
        return parsed.hostname.replace('www.', '');
    } catch {
        return url;
    }
}

function extractSportsCategories(content: string): string[] {
    const categories: string[] = [];
    const lowerContent = content.toLowerCase();

    const sportKeywords = {
        'futebol': ['futebol', 'brasileirão', 'libertadores', 'copa do brasil'],
        'basquete': ['basquete', 'nba', 'basketball'],
        'tênis': ['tênis', 'tennis', 'atp', 'wta'],
        'automobilismo': ['fórmula 1', 'f1', 'automobilismo', 'nascar'],
        'mma': ['ufc', 'mma', 'bellator'],
        'esports': ['esports', 'lol', 'cs2', 'valorant'],
        'vôlei': ['vôlei', 'voleibol', 'superliga'],
    };

    for (const [category, keywords] of Object.entries(sportKeywords)) {
        if (keywords.some(kw => lowerContent.includes(kw))) {
            categories.push(category);
        }
    }

    return categories.length > 0 ? categories : ['esportes gerais'];
}
