/**
 * Slim E2 Context for Analyzer
 * Token-efficient product context injected into signal analysis
 * 
 * KEEP THIS FILE MINIMAL - every character costs tokens
 */

/**
 * Core E2 product recommendations by signal type
 * Used to connect market signals to E2 opportunities
 */
export const E2_ANALYZER_CONTEXT = `
## E2 PRODUCT OPPORTUNITIES

When analyzing signals, connect to these E2 products:

**New Operator / Market Entry:**
→ [Odds SDK] Add betting odds to their platform
→ [E2 Ads] Contextual placements with deep links

**Sponsorship / Partnership:**
→ [E2 Ads] Deep link integration to prefilled betslips
→ [E2 Game Engine] Sponsor-friendly F2P prediction games

**Ad Restrictions / Regulatory Changes:**
→ [E2 Game Engine] Compliant F2P alternative to betting ads
→ [Score Republic] App presence without betting UI

**Expansion / Growth:**
→ [Odds SDK] Quick odds integration for new markets
→ [E2 Ads] ScoreBoard strip for sponsorship
`;

/**
 * Get context for analyzer prompt
 */
export function getE2AnalyzerContext(): string {
    return E2_ANALYZER_CONTEXT.trim();
}

/**
 * Get specific recommendation based on signal type
 */
export function getE2RecommendationForSignalType(signalType: string): string[] {
    switch (signalType) {
        case 'MARKET_ENTRY':
            return ['Odds SDK - quick odds integration', 'E2 Ads - contextual monetization'];
        case 'PARTNERSHIP':
        case 'SPONSORSHIP':
            return ['E2 Ads - deep link integration', 'E2 Game Engine - sponsor activation'];
        case 'EXPANSION':
            return ['Odds SDK - new market support', 'Score Republic - rapid market entry'];
        case 'REGULATORY':
            return ['E2 Game Engine - compliant F2P games', 'Score Republic - non-betting mode'];
        default:
            return ['E2 Ads - contextual placements'];
    }
}
