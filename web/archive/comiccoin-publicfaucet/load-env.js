// load-env.js
const { loadEnvConfig } = require('@next/env');

// This loads the appropriate .env files based on NODE_ENV
const projectDir = process.cwd();
const loadedEnvFiles = loadEnvConfig(projectDir);

console.log('Loaded environment files:', loadedEnvFiles.loadedEnvFiles);
console.log('Environment:', process.env.NODE_ENV);
console.log('API Domain:', process.env.NEXT_PUBLIC_API_DOMAIN);
