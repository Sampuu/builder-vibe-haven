# Firebase Setup Instructions

To connect the signup and signin pages to real Firebase, follow these steps:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "emergency-response-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to **Authentication** from the left sidebar
2. Click **Get started**
3. Go to the **Sign-in method** tab
4. Enable **Email/Password** provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## 3. Create Firestore Database

1. Go to **Firestore Database** from the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location for your database
5. Click "Done"

## 4. Get Firebase Configuration

1. Go to **Project Settings** (gear icon near "Project Overview")
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname (e.g., "Emergency Response Web App")
5. Copy the `firebaseConfig` object

## 5. Update Environment Variables

Replace the demo credentials with your real Firebase config by updating these environment variables:

- `VITE_FIREBASE_API_KEY` - Your Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Your project's auth domain
- `VITE_FIREBASE_PROJECT_ID` - Your project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Your storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Your messaging sender ID
- `VITE_FIREBASE_APP_ID` - Your app ID

## 6. Set up Firestore Security Rules (Optional)

For development, you can use these basic rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read/write disaster reports and help requests
    match /disasterReports/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /helpRequests/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /notifications/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 7. Restart the Development Server

After updating the environment variables, restart your dev server for the changes to take effect.

Once completed, the signup and signin pages will use real Firebase authentication instead of offline mode!
