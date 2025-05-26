import { User as FirebaseUser } from 'firebase/auth';

declare global {
  interface Window {
    // Add any global window extensions if needed
  }
}

export type { FirebaseUser };
