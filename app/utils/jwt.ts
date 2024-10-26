// src/utils/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

const JWT_EXPIRATION = parseInt(process.env.JWT_EXPIRATION!) || 900; // Default to 15 minutes in seconds
const REFRESH_EXPIRATION = parseInt(process.env.REFRESH_EXPIRATION!) || 604800; // Default to 7 days in seconds

// Generate an access token
export const generateAccessToken = (userId: number): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

// Generate a refresh token
export const generateRefreshToken = (userId: number): string => {
  return jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRATION });
};

// Verify a token
export const verifyToken = (token: string): { valid: boolean, expired: boolean, decoded?: JwtPayload | string, error?: VerifyErrors } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, expired: false, decoded };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, expired: true, error };
    }
    return { valid: false, expired: false, error };
  }
};

// Get remaining time until expiration
export const getRemainingTime = (token: string): number => {
  const decoded: any = jwt.decode(token); // Decode without verifying to get the expiration time
  if (decoded && decoded.exp) {
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
    return decoded.exp - currentTime; // Calculate remaining time
  }
  return 0; // Return 0 if token is invalid
};
