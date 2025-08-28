import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

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
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Export Firebase services
export { db, auth, analytics };
export default app;
