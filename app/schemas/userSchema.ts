import { z } from 'zod';

const baseUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  profile_image: z.string().optional(),
});

export const createUserSchema = baseUserSchema.extend({
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

export const editUserSchema = baseUserSchema.extend({
  id: z.preprocess(
    (val) => (typeof val === "string" && val.trim() !== "" ? Number(val) : undefined),
    z.number().positive()
  ),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long")
    .optional(),
});

// Type inference
export type CreateUser = z.infer<typeof createUserSchema>;
export type EditUser = z.infer<typeof editUserSchema>;
