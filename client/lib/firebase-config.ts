// Firebase configuration detection and validation
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "emergency-response-demo.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || "emergency-response-demo",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "emergency-response-demo.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

/**
 * Check if Firebase configuration is valid (not using demo values)
 */
export const isFirebaseConfigured = (): boolean => {
  // Check if any environment variables are set (indicating real Firebase config)
  const hasRealConfig = !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );

  // Also check for demo values that indicate unconfigured Firebase
  const isDemoConfig =
    firebaseConfig.apiKey === "demo-api-key" ||
    firebaseConfig.authDomain === "emergency-response-demo.firebaseapp.com" ||
    firebaseConfig.projectId === "emergency-response-demo";

  return hasRealConfig && !isDemoConfig;
};

/**
 * Get configuration status for debugging
 */
export const getConfigStatus = () => {
  const configured = isFirebaseConfigured();
  return {
    isConfigured: configured,
    mode: configured ? "firebase" : "local-storage",
    config: configured ? firebaseConfig : "demo/fallback",
    hasEnvVars: {
      apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: !!import.meta.env.VITE_FIREBASE_APP_ID,
    },
  };
};

export { firebaseConfig };
