#!/usr/bin/env node

/**
 * ZoeFlockAdmin Frontend Startup Script
 * This script starts the Next.js production server
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting ZoeFlockAdmin Frontend...');
console.log('Node.js Version:', process.version);
console.log('Working Directory:', process.cwd());

// Start Next.js production server
const nextProcess = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || 3000
  }
});

nextProcess.on('error', (error) => {
  console.error('Failed to start Next.js server:', error);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  console.log(`Next.js server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  nextProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  nextProcess.kill('SIGINT');
});
