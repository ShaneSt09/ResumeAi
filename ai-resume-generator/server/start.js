import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

// Get the current file and directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine the correct path to the .env file
const rootEnvPath = path.resolve(__dirname, '../.env');
const serverEnvPath = path.resolve(__dirname, '.env');

let envPath;

// Check for .env in server directory first, then fall back to root
if (fs.existsSync(serverEnvPath)) {
  envPath = serverEnvPath;
} else if (fs.existsSync(rootEnvPath)) {
  envPath = rootEnvPath;
} else {
  console.error('Error: .env file not found in either server/ or project root directory');
  process.exit(1);
}

// Load environment variables
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Verify required environment variables
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_PRIVATE_KEY_ID',
  'REACT_APP_FIREBASE_API_KEY'  // Added for Firebase REST API authentication
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Error: Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

console.log('Environment variables loaded successfully');
console.log('Firebase Project:', process.env.FIREBASE_PROJECT_ID);
console.log('Node Environment:', process.env.NODE_ENV || 'development');

// Import Firebase services after environment variables are loaded
console.log('Initializing Firebase...');
import('./src/config/firebase.js').then(({ db, auth }) => {
  // Verify Firebase services are initialized
  console.log('Firebase services status:');
  console.log('- Firestore:', db ? 'Connected' : 'Not connected');
  console.log('- Auth:', auth ? 'Initialized' : 'Not initialized');

    // Import and start the server
  import('./src/index.js').then(({ default: app }) => {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', err);
      // Close server & exit process
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      server.close(() => process.exit(1));
    });
  });
}).catch(error => {
  console.error('Failed to initialize Firebase:', error);
  process.exit(1);
});

// Server is started in the dynamic import above
