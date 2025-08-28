import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAPGnT4qxz8YHGmXujEsN_w1nPtetdCa8s",
  authDomain: "rescue-system-com.firebaseapp.com",
  projectId: "rescue-system-com",
  storageBucket: "rescue-system-com.firebasestorage.app",
  messagingSenderId: "700167192144",
  appId: "1:700167192144:web:3ab567e5ca28a6a7a3db55",
  measurementId: "G-PETD5ZZLFG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
