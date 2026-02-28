# Firebase Integration Documentation

## Overview

This emergency response system is now fully integrated with Firebase Firestore for data storage and real-time updates.

## Configuration

### Environment Variables
The Firebase configuration is loaded from environment variables:

```env
VITE_PUBLIC_FIREBASE_API_KEY=AIzaSyAPGnT4qxz8YHGmXujEsN_w1nPtetdCa8s
VITE_PUBLIC_FIREBASE_AUTH_DOMAIN=rescue-system-com.firebaseapp.com
VITE_PUBLIC_FIREBASE_PROJECT_ID=rescue-system-com
VITE_PUBLIC_FIREBASE_STORAGE_BUCKET=rescue-system-com.firebasestorage.app
VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=700167192144
VITE_PUBLIC_FIREBASE_APP_ID=1:700167192144:web:3ab567e5ca28a6a7a3db55
VITE_PUBLIC_FIREBASE_MEASUREMENT_ID=G-PETD5ZZLFG
```

### Firebase Services
- **Authentication**: User management and login
- **Firestore**: Document database for storing emergency data
- **Storage**: File uploads for images and documents
- **Analytics**: Usage tracking and metrics

## Database Structure

### Collections

#### `disasterReports`
Stores emergency incident reports submitted by users.

**Schema:**
```typescript
{
  id: string;
  userId: string;
  type: 'fire' | 'medical' | 'accident' | 'natural' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  contactName: string;
  contactPhone: string;
  images?: string[];
  status: 'submitted' | 'acknowledged' | 'in-progress' | 'resolved';
  assignedResponders?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### `helpRequests`
Stores requests for medical assistance and emergency supplies.

**Schema:**
```typescript
{
  id: string;
  userId: string;
  type: 'medical' | 'supplies' | 'transport' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  contactPhone: string;
  specialRequests?: string;
  status: 'submitted' | 'acknowledged' | 'in-progress' | 'fulfilled' | 'cancelled';
  assignedResponders?: string[];
  estimatedArrival?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### `newsUpdates`
Stores emergency news and public announcements.

**Schema:**
```typescript
{
  id: string;
  title: string;
  content: string;
  category: 'emergency' | 'weather' | 'safety' | 'update' | 'resolved';
  severity: 'info' | 'warning' | 'danger';
  location?: string;
  authorId: string;
  authorName: string;
  images?: string[];
  isPublic: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### `incidents`
Stores active emergency incidents with responder information.

**Schema:**
```typescript
{
  id: string;
  title: string;
  description: string;
  type: 'fire' | 'medical' | 'accident' | 'natural' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'contained' | 'resolved';
  location: string;
  coordinates: { lat: number; lng: number };
  affectedArea?: {
    radius: number;
    polygon?: Array<{ lat: number; lng: number }>;
  };
  responders: Array<{
    id: string;
    name: string;
    type: 'police' | 'fire' | 'medical' | 'other';
    status: 'dispatched' | 'on-scene' | 'available';
  }>;
  relatedReports?: string[];
  evacuationZone?: boolean;
  estimatedContainment?: string;
  publicAlert?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### `users`
Stores user profiles and authentication data.

**Schema:**
```typescript
{
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'responder';
  createdAt: string;
  updatedAt: string;
}
```

## Database Services

### Usage Examples

#### Creating a Disaster Report
```typescript
import { firebaseDb } from '@/lib/firebase-db';

const reportData = {
  userId: 'user123',
  type: 'fire',
  severity: 'high',
  title: 'Building Fire',
  description: 'Fire at commercial building',
  location: '123 Main St',
  contactName: 'John Doe',
  contactPhone: '+1-555-0123',
  status: 'submitted'
};

const result = await firebaseDb.disasterReports.create(reportData);
if (result.success) {
  console.log('Report created:', result.data);
}
```

#### Getting Recent Reports
```typescript
const result = await firebaseDb.disasterReports.getRecent(10);
if (result.success) {
  const reports = result.data;
  // Process reports...
}
```

#### Real-time Updates
```typescript
const unsubscribe = firebaseDb.disasterReports.subscribeToReports((reports) => {
  setReports(reports);
});

// Clean up listener
return () => unsubscribe();
```

## Security Rules

Firebase Security Rules should be configured to:
- Allow authenticated users to read/write their own data
- Allow emergency responders to read all incidents
- Allow admins to manage all data
- Deny access to sensitive user information

## File Structure

```
client/
├── config/
│   └── firebase.ts          # Firebase initialization
├── lib/
│   └── firebase-db.ts       # Database service functions
└── components/
    └── FirebaseTest.tsx     # Integration testing component

shared/
└── types.ts                 # TypeScript interfaces
```

## Testing

Use the `FirebaseTest` component in the User Dashboard to:
- Test database connectivity
- Create sample data
- View stored records
- Verify real-time updates

## Deployment Notes

1. Ensure Firebase project is configured with proper authentication
2. Set up Firestore security rules
3. Configure environment variables in production
4. Enable required Firebase services (Auth, Firestore, Storage, Analytics)

## Support

For Firebase-related issues:
- Check Firebase Console for project status
- Verify environment variables are set correctly
- Review network connectivity
- Check browser console for detailed error messages
