import { z } from "zod";

// Base password validation rules
const passwordValidation = z.string()
  .min(6, "Password must be at least 6 characters")
  .max(100, "Password is too long");

// For users who already have a password
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordValidation,
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }
);

// For Google users setting up their first password
export const setPasswordSchema = z.object({
  newPassword: passwordValidation,
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }
);

// Type inference
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type SetPassword = z.infer<typeof setPasswordSchema>; 