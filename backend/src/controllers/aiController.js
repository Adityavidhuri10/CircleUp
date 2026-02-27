/**
 * aiController.js
 *
 * AI Match — 5-Step Deterministic + Optional Gemini Refinement
 *
 * STEP 1  Hard filter: only users with primaryGoal === logged-in user's goal
 * STEP 2  Score each filtered user via calculateSimilarityScore()
 * STEP 3  Sort DESC by score
 * STEP 4  Take top 5
 * STEP 5  Optional Gemini refinement → return top 3
 *         If Gemini is absent / fails → return top 3 from deterministic ranking
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { calculateSimilarityScore } = require('../utils/matchingUtils');

// ── String normalisation helper ───────────────────────────────────────────────
// Trims whitespace and lowercases so comparisons are always case-insensitive.
// Returns null for falsy input so callers can do an explicit null-check.
const normalizeGoal = (val) =>
    typeof val === 'string' && val.trim() ? val.trim().toLowerCase() : null;

// ── Gemini semantic re-ranking ────────────────────────────────────────────────
// Receives the top-5 deterministic candidates and asks Gemini to re-rank them.
// Returns a sorted array of usernames (best first), or null if Gemini fails.
async function geminiRerank(loggedUser, top5) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const usersData = top5.map((u) => ({
        username: u.username,
        primaryGoal: u.primaryGoal,
        interests: u.secondaryGoals || [],
        location: u.location || '',
        role: u.role || '',
    }));

    const prompt = `You are a recommendation system. Re-rank the following 5 users for the logged-in user based on semantic similarity of their interests, goals, and background.

Logged-in User:
- Username: ${loggedUser.username}
- Primary Goal: ${loggedUser.primaryGoal}
- Interests: ${(loggedUser.secondaryGoals || []).join(', ') || 'None'}
- Location: ${loggedUser.location || 'Unknown'}
- Role: ${loggedUser.role || 'Unknown'}

Candidates (all share the same Primary Goal):
${JSON.stringify(usersData, null, 2)}

Return ONLY valid JSON with this exact structure:
{
  "ranked_usernames": ["best_match", "second_best", "third_best", "fourth", "fifth"]
}

Consider semantic meaning of interests (e.g. "Weight Training" is similar to "Lifting Weights").
All 5 usernames must appear in the output exactly as given.`;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 7000);

        let aiText;
        try {
            const result = await model.generateContent(prompt, {
                signal: controller.signal,
            });
            aiText = result.response.text();
        } finally {
            clearTimeout(timer);
        }

        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON in Gemini response');

        const parsed = JSON.parse(jsonMatch[0]);
        const ranked = parsed.ranked_usernames;

        if (!Array.isArray(ranked) || ranked.length === 0) {
            throw new Error('Invalid ranked_usernames in Gemini response');
        }

        return ranked;
    } catch (err) {
        console.warn('[AI] Gemini re-ranking failed, using deterministic order:', err.message);
        return null;
    }
}

// ── Main controller ───────────────────────────────────────────────────────────
exports.findSimilarUsers = asyncHandler(async (req, res, next) => {
    const { logged_in_user, users_list } = req.body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!logged_in_user?.username) {
        return next(new AppError('logged_in_user must include a username.', 400));
    }
    if (!Array.isArray(users_list) || users_list.length === 0) {
        return next(new AppError('users_list must be a non-empty array.', 400));
    }

    // ── STEP 1: Hard Filter — only users sharing the same primaryGoal ─────────
    // Root-cause fix: use normalizeGoal() so comparison is case-insensitive
    // and whitespace-trimmed. Raw === fails when values differ in casing or
    // have leading/trailing spaces (common from frontend form inputs).
    const normalizedLoggedGoal = normalizeGoal(logged_in_user.primaryGoal);

    // Defensive log — remove once confirmed working in production
    console.log('[AI Match] logged_in_user.primaryGoal (raw):', logged_in_user.primaryGoal);
    console.log('[AI Match] normalizedLoggedGoal:', normalizedLoggedGoal);

    if (!normalizedLoggedGoal) {
        return next(
            new AppError(
                'logged_in_user.primaryGoal is missing or empty. Set a primary goal before using AI Match.',
                400
            )
        );
    }

    const sameGoalUsers = users_list.filter((u) => {
        const normalizedCandidateGoal = normalizeGoal(u.primaryGoal);
        // Defensive log — remove once confirmed working in production
        console.log(
            `[AI Match] Comparing candidate "${u.username}" — raw: "${u.primaryGoal}" | normalized: "${normalizedCandidateGoal}" | match: ${normalizedCandidateGoal === normalizedLoggedGoal}`
        );
        return normalizedCandidateGoal === normalizedLoggedGoal;
    });

    if (sameGoalUsers.length === 0) {
        return res.status(200).json({
            status: 'success',
            data: {
                logged_in_user,
                similar_users: [],
                total_users_analyzed: users_list.length,
                same_goal_candidates: 0,
                match_source: 'deterministic',
                message: 'No users found with the same primary goal.',
            },
        });
    }

    // ── STEP 2: Score each filtered candidate ─────────────────────────────────
    const scored = sameGoalUsers.map((u) => ({
        ...u,
        _similarityScore: calculateSimilarityScore(logged_in_user, u),
    }));

    // ── STEP 3: Sort DESC by deterministic score ──────────────────────────────
    scored.sort((a, b) => b._similarityScore - a._similarityScore);

    // ── STEP 4: Take top 5 ────────────────────────────────────────────────────
    const top5 = scored.slice(0, 5);

    // ── STEP 5: Optional Gemini Refinement — re-rank top 5, return top 3 ──────
    let finalTop3;
    let matchSource = 'deterministic';

    const rankedUsernames = await geminiRerank(logged_in_user, top5);

    if (rankedUsernames) {
        // Build a lookup map for fast access
        const userMap = new Map(top5.map((u) => [u.username, u]));

        // Apply Gemini's ranking, skip any unknown usernames defensively
        const geminiOrdered = rankedUsernames
            .map((name) => userMap.get(name))
            .filter(Boolean);

        // If Gemini returned a sensible list, use it
        if (geminiOrdered.length > 0) {
            finalTop3 = geminiOrdered.slice(0, 3);
            matchSource = 'gemini';
        }
    }

    // Fallback: Gemini was absent or failed — use pure deterministic order
    if (!finalTop3) {
        finalTop3 = top5.slice(0, 3);
    }

    // ── Shape response ────────────────────────────────────────────────────────
    const similar_users = finalTop3.map((u) => {
        const { _similarityScore, ...rest } = u;
        return {
            ...rest,
            similarity_score: _similarityScore,
        };
    });

    return res.status(200).json({
        status: 'success',
        data: {
            logged_in_user,
            similar_users,
            total_users_analyzed: users_list.length,
            same_goal_candidates: sameGoalUsers.length,
            match_source: matchSource,
            analysis_timestamp: new Date().toISOString(),
        },
    });
});
