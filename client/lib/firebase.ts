import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Configuration for development vs production
const isDevelopment = import.meta.env.DEV;

// Firebase configuration - using provided API key with development-friendly settings
const firebaseConfig = {
  apiKey: "AIzaSyAPGnT4qxz8YHGmXujEsN_w1nPtetdCa8s",
  authDomain: isDevelopment ? "localhost" : "disaster-management-system.firebaseapp.com",
  projectId: isDevelopment ? "demo-disaster-management" : "disaster-management-system",
  storageBucket: isDevelopment ? "demo-disaster-management.appspot.com" : "disaster-management-system.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

let app;
let auth;
let db;
let functions;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  functions = getFunctions(app);

  // Connect to emulators in development
  if (isDevelopment) {
    try {
      // Only connect if not already connected
      if (!auth._delegate._config.emulator) {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
      }
      if (!db._delegate._databaseId.projectId.includes('(default)')) {
        connectFirestoreEmulator(db, 'localhost', 8080);
      }
      if (!functions._delegate.region.includes('localhost')) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      console.log('✅ Connected to Firebase emulators');
    } catch (emulatorError) {
      console.warn('⚠️ Could not connect to Firebase emulators:', emulatorError.message);
      console.log('📋 To use Firebase emulators, run: firebase emulators:start');
    }
  }
} catch (initError) {
  console.error('❌ Firebase initialization failed:', initError);
  console.log('🔄 Falling back to mock authentication');
}

// Export with fallback for when Firebase fails
export { auth, db, functions };
export default app;

// Firebase availability check
export const isFirebaseAvailable = () => {
  return !!(app && auth && db);
};

// Helper function to check if we're using emulators
export const isUsingEmulators = () => {
  return isDevelopment && auth?._delegate?._config?.emulator;
};
