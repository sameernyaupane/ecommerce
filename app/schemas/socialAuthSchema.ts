import { z } from 'zod';

export const googleAuthSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  googleId: z.string(),
  picture: z.string().optional(),
});

export type GoogleAuthData = z.infer<typeof googleAuthSchema>; 