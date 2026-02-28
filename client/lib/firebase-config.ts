// Firebase configuration with environment variable support
export const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyAPGnT4qxz8YHGmXujEsN_w1nPtetdCa8s",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "rescue-system-com.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rescue-system-com",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "rescue-system-com.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "700167192144",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:700167192144:web:7a6cebbc94227b35a3db55",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QTE1THZ15B",
};
