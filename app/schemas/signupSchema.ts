// app/schemas/signupSchema.ts
import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string({
    required_error: "Name is required",
  }).min(1, { message: "Name is required" }),
  email: z.string({
    required_error: "Email is required",
  }).email("Invalid email format"),
  password: z.string({
    required_error: "Password is required",
  })
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(100, { message: "Password is too long" }),
  acceptTerms: z.boolean({
    required_error: "You must accept the terms and conditions",
    invalid_type_error: "You must accept the terms and conditions",
  }).refine((val) => val === true, {
    message: "You must accept the terms and conditions"
  }),
});
