import ErrorResponse from '../utils/errorResponse.js';
import Resume from '../models/Resume.js';
import { generateResumeWithAI } from '../services/openaiService.js';
import { admin } from '../config/firebase.js';

// @desc    Get all resumes for the logged-in user
// @route   GET /api/resumes
// @access  Private
export const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user.uid });
    
    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
export const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.uid
    });

    if (!resume) {
      return next(
        new ErrorResponse(`Resume not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
export const createResume = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.uid;
    
    const resume = await Resume.create(req.body);

    // Add resume ID to user's resumeIds array
    await User.findByIdAndUpdate(req.user.uid, {
      $push: { resumeIds: resume._id }
    });

    res.status(201).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
export const updateResume = async (req, res, next) => {
  try {
    let resume = await Resume.findById(req.params.id);

    if (!resume) {
      return next(
        new ErrorResponse(`Resume not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is resume owner
    if (resume.user.toString() !== req.user.uid && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.uid} is not authorized to update this resume`,
          401
        )
      );
    }

    resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return next(
        new ErrorResponse(`Resume not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is resume owner
    if (resume.user.toString() !== req.user.uid && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.uid} is not authorized to delete this resume`,
          401
        )
      );
    }

    await resume.remove();

    // Remove resume ID from user's resumeIds array
    await User.findByIdAndUpdate(req.user.uid, {
      $pull: { resumeIds: resume._id }
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate resume with AI
// @route   POST /api/resumes/generate
// @access  Private
export const generateResume = async (req, res, next) => {
  try {
    const { jobTitle, experience, skills, additionalInfo } = req.body;

    // Call the AI service to generate resume content
    const generatedResume = await generateResumeWithAI({
      jobTitle,
      experience,
      skills,
      additionalInfo
    });

    // Create a new resume with the generated content
    req.body = {
      title: `AI-Generated Resume for ${jobTitle}`,
      sections: generatedResume.sections,
      isAIGenerated: true
    };

    // Reuse the createResume method to save the generated resume
    return this.createResume(req, res, next);
  } catch (error) {
    console.error('Error generating resume with AI:', error);
    next(new ErrorResponse('Failed to generate resume with AI', 500));
  }
};
