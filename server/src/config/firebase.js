/**
 * Firebase Admin SDK Configuration
 * For server-side token verification and storage
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    return admin;
  }

  try {
    // Check if using service account file
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    } else {
      // Use environment variables directly
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }

    console.log('🔥 Firebase Admin initialized');
    console.log('📦 Storage Bucket:', process.env.FIREBASE_STORAGE_BUCKET);
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
  }

  return admin;
};

// Initialize on import
initializeFirebase();

module.exports = admin;