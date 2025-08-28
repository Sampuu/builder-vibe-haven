# Firebase Integration Documentation

## Overview

This document outlines the Firebase integration implemented in the Rescue System web application. The integration includes Firebase Authentication with role-based access control (RBAC) and Firestore database with structured collections for different emergency services.

## Features Implemented

### ✅ Firebase Authentication

- **Email/Password Authentication**: Users can sign up and log in using email and password
- **Role Assignment**: During signup, users are assigned roles: `user`, `police`, `ambulance`, `fireBrigade`, `hospital`, or `admin`
- **Profile Management**: User profiles are stored in Firestore with role information

### ✅ Role-Based Access Control (RBAC)

- **Dashboard Routing**: Users are automatically redirected to role-specific dashboards
- **Protected Routes**: Each route is protected based on user roles
- **Permission Checks**: Components can check user roles using the Firebase context

### ✅ Firestore Database Structure

Individual collections for each entity:

#### `/users`

- User profiles with role information
- Emergency request history
- Contact information

#### `/policeReports`

- Police incident reports
- Case status tracking
- Officer assignment information

#### `/ambulanceRequests`

- Medical emergency requests
- Ambulance dispatch logs
- Hospital destination tracking

#### `/fireBrigadeReports`

- Fire incident reports
- Rescue operation logs
- Team assignment details

#### `/hospitalRecords`

- Hospital availability status
- Patient records (privacy compliant)
- Supply management data

#### `/emergencyRequests`

- General emergency requests from users
- Multi-service coordination
- Request status tracking

#### `/adminLogs`

- System administration logs
- User management actions
- Audit trail information

### ✅ Security Rules

Comprehensive Firestore security rules implementing:

- User can only access their own data
- Role-based collection access
- Emergency services cross-access for coordination
- Admin full access for system management

## File Structure

```
client/
├── lib/
│   ├── firebase.ts          # Firebase configuration and initialization
│   └── database.ts          # Database service classes and helpers
├── contexts/
│   └── FirebaseContext.tsx  # Firebase authentication and database context
├── hooks/
│   └── use-auth.tsx         # Updated auth hook using Firebase
└── pages/
    ├── Login.tsx            # Updated login page for Firebase auth
    └── Signup.tsx           # Updated signup page with role selection

shared/
└── firebase-types.ts        # TypeScript interfaces for all entities

firestore.rules               # Firestore security rules
```

## Configuration

### Firebase Configuration

The Firebase configuration is located in `client/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAPGnT4qxz8YHGmXujEsN_w1nPtetdCa8s",
  authDomain: "rescue-system-com.firebaseapp.com",
  projectId: "rescue-system-com",
  storageBucket: "rescue-system-com.firebasestorage.app",
  messagingSenderId: "700167192144",
  appId: "1:700167192144:web:3ab567e5ca28a6a7a3db55",
  measurementId: "G-PETD5ZZLFG",
};
```

### Environment Setup

The application is configured to work in development mode. For production deployment, ensure:

1. Firebase project is properly configured
2. Firestore security rules are deployed
3. Authentication methods are enabled in Firebase Console

## Usage Examples

### Authentication

```typescript
import { useFirebase } from "@/contexts/FirebaseContext";

const { signUp, signIn, logout, user, userProfile } = useFirebase();

// Sign up a new user
await signUp(email, password, name, role, contact);

// Sign in existing user
await signIn(email, password);

// Check user role
if (userProfile?.role === "admin") {
  // Admin functionality
}
```

### Database Operations

```typescript
import { PoliceService, EmergencyService } from "@/lib/database";

// Create a police report
const reportId = await PoliceService.createReport({
  officerId: user.uid,
  officerName: user.displayName,
  details: "Traffic incident on Main St",
  status: "open",
  priority: "medium",
  location: "Main St & 1st Ave",
});

// Get emergency requests
const requests = await EmergencyService.getPendingRequests();
```

### Role-Based Access

```typescript
import { useFirebase } from "@/contexts/FirebaseContext";

const { hasRole, hasAnyRole, isAdmin } = useFirebase();

// Check specific role
if (hasRole("police")) {
  // Police-specific functionality
}

// Check multiple roles
if (hasAnyRole(["ambulance", "hospital"])) {
  // Medical services functionality
}

// Check admin access
if (isAdmin()) {
  // Admin panel access
}
```

## Security Considerations

### Authentication Security

- Passwords must be at least 6 characters
- Email verification can be added for enhanced security
- Multi-factor authentication can be enabled in Firebase Console

### Data Security

- All sensitive operations require authentication
- Role-based access prevents unauthorized data access
- Firestore security rules validate all database operations
- Admin actions are logged for audit purposes

### Production Recommendations

1. **Enable Email Verification**: Require users to verify their email addresses
2. **Set Password Policies**: Implement stronger password requirements
3. **Add Rate Limiting**: Prevent abuse of authentication endpoints
4. **Monitor Security**: Use Firebase Security Rules simulator and monitoring
5. **Backup Strategy**: Implement regular Firestore backups
6. **Error Handling**: Implement comprehensive error handling and logging

## Testing

The integration has been tested for:

- ✅ User registration with role assignment
- ✅ User login and logout functionality
- ✅ Role-based dashboard redirection
- ✅ Protected route access control
- ✅ Firestore security rules validation

## Deployment

### Firestore Rules Deployment

To deploy the security rules to Firebase:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### Application Deployment

The application can be deployed using:

- **Netlify**: Use the Netlify MCP integration
- **Vercel**: Use the Vercel MCP integration
- **Firebase Hosting**: Deploy directly to Firebase

## Support and Maintenance

### Regular Tasks

1. Monitor authentication metrics in Firebase Console
2. Review security rules for any needed updates
3. Check Firestore usage and optimize queries
4. Update user role assignments as needed
5. Review admin logs for system health

### Troubleshooting

- Check Firebase Console for authentication errors
- Verify Firestore security rules are deployed
- Ensure all required Firebase services are enabled
- Check network connectivity for real-time updates

## Analytics

Firebase Analytics is integrated and will track:

- User authentication events
- Dashboard access patterns
- Emergency request volumes
- System usage metrics

Access analytics in the Firebase Console under the Analytics section.
