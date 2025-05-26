import { initializeFirebase } from '../config/firebase.js';
import ErrorResponse from '../utils/errorResponse.js';
import { jest } from '@jest/globals';

// Mock Firebase Admin
jest.mock('firebase-admin', () => {
  const mockFirestore = {
    settings: jest.fn(),
    collection: jest.fn(),
  };

  const mockAuth = {
    getUser: jest.fn(),
  };

  const mockStorage = {
    bucket: jest.fn(),
  };

  return {
    apps: [],
    initializeApp: jest.fn(),
    firestore: jest.fn(() => mockFirestore),
    auth: jest.fn(() => mockAuth),
    storage: jest.fn(() => mockStorage),
    credential: {
      cert: jest.fn(),
      applicationDefault: jest.fn(),
    },
  };
});

// Mock Firebase Admin
jest.mock('firebase-admin', () => {
  const mockFirestore = {
    settings: jest.fn(),
    collection: jest.fn(),
  };

  const mockAuth = {
    getUser: jest.fn(),
  };

  const mockStorage = {
    bucket: jest.fn(),
  };

  return {
    apps: [],
    initializeApp: jest.fn(),
    firestore: jest.fn(() => mockFirestore),
    auth: jest.fn(() => mockAuth),
    storage: jest.fn(() => mockStorage),
    credential: {
      cert: jest.fn()
    },
    // Add other Firebase Admin methods as needed
  };
});

describe('Firebase Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {}; // Clear environment variables
  });

  it('should initialize Firebase with service account from environment variable', async () => {
    // Mock environment variable
    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({
      project_id: 'test-project',
      client_email: 'test@example.com',
      private_key: 'test-key',
    });

    const { admin } = require('firebase-admin');
    
    // Call the initialization function
    const result = initializeFirebase();

    // Verify the result
    expect(result).toBeDefined();
    expect(result.admin).toBeDefined();
    expect(admin.initializeApp).toHaveBeenCalled();
  });

  it('should throw an error for invalid service account JSON', () => {
    // Mock invalid environment variable
    process.env.FIREBASE_SERVICE_ACCOUNT = 'invalid-json';

    expect(() => {
      initializeFirebase();
    }).toThrow(ErrorResponse);
  });

  it('should use Google Application Default Credentials when available', () => {
    // Mock environment variable
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/credentials.json';
    process.env.FIREBASE_PROJECT_ID = 'test-project';

    const { admin } = require('firebase-admin');
    
    // Call the initialization function
    const result = initializeFirebase();

    // Verify the result
    expect(result).toBeDefined();
    expect(admin.credential.applicationDefault).toHaveBeenCalled();
  });
});
