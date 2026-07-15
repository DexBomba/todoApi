const fs = require('fs');
const token = process.env.API_TOKEN;

console.log('🔨 Running Vercel build script...');

if (!token) {
  console.error('❌ API_TOKEN environment variable is NOT set!');
  process.exit(1);
}

console.log('✅ API_TOKEN found, generating config.js...');

const configContent = `const CONFIG = {
  API_TOKEN: '${token}'
};
`;

fs.writeFileSync('config.js', configContent);
console.log('✅ config.js generated successfully!');