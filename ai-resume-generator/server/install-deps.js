const { execSync } = require('child_process');

console.log('Installing dependencies...');
try {
  // Install express-validator
  console.log('Installing express-validator...');
  execSync('npm install express-validator', { stdio: 'inherit' });
  
  console.log('\nAll dependencies installed successfully!');
} catch (error) {
  console.error('Failed to install dependencies:');
  console.error(error.message);
  process.exit(1);
}
