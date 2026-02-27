/**
 * matchingUtils.js
 *
 * Deterministic similarity scoring for the circleUP recommendation engine.
 *
 * Scoring formula:
 *   +10  per exact interest match   (case-insensitive string equality)
 *   +4   per partial keyword match  (shared token between interest strings)
 *   +2   same location bonus
 *   +1   same role bonus
 *
 * "Interests" are stored in the User schema as `secondaryGoals[]`.
 *
 * This utility is pure and side-effect-free — safe to unit-test independently.
 */

/**
 * Tokenise an interest string into lowercase keywords.
 * Splits on spaces, hyphens, underscores, and forward-slashes.
 * Filters out short stop-words (≤ 2 chars) to reduce noise.
 *
 * @param {string} str
 * @returns {Set<string>}
 */
const tokenise = (str) => {
    if (!str || typeof str !== 'string') return new Set();
    return new Set(
        str
            .toLowerCase()
            .split(/[\s\-_/]+/)
            .filter((t) => t.length > 2)
    );
};

/**
 * Calculate the deterministic similarity score between two users.
 *
 * @param {Object} currentUser     - The logged-in user (must have secondaryGoals, location, role)
 * @param {Object} candidateUser   - A candidate user to score
 * @returns {number}               - Raw integer score (higher = better match)
 */
const calculateSimilarityScore = (currentUser, candidateUser) => {
    let score = 0;

    const currentInterests = Array.isArray(currentUser.secondaryGoals)
        ? currentUser.secondaryGoals
        : [];
    const candidateInterests = Array.isArray(candidateUser.secondaryGoals)
        ? candidateUser.secondaryGoals
        : [];

    // Track which candidate interests were already matched exactly
    // to avoid double-counting them in the partial pass
    const exactlyMatched = new Set();

    // ── Layer A: Exact interest matches (+10 each) ────────────────────────────
    for (const ci of currentInterests) {
        for (let idx = 0; idx < candidateInterests.length; idx++) {
            if (exactlyMatched.has(idx)) continue;
            if (ci.toLowerCase() === candidateInterests[idx].toLowerCase()) {
                score += 10;
                exactlyMatched.add(idx);
                break; // each current interest can match one candidate interest
            }
        }
    }

    // ── Layer B: Partial keyword matches (+4 each) ────────────────────────────
    // Only fires for candidate interests that were NOT exact matches
    const currentTokenSets = currentInterests.map(tokenise);

    for (let idx = 0; idx < candidateInterests.length; idx++) {
        if (exactlyMatched.has(idx)) continue; // already counted as exact

        const candidateTokens = tokenise(candidateInterests[idx]);
        if (candidateTokens.size === 0) continue;

        // Check overlap with ANY of the current user's interest token sets
        const hasOverlap = currentTokenSets.some((ctSet) => {
            for (const token of candidateTokens) {
                if (ctSet.has(token)) return true;
            }
            return false;
        });

        if (hasOverlap) score += 4;
    }

    // ── Layer C: Location bonus (+2) ─────────────────────────────────────────
    if (
        currentUser.location &&
        candidateUser.location &&
        currentUser.location.toLowerCase().trim() ===
        candidateUser.location.toLowerCase().trim()
    ) {
        score += 2;
    }

    // ── Layer D: Role bonus (+1) ──────────────────────────────────────────────
    if (
        currentUser.role &&
        candidateUser.role &&
        currentUser.role.toLowerCase().trim() ===
        candidateUser.role.toLowerCase().trim()
    ) {
        score += 1;
    }

    return score;
};

module.exports = { calculateSimilarityScore, tokenise };
