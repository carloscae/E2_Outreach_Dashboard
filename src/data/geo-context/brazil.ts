/**
 * Brazil Market Context
 * Regulatory and market intelligence for AI signal reasoning
 */

export interface RegulatoryNews {
    id: string;
    headline: string;
    headline_en?: string; // English translation for display
    url: string;
    source: string;
    publishedAt: string;
    status: 'pending' | 'applied' | 'ignored';
    appliedAt?: string;
}

export interface GeoContext {
    geo: string;
    name: string;
    regulatory: {
        status: string;
        licensing: string;
        ad_restrictions: string;
        compliance_notes: string[];
        last_updated: string;
    };
    opportunities: {
        when_ad_restricted: string[];
        when_new_operator_enters: string[];
        when_sponsorship_deal: string[];
    };
    pending_news: RegulatoryNews[];
}

export const BRAZIL_CONTEXT: GeoContext = {
    geo: 'br',
    name: 'Brazil',

    regulatory: {
        status: 'Newly regulated (Law 14,790/2023)',
        licensing: 'Active licensing - operators must be authorized under new framework',
        ad_restrictions: 'Emerging watershed norms; ban on misleading claims; 18+ required',
        compliance_notes: [
            'Age-gating: 18+ required, avoid youth content',
            'Affiliate links/ads: Only to authorized operators under Law 14,790/2023',
            'Ad tech: Age filters; geofence to Brazil as needed',
            'Placement: Observe emerging watershed norms',
        ],
        last_updated: '2025-08-08',
    },

    opportunities: {
        when_ad_restricted: [
            '[e2-game-engine] F2P prediction games as compliant engagement alternative',
            '[score-republic] App presence without betting UI (sponsor-only mode)',
            '[e2-ads] ScoreBoard strip for non-betting sponsorship',
        ],
        when_new_operator_enters: [
            '[odds-sdk] Add odds modules to existing platforms quickly',
            '[e2-ads] Contextual monetization with deep links',
            '[score-republic] Rapid market entry with white-label app',
        ],
        when_sponsorship_deal: [
            '[e2-ads] Deep link integration to prefilled betslips',
            '[e2-game-engine] Sponsor-friendly tournament predictor',
            '[score-republic] Branded app with sponsor placements',
        ],
    },

    pending_news: [],
};

/**
 * Get context for AI prompts (token-efficient)
 */
export function getBrazilContextForPrompt(): string {
    const ctx = BRAZIL_CONTEXT;

    let prompt = `## BRAZIL MARKET CONTEXT
Regulatory: ${ctx.regulatory.status}
Licensing: ${ctx.regulatory.licensing}
Ad Restrictions: ${ctx.regulatory.ad_restrictions}

## E2 PRODUCT OPPORTUNITIES BY SIGNAL TYPE
`;

    prompt += `When ad restrictions apply:
${ctx.opportunities.when_ad_restricted.map(o => `  - ${o}`).join('\n')}

When new operator enters market:
${ctx.opportunities.when_new_operator_enters.map(o => `  - ${o}`).join('\n')}
`;

    if (ctx.pending_news.length > 0) {
        prompt += `\n## RECENT REGULATORY NEWS (pending review)
${ctx.pending_news.slice(0, 3).map(n => `  - ${n.headline_en || n.headline}`).join('\n')}
`;
    }

    return prompt;
}

/**
 * Simple headline translation (Portuguese to English keywords)
 * Full LLM translation would be added in future
 */
function translateHeadline(headline: string): string | undefined {
    // Only translate if it looks like Portuguese
    const ptKeywords = ['pede', 'para', 'será', 'fazenda', 'apostas', 'secretaria', 'brasileiro', 'brasil'];
    const isPortuguese = ptKeywords.some(kw => headline.toLowerCase().includes(kw));

    if (!isPortuguese) return undefined; // Already English

    // Basic keyword replacements for common regulatory terms
    const translations: Record<string, string> = {
        'secretaria de prêmios e apostas': 'Betting and Prize Secretariat',
        'ministério da fazenda': 'Ministry of Finance',
        'pede prerrogativa': 'requests authority',
        'requisitar servidores': 'requisition staff',
        'loteria estadual': 'state lottery',
        'apostador brasileiro': 'Brazilian bettor',
        'analisa perfil': 'analyzes profile',
        'concessão': 'concession',
        'financiará': 'will fund',
        'construção': 'construction',
        'hospitais': 'hospitals',
        'são paulo': 'São Paulo',
    };

    let translated = headline;
    for (const [pt, en] of Object.entries(translations)) {
        translated = translated.replace(new RegExp(pt, 'gi'), en);
    }

    // If significant translation happened, return it
    if (translated !== headline) {
        return translated;
    }

    return undefined;
}

/**
 * Add regulatory news for user review
 */
export function addPendingRegulatoryNews(news: Omit<RegulatoryNews, 'id' | 'status' | 'headline_en'>): RegulatoryNews {
    // Check for duplicates by URL
    const exists = BRAZIL_CONTEXT.pending_news.some(n => n.url === news.url);
    if (exists) {
        return BRAZIL_CONTEXT.pending_news.find(n => n.url === news.url)!;
    }

    const item: RegulatoryNews = {
        ...news,
        id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        status: 'pending',
        headline_en: translateHeadline(news.headline),
    };

    BRAZIL_CONTEXT.pending_news.push(item);
    return item;
}

/**
 * Clear all pending regulatory news (useful for testing/reset)
 */
export function clearPendingRegulatoryNews(): void {
    BRAZIL_CONTEXT.pending_news = [];
}

/**
 * Get pending regulatory news for dashboard display
 */
export function getPendingRegulatoryNews(): RegulatoryNews[] {
    return BRAZIL_CONTEXT.pending_news.filter(n => n.status === 'pending');
}

/**
 * Mark regulatory news as applied or ignored
 */
export function updateRegulatoryNewsStatus(
    id: string,
    status: 'applied' | 'ignored'
): boolean {
    const item = BRAZIL_CONTEXT.pending_news.find(n => n.id === id);
    if (item) {
        item.status = status;
        if (status === 'applied') {
            item.appliedAt = new Date().toISOString();
        }
        return true;
    }
    return false;
}
