import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { User } from '../store';

// Log environment variables for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Environment Variables:', {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    NODE_ENV: process.env.NODE_ENV,
    PUBLIC_URL: process.env.PUBLIC_URL
  });
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Define types for API responses
type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Track in-flight requests to prevent duplicates
const pendingRequests: Record<string, Promise<AxiosResponse>> = {};

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true,
  timeout: 10000, // 10 seconds
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN'
});

// Helper function to generate request key
const generateRequestKey = (config: InternalAxiosRequestConfig): string => {
  return `${config.method?.toUpperCase()}:${config.url}:${JSON.stringify(config.params)}:${JSON.stringify(config.data)}`;
};

// Track last request time for rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 300; // 300ms minimum between requests

// Request interceptor for adding auth token and handling deduplication
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add cache-busting for GET requests
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(), // Add timestamp to prevent caching
      };
    }

    // Don't add Authorization header for these endpoints
    const skipAuthPaths = [
      '/auth/register',
      '/auth/login'
    ];
    const shouldSkipAuth = skipAuthPaths.some(path => config.url?.includes(path));

    // Add auth token to request if available
    const token = localStorage.getItem('token');
    if (token && !shouldSkipAuth) {
      // Ensure headers object exists and has the correct type
      if (!config.headers) {
        config.headers = {} as any;
      }
      // Use type assertion to avoid TypeScript errors
      const headers = config.headers as any;
      headers.Authorization = `Bearer ${token}`;
      headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    // Remove any headers that might cause CORS issues
    delete config.headers?.['Cache-Control'];
    delete config.headers?.['Pragma'];

    // Skip deduplication for non-GET requests
    if (config.method?.toLowerCase() !== 'get') {
      return config;
    }

    const requestKey = generateRequestKey(config);

    // If we have a pending request with the same key, return its promise
    if (pendingRequests[requestKey]) {
      return pendingRequests[requestKey].then(response => {
        // Create a new config from the original to avoid reference issues
        const newConfig = { ...response.config };
        // Ensure the response is fresh by updating timestamp
        const headers = { ...(newConfig.headers as Record<string, any>) };
        headers['X-Request-ID'] = Date.now().toString();
        newConfig.headers = headers as any;
        return newConfig;
      });
    }

    // Implement rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      // If we're making requests too quickly, delay this one
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }

    lastRequestTime = Date.now();

    // Store the request promise
    pendingRequests[requestKey] = new Promise<AxiosResponse>((resolve) => {
      // This will be resolved in the response interceptor
      (config as any).__requestKey = requestKey;
      (config as any).__resolve = resolve;
    });

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and refreshing tokens
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const requestKey = generateRequestKey(response.config);
    const resolve = (response.config as any).__resolve;
    
    // If this was a deduplicated request, resolve the pending promise
    if (requestKey && resolve) {
      resolve(response);
      delete pendingRequests[requestKey];
    }
    
    // Clear any cached data if needed
    if (response.headers['cache-control']?.includes('no-store') || 
        response.headers['pragma'] === 'no-cache') {
      // Handle cache invalidation if needed
    }
    
    // Handle successful responses
    if (response.data && !response.data.success) {
      return Promise.reject(new Error(response.data.error || 'Request failed'));
    }
    
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    const requestKey = (error.config as any)?.__requestKey;
    const resolve = (error.config as any)?.__resolve;
    
    // If this was a deduplicated request, reject the pending promise
    if (requestKey && resolve) {
      resolve(Promise.reject(error));
      delete pendingRequests[requestKey];
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Please wait before making more requests.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: { displayName: string; email: string; password: string }): Promise<{ user: User; token: string }> => {
    try {
      // Clear any existing tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Import Firebase auth functions
      const { signUpWithEmail } = await import('../utils/firebase');
      
      console.log('Starting registration for:', userData.email);
      
      // 1. Create user in Firebase Auth
      const userCredential = await signUpWithEmail(userData.email, userData.password);
      const idToken = await userCredential.user.getIdToken();
      
      if (!idToken) {
        throw new Error('Failed to get ID token after registration');
      }
      
      console.log('Successfully created user in Firebase Auth');
      
      // 2. Create user in our database
      const response = await api.post<{ 
        success: boolean; 
        user: User;
        message?: string;
      }>(
        '/auth/register',
        {
          ...userData,
          uid: userCredential.user.uid
        },
        {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        }
      );

      if (!response.data.success || !response.data.user) {
        // If creating the user in our database fails, we should delete the Firebase Auth user
        // to keep them in sync. In a production app, you might want to implement this.
        console.error('Failed to create user in database, but user was created in Firebase Auth');
        throw new Error(response.data.message || 'Registration failed');
      }

      const user = response.data.user;

      // Store the token and user data in localStorage
      localStorage.setItem('token', idToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Set the default Authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

      console.log('Registration successful, user data stored:', {
        id: user.id,
        email: user.email,
        name: user.displayName
      });

      return { 
        user: {
          ...user,
          token: idToken
        }, 
        token: idToken 
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      // Clear any partial authentication data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  },
  
  login: async (credentials: { email: string; password: string }): Promise<{ user: User; token: string }> => {
    try {
      console.log('Starting login with credentials:', { email: credentials.email });
      
      // Clear any existing tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Import Firebase auth functions
      const { signInWithEmail } = await import('../utils/firebase');
      
      console.log('Signing in with Firebase...');
      
      // Sign in with Firebase directly
      const userCredential = await signInWithEmail(credentials.email, credentials.password);
      const idToken = await userCredential.user.getIdToken();
      
      if (!idToken) {
        throw new Error('Failed to get ID token from Firebase');
      }
      
      console.log('Successfully authenticated with Firebase');
      
      // Set the Authorization header for this request
      const config = {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      };
      
      // Get user data from our backend with the token
      const response = await api.get<{ success: boolean; user: User }>('/auth/me', config);
      
      if (!response.data.success || !response.data.user) {
        throw new Error('Failed to fetch user data');
      }
      
      const user = response.data.user;
      
      // Store the ID token and user data
      localStorage.setItem('token', idToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set the default Authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
      
      console.log('Login successful, user data stored:', {
        id: user.id,
        email: user.email,
        name: user.name || user.displayName
      });
      
      return { 
        user: {
          ...user,
          token: idToken
        }, 
        token: idToken 
      };
    } catch (error: any) {
      console.error('Login error details:', {
        name: error.name,
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      // Clear any partial authentication data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please try again.';
      throw new Error(errorMessage);
    }
  },
  
  getMe: async (): Promise<User> => {
    console.log('Fetching current user data...');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        throw new Error('No authentication token found');
      }
      
      console.log('Making request to /auth/me with token:', token.substring(0, 10) + '...');
      
      // Set the Authorization header for this request
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      };
      
      const response = await api.get<{ 
        success: boolean; 
        user: User;
        message?: string;
      }>('/auth/me', config);
      
      console.log('User data response:', {
        success: response.data.success,
        hasUser: !!response.data.user,
        user: response.data.user ? { 
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name || response.data.user.displayName
        } : null
      });
      
      if (!response.data.success || !response.data.user) {
        const errorMsg = response.data.message || 'Failed to fetch user data';
        console.error('Error in response:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Update the default Authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      console.log('Successfully fetched user data');
      return response.data.user;
    } catch (error: any) {
      console.error('Error in getMe:', {
        name: error.name,
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      // Only clear auth data if the error is 401 Unauthorized
      if (error.response?.status === 401 || error.message.includes('401')) {
        console.log('Clearing invalid auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
      }
      
      throw error; // Re-throw to be handled by the caller
    }
  },
  
  logout: (): void => {
    localStorage.removeItem('token');
    // You might want to redirect to login here
    window.location.href = '/login';
  },
};

// Resume API
export const resumeAPI = {
  generateResume: async (data: any): Promise<ApiResponse> => {
    return api.post('/resumes/generate', data);
  },

  saveResume: async (resumeData: any) => {
    try {
      // Transform the data to match the server's expected format
      const formattedData = {
        title: resumeData.personalInfo?.fullName ? 
              `${resumeData.personalInfo.fullName}'s Resume` : 
              'My Resume',
        sections: [
          {
            type: 'personalInfo',
            data: resumeData.personalInfo || {}
          },
          {
            type: 'experience',
            items: resumeData.experience || []
          },
          {
            type: 'education',
            items: resumeData.education || []
          },
          {
            type: 'skills',
            items: resumeData.skills || []
          }
        ],
        isPublic: false
      };
      
      console.log('Sending resume data:', formattedData);
      const response = await api.post('/resumes', formattedData);
      console.log('Save response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving resume:', error);
      // Return a more user-friendly error message
      const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Failed to save resume. Please try again.';
      console.error('Error details:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  getResumes: async () => {
    try {
      const response = await api.get('/resumes');
      return response.data;
    } catch (error) {
      console.error('Error fetching resumes:', error);
      throw error;
    }
  },
  
  getResume: async (id: string) => {
    try {
      const response = await api.get(`/resumes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching resume ${id}:`, error);
      throw error;
    }
  },
  
  deleteResume: async (id: string) => {
    try {
      const response = await api.delete(`/resumes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting resume ${id}:`, error);
      throw error;
    }
  },
};

export default api;
