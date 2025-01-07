import { z } from 'zod';

export const vendorRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  brandName: z.string().min(1, "Brand name is required"),
  website: z.string().url().optional().or(z.literal("")),
  productDescription: z.string().min(1, "Product description is required"),
  // New fields
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  storeBannerUrl: z.string().url().optional().or(z.literal("")),
  socialFacebook: z.string().url().optional().or(z.literal("")),
  socialInstagram: z.string().url().optional().or(z.literal("")),
  socialTwitter: z.string().url().optional().or(z.literal("")),
  businessHours: z.record(z.string()).optional(),
  shippingPolicy: z.string().optional(),
  returnPolicy: z.string().optional(),
}); 