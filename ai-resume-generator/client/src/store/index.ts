import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import api from '../services/api';

export interface User {
  id?: string;
  uid: string;
  name?: string;
  email: string;
  displayName: string;
  role?: string;
  token?: string;
  photoURL?: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

type Store = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isSubmitting: false,
  error: null,
};

export const useStore = create<Store>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        login: async (email: string, password: string) => {
          set({ isSubmitting: true, error: null });
          try {
            console.log('Attempting to login with:', email);
            const { user, token } = await authAPI.login({ email, password });
            
            if (!user || !token) {
              throw new Error('Invalid response from server');
            }
            
            console.log('Login successful, updating store with user:', {
              id: user.id,
              email: user.email,
              name: user.name || user.displayName
            });
            
            // Ensure the token is set in the API client
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Update the auth state
            const authUser = { 
              ...user,
              token,
              name: user.name || user.displayName || user.email.split('@')[0],
              id: user.id || user.uid || '',
              email: user.email,
              displayName: user.displayName || user.name || user.email.split('@')[0]
            };
            
            set({
              user: authUser,
              isAuthenticated: true,
              isSubmitting: false,
              error: null,
            });
            
            console.log('Store updated, isAuthenticated set to true');
            
            // Double check the state after update
            setTimeout(() => {
              const currentState = get();
              console.log('Current auth state after login:', {
                isAuthenticated: currentState.isAuthenticated,
                user: currentState.user ? {
                  id: currentState.user.id,
                  email: currentState.user.email,
                  name: currentState.user.name
                } : null
              });
            }, 100);
            
          } catch (error: any) {
            console.error('Login error:', {
              name: error.name,
              message: error.message,
              response: error.response?.data,
              stack: error.stack
            });
            
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            
            // Clear any partial state
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            
            set({
              error: errorMessage,
              isSubmitting: false,
              isAuthenticated: false,
              user: null
            });
            
            throw error;
          }
        },

        register: async (displayName: string, email: string, password: string) => {
          set({ isSubmitting: true, error: null });
          try {
            const { user, token } = await authAPI.register({ displayName, email, password });
            set({
              user: { ...user, token },
              isAuthenticated: true,
              isSubmitting: false,
              error: null,
            });
          } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            set({
              error: errorMessage,
              isSubmitting: false,
            });
            throw new Error(errorMessage);
          }
        },

        logout: () => {
          // Clear the token from localStorage
          localStorage.removeItem('token');
          
          // Clear the token from the API client
          delete api.defaults.headers.common['Authorization'];
          
          // Clear the auth state
          set({
            user: null,
            isAuthenticated: false,
            error: null
          });
          
          // Call the authAPI logout
          authAPI.logout();
        },

        checkAuth: async (): Promise<boolean> => {
          // Only run this check if we're not already checking
          const currentState = get();
          if (currentState.isSubmitting) {
            console.log('Auth check already in progress, skipping...');
            return currentState.isAuthenticated;
          }

          console.log('Starting authentication check...');
          set({ isSubmitting: true });
          
          try {
            // Try to get the token and user from localStorage
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            
            // If no token or user data, clear auth state
            if (!token || !userStr) {
              console.log('No auth token or user data found in localStorage');
              set({ 
                user: null, 
                isAuthenticated: false, 
                isSubmitting: false,
                error: null
              });
              return false;
            }
            
            console.log('Found token and user data in localStorage');
            
            try {
              // Set the token in the API client
              api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              
              // Verify the token with the server
              console.log('Verifying auth token with server...');
              const response = await api.get('/auth/me', {
                headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache',
                  'Expires': '0'
                },
                // Add a timestamp to prevent caching
                params: { _t: Date.now() }
              });
              
              if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || 'Invalid or expired token');
              }
              
              // Use the user data from the server if available, otherwise fall back to localStorage
              const user = response.data.user || JSON.parse(userStr);
              
              if (!user) {
                throw new Error('No user data available');
              }
              
              // Ensure we have the required user properties
              const authUser = {
                ...user,
                id: user.id || user.uid,
                name: user.name || user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                displayName: user.displayName || user.name || user.email?.split('@')[0] || 'User',
                role: user.role || 'user',
                photoURL: user.photoURL || ''
              };
              
              console.log('User authenticated successfully:', {
                id: authUser.id,
                email: authUser.email,
                name: authUser.name
              });
              
              // Update the stored user data with the latest from the server
              localStorage.setItem('user', JSON.stringify(authUser));
              
              // Update the auth state
              set({
                user: authUser,
                isAuthenticated: true,
                isSubmitting: false,
                error: null
              });
              
              return true;
            } catch (apiError) {
              console.error('Error during token verification:', apiError);
              throw apiError; // Re-throw to be caught by the outer catch
            }
          } catch (error) {
            console.error('Authentication check failed:', error);
            
            // Clear any existing auth state
            localStorage.removeItem('token');
            
            // Only log the error if it's not a 401 (Unauthorized)
            const status = (error as any)?.response?.status;
            if (status !== 401) {
              console.error('Authentication error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                status,
                data: (error as any)?.response?.data
              });
            }
            
            set({ 
              user: null, 
              isAuthenticated: false, 
              isSubmitting: false,
              error: error instanceof Error ? error.message : 'Authentication failed. Please log in again.'
            });
            
            // If we have a token but verification failed, clear it
            if (localStorage.getItem('token')) {
              console.log('Clearing invalid token from localStorage');
              localStorage.removeItem('token');
            }
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated
        }),
        version: 1
      }
    )
  )
);
