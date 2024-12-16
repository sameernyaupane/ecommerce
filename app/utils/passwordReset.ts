// app/utils/passwordReset.ts
import redisClient from "@/cache/redis";
import crypto from "crypto";
import { queueEmail } from "./email";

const TOKEN_EXPIRY = 60 * 60; // 1 hour in seconds

export async function generatePasswordResetToken(email: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const key = `password-reset:${token}`;
  
  await redisClient.set(key, email, 'EX', TOKEN_EXPIRY);
  return token;
}

export async function verifyPasswordResetToken(token: string, deleteToken = false) {
  const key = `password-reset:${token}`;
  const email = await redisClient.get(key);
  
  if (!email) return null;
  
  // Only delete the token if explicitly requested
  if (deleteToken) {
    await redisClient.del(key);
  }
  
  return email;
}
