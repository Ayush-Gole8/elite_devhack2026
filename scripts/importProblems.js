const path = require('path');
require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv')).config({ 
  path: path.join(__dirname, '..', 'backend', '.env') 
});
const mongoose = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mongoose'));
const fs = require('fs');
const Problem = require('../backend/models/Problem');

const problemsDir = path.join(__dirname, '..', 'data', 'problems');

async function importProblems() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const files = fs.readdirSync(problemsDir).filter(f => f.endsWith('.json'));
    console.log(`📁 Found ${files.length} problem files\n`);

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const file of files) {
      try {
        const filePath = path.join(problemsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const problemData = JSON.parse(content);

        // Check if problem already exists
        const existing = await Problem.findOne({ slug: problemData.slug });

        if (existing) {
          // Update existing problem
          await Problem.updateOne(
            { slug: problemData.slug },
            {
              $set: {
                title: problemData.title,
                description: problemData.description,
                input_format: problemData.input_format,
                output_format: problemData.output_format,
                constraints: problemData.constraints,
                difficulty: problemData.difficulty,
                tags: problemData.tags,
                time_limit_ms: problemData.time_limit_ms,
                memory_limit_kb: problemData.memory_limit_kb
              }
            }
          );
          console.log(`✏️  Updated: ${problemData.slug}`);
          updated++;
        } else {
          // Create new problem
          await Problem.create({
            slug: problemData.slug,
            title: problemData.title,
            description: problemData.description,
            input_format: problemData.input_format,
            output_format: problemData.output_format,
            constraints: problemData.constraints,
            difficulty: problemData.difficulty,
            tags: problemData.tags,
            time_limit_ms: problemData.time_limit_ms,
            memory_limit_kb: problemData.memory_limit_kb,
            visibleTests: problemData.test_cases || [],
            hiddenTests: []
          });
          console.log(`➕ Imported: ${problemData.slug}`);
          imported++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   New imports: ${imported}`);
    console.log(`   Updates: ${updated}`);
    console.log(`   Errors: ${errors}`);
    console.log('\n✨ Done!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

importProblems();
