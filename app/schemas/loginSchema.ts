// app/schemas/loginSchema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
  .min(6, { message: "Password must be at least 6 characters long" })
  .max(100, { message: "Password is too long" }),
});
