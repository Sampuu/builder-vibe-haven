import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';

// Check if we have valid Firebase credentials
const hasValidCredentials = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  return apiKey &&
         projectId &&
         apiKey !== 'demo-api-key' &&
         projectId !== 'demo-project' &&
         apiKey.length > 10; // Basic validation
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Lazy initialization function
const initializeFirebase = () => {
  if (app) return { app, auth, db }; // Already initialized

  if (!hasValidCredentials()) {
    console.log('Firebase: Invalid or demo credentials detected, skipping initialization');
    return { app: null, auth: null, db: null };
  }

  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Connect to emulators in development (only if using Firebase emulators)
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
      try {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
        connectFirestoreEmulator(db, 'localhost', 8081);
      } catch (error) {
        console.log('Firebase emulators already connected or not available');
      }
    }

    console.log('Firebase initialized successfully');
    return { app, auth, db };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return { app: null, auth: null, db: null };
  }
};

// Getter functions that initialize Firebase on demand
export const getFirebaseAuth = (): Auth | null => {
  const { auth } = initializeFirebase();
  return auth;
};

export const getFirebaseFirestore = (): Firestore | null => {
  const { db } = initializeFirebase();
  return db;
};

export const getFirebaseApp = (): FirebaseApp | null => {
  const { app } = initializeFirebase();
  return app;
};

// Export auth and db with lazy initialization
export { getFirebaseAuth as auth, getFirebaseFirestore as db };

// Check if Firebase is available
export const isFirebaseAvailable = (): boolean => {
  return hasValidCredentials();
};

export default getFirebaseApp();
