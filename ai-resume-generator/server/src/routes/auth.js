import express from 'express';
import { check } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post(
  '/register',
  [
    check('displayName', 'Display name is required')
      .not().isEmpty()
      .trim()
      .escape(),
    check('email', 'Please include a valid email')
      .isEmail()
      .normalizeEmail(),
    check('password', 'Password must be at least 6 characters long')
      .isLength({ min: 6 })
  ],
  register
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists()
  ],
  login
);

// Protected routes (require authentication)
router.use(protect);

// Get current user
router.get('/me', getMe);

// Update user details
router.put(
  '/details',
  [
    check('displayName', 'Display name is required')
      .optional()
      .not().isEmpty()
      .trim()
      .escape(),
    check('photoURL', 'Please include a valid URL')
      .optional()
      .isURL()
  ],
  updateDetails
);

// Update password
router.put(
  '/password',
  [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'New password must be at least 6 characters long')
      .isLength({ min: 6 })
  ],
  updatePassword
);

// Logout user
router.post('/logout', logout);

export default router;