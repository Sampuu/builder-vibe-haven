# Firebase Authentication Setup

## Overview

The emergency response system now includes complete Firebase Authentication with user registration, login, role-based access control, and secure data storage.

## Features Implemented

### 🔐 **Firebase Authentication**
- Email/password authentication
- Secure user registration with validation
- Real-time auth state management
- Role-based access control
- Password strength requirements

### 👥 **User Roles & Permissions**
- **User**: Report disasters & request help
- **Police**: Monitor & coordinate response  
- **Fire Brigade**: Handle fire emergencies
- **Ambulance**: Medical emergency response
- **Hospital**: Medical supplies & dispatch
- **Admin**: Full system access

### 📱 **User Interface**
- Professional signup form with validation
- Secure login interface
- Password visibility toggle
- Role selection during registration
- Terms and conditions agreement
- Comprehensive error handling

## Database Schema

### Users Collection (`users`)
```typescript
{
  id: string;           // Firebase Auth UID
  name: string;         // Full name
  email: string;        // Email address
  phone?: string;       // Optional phone number
  role: UserRole;       // User role/permissions
  createdAt: string;    // Account creation timestamp
  updatedAt: string;    // Last update timestamp
}
```

### User Roles
```typescript
type UserRole = 'user' | 'police' | 'fire' | 'ambulance' | 'hospital' | 'admin';
```

## Authentication Flow

### 1. **User Registration** (`/signup`)
```typescript
// Example signup data
const signupData: SignupData = {
  email: 'user@example.com',
  password: 'SecurePass123!',
  name: 'John Doe',
  phone: '+1-555-0123',      // Optional
  role: 'user'               // Selected role
};

const result = await firebaseAuth.signup(signupData);
```

**Validation Rules:**
- ✅ Valid email format
- ✅ Password minimum 6 characters with uppercase, lowercase, number
- ✅ Full name required (min 2 characters)
- ✅ Phone number validation (optional)
- ✅ Terms and conditions agreement
- ✅ Role selection required

### 2. **User Login** (`/login`)
```typescript
// Example login
const loginData: LoginData = {
  email: 'user@example.com',
  password: 'SecurePass123!'
};

const result = await firebaseAuth.login(loginData);
```

**Features:**
- ✅ Email/password authentication
- ✅ Password visibility toggle
- ✅ Auto-redirect to role-specific dashboard
- ✅ Remember user session
- ✅ Comprehensive error messages

### 3. **Protected Routes**
```typescript
// Role-based route protection
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>

// Multiple roles allowed
<ProtectedRoute allowedRoles={['police', 'fire', 'admin']}>
  <EmergencyControl />
</ProtectedRoute>
```

### 4. **Auth Context Usage**
```typescript
const { user, logout, hasRole, isAdmin, isEmergencyResponder } = useAuth();

// Check user permissions
if (hasRole('admin')) {
  // Admin functionality
}

if (isEmergencyResponder()) {
  // Emergency responder features
}
```

## Security Features

### ✅ **Firebase Security Rules**
- Users can only read/write their own data
- Admin roles can access all data
- Emergency responders can read incident data
- Public data (news) is readable by all authenticated users

### ✅ **Client-Side Validation**
- Email format validation
- Strong password requirements
- Phone number format checking
- Terms agreement verification

### ✅ **Server-Side Security**
- Firebase Auth handles password encryption
- Secure token-based authentication
- Automatic session management
- HTTPS-only communication

### ✅ **Role-Based Access Control**
- Route-level protection
- Component-level permission checks
- Database-level security rules
- API endpoint protection

## File Structure

```
client/
├── config/
│   └── firebase.ts                 # Firebase initialization
├── lib/
│   ├── firebase-auth.ts            # Authentication service
│   └── firebase-db.ts              # Database service
├── hooks/
│   └── use-auth.tsx                # Auth context & hooks
├── components/
│   ├── ProtectedRoute.tsx          # Route protection
│   ├── FirebaseAuthTest.tsx        # Auth testing component
│   └── FirebaseTest.tsx            # Database testing
├── pages/
│   ├── Login.tsx                   # Login page
│   ├── Signup.tsx                  # Registration page
│   └��─ [role]/Dashboard.tsx        # Role-specific dashboards
└── App.tsx                         # Route configuration

shared/
└── types.ts                        # TypeScript interfaces
```

