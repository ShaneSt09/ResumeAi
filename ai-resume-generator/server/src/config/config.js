import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file and directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT (for custom token generation if needed)
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret',
    expire: process.env.JWT_EXPIRE || '30d',
    cookieExpire: process.env.JWT_COOKIE_EXPIRE || 30,
  },
  
  // Firebase (for client-side config)
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  },
  
  // Email (optional, for sending emails)
  email: {
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpEmail: process.env.SMTP_EMAIL,
    smtpPassword: process.env.SMTP_PASSWORD,
    fromEmail: process.env.FROM_EMAIL,
    fromName: process.env.FROM_NAME || 'AI Resume Generator',
  }
};

export default config;