import { processEmailQueue, transporter } from '@/utils/email';
import * as dotenv from 'dotenv';
import redisClient from '@/cache/redis';

// Load environment variables
dotenv.config();

async function init() {
  try {
    console.log('=== Email Processor Starting ===');
    console.log('Process ID:', process.pid);
    console.log('Current Directory:', process.cwd());
    console.log('Environment:', process.env.NODE_ENV);
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM,
      hasPassword: !!process.env.SMTP_PASS,
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
      }
    });

    // Test Redis connection
    await redisClient.ping();
    console.log('✓ Redis connection successful');
    
    // Test SMTP connection
    await transporter.verify();
    console.log('✓ SMTP connection successful');
    
    // Start processing queue
    console.log('Starting email queue processor...');
    await processEmailQueue();
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
}

init().catch(error => {
  console.error('Email processor crashed:', error);
  process.exit(1);
}); 