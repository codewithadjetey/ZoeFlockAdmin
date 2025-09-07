#!/usr/bin/env node

/**
 * ZoeFlockAdmin Frontend Production Server
 * Custom Node.js server for production deployment
 */

import { createServer } from 'http';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log('🚀 Starting ZoeFlockAdmin Frontend Production Server...');
console.log(`📡 Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`🌐 Host: ${hostname}`);
console.log(`🔌 Port: ${port}`);

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`✅ Server ready on http://${hostname}:${port}`);
      console.log('📊 Application: ZoeFlockAdmin Frontend');
      console.log('⚡ Framework: Next.js 15.3.4');
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
