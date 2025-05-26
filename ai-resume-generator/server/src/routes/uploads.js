import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect, authorize } from '../middleware/auth.js';
import { uploadFile, deleteFile, getMimeType } from '../utils/fileUpload.js';
import ErrorResponse from '../utils/errorResponse.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(__dirname, '../../uploads/resumes');

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to allow only certain file types
// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  // Accept documents and images
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ErrorResponse(
        `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// @route   POST /api/uploads/resume
// @desc    Upload a resume file
// @access  Private
router.post(
  '/resume',
  protect,
  upload.single('resume'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return next(new ErrorResponse('No file uploaded', 400));
      }

      // You can save the file info to the user's profile or resume document here
      // For example: await User.findByIdAndUpdate(req.user.id, { resume: req.file.path });

      res.status(200).json({
        success: true,
        data: {
          fileName: req.file.filename,
          filePath: req.file.path.replace(/\\/g, '/'), // Convert backslashes to forward slashes
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/uploads/:filename
// @desc    Download a file
// @access  Private
router.get('/:filename', protect, async (req, res, next) => {
  try {
    const filePath = path.join(__dirname, '../../uploads/resumes', req.params.filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return next(new ErrorResponse('File not found', 404));
    }

    // Set appropriate headers
    const mimeType = getMimeType(req.params.filename);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);

    // Stream the file
    const fileStream = getFileStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/uploads/:filename
// @desc    Delete a file
// @access  Private
router.delete('/:filename', protect, async (req, res, next) => {
  try {
    const filePath = path.join(__dirname, '../../uploads/resumes', req.params.filename);
    
    // Delete the file
    await deleteFile(filePath);
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
});

export default router;
