import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';

export const Login: React.FC = () => {
  const { 
    login, 
    register, 
    error: authError, 
    isSubmitting, 
    clearError, 
    isAuthenticated 
  } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin && !displayName.trim()) {
      errors.displayName = 'Display name is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    clearError();
  }, [clearError, isLogin]);

  // Remove the navigation effect since it's handled by the Home component
  // and the ProtectedRoute component for authenticated routes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      console.log('Form submitted, starting authentication...');
      
      if (isLogin) {
        console.log('Attempting login...');
        await login(email, password);
        console.log('Login successful, auth state will handle navigation');
      } else {
        console.log('Attempting registration...');
        await register(displayName, email, password);
        console.log('Registration successful, auth state will handle navigation');
      }
      
      // The useEffect hook will handle navigation when isAuthenticated changes
    } catch (error: any) {
      console.error('Authentication error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Only show the error message if it's not already set by the auth store
      if (!authError) {
        setFormErrors({
          ...formErrors,
          form: error.message || 'An unexpected error occurred. Please try again.'
        });
      }
    }
  };
  
  const toggleAuthMode = () => {
    clearError();
    setFormErrors({});
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Sign in to continue to your account' : 'Get started with our AI-powered resume builder'}
          </p>
        </div>
        
        {authError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{authError}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  className={`block w-full px-4 py-2 border ${formErrors.displayName ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150`}
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (formErrors.displayName) {
                      setFormErrors(prev => ({ ...prev, displayName: '' }));
                    }
                  }}
                  autoComplete="name"
                />
                {formErrors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.displayName}</p>
                )}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`block w-full px-4 py-2 border ${formErrors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email) {
                    setFormErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                {isLogin && (
                  <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-500 font-medium">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className={`block w-full px-4 py-2 border ${formErrors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150`}
                  placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) {
                      setFormErrors(prev => ({ ...prev, password: '' }));
                    }
                  }}
                />
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : isLogin ? (
                'Sign in to your account'
              ) : (
                'Create account'
              )}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={toggleAuthMode}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Export default for backward compatibility
export default Login;
