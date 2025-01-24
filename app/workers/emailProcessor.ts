import { processEmailQueue, transporter } from '@/utils/email';
import * as dotenv from 'dotenv';
import redisClient from '@/cache/redis';
import { logInfo, logError } from '@/utils/logger';

// Load environment variables
dotenv.config();

async function init() {
  try {
    logInfo('Email Processor Starting', {
      pid: process.pid,
      directory: process.cwd(),
      environment: process.env.NODE_ENV,
      config: {
        smtp: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: process.env.SMTP_SECURE,
          user: process.env.SMTP_USER,
          from: process.env.SMTP_FROM,
          hasPassword: !!process.env.SMTP_PASS,
        },
        redis: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT
        }
      }
    });

    await redisClient.ping();
    logInfo('Redis connection successful');
    
    await transporter.verify();
    logInfo('SMTP connection successful');
    
    logInfo('Starting email queue processor');
    await processEmailQueue();
  } catch (error) {
    logError('Initialization error', error);
    process.exit(1);
  }
}

init().catch(error => {
  logError('Email processor crashed', error);
  process.exit(1);
}); 