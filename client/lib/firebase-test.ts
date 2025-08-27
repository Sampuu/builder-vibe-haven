// Test file to verify Firebase integration
import { auth, db, storage, analytics } from "@/config/firebase";

// Test function to verify Firebase services are properly initialized
export function testFirebaseIntegration() {
  console.log("🔥 Firebase Integration Test");
  console.log("✅ Auth service:", auth ? "Initialized" : "Failed");
  console.log("✅ Firestore service:", db ? "Initialized" : "Failed");
  console.log("✅ Storage service:", storage ? "Initialized" : "Failed");
  console.log("✅ Analytics service:", analytics ? "Initialized" : "Client-side only");
  
  // Test environment variables
  console.log("🔧 Environment Variables Check:");
  console.log("API Key:", import.meta.env.VITE_PUBLIC_FIREBASE_API_KEY ? "✅ Loaded" : "❌ Missing");
  console.log("Project ID:", import.meta.env.VITE_PUBLIC_FIREBASE_PROJECT_ID);
  
  return {
    auth: !!auth,
    db: !!db,
    storage: !!storage,
    analytics: !!analytics,
    envVarsLoaded: !!import.meta.env.VITE_PUBLIC_FIREBASE_API_KEY
  };
}
