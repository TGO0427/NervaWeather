// Build script to generate env.js with environment variables
import fs from 'fs';

const envContent = `// Environment variables for client-side usage
window.ENV = {
    OPENAI_API_KEY: '${process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY'}',
    AISHUB_USERNAME: '${process.env.AISHUB_USERNAME || 'YOUR_AISHUB_USERNAME'}',
    DATALASTIC_API_KEY: '${process.env.DATALASTIC_API_KEY || 'YOUR_DATALASTIC_API_KEY'}',
    SEARATES_API_KEY: '${process.env.SEARATES_API_KEY || 'YOUR_SEARATES_API_KEY'}'
};`;

fs.writeFileSync('env.js', envContent);
console.log('Generated env.js with environment variables');