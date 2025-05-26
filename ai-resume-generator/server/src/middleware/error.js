import ErrorResponse from '../utils/errorResponse.js';

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for development
  console.error(err.stack);

  // Handle specific error types
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }
  
  // Firebase auth errors
  if (err.code && err.code.startsWith('auth/')) {
    let message = 'Authentication failed';
    let statusCode = 401;
    
    switch (err.code) {
      case 'auth/email-already-exists':
        message = 'Email is already in use';
        statusCode = 400;
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak';
        statusCode = 400;
        break;
      case 'auth/user-not-found':
        message = 'User not found';
        break;
      case 'auth/wrong-password':
        message = 'Invalid credentials';
        break;
      case 'auth/too-many-requests':
        message = 'Too many attempts. Please try again later';
        statusCode = 429;
        break;
      default:
        message = err.message || 'Authentication failed';
    }
    
    error = new ErrorResponse(message, statusCode);
  }

  // Default to 500 server error
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

export default errorHandler;