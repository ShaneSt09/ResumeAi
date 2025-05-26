import jwt from 'jsonwebtoken';
import ErrorResponse from './errorResponse.js';

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} [role='user'] - User role
 * @returns {string} JWT token
 */
export const generateToken = (userId, role = 'user') => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw new ErrorResponse('Failed to generate authentication token', 500);
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      throw new ErrorResponse('Token has expired', 401);
    } else if (error.name === 'JsonWebTokenError') {
      throw new ErrorResponse('Invalid token', 401);
    } else {
      throw new ErrorResponse('Not authorized to access this route', 401);
    }
  }
};

/**
 * Get token from request headers
 * @param {Object} req - Express request object
 * @returns {string} Token from header
 */
export const getTokenFromHeader = (req) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } 
  // Get token from cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Get token from query parameter (as a fallback, not recommended for production)
  else if (req.query && req.query.token) {
    token = req.query.token;
  }

  return token;
};

/**
 * Middleware to protect routes that require authentication
 * @param {Array} [roles=[]] - Array of allowed roles
 * @returns {Function} Express middleware function
 */
export const protect = (roles = []) => {
  return (req, res, next) => {
    try {
      // Get token from header
      const token = getTokenFromHeader(req);

      if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
      }

      // Verify token
      const decoded = verifyToken(token);

      // Check if user role is authorized
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return next(
          new ErrorResponse(
            `User role ${decoded.role} is not authorized to access this route`,
            403
          )
        );
      }

      // Add user from payload
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export { generateToken, verifyToken, getTokenFromHeader, protect };
