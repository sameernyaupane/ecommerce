// app/schemas/loginSchema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string({
    required_error: "Email is required",
  }).email("Invalid email format"),
  password: z.string({
    required_error: "Password is required",
  })
  .min(6, { message: "Password must be at least 6 characters long" })
  .max(100, { message: "Password is too long" }),
});
