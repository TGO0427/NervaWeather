// Build script to generate env.js with environment variables
import fs from 'fs';

const envContent = `// Environment variables for client-side usage
window.ENV = {
    OPENAI_API_KEY: '${process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY'}'
};`;

fs.writeFileSync('env.js', envContent);
console.log('Generated env.js with environment variables');