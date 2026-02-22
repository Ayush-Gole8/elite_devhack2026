/**
 * Migration Script: Update Contest Schema for ACM-ICPC Style Scoring
 * 
 * This script migrates existing contests to the new schema with:
 * - penaltyPerWrongAttempt field
 * - penalty and totalTime for each participant
 * - problemStatus array with detailed per-problem tracking
 * - Recalculated ranks using ACM-ICPC logic
 * 
 * Run: node backend/scripts/migrateContestSchema.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');

const migrateContest = async () => {
  try {
    console.log('🚀 Starting contest schema migration...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codeplatform');
    console.log('✅ Connected to MongoDB\n');

    // Get all contests
    const contests = await Contest.find({});
    console.log(`📊 Found ${contests.length} contests to migrate\n`);

    for (const contest of contests) {
      console.log(`\n🔄 Migrating contest: ${contest.title} (${contest._id})`);

      // 1. Update penaltyPerWrongAttempt to 5 minutes (force update from old default of 20)
      const oldPenalty = contest.penaltyPerWrongAttempt;
      contest.penaltyPerWrongAttempt = 5;
      console.log(`  ✓ Updated penaltyPerWrongAttempt: ${oldPenalty || 'undefined'} → 5 minutes`);

      // 2. Add isFrozen field if not exists
      if (contest.isFrozen === undefined) {
        contest.isFrozen = false;
        console.log('  ✓ Set isFrozen to false');
      }

      // 3. Process each participant
      for (let participantIndex = 0; participantIndex < contest.participants.length; participantIndex++) {
        const participant = contest.participants[participantIndex];
        
        console.log(`  👤 Processing participant: ${participant.user}`);

        // Initialize new fields if not exists
        if (participant.penalty === undefined) participant.penalty = 0;
        if (participant.totalTime === undefined) participant.totalTime = 0;
        if (!participant.problemStatus) participant.problemStatus = [];

        // Get all submissions for this participant in this contest
        const submissions = await Submission.find({
          contestId: contest._id,
          user: participant.user
        }).sort({ submittedAt: 1 }); // Sort by submission time

        console.log(`    Found ${submissions.length} submissions`);

        // Track problem solving state
        const problemMap = new Map();

        for (const submission of submissions) {
          const problemId = submission.problem.toString();
          
          if (!problemMap.has(problemId)) {
            // First time seeing this problem
            problemMap.set(problemId, {
              problem: submission.problem,
              solved: false,
              attempts: 0,
              wrongAttempts: 0,
              solveTime: 0,
              penalty: 0,
              firstSubmissionTime: submission.submittedAt
            });
          }

          const problemData = problemMap.get(problemId);
          problemData.attempts++;

          // Check if this submission was accepted
          if (submission.status === 'Accepted' && !problemData.solved) {
            // First AC for this problem
            problemData.solved = true;
            
            // Calculate solve time in minutes from contest start
            const contestStart = new Date(contest.startTime).getTime();
            const solveTimeMs = new Date(submission.submittedAt).getTime() - contestStart;
            problemData.solveTime = Math.max(0, Math.floor(solveTimeMs / (1000 * 60)));
            
            // Calculate penalty (wrong attempts * penalty per attempt)
            problemData.penalty = problemData.wrongAttempts * contest.penaltyPerWrongAttempt;
            
            console.log(`      ✓ Problem ${problemId} solved in ${problemData.solveTime} min with ${problemData.wrongAttempts} wrong attempts`);
          } else if (submission.status !== 'Accepted' && !problemData.solved) {
            // Wrong submission (only count if problem not yet solved)
            problemData.wrongAttempts++;
          }
        }

        // Update participant's problemStatus array
        participant.problemStatus = Array.from(problemMap.values());

        // Calculate totals
        let totalScore = 0;
        let totalPenalty = 0;
        let totalTime = 0;

        for (const ps of participant.problemStatus) {
          if (ps.solved) {
            totalScore++;
            totalPenalty += ps.penalty;
            totalTime += ps.solveTime + ps.penalty;
          }
        }

        participant.score = totalScore;
        participant.penalty = totalPenalty;
        participant.totalTime = totalTime;

        console.log(`    📈 Updated: ${totalScore} solved, ${totalPenalty} min penalty, ${totalTime} min total time`);
      }

      // 4. Recalculate ranks using ACM-ICPC logic
      contest.participants.sort((a, b) => {
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;

        if (scoreA !== scoreB) {
          return scoreB - scoreA; // Higher score first
        }

        // If scores are equal, sort by total time (lower is better)
        return (a.totalTime || 0) - (b.totalTime || 0);
      });

      contest.participants.forEach((p, idx) => {
        p.rank = idx + 1;
      });

      console.log('  ✓ Recalculated ranks with ACM-ICPC logic');

      // Save the contest
      await contest.save();
      console.log(`  ✅ Migrated contest: ${contest.title}`);
    }

    console.log('\n\n🎉 Migration completed successfully!');
    console.log(`✅ Migrated ${contests.length} contests`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run migration
migrateContest();
