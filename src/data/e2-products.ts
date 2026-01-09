/**
 * E2 Product Definitions (Token-Efficient)
 * Used by AI agents to connect market signals to E2 product opportunities
 */

export interface E2Product {
    id: string;
    name: string;
    pitch: string;
    triggers: string[];
    opportunities: string[];
    priority: 'high' | 'medium' | 'low';
}

export const E2_PRODUCTS: Record<string, E2Product> = {
    'e2-ads': {
        id: 'e2-ads',
        name: 'E2 Ads',
        pitch: 'Contextual placements with deep links to prefilled betslips',
        triggers: [
            'monetization', 'advertising', 'sponsorship', 'affiliate',
            'high-intent pages', 'sports content'
        ],
        opportunities: [
            'Publisher wants to monetize sports content',
            'Operator seeking performance-oriented affiliate campaigns',
            'Brand seeking contextual sponsorship placements',
            'ScoreBoard strip for sponsor-only mode (when betting UI is off)',
        ],
        priority: 'high',
    },

    'odds-sdk': {
        id: 'odds-sdk',
        name: 'Odds SDK',
        pitch: 'Drop-in odds modules or full Odds tab (Web/JS + React Native)',
        triggers: [
            'odds integration', 'betting UX', 'launch odds',
            'existing app', 'native-feeling odds'
        ],
        opportunities: [
            'Publisher with existing app wants to add odds',
            'Improve betting UX without rebuilding',
            'Add Odds tab to game details',
        ],
        priority: 'high',
    },

    'e2-game-engine': {
        id: 'e2-game-engine',
        name: 'E2 Game Engine',
        pitch: 'F2P prediction games: Streak, Jackpot, Tournament Predictor',
        triggers: [
            'engagement', 'first-party data', 'F2P games', 'prediction',
            'sponsorship alternative', 'non-betting'
        ],
        opportunities: [
            'When betting ads are restricted/banned (compliant F2P alternative)',
            'Build first-party audience with email registration',
            'Seasonal campaigns around major tournaments',
            'Sponsor-friendly engagement format',
        ],
        priority: 'high',
    },

    'score-republic': {
        id: 'score-republic',
        name: 'Score Republic',
        pitch: 'White-label live scores app for iOS/Android with plug-in support',
        triggers: [
            'mobile app', 'app store presence', 'live scores',
            'fast go-live', 'rapid market entry'
        ],
        opportunities: [
            'Publisher needs app store presence quickly',
            'Add live scores + optional betting UI',
            'Embed E2 Game Engine or AI Predictions',
        ],
        priority: 'medium',
    },

    'ai-predictions': {
        id: 'ai-predictions',
        name: 'AI Predictions',
        pitch: 'AI-driven picks users can tip/submit; standalone or embedded',
        triggers: [
            'predictions', 'match previews', 'engagement',
            'todays picks', 'companion content'
        ],
        opportunities: [
            'Lightweight engagement on match previews',
            'Build first-party audience',
            'Non-betting mode available (without deeplinks)',
        ],
        priority: 'medium',
    },

    'acg': {
        id: 'acg',
        name: 'ACG (Automatic Content Generation)',
        pitch: 'AI-generated sports content to scale previews and picks',
        triggers: [
            'content scaling', 'SEO', 'previews', 'localization',
            'long-tail content'
        ],
        opportunities: [
            'Scale localized previews for SEO',
            'Create inventory for contextual monetization',
            'Long-tail content without editorial effort',
        ],
        priority: 'low',
    },
};

/**
 * Get product recommendations based on market signals
 */
export function getProductRecommendations(signals: {
    ad_restricted?: boolean;
    needs_mobile_app?: boolean;
    wants_engagement?: boolean;
    wants_monetization?: boolean;
    new_operator?: boolean;
}): E2Product[] {
    const recommendations: E2Product[] = [];

    if (signals.ad_restricted) {
        recommendations.push(E2_PRODUCTS['e2-game-engine']);
        recommendations.push(E2_PRODUCTS['score-republic']);
    }

    if (signals.wants_monetization) {
        recommendations.push(E2_PRODUCTS['e2-ads']);
    }

    if (signals.new_operator) {
        recommendations.push(E2_PRODUCTS['odds-sdk']);
        recommendations.push(E2_PRODUCTS['e2-ads']);
    }

    if (signals.wants_engagement) {
        recommendations.push(E2_PRODUCTS['e2-game-engine']);
        recommendations.push(E2_PRODUCTS['ai-predictions']);
    }

    if (signals.needs_mobile_app) {
        recommendations.push(E2_PRODUCTS['score-republic']);
    }

    // Deduplicate and sort by priority
    const seen = new Set<string>();
    return recommendations
        .filter(p => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
        })
        .sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.priority] - order[b.priority];
        });
}

/**
 * Get product context for AI prompts (token-efficient)
 */
export function getProductContextForPrompt(): string {
    const highPriority = Object.values(E2_PRODUCTS)
        .filter(p => p.priority === 'high');

    return highPriority.map(p =>
        `[${p.id}] ${p.name}: ${p.pitch}\n  Fits when: ${p.opportunities.slice(0, 2).join('; ')}`
    ).join('\n\n');
}
