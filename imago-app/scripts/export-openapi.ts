import { execSync } from 'child_process';

execSync('npx next-openapi-gen generate', { stdio: 'inherit' });
