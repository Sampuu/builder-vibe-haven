# 🚀 Development Mode

Development mode is now **ACTIVE** for your disaster management system!

## ✅ What's Enabled

### 🔥 Firebase Integration

- **Firebase Emulators** support (when running)
- **Real-time Firestore** database
- **Firebase Authentication** (replaces mock auth when emulators are active)
- **Cloud Functions** support

### 🛠️ Development Tools

- **Debug Panel** - Bottom-right corner with system status
- **Enhanced Logging** - Detailed console logs for debugging
- **Connection Status** - Real-time Firebase/emulator status
- **Development Utilities** - Available on `window.devUtils`

### 📊 Monitoring

- **Authentication Status** - Firebase vs Mock mode indicator
- **Connection Health** - Real-time emulator connectivity
- **User Session** - Current user and role information
- **System Status** - Environment and configuration details

## 🎮 Quick Start Commands

### 1. Development with Mock Auth (Default)

```bash
pnpm dev
```

- Uses mock authentication (works immediately)
- All features functional
- No Firebase setup required

### 2. Development with Firebase Emulators

```bash
# Start emulators in separate terminal
firebase emulators:start

# Then start dev server
pnpm dev

# OR run both together
pnpm run dev:firebase
```

### 3. Force Firebase Mode

```bash
pnpm run dev:debug
```

- Forces Firebase mode even without emulators
- Good for testing Firebase connectivity

## 🎯 Debug Panel Features

The debug panel (bottom-right corner) shows:

### Connection Status

- 🔥 **Firebase** - Connected to Firebase/emulators
- 🎭 **Mock** - Using mock authentication
- ⚡ **Emulators** - Emulator connectivity status

### Current User

- Email, role, and user ID
- Authentication method being used

### System Status

- Environment (development/production)
- Mode (development/standard)
- Firebase initialization status
- Emulator connectivity

### Quick Actions

- **Emulator UI** - Opens Firebase Emulator UI (http://localhost:4000)
- **Test Conn.** - Tests all Firebase connections
- **Clear** - Clears debug logs

### Debug Logs

- Real-time development logs
- Authentication events
- Connection status changes
- Error messages

## 🔧 Development Scripts

### Core Development

- `pnpm dev` - Standard development server
- `pnpm dev:firebase` - Dev server + Firebase emulators
- `pnpm dev:debug` - Enhanced debug mode
- `pnpm dev:mock` - Force mock authentication

### Firebase Tools

- `pnpm firebase:start` - Start emulators only
- `pnpm firebase:ui` - Start emulators with UI
- `firebase emulators:start` - Firebase CLI command

## 📱 Testing Features

### Authentication Testing

1. **Mock Mode**: Use demo credentials (user@demo.com / demo123)
2. **Firebase Mode**: Create accounts through emulators
3. **Role Testing**: Test all roles (user, police, fire, ambulance, hospital, admin)

### Firebase Features

- **Real-time Updates** - Disaster reports sync across sessions
- **News Alerts** - Push notifications and real-time alerts
- **Supply Requests** - Hospital supply chain management
- **User Management** - Role-based access control

### Emergency Scenarios

- **Report Disasters** - Test emergency reporting flow
- **Response Coordination** - Multi-role emergency response
- **Map Integration** - Location services and navigation
- **Real-time Alerts** - Emergency notification system

## 🌐 Development URLs

- **App**: http://localhost:8080
- **Firebase Emulator UI**: http://localhost:4000
- **Firestore Emulator**: http://localhost:8081
- **Auth Emulator**: http://localhost:9099
- **Functions Emulator**: http://localhost:5001

## 🔍 Debugging Tips

### Check Firebase Connection

```javascript
// In browser console
window.devUtils.testConnections();
window.devUtils.getStatus();
```

### Monitor Authentication

- Debug panel shows current auth method
- Console logs show auth events
- Test role switching between different accounts

### Firestore Data

- Use Emulator UI to view/edit data
- Real-time updates visible in debug panel
- Test data persistence across sessions

## 🚨 Troubleshooting

### Emulators Not Connecting

1. Check if emulators are running: `firebase emulators:start`
2. Verify ports (9099, 8081, 5001) are available
3. Check debug panel for connection status

### Authentication Issues

1. Check debug panel for auth method being used
2. Verify environment variables in .env.local
3. Clear localStorage if needed

### Performance Issues

1. Open debug panel to check system status
2. Monitor console for error messages
3. Use Firebase Emulator UI to check data

## 🎉 Success Indicators

✅ **Debug panel visible** in bottom-right corner  
✅ **System status** shows "development" mode  
✅ **Connection status** shows Firebase or Mock  
✅ **Authentication working** with real-time updates  
✅ **All features functional** across different roles

---

**Development mode is fully active!** 🚀

Check the debug panel for real-time status and use the development tools to build and test your disaster management system.
