/**
 * Entity Extraction Tool
 * Extract bookmaker/operator names from text locally (no AI needed)
 * This dramatically reduces token usage by only sending entity names to Claude
 */

// ============================================================
// Known Bookmaker Patterns
// ============================================================

// Common bookmaker name patterns and suffixes
const BOOKMAKER_SUFFIXES = [
    'bet', 'bets', 'betting', 'apostas', 'aposta',
    'gaming', 'casino', 'poker', 'sports', 'sport',
    'win', 'play', 'game', 'odds', 'lucky',
];

// Known major operators to always recognize
const KNOWN_OPERATORS = [
    'bet365', 'betfair', 'betano', 'betway', 'bwin', 'betclic',
    'pinnacle', 'unibet', 'william hill', 'ladbrokes', 'paddy power',
    'parimatch', 'stake', 'coolbet', 'pokerstars', 'draftkings',
    'fanduel', 'caesars', 'pointsbet', 'betmgm', 'barstool',
    '1xbet', '22bet', 'melbet', 'mostbet', 'linebet',
    'superbet', 'sportingbet', 'novibet', 'leovegas', 'mrgreen',
    'pixbet', 'sportingbet', 'galera bet', 'estrelabet', 'kto',
    'rivalo', 'bodog', 'betsson', 'netbet', 'betcris',
    'caliente', 'codere', 'luckia', 'interapuestas',
];

// Regulatory/industry terms that indicate a bookmaker mention
const INDUSTRY_PATTERNS = [
    /(\w+(?:bet|bets|betting|apostas|gaming|casino|poker|play))/gi,
    /operator\s+(\w+)/gi,
    /bookmaker\s+(\w+)/gi,
    /(\w+)\s+(?:launches?|expands?|enters?|announced?)/gi,
    /license\s+(?:to|for)\s+(\w+)/gi,
];

// ============================================================
// Entity Extraction Functions
// ============================================================

export interface ExtractedEntity {
    name: string;
    confidence: 'high' | 'medium' | 'low';
    context: string; // The sentence where it was found
    source: 'known_operator' | 'pattern_match' | 'capitalized_word';
}

/**
 * Extract potential bookmaker names from a headline
 */
export function extractEntitiesFromHeadline(headline: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const seenNames = new Set<string>();

    const normalizedHeadline = headline.toLowerCase();

    // 1. Check for known operators (highest confidence)
    for (const operator of KNOWN_OPERATORS) {
        if (normalizedHeadline.includes(operator.toLowerCase())) {
            const name = capitalizeWords(operator);
            if (!seenNames.has(name.toLowerCase())) {
                seenNames.add(name.toLowerCase());
                entities.push({
                    name,
                    confidence: 'high',
                    context: headline,
                    source: 'known_operator',
                });
            }
        }
    }

    // 2. Pattern matching for betting-related names
    for (const pattern of INDUSTRY_PATTERNS) {
        const matches = headline.matchAll(pattern);
        for (const match of matches) {
            const name = capitalizeWords(match[1] || match[0]);
            if (name.length >= 3 && !seenNames.has(name.toLowerCase()) && !isCommonWord(name)) {
                seenNames.add(name.toLowerCase());
                entities.push({
                    name,
                    confidence: 'medium',
                    context: headline,
                    source: 'pattern_match',
                });
            }
        }
    }

    // 3. Capitalized words that might be company names
    const capitalizedPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
    const capitalizedMatches = headline.matchAll(capitalizedPattern);
    for (const match of capitalizedMatches) {
        const name = match[1];
        // Check if it ends with a betting-related suffix
        const lowerName = name.toLowerCase();
        const hasBettingSuffix = BOOKMAKER_SUFFIXES.some(s => lowerName.endsWith(s));
        if (hasBettingSuffix && !seenNames.has(lowerName) && !isCommonWord(name)) {
            seenNames.add(lowerName);
            entities.push({
                name,
                confidence: 'medium',
                context: headline,
                source: 'pattern_match',
            });
        }
    }

    return entities;
}

/**
 * Extract entities from multiple articles
 */
export function extractEntitiesFromArticles(
    articles: Array<{ title: string; description?: string; url: string; source: string }>
): Array<{
    entity: ExtractedEntity;
    articles: Array<{ title: string; url: string; source: string }>;
}> {
    // Group by entity name
    const entityMap = new Map<string, {
        entity: ExtractedEntity;
        articles: Array<{ title: string; url: string; source: string }>;
    }>();

    for (const article of articles) {
        const text = `${article.title} ${article.description || ''}`;
        const entities = extractEntitiesFromHeadline(text);

        for (const entity of entities) {
            const key = entity.name.toLowerCase();
            if (!entityMap.has(key)) {
                entityMap.set(key, {
                    entity,
                    articles: [],
                });
            }
            const entry = entityMap.get(key)!;
            // Upgrade confidence if found multiple times
            if (entity.confidence === 'high' || entry.articles.length > 0) {
                entry.entity.confidence = 'high';
            }
            entry.articles.push({
                title: article.title,
                url: article.url,
                source: article.source,
            });
        }
    }

    // Sort by confidence and article count
    return Array.from(entityMap.values())
        .sort((a, b) => {
            const confOrder = { high: 0, medium: 1, low: 2 };
            if (confOrder[a.entity.confidence] !== confOrder[b.entity.confidence]) {
                return confOrder[a.entity.confidence] - confOrder[b.entity.confidence];
            }
            return b.articles.length - a.articles.length;
        });
}

// ============================================================
// Helper Functions
// ============================================================

function capitalizeWords(str: string): string {
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Common words to filter out
const COMMON_WORDS = new Set([
    'the', 'and', 'for', 'with', 'new', 'latest', 'top', 'best',
    'brazil', 'brasil', 'latam', 'america', 'europe',
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'partners', 'partnership', 'launches', 'launch', 'announces', 'expands',
    'news', 'update', 'report', 'market', 'industry', 'sector',
]);

function isCommonWord(word: string): boolean {
    return COMMON_WORDS.has(word.toLowerCase());
}

// ============================================================
// Test Function
// ============================================================

export function testEntityExtraction(): void {
    const testHeadlines = [
        "Betano announces expansion into Brazil market",
        "Parimatch secures license in Latin America",
        "New operator PixBet launches mobile app",
        "Bet365 reports record profits in 2024",
        "Galera Bet sponsors Brazilian football team",
    ];

    console.log("Entity Extraction Test:");
    for (const headline of testHeadlines) {
        const entities = extractEntitiesFromHeadline(headline);
        console.log(`\n"${headline}"`);
        for (const e of entities) {
            console.log(`  → ${e.name} (${e.confidence}, ${e.source})`);
        }
    }
}
