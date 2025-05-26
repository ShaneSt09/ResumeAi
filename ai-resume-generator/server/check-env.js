// Load environment variables
require('dotenv').config({ path: '.env' });

// Check required environment variables
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

console.log('Checking environment variables...\n');

let allVarsPresent = true;

requiredVars.forEach(varName => {
  const isPresent = process.env[varName] !== undefined;
  console.log(`${varName}: ${isPresent ? '✅ Present' : '❌ Missing'}`);
  if (!isPresent) allVarsPresent = false;
});

if (allVarsPresent) {
  console.log('\n✅ All required environment variables are present!');
  console.log('\nFirst few characters of each variable (for verification):');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`${varName}: ${value ? value.substring(0, 10) + '...' : 'Empty'}`);
  });
} else {
  console.log('\n❌ Some required environment variables are missing!');
  console.log('Please check your .env file in the server directory.');
}

console.log('\nCurrent working directory:', process.cwd());
