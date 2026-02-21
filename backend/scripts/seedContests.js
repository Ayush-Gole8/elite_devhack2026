require('dotenv').config();
const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/elite_devhack');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedContests = async () => {
  try {
    await connectDB();

    // Get some random problems
    const allProblems = await Problem.find().limit(15);
    
    if (allProblems.length < 10) {
      console.log('Not enough problems in database. Please seed problems first.');
      process.exit(1);
    }

    // Get a user to be the contest creator (or use a default ID)
    const users = await User.find().limit(5);
    const creatorId = users[0]?._id || new mongoose.Types.ObjectId();

    // Clear existing contests (optional - comment out to keep existing)
    // await Contest.deleteMany({});
    // console.log('Cleared existing contests');

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Sample Contests
    const contests = [
      {
        title: 'Weekly Coding Challenge #1',
        description: 'Test your skills with a variety of algorithmic problems. This ongoing contest features problems ranging from easy to hard difficulty.',
        startTime: oneHourAgo,
        endTime: twoHoursLater,
        duration: 180, // 3 hours
        problems: allProblems.slice(0, 5).map(p => p._id),
        participants: users.slice(0, 3).map((u, idx) => ({
          user: u._id,
          score: (3 - idx) * 100, // 300, 200, 100
          rank: idx + 1,
          submissions: [],
        })),
        createdBy: creatorId,
        isPublic: true,
        status: 'ongoing',
      },
      {
        title: 'Beginner Bootcamp Contest',
        description: 'Perfect for beginners! Solve fundamental programming problems and build your confidence. Contest starts tomorrow.',
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
        duration: 120, // 2 hours
        problems: allProblems.slice(5, 9).map(p => p._id),
        participants: users.slice(0, 2).map(u => ({
          user: u._id,
          score: 0,
          submissions: [],
        })),
        createdBy: creatorId,
        isPublic: true,
        status: 'upcoming',
      },
      {
        title: 'Advanced Algorithms Sprint',
        description: 'Challenging problems for experienced coders. Test your knowledge of data structures, algorithms, and optimization techniques.',
        startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        duration: 240, // 4 hours
        problems: allProblems.slice(9, 14).map(p => p._id),
        participants: [],
        createdBy: creatorId,
        isPublic: true,
        status: 'upcoming',
      },
      {
        title: 'January Mega Contest 2026',
        description: 'Our biggest contest of the month! Compete with hundreds of developers and climb the leaderboard. This contest ended yesterday.',
        startTime: new Date(yesterday.getTime() - 3 * 60 * 60 * 1000),
        endTime: yesterday,
        duration: 180, // 3 hours
        problems: allProblems.slice(0, 6).map(p => p._id),
        participants: users.map((u, idx) => ({
          user: u._id,
          score: (users.length - idx) * 150,
          rank: idx + 1,
          submissions: [],
        })),
        createdBy: creatorId,
        isPublic: true,
        status: 'completed',
      },
    ];

    // Insert contests
    const createdContests = await Contest.insertMany(contests);
    console.log(`✅ Successfully created ${createdContests.length} contests:`);
    
    createdContests.forEach(contest => {
      console.log(`   - ${contest.title} (${contest.status})`);
    });

    console.log('\n🎉 Contest seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding contests:', error);
    process.exit(1);
  }
};

seedContests();
