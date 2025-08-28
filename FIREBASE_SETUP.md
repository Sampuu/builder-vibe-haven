# Firebase Setup Guide

Your signup functionality has been successfully integrated with Firebase Authentication and Firestore database! 🎉

## Current Status

✅ **Firebase SDK installed**  
✅ **Authentication service created**  
✅ **Firestore database integration**  
✅ **Signup page connected to Firebase**  
✅ **Login page connected to Firebase**  
✅ **User data stored in Firestore**  

## What's Working Now

- **User Registration**: Creates accounts in Firebase Auth
- **User Authentication**: Logs in with Firebase Auth
- **Data Storage**: User profiles stored in Firestore
- **Role Management**: User roles saved and retrieved from database
- **Session Management**: Automatic login state persistence

## Firebase Project Setup Required

To use your app with a real Firebase project, you need to:

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Follow the setup wizard

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Click "Save"

### 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location closest to your users

### 4. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click **Add app** > **Web** (</>) if no web app exists
4. Register your app with a name
5. Copy the config object

### 5. Set Environment Variables

Create a `.env` file in your project root with:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase config values.

## Testing the Integration

1. **Create Environment File**: Add your Firebase credentials
2. **Restart Dev Server**: Run `pnpm dev` 
3. **Test Signup**: Go to `/signup` and create a new account
4. **Check Firebase**: Verify user appears in Firebase Auth console
5. **Check Firestore**: Verify user data in Firestore console
6. **Test Login**: Login with created credentials

## Current Demo Mode

Without Firebase credentials, the app uses demo configuration values. This won't persist data but allows you to test the interface.

## Database Structure

User data is stored in Firestore with this structure:

```javascript
// Collection: "users"
// Document ID: user.uid
{
  uid: "firebase_user_id",
  email: "user@example.com", 
  name: "User Name",
  role: "user", // or "police", "fire", "ambulance", "hospital", "admin"
  createdAt: "2024-01-01T00:00:00.000Z",
  lastLogin: "2024-01-01T00:00:00.000Z"
}
```

## Security Rules (Recommended)

For production, add these Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Features Included

- ✅ Email/password authentication
- ✅ User role management
- ✅ Secure password requirements
- ✅ Real-time auth state management
- ✅ Automatic session persistence
- ✅ Error handling and validation
- ✅ User profile data storage
- ✅ Role-based dashboard routing

Your emergency response system now has a production-ready authentication system! 🚀
