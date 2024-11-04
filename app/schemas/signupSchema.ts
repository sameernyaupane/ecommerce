// app/schemas/signupSchema.ts
import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(100, { message: "Password is too long" }),
  acceptTerms: z.enum(['on'], {
    required_error: "You must accept the terms and conditions",
    invalid_type_error: "You must accept the terms and conditions",
  }).optional(),
});
