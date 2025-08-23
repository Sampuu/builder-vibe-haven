import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Development mode configuration
const isDevelopment = import.meta.env.DEV;
const isDevMode = import.meta.env.VITE_DEV_MODE === "true";
const enableDebug = import.meta.env.VITE_ENABLE_DEBUG === "true";
const useFirebaseEmulators = import.meta.env.VITE_FIREBASE_EMULATORS === "true";

// Mock auth configuration - default to true in development for safety
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== "false";

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
  appId: "1:123456789012:web:abcdef123456",
};

let app = null;
let auth = null;
let db = null;
let functions = null;
let firebaseInitialized = false;
let emulatorsConnected = false;
let firebaseTestFailed = false;

// Development mode banner
if (isDevMode) {
  console.log(`
🚀 DEVELOPMENT MODE ACTIVATED
================================
📊 Debug Logging: ${enableDebug}
🔥 Firebase Emulators: ${useFirebaseEmulators}
🎭 Mock Auth: ${USE_MOCK_AUTH}
🌐 Environment: ${isDevelopment ? "Development" : "Production"}
================================
  `);
}

// Initialize Firebase only if not using mock auth
if (!USE_MOCK_AUTH && (isDevMode || !isDevelopment)) {
  try {
    devLog("Attempting Firebase initialization...");

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
          connectAuthEmulator(auth, "http://localhost:9099", {
            disableWarnings: true,
          });
          devLog("Connected to Auth emulator on port 9099");
        }

        // Firestore Emulator
        if (!db._delegate._databaseId.projectId.includes("(default)")) {
          connectFirestoreEmulator(db, "localhost", 8081);
          devLog("Connected to Firestore emulator on port 8081");
        }

        // Functions Emulator
        if (!functions._delegate.region.includes("localhost")) {
          connectFunctionsEmulator(functions, "localhost", 5001);
          devLog("Connected to Functions emulator on port 5001");
        }

        emulatorsConnected = true;
        devLog("All Firebase emulators connected successfully");
      } catch (emulatorError) {
        console.warn(
          "⚠️ Could not connect to Firebase emulators:",
          emulatorError.message,
        );
        console.log("📋 Start emulators with: firebase emulators:start");
        // Don't fail initialization if emulators aren't available
      }
    }

    firebaseInitialized = true;
    devLog("Firebase initialized successfully");
  } catch (initError) {
    console.error("❌ Firebase initialization failed:", initError);
    firebaseInitialized = false;
    firebaseTestFailed = true;

    if (isDevMode) {
      console.log(
        "🔄 Firebase failed - will use mock authentication as fallback",
      );
    }
  }
} else {
  devLog("Using mock authentication (Firebase disabled by configuration)");
  firebaseInitialized = false;
}

// Test Firebase connectivity with timeout
const testFirebaseConnectivity = async (): Promise<boolean> => {
  if (!firebaseInitialized || !auth) return false;

  try {
    // Set a timeout for the connectivity test
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Firebase connectivity test timeout")),
        5000,
      ),
    );

    // Simple test - try to get current user (should not throw network error)
    const testPromise = Promise.resolve(auth.currentUser);

    await Promise.race([testPromise, timeoutPromise]);
    devLog("Firebase connectivity test passed");
    return true;
  } catch (error) {
    console.warn("⚠️ Firebase connectivity test failed:", error);
    firebaseTestFailed = true;
    return false;
  }
};

// Development utilities
export const devUtils = {
  isDevMode,
  enableDebug,
  useFirebaseEmulators,
  emulatorsConnected,
  firebaseTestFailed,

  // Development helpers
  log: devLog,

  // Firebase status
  getStatus: () => ({
    firebaseInitialized,
    emulatorsConnected,
    firebaseTestFailed,
    useMockAuth: USE_MOCK_AUTH,
    authConnected: !!auth,
    firestoreConnected: !!db,
    functionsConnected: !!functions,
    environment: isDevelopment ? "development" : "production",
    mode: isDevMode ? "development" : "standard",
  }),

  // Test connections
  testConnections: async () => {
    const status = devUtils.getStatus();
    devLog("Connection status:", status);

    if (auth && !firebaseTestFailed) {
      const connectivityOk = await testFirebaseConnectivity();
      status.connectivityTest = connectivityOk;
    }

    return status;
  },
};

// Export with fallback for when Firebase fails
export { auth, db, functions };
export default app;

// Firebase availability check - now includes connectivity test result
export const isFirebaseAvailable = () => {
  return firebaseInitialized && !firebaseTestFailed && !!(app && auth && db);
};

// Helper function to check if we're using emulators
export const isUsingEmulators = () => {
  return emulatorsConnected;
};

// Helper to check if we're in mock mode (either by config or Firebase failure)
export const isUsingMockAuth = () => {
  return USE_MOCK_AUTH || firebaseTestFailed || !firebaseInitialized;
};

// Development mode check
export const isDevelopmentMode = () => {
  return isDevMode;
};

// Test Firebase connectivity with better error handling
export const testFirebaseConnection = async (): Promise<boolean> => {
  if (!isFirebaseAvailable()) return false;

  return await testFirebaseConnectivity();
};

// Initialize development tools
if (isDevMode && typeof window !== "undefined") {
  (window as any).devUtils = devUtils;
  devLog("Development utilities available on window.devUtils");
}

// Run initial connectivity test if Firebase is initialized
if (firebaseInitialized && !firebaseTestFailed) {
  setTimeout(async () => {
    const isConnected = await testFirebaseConnectivity();
    if (!isConnected) {
      console.log(
        "🔄 Firebase connectivity failed - the system will use mock authentication",
      );
    }
  }, 1000);
}
