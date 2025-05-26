import ErrorResponse from '../utils/errorResponse.js';
import Resume from '../models/Resume.js';
import { generateResumeWithAI } from '../services/openaiService.js';
import { admin, db } from '../config/firebase.js';

// Helper function to update user's resume IDs
const updateUserResumeIds = async (userId, resumeId) => {
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      resumeIds: admin.firestore.FieldValue.arrayUnion(resumeId),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating user resume IDs:', error);
    return false;
  }
};

// @desc    Get all resumes for the logged-in user
// @route   GET /api/resumes
// @access  Private
export const getResumes = async (req, res, next) => {
  try {
    const resumes = [];
    const querySnapshot = await db.collection('resumes')
      .where('user', '==', req.user.uid)
      .get();
    
    querySnapshot.forEach(doc => {
      resumes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (error) {
    console.error('Error getting resumes:', error);
    next(error);
  }
};

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
export const getResume = async (req, res, next) => {
  try {
    const resumeDoc = await db.collection('resumes').doc(req.params.id).get();
    
    if (!resumeDoc.exists) {
      return next(
        new ErrorResponse(`Resume not found with id of ${req.params.id}`, 404)
      );
    }
    
    const resume = {
      id: resumeDoc.id,
      ...resumeDoc.data()
    };
    
    // Verify the resume belongs to the requesting user
    if (resume.user !== req.user.uid) {
      return next(
        new ErrorResponse('Not authorized to access this resume', 403)
      );
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Error getting resume:', error);
    next(error);
  }
};

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
export const createResume = async (req, res, next) => {
  try {
    console.log('Creating resume with data:', req.body);
    
    // Validate required fields
    if (!req.body.title) {
      req.body.title = 'Untitled Resume';
    }
    
    if (!req.body.sections) {
      req.body.sections = [];
    }
    
    // Add user and timestamps
    const now = new Date().toISOString();
    const resumeData = {
      ...req.body,
      user: req.user.uid,
      createdAt: now,
      updatedAt: now
    };
    
    // Create the resume
    const resume = await Resume.create(resumeData);
    console.log('Resume created:', resume);
    
    // Update user's resumeIds in the background
    updateUserResumeIds(req.user.uid, resume.id)
      .then(updated => {
        if (updated) {
          console.log('Successfully updated user with new resume ID');
        } else {
          console.warn('Failed to update user with new resume ID');
        }
      })
      .catch(error => {
        console.error('Error in background user update:', error);
      });

    res.status(201).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Error in createResume:', error);
    next(error);
  }
};

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
export const updateResume = async (req, res, next) => {
  try {
    const resumeRef = db.collection('resumes').doc(req.params.id);
    const resumeDoc = await resumeRef.get();

    if (!resumeDoc.exists) {
      return next(
        new ErrorResponse(`Resume not found with id of ${req.params.id}`, 404)
      );
    }

    const resume = {
      id: resumeDoc.id,
      ...resumeDoc.data()
    };

    // Make sure user is resume owner
    if (resume.user !== req.user.uid) {
      return next(
        new ErrorResponse(
          `User ${req.user.uid} is not authorized to update this resume`,
          401
        )
      );
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    // Update the resume
    await resumeRef.update(updateData);

    // Get the updated resume
    const updatedResume = {
      id: resumeDoc.id,
      ...(await resumeRef.get()).data()
    };

    res.status(200).json({
      success: true,
      data: updatedResume
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
export const deleteResume = async (req, res, next) => {
  try {
    const resumeRef = db.collection('resumes').doc(req.params.id);
    const resumeDoc = await resumeRef.get();

    if (!resumeDoc.exists) {
      return next(
        new ErrorResponse(`Resume not found with id of ${req.params.id}`, 404)
      );
    }

    const resume = {
      id: resumeDoc.id,
      ...resumeDoc.data()
    };

    // Make sure user is resume owner
    if (resume.user !== req.user.uid) {
      return next(
        new ErrorResponse(
          `User ${req.user.uid} is not authorized to delete this resume`,
          401
        )
      );
    }

    // Delete the resume
    await resumeRef.delete();

    // Remove the resume ID from the user's resumeIds array
    const userRef = db.collection('users').doc(req.user.uid);
    await userRef.update({
      resumeIds: admin.firestore.FieldValue.arrayRemove(req.params.id),
      updatedAt: new Date().toISOString()
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
