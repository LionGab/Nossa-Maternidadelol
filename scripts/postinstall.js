#!/usr/bin/env node

/**
 * Post-install script
 * Runs after npm install to set up the project
 */

import { existsSync, chmodSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// Make scripts executable
const scripts = ['setup.js', 'generate-session-secret.js'];
scripts.forEach((script) => {
  const scriptPath = join(__dirname, script);
  if (existsSync(scriptPath)) {
    try {
      chmodSync(scriptPath, 0o755);
    } catch (error) {
      // Ignore errors on Windows
    }
  }
});

console.log('✅ Post-install concluído');
