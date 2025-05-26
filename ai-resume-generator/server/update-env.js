const fs = require('fs');
const path = require('path');

// Ensure the .env file is created in the server directory
const envPath = path.join(__dirname, '.env');
const rootEnvPath = path.join(__dirname, '../.env');

// If .env exists in root but not in server, copy it
if (!fs.existsSync(envPath) && fs.existsSync(rootEnvPath)) {
  console.log('Copying .env from root to server directory...');
  const envContent = fs.readFileSync(rootEnvPath, 'utf8');
  fs.writeFileSync(envPath, envContent);
}

// Read the current .env file content
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Check and add missing variables
const requiredVars = {
  'PORT': '5000',
  'NODE_ENV': 'development',
  'FIREBASE_PROJECT_ID': 'resumeai-b5158',
  'FIREBASE_CLIENT_EMAIL': 'firebase-adminsdk-fbsvc@resumeai-b5158.iam.gserviceaccount.com',
  // Format the private key with proper escaping for .env file
  'FIREBASE_PRIVATE_KEY': `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDMTGdpujiWwgBg\n1PkhkjBnPlJz71cqAGqoSepE8p7LSUtPF2xQ7gscB3uroNM2G9Oc/RpO9BG9jM8Q\nd9lrNz2LAPtHto/NwaA8JwFF9TdrOJkcP/oxueqCehweqL+HBL9oQmyCzQJi/jSr\nAr9xf4Z+YaAxm9zmoYx9XzAssA6E+ANpKTAkF/rPV9AAePqV+jD8TjD5aEU5i+zu\nNRlx2SZVtew0qeK9fY9Tt9GvmWmAGxjdlwjhzj6Ox7aMLyB6VXUZ3EJU1FHblJlN\nv/kHV1tOJe3t8RL8lCD4M99rsJsigcKc+Ag7KJ/LzgGqshfryZAo60D5JajO7UHh\nwA5J81ajAgMBAAECggEAHZFNQjsGZ6NKRLluGRK8WKTncAoKtnR6+0I/Wp02qDtC\nX/8G2SuqhfL7ThqnluQuG0FyZkziqGlRqpN97wt+p7iLpZRheaj1VN9cStCzpZv6\nZOFJh5rduuaLXVCU76ibPy6l38Rl/QfHfZyXMoj/YRkmAygIr4Rf/eEh6sXMRCgS\ns1Y8ZFvov0WMxBYa/AB3JQXxHSjptcwTf9eol49lOLyRvIcJpLblUJSWr8cM+GaG\nUA8Rd6HNd0MvmOn7zbSpkHml2CbAAR2TyJsikkfnnOekeFOPMcNrfsHwkbU/cJQ8\nEz9ekxc9EFpJ+V8BjQH5RQ3R6/liwj2/1FVy0Dr3yQKBgQDsCZE3YbcNQgY/kVvB\nE4dBKzAFyXkcTa4FD8HoB2fdt+PWGZPiW3vWQBjoTXrVf3eadBbLFDDULPNMHHmo\nzuZcZ7I+OCSCZvH/IQokBEUDHp8x7BX0I/icljQ1TbObSfPyj1cwqRK5Vw9oQjBb\n0nwn8Ei+g6PfsLEmJvgeUn4tTwKBgQDdk6i2e5pOR3zNFyFaKiAnkKLtwVsD7Qh8\n6Or2faH6vy+YCHEkXf9mqdKXG6DyUgAF8KgQfr4twsmD/kEYIi1lQ0iWS5RNqhYt\nE4D7HFJJX4/EE/4O96EfwmUqP4PIjFDn2GtFkcRHQM5oFGgRw8HHysGTYyU+gfL2\nq40YYRo0bQKBgQClC+OQ+DDJgntgA8JG9eLDvPEter3G/sJKI8SQ/Gyyap1T3jq8\nMwAaxmMkPNlBZIo7ZCV0B0BFfND7TYX8dgA6aQAH5bYRwO5CWdX/bUTcc5MZk12e\ng3CZ/aWwCA8o7MM5vuVWz0Kaerf5TR8Hddz/CFO1c9Mo3SJh7Snd+gzknQKBgQDT\nj/xEGKqR2YIZFN+8hoJjJJ/coYT0r6suEPrf1b8GeuvHny/giHunG7k+nJvFI3Rw\nN4NRFKMjcFwW0np2v5NWn7K8BngY27EG4xuBKF6NPlg34NrwkZJfj64mc7SxlQBf\nDm4GZBLj8cXi7LEdXSs2R6sivkS+dTd2PQCgaX6q1QKBgCEprYi/nwpqKyBo8w3p\nN2i6CVvxPDlvpEejUWIvnIGxS5u6BsY9EykepdloUQvEB3F804y1TapJRAmT8+cw\nIx40NcmJwtJvrYd+GS39r11I003fC08jJfhQXzIk+BwEkN9pm3unthY+3a2p6uXi\n6tVE4qE1BByvu2DYlOZMakKG\n-----END PRIVATE KEY-----`,
  'JWT_SECRET': '116181f2bc6b920b69fb10d2dead5f18e0f013e8261aef01554865d78870eb1e',
  'JWT_EXPIRE': '30d',
  'CLIENT_URL': 'http://localhost:3000',
  'OPENAI_API_KEY': 'your-openai-api-key'
};

let updated = false;

Object.entries(requiredVars).forEach(([key, defaultValue]) => {
  const regex = new RegExp(`^${key}=.*`, 'm');
  if (!regex.test(envContent)) {
    // Add the missing variable
    envContent += `\n${key}=${defaultValue}\n`;
    console.log(`✅ Added missing variable: ${key}`);
    updated = true;
  }
});

if (updated) {
  // Write the updated content back to .env
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log('\n✅ .env file has been updated with missing variables.');
} else {
  console.log('\n✅ All required variables are already present in .env');
}

console.log('\nPath to .env file:', envPath);
console.log('\nRunning environment check...\n');

// Run the environment check
require('./check-env.js');
