import ErrorResponse from '../utils/errorResponse.js';
import { admin } from '../config/firebase.js';
import User from '../models/User.js';

/**
 * Middleware to protect routes - verifies Firebase ID tokens
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      // Format: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Check if token exists
    if (!token) {
      console.log('No token provided in request');
      return next(
        new ErrorResponse('Not authorized to access this route - No token provided', 401)
      );
    }

    console.log('Token received, verifying...');

    try {
      // 3. Verify the ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('ID Token verified for UID:', decodedToken.uid);
      
      // 4. Get user from database or create if not exists
      let user = await User.findOne({ uid: decodedToken.uid });
      
      if (!user) {
        // Create a new user if they don't exist
        user = await User.create({
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          displayName: decodedToken.name || 'User',
          role: 'user',
          photoURL: decodedToken.picture || ''
        });
        console.log('Created new user in database:', user.uid);
      }
      
      // 5. Update user data if needed
      const updates = {};
      if (decodedToken.email && user.email !== decodedToken.email) updates.email = decodedToken.email;
      if (decodedToken.name && user.displayName !== decodedToken.name) updates.displayName = decodedToken.name;
      if (decodedToken.picture && user.photoURL !== decodedToken.picture) updates.photoURL = decodedToken.picture;
      
      if (Object.keys(updates).length > 0) {
        await User.getCollection().doc(user.uid).update(updates);
        Object.assign(user, updates);
      }
      
      // 6. Attach user to request object
      req.user = user;
      
      // 7. Continue to the next middleware/route handler
      next();
      
    } catch (error) {
      console.error('Error verifying token:', error);
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/argument-error') {
        return next(new ErrorResponse('Invalid token format', 401));
      }
      
      if (error.code === 'auth/id-token-expired') {
        return next(new ErrorResponse('Token has expired', 401));
      }
      
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return next(new ErrorResponse('Authentication failed', 500));
  }
};

/**
 * Middleware to authorize user roles
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ErrorResponse('Authentication required', 401));
      }
      
      // Check if user has one of the required roles
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorResponse(
            `User role ${req.user.role} is not authorized to access this route`,
            403
          )
        );
      }
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      next(new ErrorResponse('Authorization failed', 500));
    }
  };
};

/**
 * Middleware to check if user is the owner of a resource
 * @param {object} resourceModel - Mongoose model for the resource
 * @param {string} [userIdField='user'] - Field in the resource that contains the user ID
 */
export const checkOwnership = (resourceModel, userIdField = 'user') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ErrorResponse('Authentication required', 401));
      }
      
      const resourceId = req.params.id;
      if (!resourceId) {
        return next(new ErrorResponse('Resource ID is required', 400));
      }
      
      // Get the resource
      const resource = await resourceModel.findById(resourceId);
      if (!resource) {
        return next(new ErrorResponse('Resource not found', 404));
      }
      
      // Check if the user is the owner
      if (resource[userIdField].toString() !== req.user.id) {
        return next(
          new ErrorResponse('Not authorized to modify this resource', 403)
        );
      }
      
      // Attach the resource to the request for use in the route handler
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      next(new ErrorResponse('Authorization failed', 500));
    }
  };
};
