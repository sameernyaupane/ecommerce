import { z } from "zod";

// Use import.meta.env for both client and server
const envSchema = z.object({
  PAYPAL_CLIENT_ID: z.string(),
  PAYPAL_CLIENT_SECRET: z.string(),
  PAYPAL_API_URL: z.string().default("https://api-m.sandbox.paypal.com"),
});

// Get environment variables from either process.env (server) or import.meta.env (client)
const getEnv = () => {
  if (typeof process !== 'undefined' && process.env) {
    return {
      PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID,
      PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || process.env.VITE_PAYPAL_CLIENT_SECRET,
      PAYPAL_API_URL: process.env.PAYPAL_API_URL || process.env.VITE_PAYPAL_API_URL,
    };
  }
  return {
    PAYPAL_CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: import.meta.env.VITE_PAYPAL_CLIENT_SECRET,
    PAYPAL_API_URL: import.meta.env.VITE_PAYPAL_API_URL,
  };
};

let env;
try {
  env = envSchema.parse(getEnv());
} catch (error) {
  console.error('Error parsing PayPal config:', error);
  throw new Error('Invalid PayPal configuration');
}

export const paypalConfig = {
  clientId: env.PAYPAL_CLIENT_ID,
  clientSecret: env.PAYPAL_CLIENT_SECRET,
  apiUrl: env.PAYPAL_API_URL,
}; 