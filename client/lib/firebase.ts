import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Configuration for development vs production
const isDevelopment = import.meta.env.DEV;

// Check if we have real Firebase credentials or should use mock mode
const MOCK_API_KEY = "AIzaSyAPGnT4qxz8YHGmXujEsN_w1nPtetdCa8s";
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false'; // Default to mock auth

// Firebase configuration - only use if not in mock mode
const firebaseConfig = {
  apiKey: MOCK_API_KEY,
  authDomain: "demo-disaster-management.firebaseapp.com",
  projectId: "demo-disaster-management",
  storageBucket: "demo-disaster-management.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

let app = null;
let auth = null;
let db = null;
let functions = null;
let firebaseInitialized = false;

// Only initialize Firebase if we're not using mock auth
if (!USE_MOCK_AUTH) {
  try {
    console.log('🔥 Initializing Firebase...');
    
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
          connectFirestoreEmulator(db, 'localhost', 8081);
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
    
    firebaseInitialized = true;
    console.log('✅ Firebase initialized successfully');
  } catch (initError) {
    console.error('❌ Firebase initialization failed:', initError);
    console.log('🔄 Will use mock authentication');
    firebaseInitialized = false;
  }
} else {
  console.log('🎭 Using mock authentication (Firebase disabled)');
  firebaseInitialized = false;
}

// Export with fallback for when Firebase fails
export { auth, db, functions };
export default app;

// Firebase availability check
export const isFirebaseAvailable = () => {
  return firebaseInitialized && !!(app && auth && db);
};

// Helper function to check if we're using emulators
export const isUsingEmulators = () => {
  return isDevelopment && auth?._delegate?._config?.emulator;
};

// Helper to check if we're in mock mode
export const isUsingMockAuth = () => {
  return USE_MOCK_AUTH || !firebaseInitialized;
};

// Test Firebase connectivity
export const testFirebaseConnection = async (): Promise<boolean> => {
  if (!isFirebaseAvailable()) return false;
  
  try {
    // Try a simple Firebase operation to test connectivity
    const testUser = auth?.currentUser;
    console.log('🔍 Firebase connection test passed');
    return true;
  } catch (error) {
    console.warn('⚠️ Firebase connection test failed:', error);
    return false;
  }
};
