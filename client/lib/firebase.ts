import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './firebase-config';

// Only initialize Firebase if properly configured
let app: any = null;
let auth: any = null;
let db: any = null;

if (isFirebaseConfigured()) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize Firebase Authentication and get a reference to the service
    auth = getAuth(app);

    // Initialize Cloud Firestore and get a reference to the service
    db = getFirestore(app);

    console.log('🔥 Firebase initialized successfully');
  } catch (error) {
    console.warn('🚫 Firebase initialization failed:', error);
    console.log('📱 Falling back to local storage authentication');
  }
} else {
  console.log('⚠️ Firebase not configured, using local storage fallback');
  console.log('💡 To use Firebase, add your Firebase config to .env file');
}

export { auth, db, app };

// Export Firebase status
export const isFirebaseAvailable = (): boolean => {
  return auth !== null && db !== null;
};

export default app;
