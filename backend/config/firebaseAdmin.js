const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK with service account
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

// Check if service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Firebase service account key not found!');
  console.error('📝 Please follow these steps:');
  console.error('   1. Go to Firebase Console: https://console.firebase.google.com');
  console.error('   2. Select your project');
  console.error('   3. Go to Project Settings (gear icon) → Service Accounts');
  console.error('   4. Click "Generate New Private Key"');
  console.error('   5. Download the JSON file');
  console.error('   6. Rename it to "serviceAccountKey.json"');
  console.error('   7. Place it in: backend/serviceAccountKey.json');
  console.error('');
  console.error('⚠️  Server cannot start without Firebase configuration.');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log('✅ Firebase Admin initialized successfully');

module.exports = admin;
