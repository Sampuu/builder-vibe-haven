import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPGnT4qxz8YHGmXujEsN_w1nPtetdCa8s",
  authDomain: "rescue-system-com.firebaseapp.com",
  projectId: "rescue-system-com",
  storageBucket: "rescue-system-com.firebasestorage.app",
  messagingSenderId: "700167192144",
  appId: "1:700167192144:web:3ab567e5ca28a6a7a3db55",
  measurementId: "G-PETD5ZZLFG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
