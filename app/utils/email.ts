import nodemailer from 'nodemailer';
import redisClient from '@/cache/redis';
import { logInfo, logError } from '@/utils/logger';

// Create transporter with environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export { transporter };

interface EmailJob {
  to: string;
  subject: string;
  html: string;
  attempts?: number;
  lastError?: string;
}

const EMAIL_QUEUE_KEY = 'email:queue';
const EMAIL_CHANNEL = 'email:notifications';
const MAX_RETRY_ATTEMPTS = 3;

// Add email to queue
export async function queueEmail({ to, subject, html }: EmailJob) {
  const emailJob: EmailJob = {
    to,
    subject,
    html,
    attempts: 0
  };
  
  await redisClient.rpush(EMAIL_QUEUE_KEY, JSON.stringify(emailJob));
  await redisClient.publish(EMAIL_CHANNEL, 'new_email');
  logInfo('Email queued', { to });
}

// Process emails in queue
export async function processEmailQueue() {
  logInfo('Email queue processor started');
  
  // Create a duplicate client for subscription
  const subscriber = redisClient.duplicate();
  await subscriber.subscribe(EMAIL_CHANNEL);
  
  // Process any existing emails in queue
  await processEmails();
  
  // Listen for new emails
  subscriber.on('message', async (channel, message) => {
    if (channel === EMAIL_CHANNEL && message === 'new_email') {
      await processEmails();
    }
  });
}

async function processEmails() {
  while (true) {
    const emailJobString = await redisClient.lpop(EMAIL_QUEUE_KEY);
    if (!emailJobString) break;
    
    const emailJob: EmailJob = JSON.parse(emailJobString);
    logInfo('Processing email job', { to: emailJob.to });
    
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"INDIBE" <noreply@indibe.net>',
        to: emailJob.to,
        subject: emailJob.subject,
        html: emailJob.html,
      });
      
      logInfo('Email sent successfully', {
        to: emailJob.to,
        messageId: info.messageId,
        response: info.response
      });
    } catch (error: any) {
      logError('Email sending failed', {
        to: emailJob.to,
        error: {
          message: error.message,
          code: error.code,
          command: error.command,
          response: error.response
        }
      });
      
      emailJob.attempts = (emailJob.attempts || 0) + 1;
      emailJob.lastError = error.message;

      if (emailJob.attempts < MAX_RETRY_ATTEMPTS) {
        logInfo('Requeuing email', {
          to: emailJob.to,
          attempt: emailJob.attempts,
          maxAttempts: MAX_RETRY_ATTEMPTS
        });
        await redisClient.rpush(EMAIL_QUEUE_KEY, JSON.stringify(emailJob));
      } else {
        logError('Max retries reached', {
          to: emailJob.to,
          attempts: emailJob.attempts,
          queue: 'email:failed'
        });
        await redisClient.rpush('email:failed', JSON.stringify(emailJob));
      }
    }
  }
}

// Email templates
export function getVendorWelcomeEmail(vendorName: string, tempPassword: string) {
  return {
    subject: 'Welcome to INDIBE - Your Vendor Account Details',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to INDIBE!</h2>
        <p>Dear ${vendorName},</p>
        <p>Thank you for registering as a vendor on INDIBE. Your account has been created successfully.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0;"><strong>Your temporary password:</strong> ${tempPassword}</p>
        </div>
        
        <p>For security reasons, please change your password after your first login.</p>
        
        <p>Here's what you can do next:</p>
        <ul>
          <li>Log in to your account</li>
          <li>Set up your store profile</li>
          <li>Add your products</li>
          <li>Configure shipping settings</li>
        </ul>
        
        <p>If you need any assistance, please don't hesitate to contact our vendor support team at vendorsupport@indibe.net</p>
        
        <p>Best regards,<br>The INDIBE Team</p>
      </div>
    `
  };
}

export function getPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
  
  return {
    subject: 'Reset Your Password - INDIBE',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password for your INDIBE account (${email}). Click the link below to set a new password:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <a href="${resetUrl}" 
             style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p>This link will expire in 1 hour for security reasons.</p>
        
        <p style="color: #666;">If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        
        <p style="margin-top: 30px; color: #666;">
          Best regards,<br>
          The INDIBE Team
        </p>
      </div>
    `
  };
} 