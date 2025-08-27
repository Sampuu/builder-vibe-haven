import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // In production, use service account key
  // For development, you can use the emulator or provide service account credentials
  
  if (process.env.NODE_ENV === 'production') {
    // Production configuration - requires service account key
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is required in production');
    }
    
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
    });
  } else {
    // Development configuration - can use emulator or service account
    const projectId = process.env.FIREBASE_PROJECT_ID || 'demo-project';
    
    try {
      // Try to use application default credentials or service account
      admin.initializeApp({
        projectId: projectId,
        // If FIREBASE_SERVICE_ACCOUNT_KEY is provided, use it
        ...(process.env.FIREBASE_SERVICE_ACCOUNT_KEY && {
          credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
        })
      });
    } catch (error) {
      console.warn('Firebase Admin initialization failed, using default project:', error);
      // Fallback for development - this will work with emulator
      admin.initializeApp({
        projectId: projectId
      });
    }
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;

// Helper function to check if running in emulator mode
export const isEmulatorMode = () => {
  return process.env.NODE_ENV !== 'production' && !process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
};

// Connect to Firestore emulator in development
if (isEmulatorMode()) {
  console.log('Connecting to Firestore emulator for server-side operations');
  // Set emulator host for admin SDK
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
}
