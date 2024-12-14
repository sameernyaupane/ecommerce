import { processEmailQueue } from '@/utils/email';

// Start processing the email queue
console.log('Starting email processor...');
processEmailQueue().catch(error => {
  console.error('Email processor crashed:', error);
  process.exit(1);
}); 