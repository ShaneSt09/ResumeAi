import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/User.js';
import { admin } from '../config/firebase.js';
const auth = admin.auth();

console.log('Auth controller initialized with Firebase');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    console.log('=== Registration Request ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Raw body:', req.body);
    
    // Ensure the request has a body and it's an object
    if (!req.body || typeof req.body !== 'object') {
      console.error('Invalid request body:', req.body);
      return next(new ErrorResponse('Invalid request body', 400));
    }
    
    // Log the raw request body and parsed JSON
    console.log('Parsed body:', JSON.stringify(req.body, null, 2));
    
    // Destructure with default values to prevent undefined errors
    const { 
      email = '', 
      password = '', 
      displayName = '',
      uid = ''
    } = req.body;
    
    // Input validation with detailed logging
    const missingFields = [];
    if (!email || typeof email !== 'string') missingFields.push('email');
    if (!uid || typeof uid !== 'string') missingFields.push('uid');
    if (!displayName || typeof displayName !== 'string') missingFields.push('displayName');
    
    if (missingFields.length > 0) {
      console.error('Missing or invalid fields:', missingFields);
      console.error('Received data:', { 
        email: email ? 'present' : 'missing', 
        uid: uid ? 'present' : 'missing',
        displayName: displayName ? 'present' : 'missing' 
      });
      return next(new ErrorResponse(`Please provide all required fields: ${missingFields.join(', ')}`, 400));
    }
    
    // Additional validation for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Invalid email format:', email);
      return next(new ErrorResponse('Please provide a valid email address', 400));
    }
    
    // Verify the ID token with Firebase Admin SDK
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ErrorResponse('No token provided', 401));
    }
    
    const idToken = authHeader.split(' ')[1];
    let decodedToken;
    
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      
      if (!decodedToken || !decodedToken.uid) {
        return next(new ErrorResponse('Invalid token', 401));
      }
      
      // Verify the UID in the token matches the one in the request
      if (decodedToken.uid !== uid) {
        return next(new ErrorResponse('Token UID does not match request UID', 401));
      }
      
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return next(new ErrorResponse('Authentication failed', 401));
    }

    // Check if user already exists in our database
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return next(new ErrorResponse('User already exists', 400));
    }

    try {
      // Create user in our database
      const user = await User.create({
        uid,
        email: email.toLowerCase().trim(),
        displayName: displayName.trim(),
        role: 'user',
        photoURL: ''
      });

      console.log('Successfully created user in database:', user.uid);
      
      // Return the user data
      return res.status(201).json({
        success: true,
        user: {
          id: user._id,
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          displayName: user.displayName,
          role: user.role || 'user',
          photoURL: user.photoURL || ''
        }
      });
      
    } catch (error) {
      console.error('Error creating user in database:', error);
      return next(new ErrorResponse('Failed to create user in database', 500));
    }
  } catch (error) {
    console.error('Registration error:', error);
    next(new ErrorResponse('Registration failed. Please try again.', 500));
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    console.log('=== Login Request ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const { email } = req.body;

    // Validate email
    if (!email) {
      console.error('Missing email');
      return next(new ErrorResponse('Please provide an email', 400));
    }

    // Verify the ID token with Firebase Admin SDK
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ErrorResponse('No token provided', 401));
    }
    
    const idToken = authHeader.split(' ')[1];
    let decodedToken;
    
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      
      if (!decodedToken || !decodedToken.uid) {
        return next(new ErrorResponse('Invalid token', 401));
      }
      
      // Get the user from our database
      const user = await User.findOne({ uid: decodedToken.uid });
      
      if (!user) {
        // Create a new user in our database if they don't exist
        const newUser = await User.create({
          uid: decodedToken.uid,
          email: decodedToken.email || email,
          displayName: decodedToken.name || email.split('@')[0],
          role: 'user',
          photoURL: decodedToken.picture || ''
        });
        
        console.log('Created new user in database:', newUser.uid);
        
        // Return the user data
        return res.status(200).json({
          success: true,
          user: {
            id: newUser._id,
            uid: newUser.uid,
            email: newUser.email,
            name: newUser.displayName,
            displayName: newUser.displayName,
            role: newUser.role || 'user',
            photoURL: newUser.photoURL || ''
          }
        });
      }
      
      // Update user data if needed
      const updates = {};
      if (decodedToken.email && user.email !== decodedToken.email) updates.email = decodedToken.email;
      if (decodedToken.name && user.displayName !== decodedToken.name) updates.displayName = decodedToken.name;
      if (decodedToken.picture && user.photoURL !== decodedToken.picture) updates.photoURL = decodedToken.picture;
      
      if (Object.keys(updates).length > 0) {
        await User.getCollection().doc(user.uid).update(updates);
        Object.assign(user, updates);
      }
      
      // Return the user data
      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          displayName: user.displayName,
          role: user.role || 'user',
          photoURL: user.photoURL || ''
        }
      });
      
    } catch (error) {
      console.error('Error during login:', error);
      return next(new ErrorResponse('Authentication failed', 401));
    }
  } catch (err) {
    console.error('Login error:', err);
    return next(err);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    // In a real app, you might want to invalidate the token
    // For JWT, you would typically handle this on the client side
    res.status(200).json({
      success: true,
      message: 'Successfully logged out'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    console.log('=== Get Current User ===');
    console.log('User from request:', req.user);
    
    // Verify the ID token with Firebase Admin SDK
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ErrorResponse('No token provided', 401));
    }
    
    const idToken = authHeader.split(' ')[1];
    let decodedToken;
    
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      
      if (!decodedToken || !decodedToken.uid) {
        return next(new ErrorResponse('Invalid token', 401));
      }
      
      // Get the user from the database using the UID from the token
      let user = await User.findOne({ uid: decodedToken.uid });
      
      if (!user) {
        // Create a new user if they don't exist in our database
        user = await User.create({
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          displayName: decodedToken.name || 'User',
          role: 'user',
          photoURL: decodedToken.picture || ''
        });
        console.log('Created new user in database:', user.uid);
      }
      
      // Update user data if needed
      const updates = {};
      if (decodedToken.email && user.email !== decodedToken.email) updates.email = decodedToken.email;
      if (decodedToken.name && user.displayName !== decodedToken.name) updates.displayName = decodedToken.name;
      if (decodedToken.picture && user.photoURL !== decodedToken.picture) updates.photoURL = decodedToken.picture;
      
      if (Object.keys(updates).length > 0) {
        await User.getCollection().doc(user.uid).update(updates);
        Object.assign(user, updates);
      }
      
      // Return user data
      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          displayName: user.displayName,
          role: user.role || 'user',
          photoURL: user.photoURL || ''
        }
      });
      
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return next(new ErrorResponse('Authentication failed', 401));
    }
    
  } catch (error) {
    console.error('Error getting current user:', error);
    next(error);
  }  
};

// @desc    Update user details
// @route   PUT /api/auth/details
// @access  Private
const updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      displayName: req.body.displayName,
      photoURL: req.body.photoURL
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    // Update in Firebase Auth
    if (Object.keys(fieldsToUpdate).length > 0) {
      await auth.updateUser(req.user.uid, fieldsToUpdate);
    }

    // Update in our database
    const user = await User.findById(req.user.uid);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    
    await user.update(fieldsToUpdate);
    
    res.status(200).json({
      success: true,
      data: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update details error:', error);
    next(new ErrorResponse('Failed to update user details', 500));
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { uid } = req.user;

    if (!newPassword || newPassword.length < 6) {
      return next(new ErrorResponse('New password must be at least 6 characters long', 400));
    }

    // In a real app, verify the current password first
    // This is a simplified example that just updates the password
    
    // Update password in Firebase Auth
    await auth.updateUser(uid, {
      password: newPassword
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    next(new ErrorResponse('Failed to update password', 500));
  }
};

// Export all controller functions
export {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword
};