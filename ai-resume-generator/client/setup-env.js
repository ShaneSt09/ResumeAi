const fs = require('fs');
const path = require('path');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  // Copy .env.example to .env if it exists
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('Created .env file from .env.example');
  } else {
    // Create a basic .env file
    const envContent = `# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=AIzaSyDSWOmxg7NnvnGtLtkzshbnS9kP_-qs-_w
# Add other environment variables here as needed`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('Created new .env file with default values');
  }
  
  console.log('Please update the .env file with your configuration and restart the development server.');
} else {
  console.log('.env file already exists');
}
