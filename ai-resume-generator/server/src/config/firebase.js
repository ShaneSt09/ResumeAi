import firebaseAdmin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// This will hold our Firebase services
let firebaseServices = null;

const initializeFirebase = () => {
  try {
    console.log('Environment variables:', {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? '***' : 'Not set',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? '***' : 'Not set',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? '***' : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'development'
    });
    
    // If already initialized, return the services
    if (firebaseServices) {
      console.log('Firebase already initialized');
      return firebaseServices;
    }

    console.log('Initializing Firebase...');
    
    let serviceAccount;
    const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
    
    // Try to load service account from file first
    if (fs.existsSync(serviceAccountPath)) {
      console.log('Loading service account from file:', serviceAccountPath);
      serviceAccount = require(serviceAccountPath);
    } 
    // Fall back to environment variables if file doesn't exist
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      console.log('Using service account from environment variables');
      // Format the private key by replacing escaped newlines
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_EMAIL.split('@')[0],
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
      };
    } else {
      throw new Error('No Firebase configuration found. Please provide either a service account key file or set the required environment variables.');
    }
    
    console.log('Using Firebase project:', serviceAccount.project_id);

    // Initialize the app if it doesn't already exist
    if (firebaseAdmin.apps.length === 0) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
      });
      console.log('Firebase Admin initialized with project ID:', process.env.FIREBASE_PROJECT_ID);
    }

    // Initialize Firestore
    const db = firebaseAdmin.firestore();
    
    try {
      // Apply Firestore settings
      db.settings({ 
        timestampsInSnapshots: true,
        ignoreUndefinedProperties: true 
      });
    } catch (error) {
      // Ignore if settings were already applied
      if (!error.message.includes('Firestore has already been initialized')) {
        console.error('Error initializing Firestore settings:', error);
        throw error;
      }
    }

    // Initialize services
    firebaseServices = {
      admin: firebaseAdmin,
      db,
      auth: firebaseAdmin.auth(),
      storage: firebaseAdmin.storage()
    };

    console.log('Firebase services initialized successfully');
    return firebaseServices;
    
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
};

// Initialize Firebase immediately when this module is imported
let services;

try {
  services = initializeFirebase();
  console.log('Firebase services initialized successfully:', {
    admin: !!services?.admin,
    db: !!services?.db,
    auth: !!services?.auth,
    storage: !!services?.storage
  });
} catch (error) {
  console.error('Failed to initialize Firebase services:', error);
  process.exit(1);
}

// Export all services as a single default export
export default {
  admin: services.admin,
  db: services.db,
  auth: services.auth,
  storage: services.storage,
  getFirebaseServices: () => services
};

// Also export individual services for named imports
export const admin = services.admin;
export const db = services.db;
export const auth = services.auth;
export const storage = services.storage;