import { z } from "zod";

const envSchema = z.object({
  PAYPAL_CLIENT_ID: z.string(),
  PAYPAL_CLIENT_SECRET: z.string(),
  PAYPAL_API_URL: z.string().default("https://api-m.sandbox.paypal.com"),
});

const env = envSchema.parse({
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  PAYPAL_API_URL: process.env.PAYPAL_API_URL,
});

export const paypalConfig = {
  clientId: env.PAYPAL_CLIENT_ID,
  clientSecret: env.PAYPAL_CLIENT_SECRET,
  apiUrl: env.PAYPAL_API_URL,
}; 