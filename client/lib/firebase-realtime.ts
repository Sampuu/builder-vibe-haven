import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration for development
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "emergency-response-dev",
  storageBucket: "emergency-response-dev.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connect to emulators in development
let emulatorsConnected = false;

if (!emulatorsConnected) {
  try {
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8081);
    console.log('Connected to Firestore emulator on port 8081');
    
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('Connected to Auth emulator on port 9099');
    
    // Connect to Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('Connected to Storage emulator on port 9199');
    
    emulatorsConnected = true;
  } catch (error) {
    console.log('Emulators already connected or not available:', error);
  }
}

export default app;