## Usage Examples

### 1. **Creating New User**
```typescript
import { firebaseAuth } from '@/lib/firebase-auth';

const handleSignup = async (formData: SignupData) => {
  const result = await firebaseAuth.signup(formData);
  
  if (result.success) {
    // Redirect to dashboard
    navigate(`/dashboard/${result.data.role}`);
  } else {
    // Show error message
    setError(result.error);
  }
};
```

### 2. **User Login**
```typescript
const handleLogin = async (loginData: LoginData) => {
  const result = await firebaseAuth.login(loginData);
  
  if (result.success) {
    // Auto-redirect based on user role
    navigate(`/dashboard/${result.data.role}`);
  }
};
```

### 3. **Logout**
```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  navigate('/');
};
```

### 4. **Check Permissions**
```typescript
const { hasRole, isAdmin } = useAuth();

// Component rendering based on role
{hasRole(['admin', 'police']) && (
  <EmergencyControlPanel />
)}

{isAdmin() && (
  <AdminSettings />
)}
```

## Testing

### 🧪 **Firebase Auth Test Component**
Access the **Firebase Authentication Test** section in the User Dashboard to:

1. **Test Signup**: Create new user accounts
2. **Test Login**: Authenticate existing users  
3. **Test Logout**: Sign out users
4. **View User Data**: See current authentication status
5. **Verify Database**: Check Firestore user collection

### 🔧 **Manual Testing Steps**

1. **Registration Flow**:
   - Go to `/signup`
   - Fill in required fields
   - Select appropriate role
   - Verify account creation in Firebase Console

2. **Login Flow**:
   - Go to `/login` 
   - Enter credentials
   - Verify redirect to role-specific dashboard
   - Check auth state persistence

3. **Role-Based Access**:
   - Try accessing different dashboards
   - Verify role restrictions work
   - Test protected routes

4. **Logout Flow**:
   - Use logout button
   - Verify session termination
   - Check redirect to public pages

## Environment Variables

Ensure these Firebase configuration variables are set:
```env
VITE_PUBLIC_FIREBASE_API_KEY=AIzaSyAPGnT4qxz8YHGmXujEsN_w1nPtetdCa8s
VITE_PUBLIC_FIREBASE_AUTH_DOMAIN=rescue-system-com.firebaseapp.com
VITE_PUBLIC_FIREBASE_PROJECT_ID=rescue-system-com
VITE_PUBLIC_FIREBASE_STORAGE_BUCKET=rescue-system-com.firebasestorage.app
VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=700167192144
VITE_PUBLIC_FIREBASE_APP_ID=1:700167192144:web:3ab567e5ca28a6a7a3db55
VITE_PUBLIC_FIREBASE_MEASUREMENT_ID=G-PETD5ZZLFG
```

## Error Handling

### Common Error Messages:
- **auth/email-already-in-use**: Account exists with this email
- **auth/weak-password**: Password must be at least 6 characters
- **auth/invalid-email**: Invalid email format
- **auth/user-not-found**: No account with this email
- **auth/wrong-password**: Incorrect password
- **auth/too-many-requests**: Too many failed attempts

### Client-Side Validation:
- Email format checking
- Password strength requirements
- Phone number validation
- Required field validation
- Terms agreement checking

## Production Deployment

1. **Firebase Console Setup**:
   - Enable Authentication with Email/Password
   - Configure authorized domains
   - Set up Firestore security rules
   - Enable necessary APIs

2. **Security Considerations**:
   - Set strong Firestore security rules
   - Configure proper CORS settings
   - Use HTTPS for all requests
   - Implement rate limiting

3. **Monitoring**:
   - Enable Firebase Analytics
   - Set up error tracking
   - Monitor authentication metrics
   - Track user role distribution

## Support

For authentication issues:
1. Check Firebase Console for project status
2. Verify environment variables
3. Check browser console for detailed errors
4. Review Network tab for API calls
5. Test with Firebase Auth Test component

The system now provides **enterprise-grade authentication** with comprehensive user management, role-based security, and seamless integration with the emergency response features! 🔐
