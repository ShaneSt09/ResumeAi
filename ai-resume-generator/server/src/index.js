// Import required modules
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';
import ErrorResponse from './utils/errorResponse.js';

// Import Firebase services (already initialized in start.js)
import { admin, db, auth } from './config/firebase.js';

// Get the current file and directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Express server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Firebase Project ID:', process.env.FIREBASE_PROJECT_ID);

const app = express();

// Set security headers
app.use(helmet());

// Enable CORS with detailed logging
// Development CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      console.log('Development: Allowing origin:', origin);
      return callback(null, true);
    }
    
    // In production, only allow specific origins
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5000'
    ];
    
    console.log('CORS request from origin:', origin);
    
    if (!origin || allowedOrigins.includes(origin)) {
      console.log('CORS: Allowed origin:', origin);
      return callback(null, true);
    } else {
      console.log('CORS: Blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials',
    'Expires',
    'Cache-Control',
    'Pragma',
    'X-Requested-With'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Authorization',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials'
  ],
  maxAge: 600, // Cache preflight request for 10 minutes
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS middleware first
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Add CORS headers to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Log CORS headers for debugging
app.use((req, res, next) => {
  console.log('=== Request Headers ===');
  console.log('Origin:', req.headers.origin);
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Body parser with increased limit and proper content-type handling
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({
  extended: true,
  limit: '50mb',
  parameterLimit: 100000,
  type: 'application/x-www-form-urlencoded'
}));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  next();
});

// Cookie parser
app.use(cookieParser());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// OpenAI Configuration
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('OpenAI API configured successfully');
} else {
  console.warn('WARNING: OPENAI_API_KEY not set. OpenAI features will be disabled.');
}

// Import route files
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resume.js';
import uploadRoutes from './routes/uploads.js';

// Import middleware
import errorHandler from './middleware/error.js';

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/uploads', uploadRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handler middleware (must be after all other middleware and routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Test database connection
try {
  await db.listCollections();
  console.log('Firestore connected successfully');
} catch (dbError) {
  console.error('Firestore connection error:', dbError);
  throw new Error('Failed to connect to Firestore');
}

// Test Auth connection
try {
  await auth.listUsers(1);
  console.log('Firebase Auth connected successfully');
} catch (authError) {
  console.error('Firebase Auth connection error:', authError);
  throw new Error('Failed to connect to Firebase Auth');
}

console.log('Server is ready to accept connections');

export default app;