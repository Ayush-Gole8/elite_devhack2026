require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./models/Problem');

async function checkProblemTestCases() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get first few problems with their test cases
    const problems = await Problem.find({})
      .select('slug title visibleTests hiddenTests')
      .limit(3);

    for (const problem of problems) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Problem: ${problem.title} (${problem.slug})`);
      console.log(`${'='.repeat(60)}`);

      console.log('\n--- Visible Tests ---');
      problem.visibleTests.forEach((test, idx) => {
        console.log(`\nTest ${idx + 1}:`);
        console.log('Input (first 200 chars):');
        console.log(JSON.stringify(test.input.substring(0, 200)));
        console.log('\nOutput (first 100 chars):');
        console.log(JSON.stringify(test.output.substring(0, 100)));
        console.log('\nInput has newlines:', test.input.includes('\n'));
        console.log('Input length:', test.input.length);
      });

      console.log('\n--- Hidden Tests (count) ---');
      console.log(`Hidden tests: ${problem.hiddenTests.length}`);
      if (problem.hiddenTests.length > 0) {
        const firstHidden = problem.hiddenTests[0];
        console.log('\nFirst hidden test input (first 200 chars):');
        console.log(JSON.stringify(firstHidden.input.substring(0, 200)));
        console.log('Has newlines:', firstHidden.input.includes('\n'));
      }
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProblemTestCases();
