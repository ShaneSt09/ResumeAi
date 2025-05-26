import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signInWithCustomToken as firebaseSignInWithCustomToken,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth
export const auth = getAuth(app);

// Auth functions
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithToken = async (token: string) => {
  const result = await firebaseSignInWithCustomToken(auth, token);
  return result.user;
};

export const signOut = () => firebaseSignOut(auth);

// Types
export type { FirebaseUser };
