/**
 * Firebase Admin SDK Configuration
 * For server-side token verification
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
// Option 1: Using environment variables
const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    return admin;
  }

  try {
    // Check if using service account file
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    } else {
      // Use environment variables directly
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        }),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    }

    console.log('🔥 Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    // Continue without Firebase for MVP development
  }

  return admin;
};

// Initialize on import
initializeFirebase();

module.exports = admin;