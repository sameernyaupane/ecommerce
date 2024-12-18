import { z } from "zod";

export const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postcode: z.string().min(1, "Postcode is required"),
  paymentMethod: z.enum([ 
    'cash_on_delivery',
    'amazon-pay',
    'google-pay',
    'square',
    'paypal'
  ]),
  notes: z.string().optional(),
  saveAddress: z.boolean().optional(),
  selectedAddressId: z.string().optional(),
}); 