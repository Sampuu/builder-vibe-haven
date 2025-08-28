// Detect Firebase availability and choose appropriate service
let isFirebaseAvailable: boolean | null = null;
let checkPromise: Promise<boolean> | null = null;

// Check if Firebase is available
export const checkFirebaseAvailability = async (): Promise<boolean> => {
  // Return cached result if already checked
  if (isFirebaseAvailable !== null) {
    return isFirebaseAvailable;
  }

  // Return ongoing check if already in progress
  if (checkPromise) {
    return checkPromise;
  }

  checkPromise = (async () => {
    try {
      // First check if we have valid credentials using the Firebase module
      const { isFirebaseAvailable: hasValidCreds } = await import('@/lib/firebase');

      if (!hasValidCreds()) {
        console.log('Using demo/missing Firebase credentials - switching to offline mode');
        isFirebaseAvailable = false;
        return false;
      }

      // If we have valid credentials, try to verify connectivity
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: 'test' })
        }
      );

      // If we get any response (even an error like 400), Firebase is reachable
      // A 400 error is expected since we're sending an invalid token
      if (response.status === 400 || response.status === 200) {
        isFirebaseAvailable = true;
        console.log('Firebase is available - using Firebase services');
        return true;
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.log('Firebase is not available - using offline services', error);
      isFirebaseAvailable = false;
      return false;
    }
  })();

  return checkPromise;
};

// Force offline mode (for testing)
export const forceOfflineMode = (): void => {
  isFirebaseAvailable = false;
  checkPromise = Promise.resolve(false);
};

// Reset availability check (useful for testing)
export const resetAvailabilityCheck = (): void => {
  isFirebaseAvailable = null;
  checkPromise = null;
};

// Get current availability status
export const getFirebaseAvailability = (): boolean | null => {
  return isFirebaseAvailable;
};
