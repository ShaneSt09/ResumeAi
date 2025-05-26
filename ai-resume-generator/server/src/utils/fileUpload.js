import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import ErrorResponse from './errorResponse.js';
import { fileURLToPath } from 'url';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Handle file upload
 * @param {Object} file - The file object from multer
 * @param {string[]} allowedFileTypes - Array of allowed file types (e.g., ['image/jpeg', 'application/pdf'])
 * @param {string} [subfolder=''] - Subfolder within uploads directory
 * @returns {Promise<{fileName: string, filePath: string}>} Uploaded file details
 */
const uploadFile = (file, allowedFileTypes, subfolder = '') => {
  return new Promise((resolve, reject) => {
    try {
      if (!file) {
        return reject(new ErrorResponse('No file uploaded', 400));
      }

      // Check file type
      if (!allowedFileTypes.includes(file.mimetype)) {
        return reject(
          new ErrorResponse(
            `File type ${file.mimetype} is not allowed. Allowed types: ${allowedFileTypes.join(', ')}`,
            400
          )
        );
      }

      // Create a unique filename
      const fileExt = path.extname(file.originalname).toLowerCase();
      const fileName = `${uuidv4()}${fileExt}`;
      
      // Create subfolder if it doesn't exist
      const uploadPath = path.join(uploadDir, subfolder);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const filePath = path.join(uploadPath, fileName);

      // Move the file to the uploads folder
      fs.rename(file.path, filePath, (err) => {
        if (err) {
          console.error('Error moving file:', err);
          return reject(new ErrorResponse('Error processing file upload', 500));
        }

        resolve({
          fileName,
          filePath: path.join('uploads', subfolder, fileName).replace(/\\/g, '/') // Use forward slashes for URLs
        });
      });
    } catch (error) {
      console.error('Upload error:', error);
      reject(new ErrorResponse('File upload failed', 500));
    }
  });
};

/**
 * Delete a file
 * @param {string} filePath - Path to the file to delete
 * @returns {Promise<void>}
 */
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      return resolve();
    }

    // Construct full path if it's a relative path
    const fullPath = filePath.startsWith(uploadDir) 
      ? filePath 
      : path.join(__dirname, '../..', filePath);

    fs.unlink(fullPath, (err) => {
      if (err) {
        // Don't reject if file doesn't exist
        if (err.code === 'ENOENT') {
          console.warn(`File not found: ${fullPath}`);
          return resolve();
        }
        console.error('Error deleting file:', err);
        return reject(new ErrorResponse('Error deleting file', 500));
      }
      resolve();
    });
  });
};

/**
 * Get file stream for download
 * @param {string} filePath - Path to the file
 * @returns {fs.ReadStream}
 */
const getFileStream = (filePath) => {
  try {
    // Construct full path if it's a relative path
    const fullPath = filePath.startsWith(uploadDir) 
      ? filePath 
      : path.join(__dirname, '../..', filePath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      throw new ErrorResponse('File not found', 404);
    }

    return fs.createReadStream(fullPath);
  } catch (error) {
    console.error('Error getting file stream:', error);
    throw new ErrorResponse('Error accessing file', 500);
  }
};

/**
 * Get MIME type based on file extension
 * @param {string} fileName - The file name
 * @returns {string} MIME type
 */
const getMimeType = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
  };

  return mimeTypes[ext] || 'application/octet-stream';
};

export { uploadFile, deleteFile, getFileStream, getMimeType, uploadDir };
