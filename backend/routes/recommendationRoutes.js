const express = require('express');
const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /api/recommendations/:userId
 *
 * Returns a full recommendation payload for the dashboard:
 *  - milestone      : positive reinforcement if a solve-count milestone was just hit
 *  - weakTopics     : tags with successRate < 0.4 (min 3 attempts)
 *  - patternGaps    : tags common at the user's typical difficulty that they've never tried
 *  - efficiencyNudge: true when avg execution time on Accepted solutions is high
 *  - recommendedProblems: 2-3 unsolved problems targeted at weak/gap areas
 */
router.get('/:userId', protect, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    /* ── 1. All user submissions with problem data ───────────────────── */
    const submissions = await Submission.find({ user: userId })
      .populate('problem', 'slug title difficulty tags time_limit_ms')
      .lean();

    /* ── 2. Solved / attempted problem ids ───────────────────────────── */
    const solvedIds = new Set();
    const attemptedIds = new Set();
    submissions.forEach((s) => {
      if (!s.problem) return;
      attemptedIds.add(s.problem._id.toString());
      if (s.status === 'Accepted') solvedIds.add(s.problem._id.toString());
    });
    const solvedCount = solvedIds.size;

    /* ── 3. Milestone check ──────────────────────────────────────────── */
    const MILESTONES = [1, 5, 10, 25, 50, 100, 150, 200, 300, 500];
    const milestone = MILESTONES.includes(solvedCount) ? solvedCount : null;

    /* ── 4. Weak topics (per-tag success rate) ───────────────────────── */
    const tagStats = {};
    submissions.forEach((s) => {
      if (!s.problem?.tags) return;
      const isAccepted = s.status === 'Accepted';
      s.problem.tags.forEach((tag) => {
        if (!tagStats[tag]) tagStats[tag] = { total: 0, accepted: 0 };
        tagStats[tag].total += 1;
        if (isAccepted) tagStats[tag].accepted += 1;
      });
    });

    const weakTopics = Object.entries(tagStats)
      .filter(([, v]) => v.total >= 3)
      .map(([tag, v]) => ({
        tag,
        total: v.total,
        accepted: v.accepted,
        successRate: v.accepted / v.total,
      }))
      .filter((t) => t.successRate < 0.4)
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, 5);

    /* ── 5. Pattern gaps ─────────────────────────────────────────────── */
    // Determine the user's primary difficulty (most solved at)
    const diffCount = { Easy: 0, Medium: 0, Hard: 0 };
    submissions.forEach((s) => {
      if (s.status === 'Accepted' && s.problem?.difficulty) {
        diffCount[s.problem.difficulty] = (diffCount[s.problem.difficulty] || 0) + 1;
      }
    });
    const primaryDiff = Object.entries(diffCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Medium';

    // Tags the user HAS attempted
    const attemptedTags = new Set(Object.keys(tagStats));

    // Find tags that appear frequently in problems at the user's difficulty
    const diffProblems = await Problem.find({ difficulty: primaryDiff })
      .select('tags')
      .lean();

    const tagFreq = {};
    diffProblems.forEach((p) => {
      (p.tags || []).forEach((t) => {
        tagFreq[t] = (tagFreq[t] || 0) + 1;
      });
    });

    const patternGaps = Object.entries(tagFreq)
      .filter(([tag]) => !attemptedTags.has(tag))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag, freq]) => ({ tag, freq }));

    /* ── 6. Efficiency nudge ─────────────────────────────────────────── */
    const acceptedWithTime = submissions.filter(
      (s) => s.status === 'Accepted' && s.executionTime != null && s.problem?.time_limit_ms
    );

    let efficiencyNudge = false;
    if (acceptedWithTime.length >= 3) {
      const avgRatio =
        acceptedWithTime.reduce((sum, s) => sum + s.executionTime / s.problem.time_limit_ms, 0) /
        acceptedWithTime.length;
      efficiencyNudge = avgRatio > 0.6; // using > 60 % of the time limit on average
    }

    /* ── 7. Recommended problems ─────────────────────────────────────── */
    // Priority: weak topic tags first, then gap tags, then general unsolved
    const targetTags = [
      ...weakTopics.map((t) => t.tag),
      ...patternGaps.map((t) => t.tag),
    ];

    let recommendedProblems = [];

    if (targetTags.length > 0) {
      recommendedProblems = await Problem.find({
        _id: { $nin: [...solvedIds].map((id) => new mongoose.Types.ObjectId(id)) },
        tags: { $in: targetTags },
        difficulty: { $in: ['Easy', 'Medium', 'Hard'] },
      })
        .select('slug title difficulty tags')
        .limit(10)
        .lean();
    }

    // If not enough, pad with unsolved problems at user's difficulty
    if (recommendedProblems.length < 2) {
      const extra = await Problem.find({
        _id: { $nin: [...solvedIds].map((id) => new mongoose.Types.ObjectId(id)) },
        difficulty: primaryDiff,
      })
        .select('slug title difficulty tags')
        .limit(5)
        .lean();
      recommendedProblems = [...recommendedProblems, ...extra];
    }

    // Deduplicate and cap at 3
    const seen = new Set();
    const dedupedRecs = [];
    for (const p of recommendedProblems) {
      const key = p._id.toString();
      if (!seen.has(key)) {
        seen.add(key);
        dedupedRecs.push(p);
      }
      if (dedupedRecs.length >= 3) break;
    }

    /* ── 8. Respond ──────────────────────────────────────────────────── */
    return res.json({
      success: true,
      data: {
        solvedCount,
        milestone,
        weakTopics,
        patternGaps,
        efficiencyNudge,
        recommendedProblems: dedupedRecs,
      },
    });
  } catch (err) {
    console.error('[recommendations] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
