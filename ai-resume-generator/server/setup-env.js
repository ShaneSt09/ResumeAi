const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file...');
  
  // Copy from .env.example if it exists
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example');
  } else {
    // Create a basic .env file with Firebase config
    const envContent = `# Server
PORT=5000
NODE_ENV=development

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email@example.com
FIREBASE_PRIVATE_KEY="your-private-key-here"

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=30d

# CORS
CLIENT_URL=http://localhost:3000

# OpenAI (optional)
OPENAI_API_KEY=your-openai-api-key
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created new .env file with template');
  }
  
  console.log('\nPlease update the .env file with your Firebase credentials and restart the server.');
  console.log('Path to .env file:', envPath);
} else {
  console.log('✅ .env file already exists at:', envPath);
  console.log('\nPlease ensure it contains the following variables:');
  console.log('- FIREBASE_PROJECT_ID');
  console.log('- FIREBASE_CLIENT_EMAIL');
  console.log('- FIREBASE_PRIVATE_KEY');
  console.log('\nPath to .env file:', envPath);
}

// Run the environment check
console.log('\nRunning environment check...\n');
require('./check-env.js');
