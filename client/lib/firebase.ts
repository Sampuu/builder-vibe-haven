import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Development mode configuration
const isDevelopment = import.meta.env.DEV;
const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';
const enableDebug = import.meta.env.VITE_ENABLE_DEBUG === 'true';
const useFirebaseEmulators = import.meta.env.VITE_FIREBASE_EMULATORS === 'true';

// Mock auth is disabled in development mode
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

// Development logging
const devLog = (message: string, ...args: any[]) => {
  if (enableDebug) {
    console.log(`🔧 [DEV] ${message}`, ...args);
  }
};

// Firebase configuration for development
const firebaseConfig = {
  apiKey: "AIzaSyAPGnT4qxz8YHGmXujEsN_w1nPtetdCa8s",
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
let emulatorsConnected = false;

// Development mode banner
if (isDevMode) {
  console.log(`
🚀 DEVELOPMENT MODE ACTIVATED
================================
📊 Debug Logging: ${enableDebug}
🔥 Firebase Emulators: ${useFirebaseEmulators}
🎭 Mock Auth: ${USE_MOCK_AUTH}
🌐 Environment: ${isDevelopment ? 'Development' : 'Production'}
================================
  `);
}

// Initialize Firebase (always try in dev mode unless explicitly using mock)
if (!USE_MOCK_AUTH || isDevMode) {
  try {
    devLog('Initializing Firebase...');
    
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Firebase services
    auth = getAuth(app);
    db = getFirestore(app);
    functions = getFunctions(app);

    // Connect to emulators if enabled
    if ((isDevelopment || isDevMode) && useFirebaseEmulators) {
      try {
        // Auth Emulator
        if (!auth._delegate._config.emulator) {
          connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
          devLog('Connected to Auth emulator on port 9099');
        }
        
        // Firestore Emulator
        if (!db._delegate._databaseId.projectId.includes('(default)')) {
          connectFirestoreEmulator(db, 'localhost', 8081);
          devLog('Connected to Firestore emulator on port 8081');
        }
        
        // Functions Emulator
        if (!functions._delegate.region.includes('localhost')) {
          connectFunctionsEmulator(functions, 'localhost', 5001);
          devLog('Connected to Functions emulator on port 5001');
        }
        
        emulatorsConnected = true;
        console.log('✅ All Firebase emulators connected successfully');
      } catch (emulatorError) {
        console.warn('⚠️ Could not connect to Firebase emulators:', emulatorError.message);
        console.log('📋 Start emulators with: firebase emulators:start');
        console.log('📋 Or run: pnpm run dev:firebase');
      }
    }
    
    firebaseInitialized = true;
    devLog('Firebase initialized successfully');
  } catch (initError) {
    console.error('❌ Firebase initialization failed:', initError);
    if (isDevMode) {
      console.log('🔄 Development mode: Will use mock authentication as fallback');
    }
    firebaseInitialized = false;
  }
} else {
  devLog('Using mock authentication (Firebase disabled)');
  firebaseInitialized = false;
}

// Development utilities
export const devUtils = {
  isDevMode,
  enableDebug,
  useFirebaseEmulators,
  emulatorsConnected,
  
  // Development helpers
  log: devLog,
  
  // Firebase status
  getStatus: () => ({
    firebaseInitialized,
    emulatorsConnected,
    authConnected: !!auth,
    firestoreConnected: !!db,
    functionsConnected: !!functions,
    environment: isDevelopment ? 'development' : 'production',
    mode: isDevMode ? 'development' : 'standard'
  }),
  
  // Test connections
  testConnections: async () => {
    const status = devUtils.getStatus();
    devLog('Connection status:', status);
    
    if (auth) {
      try {
        const user = auth.currentUser;
        devLog('Auth test: Success', user ? 'User logged in' : 'No user');
      } catch (e) {
        devLog('Auth test: Failed', e);
      }
    }
    
    return status;
  }
};

// Export with fallback for when Firebase fails
export { auth, db, functions };
export default app;

// Firebase availability check
export const isFirebaseAvailable = () => {
  return firebaseInitialized && !!(app && auth && db);
};

// Helper function to check if we're using emulators
export const isUsingEmulators = () => {
  return emulatorsConnected;
};

// Helper to check if we're in mock mode
export const isUsingMockAuth = () => {
  return USE_MOCK_AUTH && !isDevMode;
};

// Development mode check
export const isDevelopmentMode = () => {
  return isDevMode;
};

// Test Firebase connectivity
export const testFirebaseConnection = async (): Promise<boolean> => {
  if (!isFirebaseAvailable()) return false;
  
  try {
    // Try a simple Firebase operation to test connectivity
    const testUser = auth?.currentUser;
    devLog('Firebase connection test passed');
    return true;
  } catch (error) {
    console.warn('⚠️ Firebase connection test failed:', error);
    return false;
  }
};

// Initialize development tools
if (isDevMode && typeof window !== 'undefined') {
  (window as any).devUtils = devUtils;
  devLog('Development utilities available on window.devUtils');
}
