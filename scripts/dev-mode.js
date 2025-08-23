#!/usr/bin/env node

/**
 * Development Mode Setup Script
 * This script configures the environment for development mode
 */

import fs from 'fs';
import path from 'path';

const envContent = `# Development Mode Configuration
VITE_USE_MOCK_AUTH=false
VITE_DEV_MODE=true
VITE_ENABLE_DEBUG=true
VITE_FIREBASE_EMULATORS=true

# Firebase Emulator Configuration
VITE_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
VITE_FIREBASE_FIRESTORE_EMULATOR_HOST=localhost:8081
VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001

# Development Features
VITE_SHOW_DEV_TOOLS=true
VITE_ENABLE_LOGGING=true
VITE_DEBUG_AUTH=true
`;

// Write .env.local file to override defaults
fs.writeFileSync('.env.local', envContent);

console.log(`
🚀 DEVELOPMENT MODE ACTIVATED!
==============================

✅ Created .env.local with development configuration
✅ Firebase emulators will be used when available
✅ Debug panel enabled
✅ Enhanced logging enabled

📋 Next steps:
1. Start Firebase emulators: firebase emulators:start
2. Or run both together: pnpm run dev:firebase
3. Or just start dev server: pnpm dev

🔧 Debug panel will appear in bottom-right corner
🌐 Firebase Emulator UI: http://localhost:4000

==============================
`);
