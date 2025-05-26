import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { check } from 'express-validator';
import {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  generateResume
} from '../controllers/resumeController.js';

const router = express.Router();

// All routes below this middleware are protected
router.use(protect);

// @route   GET /api/resumes
// @desc    Get all resumes for the logged-in user
// @access  Private
router.get('/', getResumes);

// @route   GET /api/resumes/:id
// @desc    Get a single resume by ID
// @access  Private
router.get('/:id', getResume);

// @route   POST /api/resumes
// @desc    Create a new resume
// @access  Private
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('sections', 'Sections are required').isArray({ min: 1 })
  ],
  createResume
);

// @route   PUT /api/resumes/:id
// @desc    Update a resume
// @access  Private
router.put('/:id', updateResume);

// @route   DELETE /api/resumes/:id
// @desc    Delete a resume
// @access  Private
router.delete('/:id', deleteResume);

// @route   POST /api/resumes/generate
// @desc    Generate a resume using AI
// @access  Private
router.post(
  '/generate',
  [
    check('jobDescription', 'Job description is required').not().isEmpty(),
    check('experience', 'Experience is required').isArray({ min: 1 }),
    check('education', 'Education is required').isArray({ min: 1 })
  ],
  generateResume
);

export default router;
