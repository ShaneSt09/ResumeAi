// Mock Firebase Auth
const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  getIdToken: jest.fn().mockResolvedValue('test-id-token'),
};

const mockAuth = {
  signInWithCustomToken: jest.fn().mockResolvedValue({
    user: mockUser,
  }),
  currentUser: mockUser,
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn().mockResolvedValue({}),
};

const mockFirebase = {
  initializeApp: jest.fn(),
  auth: jest.fn(() => mockAuth),
  apps: [],
};

// Mock window.firebase
global.window.firebase = mockFirebase;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
