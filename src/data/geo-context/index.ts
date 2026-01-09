/**
 * GEO Context Index
 * Load market context by geography code
 */

import { BRAZIL_CONTEXT, type GeoContext, getBrazilContextForPrompt } from './brazil';

export * from './brazil';
export type { GeoContext };

const GEO_CONTEXTS: Record<string, GeoContext> = {
    'br': BRAZIL_CONTEXT,
};

const GEO_PROMPT_GENERATORS: Record<string, () => string> = {
    'br': getBrazilContextForPrompt,
};

/**
 * Get GEO context by code
 */
export function getGeoContext(geo: string): GeoContext | null {
    return GEO_CONTEXTS[geo.toLowerCase()] || null;
}

/**
 * Get context prompt for AI reasoning
 */
export function getGeoContextForPrompt(geo: string): string {
    const generator = GEO_PROMPT_GENERATORS[geo.toLowerCase()];
    if (generator) {
        return generator();
    }
    return `## MARKET CONTEXT\nNo specific context available for ${geo.toUpperCase()}`;
}

/**
 * Check if GEO is supported
 */
export function isGeoSupported(geo: string): boolean {
    return geo.toLowerCase() in GEO_CONTEXTS;
}
