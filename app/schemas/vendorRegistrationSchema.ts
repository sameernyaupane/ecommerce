import { z } from 'zod';

export const vendorRegistrationSchema = z.object({
  brandName: z.string({
    required_error: "Brand name is required",
  }).min(1, { message: "Brand name is required" }),
  
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  
  businessType: z.enum(["sole-trader", "limited-company", "partnership"], {
    required_error: "Please select a business type",
  }),
  
  firstName: z.string({
    required_error: "First name is required",
  }).min(1, { message: "First name is required" }),
  
  lastName: z.string({
    required_error: "Last name is required",
  }).min(1, { message: "Last name is required" }),
  
  email: z.string({
    required_error: "Email is required",
  }).email("Invalid email format"),
  
  phone: z.string({
    required_error: "Phone number is required",
  }).min(1, { message: "Phone number is required" }),
  
  productDescription: z.string({
    required_error: "Product description is required",
  }).min(10, { message: "Please provide at least 50 characters of description" }),
}); 