import nodemailer from 'nodemailer';
import redisClient from '@/cache/redis';

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

interface EmailJob {
  to: string;
  subject: string;
  html: string;
  attempts?: number;
  lastError?: string;
}

const EMAIL_QUEUE_KEY = 'email:queue';
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
  console.log('Email queued for:', to);
}

// Process emails in queue
export async function processEmailQueue() {
  while (true) {
    try {
      // Get the next email job from the queue
      const emailJobString = await redisClient.lpop(EMAIL_QUEUE_KEY);
      if (!emailJobString) {
        // If queue is empty, wait before checking again
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      const emailJob: EmailJob = JSON.parse(emailJobString);
      
      try {
        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || '"INDIBE" <noreply@indibe.net>',
          to: emailJob.to,
          subject: emailJob.subject,
          html: emailJob.html,
        });
        console.log('Email sent successfully:', info.messageId);
      } catch (error: any) {
        emailJob.attempts = (emailJob.attempts || 0) + 1;
        emailJob.lastError = error.message;

        if (emailJob.attempts < MAX_RETRY_ATTEMPTS) {
          // Re-queue the job for retry
          await redisClient.rpush(EMAIL_QUEUE_KEY, JSON.stringify(emailJob));
          console.log(`Email sending failed, attempt ${emailJob.attempts}. Requeuing...`);
        } else {
          // Log failed email after max retries
          await redisClient.rpush('email:failed', JSON.stringify(emailJob));
          console.error('Email sending failed after max retries:', emailJob);
        }
      }
    } catch (error) {
      console.error('Error processing email queue:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
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