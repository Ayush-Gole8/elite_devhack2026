require('dotenv').config();
const mongoose = require('mongoose');

async function cleanupIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get all indexes
    const indexes = await usersCollection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    // Drop the firebaseUid index if it exists
    try {
      await usersCollection.dropIndex('firebaseUid_1');
      console.log('\n✅ Successfully dropped firebaseUid_1 index');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('\n✅ firebaseUid_1 index does not exist (already cleaned)');
      } else {
        throw error;
      }
    }

    // Show remaining indexes
    const remainingIndexes = await usersCollection.indexes();
    console.log('\n📋 Remaining indexes:');
    remainingIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key);
    });

    console.log('\n✅ Index cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up indexes:', error);
    process.exit(1);
  }
}

cleanupIndexes();
